/**
 * GET /api/sensor-data
 * Always fetches fresh data from the SmartPark relay first.
 * Falls back to the local in-memory store (populated by /api/webhook) if relay is down.
 */

import { NextRequest, NextResponse } from "next/server";
import { getReadings } from "@/lib/store";

const RELAY_URL =
  process.env.RELAY_URL ||
  "https://iot-smart-park.vercel.app/api/ttn/jalrakshak-ai";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 200);

  // Always try relay first (this is where real TTN data lives)
  try {
    const res = await fetch(`${RELAY_URL}?limit=${limit}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data) && json.data.length > 0) {
        return NextResponse.json({
          status: "ok",
          source: "relay",
          count: json.data.length,
          data: json.data,
        });
      }
    }
  } catch {
    // relay unreachable — fall through to local store
  }

  // Fallback: local in-memory store (populated when webhook is configured directly)
  const readings = getReadings(limit);
  return NextResponse.json({
    status: "ok",
    source: "local",
    count: readings.length,
    data: readings,
  });
}
