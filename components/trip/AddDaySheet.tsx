"use client";
import { useState } from "react";
import { TripDay } from "@/lib/types";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useTripStore } from "@/store/tripStore";
import { useT } from "@/lib/i18n";

interface Props {
  open: boolean;
  onClose: () => void;
  tripId: string;
  suggestedDayNumber: number;
  suggestedDate?: string;
}

export function AddDaySheet({ open, onClose, tripId, suggestedDayNumber, suggestedDate }: Props) {
  const { t } = useT();
  const { addDay } = useTripStore();
  const [dayNumber, setDayNumber] = useState(String(suggestedDayNumber));
  const [date, setDate] = useState(suggestedDate ?? "");
  const [city, setCity] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!date || !city.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("trip_days")
      .insert({
        trip_id: tripId,
        day_number: parseInt(dayNumber) || suggestedDayNumber,
        date,
        city: city.trim(),
        notes: "",
      })
      .select()
      .single();

    setSaving(false);
    if (!error && data) {
      addDay(data as TripDay);
      // reset for next time
      setCity("");
      onClose();
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={t.crud.newDay}>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-foreground block mb-1.5">{t.crud.dayNumber}</label>
          <input
            type="number"
            min="1"
            value={dayNumber}
            onChange={(e) => setDayNumber(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-foreground block mb-1.5">{t.crud.date}</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-foreground block mb-1.5">{t.crud.city}</label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={t.crud.city}
          />
        </div>
        <div className="flex gap-3 pt-1">
          <Button variant="outline" size="lg" className="flex-1 text-base" onClick={onClose}>
            {t.crud.cancel}
          </Button>
          <Button size="lg" className="flex-1 text-base" onClick={handleSave} disabled={saving || !date || !city.trim()}>
            {saving ? "…" : t.crud.save}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
