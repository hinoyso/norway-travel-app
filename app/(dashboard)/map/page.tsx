"use client";
import { useTrip } from "@/hooks/useTrip";
import { useTripStore } from "@/store/tripStore";
import { PageHeader } from "@/components/navigation/PageHeader";
import { MapEmbed } from "@/components/maps/MapEmbed";
import { Activity } from "@/lib/types";
import { useT } from "@/lib/i18n";

export default function MapPage() {
  const { t } = useT();
  const { days } = useTrip();
  const { activities } = useTripStore();

  const allActivities: Activity[] = days.flatMap(
    (day) => activities[day.id] ?? []
  ).filter((a) => a.latitude && a.longitude);

  return (
    <div>
      <PageHeader title={t.map.title} subtitle={t.map.subtitle} />
      <div className="px-4 pb-6">
        <MapEmbed activities={allActivities} height="calc(100vh - 200px)" zoom={6} />
        <p className="text-sm text-center text-muted-foreground mt-3">
          {t.map.locations}: {allActivities.length} · {t.map.across} {days.length} {t.map.daysSuffix}
        </p>
      </div>
    </div>
  );
}
