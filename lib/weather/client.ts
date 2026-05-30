import { WeatherData } from "@/lib/types";

// WMO Weather Code descriptions
const WMO_CODES: Record<number, { label: string; icon: string }> = {
  0: { label: "Clear sky", icon: "☀️" },
  1: { label: "Mainly clear", icon: "🌤️" },
  2: { label: "Partly cloudy", icon: "⛅" },
  3: { label: "Overcast", icon: "☁️" },
  45: { label: "Foggy", icon: "🌫️" },
  48: { label: "Icy fog", icon: "🌫️" },
  51: { label: "Light drizzle", icon: "🌦️" },
  53: { label: "Drizzle", icon: "🌦️" },
  55: { label: "Heavy drizzle", icon: "🌧️" },
  61: { label: "Light rain", icon: "🌧️" },
  63: { label: "Rain", icon: "🌧️" },
  65: { label: "Heavy rain", icon: "🌧️" },
  71: { label: "Light snow", icon: "🌨️" },
  73: { label: "Snow", icon: "❄️" },
  75: { label: "Heavy snow", icon: "❄️" },
  77: { label: "Snow grains", icon: "🌨️" },
  80: { label: "Showers", icon: "🌦️" },
  81: { label: "Rain showers", icon: "🌧️" },
  82: { label: "Heavy showers", icon: "⛈️" },
  85: { label: "Snow showers", icon: "🌨️" },
  86: { label: "Heavy snow showers", icon: "❄️" },
  95: { label: "Thunderstorm", icon: "⛈️" },
  96: { label: "Thunderstorm w/ hail", icon: "⛈️" },
  99: { label: "Thunderstorm w/ heavy hail", icon: "⛈️" },
};

export function getWeatherInfo(code: number) {
  return WMO_CODES[code] ?? { label: "Unknown", icon: "🌡️" };
}

interface GeocodedLocation {
  latitude: number;
  longitude: number;
}

const NORWAY_CITIES: Record<string, GeocodedLocation> = {
  oslo: { latitude: 59.9139, longitude: 10.7522 },
  bergen: { latitude: 60.3913, longitude: 5.3221 },
  trondheim: { latitude: 63.4305, longitude: 10.3951 },
  stavanger: { latitude: 58.9700, longitude: 5.7331 },
  tromsø: { latitude: 69.6489, longitude: 18.9551 },
  tromso: { latitude: 69.6489, longitude: 18.9551 },
  ålesund: { latitude: 62.4722, longitude: 6.1549 },
  alesund: { latitude: 62.4722, longitude: 6.1549 },
  flåm: { latitude: 60.8629, longitude: 7.1164 },
  flam: { latitude: 60.8629, longitude: 7.1164 },
  geiranger: { latitude: 62.1000, longitude: 7.2019 },
  lofoten: { latitude: 68.1500, longitude: 13.6000 },
  nordfjordeid: { latitude: 61.9038, longitude: 5.9932 },
  balestrand: { latitude: 61.2030, longitude: 6.5243 },
  voss: { latitude: 60.6274, longitude: 6.4165 },
  lillehammer: { latitude: 61.1153, longitude: 10.4662 },
  haugesund: { latitude: 59.4138, longitude: 5.2680 },
  kristiansand: { latitude: 58.1467, longitude: 7.9956 },
};

function getCityCoords(city: string): GeocodedLocation {
  const normalized = city.toLowerCase().trim();
  for (const [key, coords] of Object.entries(NORWAY_CITIES)) {
    if (normalized.includes(key)) return coords;
  }
  return { latitude: 59.9139, longitude: 10.7522 }; // Default to Oslo
}

export async function fetchWeatherForCity(
  city: string,
  startDate: string,
  endDate: string
): Promise<WeatherData[]> {
  const { latitude, longitude } = getCityCoords(city);

  const isPast = new Date(endDate) < new Date();
  const baseUrl = isPast
    ? "https://archive-api.open-meteo.com/v1/archive"
    : "https://api.open-meteo.com/v1/forecast";

  const dailyFields = isPast
    ? "temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code,wind_speed_10m_max"
    : "temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode,wind_speed_10m_max";

  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    daily: dailyFields,
    timezone: "Europe/Oslo",
    start_date: startDate,
    end_date: endDate,
  });

  const res = await fetch(`${baseUrl}?${params}`, {
    next: { revalidate: isPast ? 86400 : 3600 },
  });

  if (!res.ok) throw new Error("Weather API request failed");

  const data = await res.json();
  const daily = data.daily;

  const weatherCodeField = daily.weather_code ?? daily.weathercode;

  return daily.time.map((date: string, i: number) => ({
    date,
    temperature_max: Math.round(daily.temperature_2m_max[i]),
    temperature_min: Math.round(daily.temperature_2m_min[i]),
    precipitation_probability: daily.precipitation_probability_max[i] ?? 0,
    weather_code: weatherCodeField[i],
    wind_speed: Math.round(daily.wind_speed_10m_max[i]),
  }));
}
