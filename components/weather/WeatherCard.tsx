"use client";
import { useWeather } from "@/hooks/useWeather";
import { getWeatherInfo } from "@/lib/weather/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Wind, Droplets, Thermometer } from "lucide-react";
import { useT } from "@/lib/i18n";

interface WeatherCardProps {
  city: string;
  date: string;
  compact?: boolean;
}

export function WeatherCard({ city, date, compact = false }: WeatherCardProps) {
  const { weather, loading } = useWeather(city, date);
  const { t } = useT();

  if (loading) {
    return <Skeleton className={compact ? "h-14 w-48 rounded-2xl" : "h-24 w-full rounded-2xl"} />;
  }

  if (!weather) return null;

  const info = getWeatherInfo(weather.weather_code);

  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-sky-50 dark:bg-sky-900/20 rounded-2xl px-3 py-2 border border-sky-100 dark:border-sky-800/30">
        <span className="text-2xl" role="img" aria-label={info.label}>{info.icon}</span>
        <div>
          <p className="font-semibold text-sm text-foreground">
            {weather.temperature_max}° / {weather.temperature_min}°C
          </p>
          <p className="text-xs text-muted-foreground">{info.label}</p>
        </div>
        {weather.precipitation_probability > 20 && (
          <div className="flex items-center gap-0.5 text-xs text-sky-600 dark:text-sky-400 ml-auto">
            <Droplets className="h-3 w-3" />
            <span>{weather.precipitation_probability}%</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 rounded-2xl p-4 border border-sky-100 dark:border-sky-800/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-4xl" role="img" aria-label={info.label}>{info.icon}</span>
          <div>
            <p className="font-bold text-2xl text-foreground">{weather.temperature_max}°C</p>
            <p className="text-sm text-muted-foreground">{info.label}</p>
          </div>
        </div>
        <div className="text-right space-y-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
            <Thermometer className="h-3 w-3" />
            <span>{t.activity.weatherLow} {weather.temperature_min}°C</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400 justify-end">
            <Droplets className="h-3 w-3" />
            <span>{weather.precipitation_probability}% {t.activity.weatherRain}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
            <Wind className="h-3 w-3" />
            <span>{weather.wind_speed} km/h</span>
          </div>
        </div>
      </div>
    </div>
  );
}
