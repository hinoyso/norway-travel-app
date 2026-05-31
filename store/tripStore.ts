"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Trip, TripDay, Activity } from "@/lib/types";

export type Language = "en" | "he" | "no";

interface TripState {
  currentTrip: Trip | null;
  days: TripDay[];
  activities: Record<string, Activity[]>;
  selectedDayId: string | null;
  offlineMode: boolean;
  language: Language;
  setCurrentTrip: (trip: Trip | null) => void;
  setDays: (days: TripDay[]) => void;
  setActivities: (dayId: string, activities: Activity[]) => void;
  setSelectedDay: (dayId: string | null) => void;
  setOfflineMode: (offline: boolean) => void;
  setLanguage: (lang: Language) => void;
  clearStore: () => void;
  updateActivity: (dayId: string, activity: Activity) => void;
  deleteActivity: (dayId: string, activityId: string) => void;
  addActivity: (dayId: string, activity: Activity) => void;
  updateDay: (day: TripDay) => void;
  deleteDay: (dayId: string) => void;
  addDay: (day: TripDay) => void;
}

export const useTripStore = create<TripState>()(
  persist(
    (set) => ({
      currentTrip: null,
      days: [],
      activities: {},
      selectedDayId: null,
      offlineMode: false,
      language: "he",
      setCurrentTrip: (trip) => set({ currentTrip: trip }),
      setDays: (days) => set({ days }),
      setActivities: (dayId, activities) =>
        set((state) => ({ activities: { ...state.activities, [dayId]: activities } })),
      setSelectedDay: (dayId) => set({ selectedDayId: dayId }),
      setOfflineMode: (offlineMode) => set({ offlineMode }),
      setLanguage: (language) => set({ language }),
      clearStore: () =>
        set({ currentTrip: null, days: [], activities: {}, selectedDayId: null }),
      updateActivity: (dayId, activity) =>
        set((s) => ({
          activities: {
            ...s.activities,
            [dayId]: (s.activities[dayId] ?? []).map((a) => a.id === activity.id ? activity : a),
          },
        })),
      deleteActivity: (dayId, activityId) =>
        set((s) => ({
          activities: {
            ...s.activities,
            [dayId]: (s.activities[dayId] ?? []).filter((a) => a.id !== activityId),
          },
        })),
      addActivity: (dayId, activity) =>
        set((s) => ({
          activities: {
            ...s.activities,
            [dayId]: [...(s.activities[dayId] ?? []), activity],
          },
        })),
      updateDay: (day) =>
        set((s) => ({
          days: s.days
            .map((d) => d.id === day.id ? day : d)
            .sort((a, b) => a.day_number - b.day_number),
        })),
      deleteDay: (dayId) =>
        set((s) => ({
          days: s.days.filter((d) => d.id !== dayId),
          activities: Object.fromEntries(Object.entries(s.activities).filter(([k]) => k !== dayId)),
        })),
      addDay: (day) =>
        set((s) => ({
          days: [...s.days, day].sort((a, b) => a.day_number - b.day_number),
        })),
    }),
    {
      name: "norway-trip-store",
      partialize: (state) => ({
        currentTrip: state.currentTrip,
        days: state.days,
        activities: state.activities,
        language: state.language,
      }),
    }
  )
);
