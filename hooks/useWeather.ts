"use client";
import { useEffect, useState } from "react";
import { WeatherData } from "@/lib/types";

export function useWeather(city: string, date: string) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!city || !date) return;

    async function fetch() {
      setLoading(true);
      try {
        const res = await window.fetch(
          `/api/weather?city=${encodeURIComponent(city)}&date=${date}`
        );
        if (res.ok) {
          const data = await res.json();
          setWeather(data);
        }
      } catch {
        // Weather is non-critical, fail silently
      } finally {
        setLoading(false);
      }
    }

    fetch();
  }, [city, date]);

  return { weather, loading };
}
