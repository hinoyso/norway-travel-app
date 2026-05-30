"use client";
import { useState } from "react";
import { Activity } from "@/lib/types";
import { ActivityCard } from "./ActivityCard";
import { EditActivitySheet } from "./EditActivitySheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useT } from "@/lib/i18n";
import { Plus } from "lucide-react";

interface ActivityTimelineProps {
  activities: Activity[];
  loading?: boolean;
  dayId?: string;
  tripId?: string;
}

export function ActivityTimeline({ activities, loading = false, dayId, tripId }: ActivityTimelineProps) {
  const { t } = useT();
  const [addOpen, setAddOpen] = useState(false);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <Skeleton className="flex-1 h-28 rounded-2xl" />
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <span className="text-5xl mb-3">🗺️</span>
        <p className="font-semibold text-foreground">{t.activity.noActivities}</p>
        <p className="text-sm text-muted-foreground mt-1">{t.activity.uploadPrompt}</p>
      </div>
    );
  }

  return (
    <div className="py-2">
      {activities.map((activity, idx) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          index={idx}
          isLast={idx === activities.length - 1}
        />
      ))}

      {/* Add activity button */}
      {dayId && tripId && (
        <>
          <button
            onClick={() => setAddOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors mt-2"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm font-medium">{t.crud.add}</span>
          </button>
          <EditActivitySheet
            open={addOpen}
            onClose={() => setAddOpen(false)}
            activity={{ day_id: dayId, trip_id: tripId }}
            mode="create"
          />
        </>
      )}
    </div>
  );
}
