import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { parseExcelBuffer } from "@/lib/excel/parser";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const tripName = formData.get("trip_name") as string | undefined;

    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      return NextResponse.json({ error: "Please upload an Excel file (.xlsx or .xls)" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const parsed = await parseExcelBuffer(buffer, tripName);

    // Geocode unique cities to get coordinates for the map
    const cityCoords: Record<string, { lat: number; lng: number }> = {};
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (apiKey) {
      const uniqueCities = [...new Set(parsed.rows.map((r) => r.city).filter(Boolean))];
      await Promise.all(
        uniqueCities.map(async (city) => {
          try {
            const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=${apiKey}&region=no`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.status === "OK" && data.results?.[0]) {
              cityCoords[city] = data.results[0].geometry.location;
            }
          } catch {}
        })
      );
    }

    const supabase = await createAdminClient();

    // Get or create the authenticated user's session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Filter out rows with invalid dates
    const validRows = parsed.rows.filter((r) => r.date && String(r.date).length >= 8);

    // Group rows by date to find trip date range
    const dates = validRows.map((r) => r.date as string).sort();
    const startDate = dates[0];
    const endDate = dates[dates.length - 1];

    // Delete any existing trip for this user so we start clean (cascades to trip_days + activities)
    await supabase.from("trips").delete().eq("user_id", user.id);

    // Create fresh trip
    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .insert({
        name: parsed.trip_name,
        destination: "Norway",
        start_date: startDate,
        end_date: endDate,
        user_id: user.id,
      })
      .select()
      .single();

    if (tripError) throw tripError;

    // Group valid rows by date
    const dayMap = new Map<string, typeof validRows>();
    for (const row of validRows) {
      const key = row.date as string;
      if (!dayMap.has(key)) dayMap.set(key, []);
      dayMap.get(key)!.push(row);
    }

    let dayNumber = 1;
    for (const [date, rows] of Array.from(dayMap.entries()).sort()) {
      // Always use sequential counter — never trust the Excel day_number (can have duplicates)
      const { data: day, error: dayError } = await supabase
        .from("trip_days")
        .insert({
          trip_id: trip.id,
          day_number: dayNumber,
          date,
          city: rows[0].city,
          notes: "",
        })
        .select()
        .single();

      if (dayError) throw dayError;

      const activitiesToInsert = rows.map((row, idx) => ({
        trip_id: trip.id,
        day_id: day.id,
        name: row.activity_name,
        description: row.description || null,
        start_time: row.start_time || null,
        end_time: row.end_time || null,
        address: row.address || null,
        latitude: cityCoords[row.city]?.lat ?? null,
        longitude: cityCoords[row.city]?.lng ?? null,
        notes: row.notes || null,
        order_index: idx,
        category: inferCategory(row.activity_name, row.description),
      }));

      const { error: actError } = await supabase.from("activities").insert(activitiesToInsert);
      if (actError) throw actError;

      dayNumber++;
    }

    return NextResponse.json({ success: true, trip_id: trip.id, days: dayMap.size, activities: validRows.length });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}

function inferCategory(name: string, description?: string): string {
  const text = `${name} ${description ?? ""}`.toLowerCase();
  // English
  if (/hotel|stay|check.in|check.out|accommodat|hostel|airbnb/.test(text)) return "accommodation";
  if (/restaurant|lunch|dinner|breakfast|café|cafe|eat|food|drink|bar|coffee/.test(text)) return "food";
  if (/train|bus|ferry|flight|airport|transfer|transport|depart|arrive|drive/.test(text)) return "transport";
  if (/museum|church|cathedral|gallery|tour|exhibit|palace|castle|historica/.test(text)) return "culture";
  if (/hike|walk|fjord|mountain|trail|outdoor|boat|kayak|ski|park|natur/.test(text)) return "outdoor";
  if (/shop|market|souven|mall|store/.test(text)) return "shopping";
  if (/view|sight|landmark|visit|explore|discover/.test(text)) return "sightseeing";
  // Hebrew
  if (/מלון|לינה|צ'ק אין|צ'ק אאוט|אירוח/.test(text)) return "accommodation";
  if (/מסעדה|אוכל|ארוחה|קפה|בר|שתייה|אכילה/.test(text)) return "food";
  if (/טיסה|אוטובוס|רכבת|מונית|נסיעה|נמל תעופה|העברה|הגעה|יציאה|ספינה|מעבורת/.test(text)) return "transport";
  if (/מוזיאון|כנסייה|קתדרלה|גלריה|סיור|תצוגה|ארמון|טירה|היסטורי/.test(text)) return "culture";
  if (/טיול|טבע|הר|ים|פארק|רכבל|הליכה|קיאק|סקי|פיורד/.test(text)) return "outdoor";
  if (/קניות|שוק|מזכרת|קניון/.test(text)) return "shopping";
  if (/תצפית|אטרקציה|ביקור|גשר|מגדל|כיכר/.test(text)) return "sightseeing";
  return "sightseeing"; // default to sightseeing for travel activities rather than "other"
}
