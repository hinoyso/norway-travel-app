import { Activity, OptimizedRoute } from "@/lib/types";

// Nearest-neighbor TSP heuristic for route optimization
export function optimizeRoute(activities: Activity[]): OptimizedRoute {
  if (activities.length <= 2) {
    return {
      ordered_activities: activities,
      total_duration_minutes: 0,
      total_distance_meters: 0,
      savings_minutes: 0,
    };
  }

  // Filter to activities with coordinates
  const withCoords = activities.filter((a) => a.latitude && a.longitude);
  const withoutCoords = activities.filter((a) => !a.latitude || !a.longitude);

  if (withCoords.length <= 1) {
    return {
      ordered_activities: activities,
      total_duration_minutes: 0,
      total_distance_meters: 0,
      savings_minutes: 0,
    };
  }

  const ordered = [withCoords[0]];
  const remaining = withCoords.slice(1);

  while (remaining.length > 0) {
    const last = ordered[ordered.length - 1];
    let nearestIdx = 0;
    let minDist = Infinity;

    remaining.forEach((act, idx) => {
      const dist = haversineDistance(
        last.latitude!,
        last.longitude!,
        act.latitude!,
        act.longitude!
      );
      if (dist < minDist) {
        minDist = dist;
        nearestIdx = idx;
      }
    });

    ordered.push(remaining[nearestIdx]);
    remaining.splice(nearestIdx, 1);
  }

  const totalDistance = calculateTotalDistance(ordered);
  const originalDistance = calculateTotalDistance(withCoords);

  return {
    ordered_activities: [...ordered, ...withoutCoords],
    total_duration_minutes: Math.round((totalDistance / 1000 / 30) * 60), // ~30 km/h average
    total_distance_meters: totalDistance,
    savings_minutes: Math.max(
      0,
      Math.round(((originalDistance - totalDistance) / 1000 / 30) * 60)
    ),
  };
}

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number) {
  return deg * (Math.PI / 180);
}

function calculateTotalDistance(activities: Activity[]): number {
  let total = 0;
  for (let i = 1; i < activities.length; i++) {
    total += haversineDistance(
      activities[i - 1].latitude!,
      activities[i - 1].longitude!,
      activities[i].latitude!,
      activities[i].longitude!
    );
  }
  return total;
}
