import { NextRequest, NextResponse } from "next/server";
import { fetchWeatherForCity } from "@/lib/weather/client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");
  const date = searchParams.get("date");

  if (!city || !date) {
    return NextResponse.json({ error: "city and date are required" }, { status: 400 });
  }

  try {
    const weather = await fetchWeatherForCity(city, date, date);
    const dayWeather = weather.find((w) => w.date === date) ?? weather[0];

    if (!dayWeather) return NextResponse.json({ error: "No weather data" }, { status: 404 });

    return NextResponse.json(dayWeather, {
      headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch (error) {
    return NextResponse.json({ error: "Weather fetch failed" }, { status: 500 });
  }
}
