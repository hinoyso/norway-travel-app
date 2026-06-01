"use client";
import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Activity } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

interface MapEmbedProps {
  activities: Activity[];
  height?: string;
  zoom?: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  sightseeing: "#0EA5E9",
  food: "#F97316",
  transport: "#8B5CF6",
  accommodation: "#10B981",
  outdoor: "#22C55E",
  culture: "#F59E0B",
  shopping: "#EC4899",
  other: "#64748B",
};

export function MapEmbed({ activities, height = "280px", zoom = 13 }: MapEmbedProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setLoading(false);
      setError("no-key");
      return;
    }

    const activitiesWithCoords = activities.filter((a) => a.latitude && a.longitude);
    if (activitiesWithCoords.length === 0) {
      setLoading(false);
      setError("no-coords");
      return;
    }

    const loader = new Loader({ apiKey, version: "weekly", libraries: ["maps", "marker"] });

    loader.load().then(async () => {
      if (!mapRef.current) return; // guard against unmount during async load

      const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
      const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

      const center = {
        lat: activitiesWithCoords[0].latitude!,
        lng: activitiesWithCoords[0].longitude!,
      };

      const map = new Map(mapRef.current!, {
        center,
        zoom,
        mapId: "norway-travel-map",
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: "cooperative",
        styles: [
          { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
          { featureType: "transit", elementType: "labels", stylers: [{ visibility: "off" }] },
        ],
      });

      const bounds = new google.maps.LatLngBounds();

      activitiesWithCoords.forEach((activity, idx) => {
        const position = { lat: activity.latitude!, lng: activity.longitude! };
        bounds.extend(position);

        const markerEl = document.createElement("div");
        markerEl.className = "relative";
        markerEl.innerHTML = `
          <div style="
            background: ${CATEGORY_COLORS[activity.category ?? "other"]};
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 13px;
            border: 2px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.25);
          ">${idx + 1}</div>
        `;

        new AdvancedMarkerElement({
          map,
          position,
          content: markerEl,
          title: activity.name,
        });
      });

      if (activitiesWithCoords.length > 1) {
        map.fitBounds(bounds, 40);
      }

      // Draw route polyline
      if (activitiesWithCoords.length > 1) {
        const coords = activitiesWithCoords.map((a) => ({
          lat: a.latitude!,
          lng: a.longitude!,
        }));
        new google.maps.Polyline({
          path: coords,
          geodesic: true,
          strokeColor: "#E11D48",
          strokeOpacity: 0.5,
          strokeWeight: 3,
          map,
        });
      }

      setLoading(false);
    }).catch((e) => {
      setLoading(false);
      setError("load-failed: " + String(e));
    });
  }, [activities]);

  if (error) {
    const message =
      error === "no-key" ? "Google Maps API key not configured" :
      error === "no-coords" ? "No location data — re-upload your itinerary to populate coordinates" :
      `Map failed to load: ${error}`;
    return (
      <div
        className="flex flex-col items-center justify-center bg-muted/50 rounded-2xl border border-border"
        style={{ height }}
      >
        <span className="text-3xl mb-2">🗺️</span>
        <p className="text-sm text-muted-foreground text-center px-4">{message}</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-border" style={{ height }}>
      {loading && <Skeleton className="absolute inset-0 rounded-2xl" />}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
