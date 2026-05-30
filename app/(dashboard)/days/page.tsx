"use client";
import { useTrip } from "@/hooks/useTrip";
import { DayCard } from "@/components/trip/DayCard";
import { PageHeader } from "@/components/navigation/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { useTripStore } from "@/store/tripStore";
import { useT } from "@/lib/i18n";

export default function DaysPage() {
  const { t } = useT();
  const { days, loading } = useTrip();
  const { activities } = useTripStore();

  return (
    <div>
      <PageHeader
        title={t.nav.itinerary}
        subtitle={loading ? "" : `${days.length} ${t.activity.daysPlanned}`}
      />
      <div className="px-4 space-y-3 pb-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
          : days.map((day, idx) => (
              <DayCard
                key={day.id}
                day={day}
                activityCount={activities[day.id]?.length ?? 0}
                index={idx}
              />
            ))}
      </div>
    </div>
  );
}
