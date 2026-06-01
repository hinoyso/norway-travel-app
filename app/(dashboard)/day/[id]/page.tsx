"use client";
import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { useTripStore } from "@/store/tripStore";
import { useDayActivities } from "@/hooks/useTrip";
import { createClient } from "@/lib/supabase/client";
import { TripDay } from "@/lib/types";
import { PageHeader } from "@/components/navigation/PageHeader";
import { ActivityTimeline } from "@/components/activity/ActivityTimeline";
import { WeatherCard } from "@/components/weather/WeatherCard";
import { MapEmbed } from "@/components/maps/MapEmbed";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getMapsUrl } from "@/lib/utils";
import { MapPin, Zap, Hotel, Share2, ExternalLink, Navigation } from "lucide-react";
import { optimizeRoute } from "@/lib/maps/optimize";
import { motion } from "framer-motion";
import { useT, useDayLabel, useFormatDate } from "@/lib/i18n";

export default function DayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useT();
  const getDayLabel = useDayLabel();
  const formatDate = useFormatDate();
  const { days } = useTripStore();
  const [day, setDay] = useState<TripDay | null>(null);
  const [loadingDay, setLoadingDay] = useState(true);
  const { activities, loading: loadingActivities } = useDayActivities(id);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizedOrder, setOptimizedOrder] = useState(activities);

  useEffect(() => {
    const cached = days.find((d) => d.id === id);
    if (cached) { setDay(cached); setLoadingDay(false); return; }
    const supabase = createClient();
    supabase.from("trip_days").select("*").eq("id", id).single()
      .then(({ data }) => { if (data) setDay(data as TripDay); setLoadingDay(false); });
  }, [id, days]);

  // Include editable content (not just IDs) so edits re-render the timeline
  const activitiesKey = JSON.stringify(
    activities.map((a) => [a.id, a.name, a.description, a.address, a.notes, a.start_time, a.end_time, a.category])
  );
  useEffect(() => {
    setOptimizedOrder(activities);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activitiesKey]);

  async function handleOptimize() {
    if (activities.length < 3) return;
    setOptimizing(true);
    await new Promise((r) => setTimeout(r, 600));
    const result = optimizeRoute(activities);
    setOptimizedOrder(result.ordered_activities);
    setOptimizing(false);
  }

  function handleShare() {
    if (!day) return;
    const lines = [
      `📅 ${getDayLabel(day.date)}, ${formatDate(day.date)} — ${day.city}`,
      "",
      ...activities.map((a, i) => `${i + 1}. ${a.name}${a.start_time ? ` (${a.start_time})` : ""}`),
    ];
    const text = lines.join("\n");
    if (navigator.share) {
      navigator.share({ title: `Day ${day.day_number} — ${day.city}`, text });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    }
  }

  if (loadingDay) {
    return (
      <div className="px-4 space-y-4 pt-4">
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (!day) return notFound();

  const activitiesWithCoords = activities.filter((a) => a.latitude && a.longitude);
  const hotelName = activities.find((a) => a.address)?.address;

  return (
    <div>
      <PageHeader
        title={`${t.day.day} ${day.day_number}`}
        subtitle={formatDate(day.date)}
        showBack
        rightAction={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleShare} className="gap-1.5 text-xs">
              <Share2 className="h-3.5 w-3.5" />
              {t.share.shareDay}
            </Button>
            {activities.length >= 3 && (
              <Button size="sm" variant="outline" onClick={handleOptimize} disabled={optimizing} className="gap-1.5 text-xs">
                <Zap className="h-3.5 w-3.5" />
                {optimizing ? t.day.optimizing : t.day.optimizeRoute}
              </Button>
            )}
          </div>
        }
      />

      <div className="px-4 space-y-4 pb-6">
        {/* Day title card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-4 border border-primary/10"
        >
          <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">
            {getDayLabel(day.date)}
          </p>
          <h2 className="font-bold text-xl text-foreground">{formatDate(day.date, "EEEE, d MMMM")}</h2>
          <div className="flex items-center gap-1.5 mt-1 text-muted-foreground text-sm">
            <MapPin className="h-4 w-4" />
            <span>{day.city}</span>
          </div>
        </motion.div>

        {/* Tonight's hotel */}
        {hotelName && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800/30"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                <Hotel className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">{t.hotel.tonight}</p>
                <p className="font-semibold text-foreground text-base">{hotelName}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href={`https://waze.com/ul?q=${encodeURIComponent(hotelName)}&navigate=yes`}
                target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium bg-[#05C3DE] text-white px-3 py-2.5 rounded-xl"
              >
                <span className="text-base">🧭</span>
                Waze
              </a>
              <a
                href={getMapsUrl(hotelName, "google")}
                target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-3 py-2.5 rounded-xl"
              >
                <Navigation className="h-4 w-4" />
                Google Maps
              </a>
            </div>
          </motion.div>
        )}

        {/* Weather */}
        <WeatherCard city={day.city} date={day.date} />

        {/* Map */}
        {activitiesWithCoords.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
              {t.day.routeMap}
            </h3>
            <MapEmbed activities={optimizedOrder} height="220px" />
          </motion.div>
        )}

        {/* Timeline */}
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
            {t.day.activities}
          </h3>
          <ActivityTimeline
            activities={optimizedOrder}
            loading={loadingActivities}
            dayId={day.id}
            tripId={day.trip_id}
          />
        </div>

        {day.notes && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-2xl p-4">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">
              {t.day.notes}
            </p>
            <p className="text-sm text-foreground">{day.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
