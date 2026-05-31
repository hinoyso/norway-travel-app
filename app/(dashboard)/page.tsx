"use client";
import { useTrip } from "@/hooks/useTrip";
import { TripHero } from "@/components/trip/TripHero";
import { DayCard } from "@/components/trip/DayCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Upload, CalendarDays, Phone, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useTripStore } from "@/store/tripStore";
import { useT } from "@/lib/i18n";
import { AddDaySheet } from "@/components/trip/AddDaySheet";
import { parseISO, addDays as addDaysFn, format } from "date-fns";

function HomeSkeletons() {
  return (
    <div className="px-4 space-y-4 pt-4">
      <Skeleton className="h-56 rounded-3xl" />
      <Skeleton className="h-6 w-32 rounded-xl" />
      {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
    </div>
  );
}

function EmergencyCard() {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const numbers = [
    { label: t.emergency.police, number: "112", color: "text-red-600" },
    { label: t.emergency.ambulance, number: "113", color: "text-orange-600" },
    { label: t.emergency.fire, number: "110", color: "text-amber-600" },
    { label: t.emergency.embassy, number: t.emergency.embassyPhone, color: "text-blue-600" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="mx-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-red-600" />
          <span className="font-semibold text-sm text-red-700 dark:text-red-400">{t.emergency.title}</span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-red-500" /> : <ChevronDown className="h-4 w-4 text-red-500" />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-2 border-t border-red-200 dark:border-red-800/30 pt-3">
          {numbers.map(({ label, number, color }) => (
            <a key={number} href={`tel:${number.replace(/\s/g, "")}`}
              className="flex items-center justify-between bg-white dark:bg-red-900/30 rounded-xl px-3 py-2.5"
            >
              <span className="text-sm text-foreground">{label}</span>
              <span className={`font-bold text-base ${color}`}>{number}</span>
            </a>
          ))}
          <p className="text-xs text-center text-muted-foreground pt-1">{t.emergency.tapToCall}</p>
        </div>
      )}
    </motion.div>
  );
}

export default function HomePage() {
  const { t } = useT();
  const { trip, days, loading, error } = useTrip();
  const { activities } = useTripStore();
  const [addDayOpen, setAddDayOpen] = useState(false);

  const maxDayNumber = days.reduce((m, d) => Math.max(m, d.day_number), 0);
  const lastDate = days.length
    ? days.reduce((m, d) => (d.date > m ? d.date : m), days[0].date)
    : "";
  const suggestedDate = lastDate
    ? format(addDaysFn(parseISO(lastDate), 1), "yyyy-MM-dd")
    : "";

  const activityCounts: Record<string, number> = {};
  days.forEach((day) => {
    activityCounts[day.id] = activities[day.id]?.length ?? 0;
  });

  if (loading) return <HomeSkeletons />;

  if (error || !trip) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-7xl mb-6">🇳🇴</div>
          <h1 className="font-bold text-2xl text-foreground mb-2">{t.home.welcome}</h1>
          <p className="text-muted-foreground text-base mb-8 max-w-xs">{t.home.uploadPrompt}</p>
          <Button asChild size="lg" className="gap-2 w-full max-w-xs">
            <Link href="/admin">
              <Upload className="h-5 w-5" />
              {t.home.uploadBtn}
            </Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <div className="pt-4">
        <TripHero trip={trip} days={days} />
      </div>

      <EmergencyCard />

      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg text-foreground flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            {t.home.yourItinerary}
          </h2>
          <span className="text-sm text-muted-foreground">{days.length} {t.hero.days}</span>
        </div>

        <div className="space-y-3">
          {days.map((day, idx) => (
            <DayCard
              key={day.id}
              day={day}
              activityCount={activityCounts[day.id]}
              index={idx}
            />
          ))}
        </div>

        {/* Add a day manually */}
        <button
          onClick={() => setAddDayOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 mt-3 rounded-2xl border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span className="text-sm font-semibold">{t.crud.addDay}</span>
        </button>

        {trip && (
          <AddDaySheet
            open={addDayOpen}
            onClose={() => setAddDayOpen(false)}
            tripId={trip.id}
            suggestedDayNumber={maxDayNumber + 1}
            suggestedDate={suggestedDate}
          />
        )}

        {days.length === 0 && (
          <div className="text-center py-10">
            <p className="text-muted-foreground">{t.home.noDays}</p>
            <Button asChild variant="link" className="mt-2">
              <Link href="/admin">{t.home.uploadFile}</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
