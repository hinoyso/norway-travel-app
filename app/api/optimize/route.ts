import { NextRequest, NextResponse } from "next/server";
import { optimizeRoute } from "@/lib/maps/optimize";
import { Activity } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { activities }: { activities: Activity[] } = await request.json();
    if (!activities?.length) {
      return NextResponse.json({ error: "No activities provided" }, { status: 400 });
    }
    const result = optimizeRoute(activities);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Optimization failed" }, { status: 500 });
  }
}
