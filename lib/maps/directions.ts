import { DirectionsResult } from "@/lib/types";

export async function getDirections(
  origin: string,
  destination: string,
  mode: "driving" | "walking" | "transit" = "driving"
): Promise<DirectionsResult | null> {
  try {
    const res = await fetch(
      `/api/directions?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${mode}`
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
