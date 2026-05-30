"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Trip, TripDay, Activity } from "@/lib/types";

import { useTripStore } from "@/store/tripStore";

export function useTrip(tripId?: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentTrip, days, setCurrentTrip, setDays, setActivities } = useTripStore();

  const fetchTrip = useCallback(async () => {
    const supabase = createClient();
    setLoading(true);
    setError(null);

    try {
      let tripQuery = supabase.from("trips").select("*").order("created_at", { ascending: false });
      if (tripId) tripQuery = tripQuery.eq("id", tripId);
      else tripQuery = tripQuery.limit(1);

      const { data: tripData, error: tripError } = await tripQuery.single();
      if (tripError) throw tripError;

      setCurrentTrip(tripData as Trip);

      const { data: daysData, error: daysError } = await supabase
        .from("trip_days")
        .select("*")
        .eq("trip_id", tripData.id)
        .order("day_number", { ascending: true });

      if (daysError) throw daysError;
      setDays(((daysData as TripDay[]) ?? []).sort((a, b) => a.day_number - b.day_number));

      // Load all activities at once so counts are available on the home page
      const { data: activitiesData } = await supabase
        .from("activities")
        .select("*")
        .eq("trip_id", tripData.id)
        .order("order_index", { ascending: true });

      if (activitiesData) {
        const byDay: Record<string, Activity[]> = {};
        activitiesData.forEach((a) => {
          if (!byDay[a.day_id]) byDay[a.day_id] = [];
          byDay[a.day_id].push(a as Activity);
        });
        Object.entries(byDay).forEach(([dayId, acts]) => setActivities(dayId, acts));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load trip");
    } finally {
      setLoading(false);
    }
  }, [tripId, setCurrentTrip, setDays, setActivities]);

  useEffect(() => {
    fetchTrip();
  }, [fetchTrip]);

  return { trip: currentTrip, days, loading, error, refetch: fetchTrip };
}

export function useDayActivities(dayId: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { activities, setActivities } = useTripStore();
  const dayActivities = activities[dayId] ?? [];

  const fetchActivities = useCallback(async () => {
    if (!dayId) return;
    const supabase = createClient();
    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await supabase
        .from("activities")
        .select("*")
        .eq("day_id", dayId)
        .order("order_index", { ascending: true });

      if (err) throw err;
      setActivities(dayId, (data as Activity[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load activities");
    } finally {
      setLoading(false);
    }
  }, [dayId, setActivities]);

  useEffect(() => {
    if (dayActivities.length === 0) fetchActivities();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayId, fetchActivities]);

  return { activities: dayActivities, loading, error, refetch: fetchActivities };
}
