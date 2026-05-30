import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");
  const mode = searchParams.get("mode") ?? "driving";

  if (!origin || !destination) {
    return NextResponse.json({ error: "origin and destination are required" }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Maps API key not configured" }, { status: 500 });

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/directions/json");
    url.searchParams.set("origin", origin);
    url.searchParams.set("destination", destination);
    url.searchParams.set("mode", mode);
    url.searchParams.set("key", apiKey);
    url.searchParams.set("region", "no");

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    const data = await res.json();

    if (data.status !== "OK" || !data.routes?.length) {
      return NextResponse.json({ error: "No route found" }, { status: 404 });
    }

    const leg = data.routes[0].legs[0];
    return NextResponse.json(
      {
        duration_seconds: leg.duration.value,
        duration_text: leg.duration.text,
        distance_meters: leg.distance.value,
        distance_text: leg.distance.text,
        mode,
      },
      { headers: { "Cache-Control": "s-maxage=3600" } }
    );
  } catch {
    return NextResponse.json({ error: "Directions request failed" }, { status: 500 });
  }
}
