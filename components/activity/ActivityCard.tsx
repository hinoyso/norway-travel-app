"use client";
import { useState } from "react";
import Link from "next/link";
import { Activity } from "@/lib/types";
import { formatTime, categoryColor, cn } from "@/lib/utils";
import { Clock, Pencil, Trash2, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useT } from "@/lib/i18n";
import { EditActivitySheet } from "./EditActivitySheet";
import { createClient } from "@/lib/supabase/client";
import { useTripStore } from "@/store/tripStore";

interface ActivityCardProps {
  activity: Activity;
  index?: number;
  isLast?: boolean;
}

const CATEGORY_ICONS: Record<string, string> = {
  sightseeing: "🏛️", food: "🍽️", transport: "🚂", accommodation: "🏨",
  outdoor: "🏔️", culture: "🎭", shopping: "🛍️", other: "📍",
};

const CHIP_COLORS: Record<string, string> = {
  restaurant: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300",
  driving:    "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-300",
  km:         "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300",
};

function parseNotes(raw: string | undefined): Record<string, string> | null {
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function ActivityCard({ activity, index = 0, isLast = false }: ActivityCardProps) {
  const { t } = useT();
  const { deleteActivity } = useTripStore();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const notesData = parseNotes(activity.notes);

  async function handleDelete() {
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("activities").delete().eq("id", activity.id);
    deleteActivity(activity.day_id, activity.id);
    setDeleting(false);
    setConfirmDelete(false);
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.06, duration: 0.35, ease: "easeOut" }}
        className="relative flex gap-4"
      >
        {/* Timeline dot + line */}
        <div className="flex flex-col items-center shrink-0">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 border-2 border-primary/20 text-lg z-10">
            {CATEGORY_ICONS[activity.category ?? "other"]}
          </div>
          {!isLast && <div className="w-0.5 flex-1 mt-1 bg-border min-h-[2rem]" />}
        </div>

        {/* Card */}
        <div className="flex-1 mb-4">
          <div className="bg-card border border-border rounded-2xl shadow-sm">
            {/* Tap area → detail page */}
            <Link href={`/activity/${activity.id}`} className="block p-4 group">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base leading-snug text-foreground group-hover:text-primary transition-colors">
                    {activity.name}
                  </h3>
                  {activity.start_time && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 shrink-0" />
                      <span>
                        {formatTime(activity.start_time)}
                        {activity.end_time && ` — ${formatTime(activity.end_time)}`}
                      </span>
                    </div>
                  )}
                </div>
                {activity.category && activity.category !== "other" && (
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium shrink-0", categoryColor(activity.category))}>
                    {t.categories[activity.category as keyof typeof t.categories] ?? activity.category}
                  </span>
                )}
              </div>

              {activity.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{activity.description}</p>
              )}

              {/* Chips */}
              {notesData && Object.keys(notesData).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-border">
                  {Object.entries(notesData).map(([key, value]) => {
                    const label = t.noteLabels[key as keyof typeof t.noteLabels] ?? key;
                    const colorClass = CHIP_COLORS[key] ?? "bg-muted text-muted-foreground border-border";
                    return (
                      <span key={key} className={cn("inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg border font-medium", colorClass)}>
                        <span className="opacity-70">{label}:</span> {value}
                      </span>
                    );
                  })}
                </div>
              )}
            </Link>

            {/* Action buttons */}
            <div className="px-3 pb-3">
              <AnimatePresence mode="wait">
                {confirmDelete ? (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 rounded-xl p-2.5 border border-red-200 dark:border-red-800/40"
                  >
                    <p className="flex-1 text-sm font-semibold text-red-700 dark:text-red-400">{t.crud.confirmDelete}</p>
                    <button onClick={() => setConfirmDelete(false)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-sm font-medium">
                      <X className="h-3.5 w-3.5" /> {t.crud.no}
                    </button>
                    <button onClick={handleDelete} disabled={deleting}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-semibold">
                      <Check className="h-3.5 w-3.5" /> {deleting ? "…" : t.crud.yes}
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                    <button
                      onClick={() => setEditOpen(true)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-sm hover:opacity-90 active:scale-95 transition-all"
                    >
                      <Pencil className="h-3.5 w-3.5" /> {t.crud.edit}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold shadow-sm hover:opacity-90 active:scale-95 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> {t.crud.delete}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      <EditActivitySheet
        open={editOpen}
        onClose={() => setEditOpen(false)}
        activity={activity}
        mode="edit"
      />
    </>
  );
}
