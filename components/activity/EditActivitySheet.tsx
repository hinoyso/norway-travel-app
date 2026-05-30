"use client";
import { useState } from "react";
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

export function EditActivitySheet({ open, onClose, activity, mode }: Props) {
  const { t } = useT();
  const { updateActivity, addActivity } = useTripStore();
  const [form, setForm] = useState({
    name: activity.name ?? "",
    description: activity.description ?? "",
    address: activity.address ?? "",
    notes: (() => {
      if (!activity.notes) return "";
      try { return Object.entries(JSON.parse(activity.notes)).map(([k, v]) => `${k}: ${v}`).join("\n"); }
      catch { return activity.notes; }
    })(),
    start_time: activity.start_time ?? "",
    end_time: activity.end_time ?? "",
    category: activity.category ?? "sightseeing",
  });
  const [saving, setSaving] = useState(false);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    const supabase = createClient();

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      address: form.address.trim() || null,
      notes: form.notes.trim() || null,
      start_time: form.start_time || null,
      end_time: form.end_time || null,
      category: form.category,
    };

    if (mode === "edit" && activity.id) {
      await supabase.from("activities").update(payload).eq("id", activity.id);
      updateActivity(activity.day_id, { ...activity, ...payload } as Activity);
    } else {
      const { data } = await supabase
        .from("activities")
        .insert({ ...payload, day_id: activity.day_id, trip_id: activity.trip_id, order_index: 99 })
        .select()
        .single();
      if (data) addActivity(activity.day_id, data as Activity);
    }

    setSaving(false);
    onClose();
  }

  const title = mode === "edit" ? t.crud.editActivity : t.crud.newActivity;

  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">{t.crud.activityName} *</label>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={t.crud.activityName}
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">{t.categories[form.category as keyof typeof t.categories]}</label>
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
            <label className="text-sm font-medium text-foreground block mb-1.5">{t.activity.time} (start)</label>
            <input type="time" value={form.start_time} onChange={(e) => set("start_time", e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">{t.activity.time} (end)</label>
            <input type="time" value={form.end_time} onChange={(e) => set("end_time", e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">{t.activity.description}</label>
          <textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder={t.activity.description} />
        </div>

        {/* Hotel */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">{t.hotel.tonight}</label>
          <input value={form.address} onChange={(e) => set("address", e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={t.hotel.tonight} />
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">{t.activity.travelInfo}</label>
          <textarea rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder={t.activity.travelInfo} />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2 pb-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>{t.crud.cancel}</Button>
          <Button className="flex-1" onClick={handleSave} disabled={saving || !form.name.trim()}>
            {saving ? "…" : t.crud.save}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
