"use client";
import { useState, useEffect } from "react";
import { Activity } from "@/lib/types";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useTripStore } from "@/store/tripStore";
import { useT } from "@/lib/i18n";

interface Props {
  open: boolean;
  onClose: () => void;
  activity: Partial<Activity> & { day_id: string; trip_id: string };
  mode: "edit" | "create";
}

const CATEGORIES = [
  { value: "sightseeing", icon: "🏛️" },
  { value: "food",        icon: "🍽️" },
  { value: "transport",   icon: "🚂" },
  { value: "accommodation",icon: "🏨" },
  { value: "outdoor",     icon: "🏔️" },
  { value: "culture",     icon: "🎭" },
  { value: "shopping",    icon: "🛍️" },
  { value: "other",       icon: "📍" },
] as const;

function parseNotes(raw?: string): { restaurant: string; driving: string; km: string } {
  const empty = { restaurant: "", driving: "", km: "" };
  if (!raw) return empty;
  try {
    const o = JSON.parse(raw);
    return {
      restaurant: o.restaurant ?? "",
      driving: o.driving ?? "",
      km: o.km ?? "",
    };
  } catch {
    // legacy plain-text notes → put them in the restaurant field so nothing is lost
    return { ...empty, restaurant: raw };
  }
}

export function EditActivitySheet({ open, onClose, activity, mode }: Props) {
  const { t } = useT();
  const { updateActivity, addActivity } = useTripStore();

  const blank = {
    name: activity.name ?? "",
    description: activity.description ?? "",
    address: activity.address ?? "",
    start_time: activity.start_time ?? "",
    end_time: activity.end_time ?? "",
    category: (activity.category ?? "sightseeing") as string,
    ...parseNotes(activity.notes),
  };

  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-load the form from the activity each time the sheet opens
  useEffect(() => {
    if (open) {
      setForm({
        name: activity.name ?? "",
        description: activity.description ?? "",
        address: activity.address ?? "",
        start_time: activity.start_time ?? "",
        end_time: activity.end_time ?? "",
        category: (activity.category ?? "sightseeing") as string,
        ...parseNotes(activity.notes),
      });
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave() {
    setError(null);
    if (!form.name.trim()) return;
    setSaving(true);
    const supabase = createClient();

    // Re-serialise structured travel info to JSON (so the chips keep working)
    const notesObj: Record<string, string> = {};
    if (form.restaurant.trim()) notesObj.restaurant = form.restaurant.trim();
    if (form.driving.trim()) notesObj.driving = form.driving.trim();
    if (form.km.trim()) notesObj.km = form.km.trim();
    const notes = Object.keys(notesObj).length ? JSON.stringify(notesObj) : null;

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      address: form.address.trim() || null,
      notes,
      start_time: form.start_time || null,
      end_time: form.end_time || null,
      category: form.category,
    };

    if (mode === "edit" && activity.id) {
      const { error: dbError } = await supabase.from("activities").update(payload).eq("id", activity.id);
      setSaving(false);
      if (dbError) { setError(dbError.message); return; }
      updateActivity(activity.day_id, { ...activity, ...payload } as Activity);
    } else {
      const { data, error: dbError } = await supabase
        .from("activities")
        .insert({ ...payload, day_id: activity.day_id, trip_id: activity.trip_id, order_index: 99 })
        .select()
        .single();
      setSaving(false);
      if (dbError) { setError(dbError.message); return; }
      if (data) addActivity(activity.day_id, data as Activity);
    }

    onClose();
  }

  const title = mode === "edit" ? t.crud.editActivity : t.crud.newActivity;
  const inputCls = "w-full rounded-xl border border-border bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      <div className="space-y-4">
        {/* Name (נקודות עצירה) */}
        <div>
          <label className="text-sm font-semibold text-foreground block mb-1.5">{t.crud.activityName} *</label>
          <input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} placeholder={t.crud.activityName} />
        </div>

        {/* Category */}
        <div>
          <label className="text-sm font-semibold text-foreground block mb-1.5">{t.categories[form.category as keyof typeof t.categories]}</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(({ value, icon }) => (
              <button
                key={value}
                onClick={() => set("category", value)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border transition-colors ${form.category === value ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-border text-foreground"}`}
              >
                {icon} {t.categories[value as keyof typeof t.categories]}
              </button>
            ))}
          </div>
        </div>

        {/* Times */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-semibold text-foreground block mb-1.5">{t.activity.time} (start)</label>
            <input type="time" value={form.start_time} onChange={(e) => set("start_time", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground block mb-1.5">{t.activity.time} (end)</label>
            <input type="time" value={form.end_time} onChange={(e) => set("end_time", e.target.value)} className={inputCls} />
          </div>
        </div>

        {/* Description (תיאור) */}
        <div>
          <label className="text-sm font-semibold text-foreground block mb-1.5">{t.activity.description}</label>
          <textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} className={`${inputCls} resize-none`} placeholder={t.activity.description} />
        </div>

        {/* Hotel */}
        <div>
          <label className="text-sm font-semibold text-foreground block mb-1.5">{t.hotel.tonight}</label>
          <input value={form.address} onChange={(e) => set("address", e.target.value)} className={inputCls} placeholder={t.hotel.tonight} />
        </div>

        {/* Structured travel info */}
        <div>
          <label className="text-sm font-semibold text-foreground block mb-1.5">{t.noteLabels.restaurant}</label>
          <input value={form.restaurant} onChange={(e) => set("restaurant", e.target.value)} className={inputCls} placeholder={t.noteLabels.restaurant} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-semibold text-foreground block mb-1.5">{t.noteLabels.driving}</label>
            <input value={form.driving} onChange={(e) => set("driving", e.target.value)} className={inputCls} placeholder={t.noteLabels.driving} />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground block mb-1.5">{t.noteLabels.km}</label>
            <input value={form.km} onChange={(e) => set("km", e.target.value)} className={inputCls} placeholder={t.noteLabels.km} />
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2 pb-2">
          <Button variant="outline" size="lg" className="flex-1 text-base" onClick={onClose}>{t.crud.cancel}</Button>
          <Button size="lg" className="flex-1 text-base" onClick={handleSave} disabled={saving || !form.name.trim()}>
            {saving ? "…" : t.crud.save}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
