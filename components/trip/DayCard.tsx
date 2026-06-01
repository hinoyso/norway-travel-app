"use client";
import { useState } from "react";
import Link from "next/link";
import { TripDay } from "@/lib/types";
import { cn } from "@/lib/utils";
import { isToday, isPast, parseISO } from "date-fns";
import { MapPin, Pencil, Trash2, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { WeatherCard } from "@/components/weather/WeatherCard";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/button";
import { useT, useDayLabel, useFormatDate } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { useTripStore } from "@/store/tripStore";

interface DayCardProps {
  day: TripDay;
  activityCount?: number;
  index?: number;
}

export function DayCard({ day, activityCount = 0, index = 0 }: DayCardProps) {
  const { t } = useT();
  const getDayLabel = useDayLabel();
  const formatDate = useFormatDate();
  const { updateDay, deleteDay } = useTripStore();
  const isCurrentDay = isToday(parseISO(day.date));
  const isPastDay = isPast(parseISO(day.date)) && !isCurrentDay;

  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editCity, setEditCity] = useState(day.city);
  const [editDayNum, setEditDayNum] = useState(String(day.day_number));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function openEdit() {
    setEditCity(day.city);
    setEditDayNum(String(day.day_number));
    setEditOpen(true);
  }

  async function handleSaveDay() {
    if (!editCity.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const newDayNum = parseInt(editDayNum) || day.day_number;
    await supabase
      .from("trip_days")
      .update({ city: editCity.trim(), day_number: newDayNum })
      .eq("id", day.id);
    updateDay({ ...day, city: editCity.trim(), day_number: newDayNum });
    setSaving(false);
    setEditOpen(false);
  }

  async function handleDeleteDay() {
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("trip_days").delete().eq("id", day.id);
    deleteDay(day.id);
    setDeleting(false);
    setConfirmDelete(false);
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.35, ease: "easeOut" }}
      >
        <div className={cn(
          "relative rounded-3xl border overflow-hidden transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.10)]",
          isCurrentDay ? "bg-card border-emerald-400/40 dark:border-emerald-500/30 ring-1 ring-emerald-400/20"
            : isPastDay ? "bg-card border-border/50 opacity-75"
            : "bg-card border-border/60"
        )}>
          {/* Main tap area → day detail */}
          <Link href={`/day/${day.id}`} dir="ltr" className="block p-4">
            <div className="flex items-center gap-3.5">
              {/* Day badge — slate / dark blue */}
              <div className="shrink-0 h-[3.25rem] w-[3.25rem] rounded-2xl flex flex-col items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 text-white shadow-sm ring-1 ring-inset ring-white/10">
                <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/55 leading-none">{t.day.day}</span>
                <span className="text-[1.6rem] font-extrabold leading-none mt-0.5">{day.day_number}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Date (primary) + today pill */}
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-extrabold text-xl text-foreground leading-tight tracking-tight truncate">
                    {formatDate(day.date, "d MMM")}
                    <span className="ms-1.5 text-sm font-medium text-muted-foreground">{getDayLabel(day.date)}</span>
                  </h3>
                  {isCurrentDay && (
                    <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-500 text-white rounded-full px-2 py-0.5 shadow-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                      {t.day.today}
                    </span>
                  )}
                </div>

                {/* City (secondary) — light blue */}
                <div className="flex items-center gap-1.5 mt-1 text-[#5BA7FF] min-w-0">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="text-sm font-semibold truncate">{day.city}</span>
                </div>

                {/* Meta (tertiary) — weather · activity count */}
                <div className="flex items-center gap-2.5 mt-2.5">
                  <WeatherCard city={day.city} date={day.date} compact />
                  <span className="text-muted-foreground/30">·</span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {activityCount} {activityCount === 1 ? t.day.activity : t.day.activities}
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Action buttons */}
          <div className="px-4 pb-4 pt-0">
            <div className="border-t border-border/50 -mx-4 mb-3" />
            <AnimatePresence mode="wait">
              {confirmDelete ? (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/30 rounded-xl p-3 border border-rose-200/70 dark:border-rose-900/50"
                >
                  <p className="flex-1 text-sm font-semibold text-rose-600 dark:text-rose-300">
                    {t.crud.confirmDelete}
                  </p>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-sm font-medium active:scale-95 transition-transform"
                  >
                    <X className="h-3.5 w-3.5" /> {t.crud.no}
                  </button>
                  <button
                    onClick={handleDeleteDay}
                    disabled={deleting}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500 text-white text-sm font-semibold active:scale-95 transition-transform"
                  >
                    <Check className="h-3.5 w-3.5" /> {deleting ? "…" : t.crud.yes}
                  </button>
                </motion.div>
              ) : (
                <motion.div key="actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
                  <button
                    onClick={openEdit}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 text-sm font-semibold ring-1 ring-inset ring-blue-600/20 hover:bg-blue-600/15 active:scale-[0.97] transition-all"
                  >
                    <Pencil className="h-4 w-4" />
                    {t.crud.edit}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm font-semibold ring-1 ring-inset ring-rose-500/20 hover:bg-rose-500/15 active:scale-[0.97] transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                    {t.crud.delete}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Edit day sheet */}
      <BottomSheet open={editOpen} onClose={() => setEditOpen(false)} title={t.crud.editDay}>
        <div className="space-y-4">
          {/* Day number */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-1.5">
              {t.day.day}
            </label>
            <input
              type="number"
              min="1"
              value={editDayNum}
              onChange={(e) => setEditDayNum(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {/* City */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-1.5">
              {t.crud.city}
            </label>
            <input
              value={editCity}
              onChange={(e) => setEditCity(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={t.crud.city}
            />
          </div>
          <div className="flex gap-3 pt-1">
            <Button variant="outline" size="lg" className="flex-1 text-base" onClick={() => setEditOpen(false)}>
              {t.crud.cancel}
            </Button>
            <Button size="lg" className="flex-1 text-base" onClick={handleSaveDay} disabled={saving || !editCity.trim()}>
              {saving ? "…" : t.crud.save}
            </Button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
