import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");
  if (!address) return NextResponse.json({ error: "address required" }, { status: 400 });

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Maps API key not configured" }, { status: 500 });

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}&region=no`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    const data = await res.json();

    if (data.status !== "OK" || !data.results?.length) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    const { lat, lng } = data.results[0].geometry.location;
    return NextResponse.json({ lat, lng }, {
      headers: { "Cache-Control": "s-maxage=86400" },
    });
  } catch {
    return NextResponse.json({ error: "Geocoding failed" }, { status: 500 });
  }
}
