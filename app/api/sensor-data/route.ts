/**
 * GET /api/sensor-data
 * Priority order:
 *   1. MongoDB (our persisted readings, most reliable)
 *   2. SmartPark relay (TTN live feed, used as seed when DB is empty)
 *   3. Empty response
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Reading } from "@/models/Reading";
import { SensorReading } from "@/types";

const RELAY_URL =
  process.env.RELAY_URL ||
  "https://iot-smart-park.vercel.app/api/ttn/jalrakshak-ai";

export const dynamic = "force-dynamic";

/** Map a MongoDB Reading document → SensorReading shape the frontend expects */
function toSensorReading(doc: InstanceType<typeof Reading>): SensorReading {
  return {
    id:             doc.readingId,
    timestamp:      doc.timestamp.toISOString(),
    receivedAt:     doc.receivedAt.toISOString(),
    deviceId:       doc.deviceId,
    deviceName:     doc.deviceName,
    temperature:    doc.temperature,
    ph:             doc.ph,
    tds:            doc.tds,
    turbidity:      doc.turbidity,
    conductivity:   doc.conductivity,
    rssi:           doc.rssi ?? null,
    snr:            doc.snr ?? null,
    spreadingFactor: doc.spreadingFactor ?? null,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 500);

  // ── 1. Try MongoDB ───────────────────────────────────────────────────────
  try {
    await connectDB();
    const [docs, totalReadings] = await Promise.all([
      Reading.find().sort({ receivedAt: -1 }).limit(limit).lean(),
      Reading.countDocuments(),
    ]);

    if (docs.length > 0) {
      const data = docs.map((doc) => ({
        id:              doc.readingId,
        timestamp:       (doc.timestamp as Date).toISOString(),
        receivedAt:      (doc.receivedAt as Date).toISOString(),
        deviceId:        doc.deviceId,
        deviceName:      doc.deviceName,
        temperature:     doc.temperature ?? null,
        ph:              doc.ph ?? null,
        tds:             doc.tds ?? null,
        turbidity:       doc.turbidity ?? null,
        conductivity:    doc.conductivity ?? null,
        rssi:            doc.rssi ?? null,
        snr:             doc.snr ?? null,
        spreadingFactor: doc.spreadingFactor ?? null,
      }));

      // docs[0] is newest (sorted desc)
      const lastDataAt = (docs[0].receivedAt as Date).toISOString();

      return NextResponse.json({
        status: "ok",
        source: "mongodb",
        count: data.length,
        totalReadings,
        lastDataAt,
        data,
      });
    }
  } catch (dbErr) {
    console.warn("[sensor-data] MongoDB unavailable, falling back to relay:", dbErr);
  }

  // ── 2. Relay fallback (seeds DB on first run) ────────────────────────────
  try {
    const res = await fetch(`${RELAY_URL}?limit=${limit}`, { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data) && json.data.length > 0) {
        const relayData = json.data as SensorReading[];
        const lastDataAt: string | undefined =
          relayData[0]?.receivedAt ?? relayData[0]?.timestamp ?? undefined;
        return NextResponse.json({
          status: "ok",
          source: "relay",
          count: relayData.length,
          totalReadings: relayData.length,
          lastDataAt,
          data: relayData,
        });
      }
    }
  } catch {
    // relay also unreachable
  }

  return NextResponse.json({ status: "ok", source: "empty", count: 0, data: [] });
}

