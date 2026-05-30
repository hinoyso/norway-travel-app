"use client";
import { Trip, TripDay } from "@/lib/types";
import { formatDate, getDayLabel, getCountdown } from "@/lib/utils";
import { parseISO, differenceInDays, isToday, isBefore } from "date-fns";
import { MapPin, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useT, useFormatDate } from "@/lib/i18n";

interface TripHeroProps {
  trip: Trip;
  days: TripDay[];
}

export function TripHero({ trip, days }: TripHeroProps) {
  const { t } = useT();
  const formatDate = useFormatDate();
  const today = new Date();
  const startDate = parseISO(trip.start_date);
  const endDate = parseISO(trip.end_date);
  const totalDays = days.length;
  const daysUntilTrip = differenceInDays(startDate, today);
  const isOngoing = isBefore(startDate, today) && isBefore(today, endDate);
  const currentDay = isOngoing
    ? days.find((d) => isToday(parseISO(d.date)))
    : null;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-norway-blue via-norway-fjord to-[#1a3a6b] text-white mx-4 mb-4">
      {/* Decorative aurora overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            "radial-gradient(ellipse at top right, #7EC8E3 0%, transparent 60%), radial-gradient(ellipse at bottom left, #2D5A27 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10 p-6">
        {/* Trip name + destination */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-white/60 text-xs uppercase tracking-widest font-medium mb-1">
              {t.hero.yourJourney}
            </p>
            <h1 className="font-bold text-2xl leading-tight text-balance">{trip.name}</h1>
          </div>
          <div className="flex items-center gap-1.5 bg-white/10 rounded-xl px-3 py-1.5 shrink-0">
            <MapPin className="h-3.5 w-3.5" />
            <span className="text-sm font-medium">{trip.destination}</span>
          </div>
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2 text-white/70 text-sm mb-5">
          <Calendar className="h-4 w-4" />
          <span>
            {formatDate(trip.start_date, "d MMM")} — {formatDate(trip.end_date, "d MMM yyyy")}
          </span>
        </div>

        {/* Stats row — only show 2 boxes: days and cities */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 rounded-2xl p-3 text-center"
          >
            <p className="font-bold text-2xl">{totalDays}</p>
            <p className="text-white/60 text-sm">{t.hero.days}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white/10 rounded-2xl p-3 text-center"
          >
            <p className="font-bold text-2xl">
              {new Set(days.map((d) => d.city)).size}
            </p>
            <p className="text-white/60 text-sm">{t.hero.cities}</p>
          </motion.div>
        </div>

        {/* Current day callout */}
        {currentDay && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 bg-white/15 border border-white/20 rounded-2xl p-3 flex items-center gap-3"
          >
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
              {currentDay.day_number}
            </div>
            <div>
              <p className="text-xs text-white/60">{t.hero.todayIn}</p>
              <p className="font-semibold">{currentDay.city}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
