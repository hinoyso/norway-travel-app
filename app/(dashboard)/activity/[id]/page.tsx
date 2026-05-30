"use client";
import React, { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Activity } from "@/lib/types";
import { PageHeader } from "@/components/navigation/PageHeader";
import { NavigationButtons } from "@/components/maps/NavigationButtons";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTime, categoryColor, cn } from "@/lib/utils";
import { Clock, MapPin, AlignLeft, ExternalLink, Car, Ruler, UtensilsCrossed, Navigation } from "lucide-react";
import { motion } from "framer-motion";
import { useT } from "@/lib/i18n";

const NOTE_ICONS: Record<string, React.ReactNode> = {
  restaurant: <UtensilsCrossed className="h-4 w-4 text-orange-500" />,
  driving:    <Car className="h-4 w-4 text-violet-500" />,
  km:         <Ruler className="h-4 w-4 text-sky-500" />,
};
const NOTE_COLORS: Record<string, string> = {
  restaurant: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800/30",
  driving:    "bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800/30",
  km:         "bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800/30",
};
const NOTE_LABEL_COLORS: Record<string, string> = {
  restaurant: "text-orange-700 dark:text-orange-400",
  driving:    "text-violet-700 dark:text-violet-400",
  km:         "text-sky-700 dark:text-sky-400",
};

function parseNotesJSON(raw: string | undefined): Record<string, string> | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw);
    if (typeof p === "object" && p !== null) return p as Record<string, string>;
  } catch {}
  return null;
}

const CATEGORY_ICONS: Record<string, string> = {
  sightseeing: "🏛️", food: "🍽️", transport: "🚂", accommodation: "🏨",
  outdoor: "🏔️", culture: "🎭", shopping: "🛍️", other: "📍",
};

export default function ActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useT();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("activities").select("*").eq("id", id).single()
      .then(({ data }) => {
        if (data) setActivity(data as Activity);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="px-4 space-y-4 pt-4">
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
    );
  }

  if (!activity) return notFound();

  const icon = CATEGORY_ICONS[activity.category ?? "other"];
  const categoryLabel = t.categories[activity.category as keyof typeof t.categories] ?? activity.category;
  const notesData = parseNotesJSON(activity.notes);
  const noteEntries = notesData ? Object.entries(notesData).filter(([, v]) => v) : [];

  return (
    <div>
      <PageHeader title={activity.name} showBack />

      <div className="px-4 space-y-4 pb-8">
        {/* Hero card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary/8 to-primary/3 rounded-3xl p-5 border border-primary/10"
        >
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl shrink-0">
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-xl text-foreground leading-snug">{activity.name}</h2>
              {activity.category && (
                <span className={cn("inline-block mt-2 text-sm px-3 py-1 rounded-full font-medium", categoryColor(activity.category))}>
                  {categoryLabel}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Time */}
        {(activity.start_time || activity.end_time) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="flex items-center gap-3 bg-card rounded-2xl p-4 border border-border"
          >
            <div className="h-10 w-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{t.activity.time}</p>
              <p className="font-semibold text-foreground text-base">
                {formatTime(activity.start_time)}
                {activity.end_time && ` — ${formatTime(activity.end_time)}`}
              </p>
            </div>
          </motion.div>
        )}

        {/* Address + Navigation */}
        {activity.address && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl p-4 border border-border space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-0.5">{t.activity.address}</p>
                <p className="text-sm text-foreground">{activity.address}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href={`https://waze.com/ul?q=${encodeURIComponent(activity.address)}&navigate=yes`}
                target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium bg-[#05C3DE] text-white px-3 py-2.5 rounded-xl"
              >
                <span>🧭</span> Waze
              </a>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.address)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 px-3 py-2.5 rounded-xl"
              >
                <Navigation className="h-4 w-4" /> Google
              </a>
            </div>
          </motion.div>
        )}

        {/* Description */}
        {activity.description && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-card rounded-2xl p-4 border border-border"
          >
            <div className="flex items-center gap-2 mb-3">
              <AlignLeft className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{t.activity.description}</p>
            </div>

            <p className="text-base text-foreground leading-relaxed whitespace-pre-line">{activity.description}</p>
          </motion.div>
        )}

        {/* Restaurant recommendation (notes field) */}
        {/* Individual note entries — one card per column */}
        {noteEntries.map(([key, value], i) => {
          const label = t.noteLabels[key as keyof typeof t.noteLabels] ?? key;
          const colorClass = NOTE_COLORS[key] ?? "bg-muted border-border";
          const labelColor = NOTE_LABEL_COLORS[key] ?? "text-muted-foreground";
          const icon = NOTE_ICONS[key] ?? <AlignLeft className="h-4 w-4 text-muted-foreground" />;
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 + i * 0.05 }}
              className={`rounded-2xl p-4 border ${colorClass}`}
            >
              <div className="flex items-center gap-2 mb-2">
                {icon}
                <p className={`text-sm font-semibold uppercase tracking-wide ${labelColor}`}>{label}</p>
              </div>
              <p className="text-base text-foreground leading-relaxed">{value}</p>
            </motion.div>
          );
        })}

        {/* Find nearby restaurants */}
        {activity.address && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          >
            <a
              href={`https://www.google.com/maps/search/restaurants+near+${encodeURIComponent(activity.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between bg-card rounded-2xl p-4 border border-border group hover:border-primary/30 transition-colors"
            >
              <div>
                <p className="font-medium text-base text-foreground">{t.activity.findNearby}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{t.activity.searchMaps}</p>
              </div>
              <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </a>
          </motion.div>
        )}
      </div>
    </div>
  );
}
