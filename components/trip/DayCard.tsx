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
          "relative rounded-3xl border overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md",
          isCurrentDay ? "bg-emerald-50/60 border-emerald-400/50 dark:bg-emerald-900/15 dark:border-emerald-500/40 ring-1 ring-emerald-400/25"
            : isPastDay ? "bg-muted/40 border-border opacity-80"
            : "bg-card border-border/70"
        )}>
          {/* Main tap area → day detail */}
          <Link href={`/day/${day.id}`} className="block px-4 pt-4 pb-3">
            {/* Single line: location (left) · day + date (center) · day badge (right) */}
            <div dir="ltr" className="flex items-center gap-2 min-h-[3.5rem]">
              {/* Left zone: location */}
              <div className="flex-1 min-w-0 flex items-center">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5BA7FF] dark:text-[#6EC1FF] min-w-0">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="truncate">{day.city}</span>
                </span>
              </div>

              {/* Center zone: today pill + date */}
              <div className="shrink-0 text-center">
                {isCurrentDay && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-500 text-white rounded-full px-2.5 py-0.5 shadow-sm mb-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    {t.day.today}
                  </span>
                )}
                <p className="font-extrabold text-2xl text-foreground leading-tight tracking-tight">
                  {formatDate(day.date, "d MMM")}
                </p>
                <p className="text-sm font-medium text-muted-foreground">
                  {getDayLabel(day.date)}
                </p>
              </div>

              {/* Right zone: rose-gold day badge */}
              <div className="flex-1 flex justify-end">
                <div className="shrink-0 h-14 w-14 rounded-2xl flex flex-col items-center justify-center font-bold shadow-sm bg-gradient-to-br from-[#E6B17E] via-[#D9908C] to-[#B76E79] text-white">
                  <span className="text-[10px] font-medium uppercase tracking-wider opacity-90 leading-none [text-shadow:0_1px_1px_rgba(0,0,0,0.15)]">{t.day.day}</span>
                  <span className="text-2xl leading-none mt-0.5 [text-shadow:0_1px_2px_rgba(0,0,0,0.18)]">{day.day_number}</span>
                </div>
              </div>
            </div>

            {/* Activity count — centered below */}
            <div className="flex justify-center mt-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300 px-3 py-1 text-xs font-semibold">
                {activityCount} {activityCount === 1 ? t.day.activity : t.day.activities}
              </span>
            </div>

            <div className="mt-3">
              <WeatherCard city={day.city} date={day.date} compact />
            </div>
          </Link>

          {/* Action buttons */}
          <div className="px-4 pb-4">
            <AnimatePresence mode="wait">
              {confirmDelete ? (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 rounded-xl p-3 border border-red-200 dark:border-red-800/40"
                >
                  <p className="flex-1 text-sm font-semibold text-red-700 dark:text-red-400">
                    {t.crud.confirmDelete}
                  </p>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-sm font-medium"
                  >
                    <X className="h-3.5 w-3.5" /> {t.crud.no}
                  </button>
                  <button
                    onClick={handleDeleteDay}
                    disabled={deleting}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-semibold"
                  >
                    <Check className="h-3.5 w-3.5" /> {deleting ? "…" : t.crud.yes}
                  </button>
                </motion.div>
              ) : (
                <motion.div key="actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                  <button
                    onClick={openEdit}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-sm hover:opacity-90 active:scale-95 transition-all"
                  >
                    <Pencil className="h-4 w-4" />
                    {t.crud.edit}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold shadow-sm hover:opacity-90 active:scale-95 transition-all"
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
