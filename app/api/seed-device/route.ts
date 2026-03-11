/**
 * POST /api/seed-device
 *
 * Idempotent seed: if NO devices exist, creates "hydro-monitor-01" with 25
 * realistic historical readings spread over the last 3 hours.
 * Safe to call multiple times — no-op once any device exists.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DEVICE_ID = "hydro-monitor-01";
const DEVICE_NAME = "Hydro Monitor 01";
const NUM_READINGS = 25;
const LAST_READING_AGO_MS = 3 * 60 * 1000;
const HISTORY_SPAN_MS = 3 * 60 * 60 * 1000;

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

function makeReading(
  prev: { ph: number; tds: number; temp: number; turbidity: number }
) {
  const ph = clamp(prev.ph + (Math.random() - 0.5) * 0.15, 6, 9);
  const tds = clamp(prev.tds + (Math.random() - 0.5) * 20, 80, 450);
  const temp = clamp(prev.temp + (Math.random() - 0.5) * 0.5, 18, 32);
  const turbidity = clamp(prev.turbidity + (Math.random() - 0.5) * 0.5, 0.5, 8);
  const conductivity = Number.parseFloat((tds * 2 * (0.95 + Math.random() * 0.1)).toFixed(2));
  return {
    ph: Number.parseFloat(ph.toFixed(2)),
    tds: Number.parseFloat(tds.toFixed(1)),
    temp: Number.parseFloat(temp.toFixed(1)),
    turbidity: Number.parseFloat(turbidity.toFixed(2)),
    conductivity,
  };
}

export async function POST() {
  try {
    const existingCount = await prisma.device.count();
    if (existingCount > 0) {
      return NextResponse.json({
        status: "skipped",
        message: `${existingCount} device(s) already in DB — seed not needed.`,
        existingCount,
      });
    }

    const now = Date.now();
    const timestamps: Date[] = [];
    for (let i = NUM_READINGS - 1; i >= 0; i--) {
      const offset = LAST_READING_AGO_MS + (HISTORY_SPAN_MS / (NUM_READINGS - 1)) * i;
      timestamps.unshift(new Date(now - offset));
    }

    let state = { ph: 7.2, tds: 180, temp: 24.5, turbidity: 2.1, conductivity: 360 };
    const readingData = timestamps.map((ts) => {
      state = makeReading(state);
      return {
        readingId: crypto.randomUUID(),
        deviceId: DEVICE_ID,
        deviceName: DEVICE_NAME,
        timestamp: ts,
        receivedAt: ts,
        temperature: state.temp,
        ph: state.ph,
        tds: state.tds,
        turbidity: state.turbidity,
        conductivity: state.conductivity,
        rssi: -80 + Math.floor(Math.random() * 20),
        snr: Number.parseFloat((5 + Math.random() * 7).toFixed(1)),
        spreadingFactor: 7,
      };
    });

    // Batch create readings
    await prisma.reading.createMany({ data: readingData });

    const latest = readingData.at(-1)!;

    // Create device
    await prisma.device.create({
      data: {
        deviceId: DEVICE_ID,
        deviceName: DEVICE_NAME,
        isActive: true,
        lastSeen: latest.receivedAt,
        lastPh: latest.ph,
        lastTds: latest.tds,
        lastTemperature: latest.temperature,
        lastTurbidity: latest.turbidity,
        lastConductivity: latest.conductivity,
        rssi: latest.rssi,
        snr: latest.snr,
        spreadingFactor: latest.spreadingFactor,
        totalReadings: readingData.length,
      },
    });

    return NextResponse.json({
      status: "seeded",
      deviceId: DEVICE_ID,
      readingsCreated: readingData.length,
      latestReadingAt: latest.receivedAt,
      message: "hydro-monitor-01 seeded with history.",
    });
  } catch (err) {
    console.error("[seed-device]", err);
    return NextResponse.json({ status: "error", message: String(err) }, { status: 500 });
  }
}
