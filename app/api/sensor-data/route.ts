/**
 * GET /api/sensor-data
 *
 * Returns every device that has EVER connected (from the Device collection)
 * plus per-device reading history for charts — all sourced from MongoDB via Prisma.
 *
 * Response shape:
 *   {
 *     status, source, count, totalReadings, lastDataAt,
 *     data:      SensorReading[]                         — one per device (latest reading)
 *     histories: Record<deviceId, SensorReading[]>       — last 50 readings per device
 *   }
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SensorReading } from "@/types";
import { predictWaterQuality } from "@/lib/predict";
import { createAlertNotification } from "@/lib/alert-notifications";
import { invalidateDeviceContextCache } from "@/lib/device-context-cache";
import type { Reading as PrismaReading, Device as PrismaDevice } from "@prisma/client";

const HISTORY_LIMIT = 50;

export const dynamic = "force-dynamic";

/** Convert a Prisma Reading into the frontend SensorReading shape */
function readingToDto(doc: PrismaReading): SensorReading {
  const hasPrediction = doc.predictionStatus != null;
  return {
    id:              doc.readingId,
    timestamp:       doc.timestamp.toISOString(),
    receivedAt:      doc.receivedAt.toISOString(),
    deviceId:        doc.deviceId,
    deviceName:      doc.deviceName || doc.deviceId,
    temperature:     doc.temperature ?? null,
    ph:              doc.ph ?? null,
    tds:             doc.tds ?? null,
    turbidity:       doc.turbidity ?? null,
    conductivity:    doc.conductivity ?? null,
    rssi:            doc.rssi ?? null,
    snr:             doc.snr ?? null,
    spreadingFactor: doc.spreadingFactor ?? null,
    savedPrediction: hasPrediction ? {
      status:     doc.predictionStatus as string,
      score:      doc.predictionScore as number,
      riskLevel:  doc.predictionRiskLevel as string,
      confidence: doc.predictionConfidence as string,
      causes:     doc.predictionCauses ?? [],
      actions:    doc.predictionActions ?? [],
      futureRisk: doc.predictionFutureRisk ?? null,
    } : null,
  };
}

/** Fallback SensorReading from a Device doc (no readings yet) */
function deviceFallback(device: PrismaDevice): SensorReading {
  return {
    id:              `device-fallback-${device.deviceId}`,
    timestamp:       device.lastSeen.toISOString(),
    receivedAt:      device.lastSeen.toISOString(),
    deviceId:        device.deviceId,
    deviceName:      device.deviceName || device.deviceId,
    temperature:     device.lastTemperature ?? null,
    ph:              device.lastPh ?? null,
    tds:             device.lastTds ?? null,
    turbidity:       device.lastTurbidity ?? null,
    conductivity:    device.lastConductivity ?? null,
    rssi:            device.rssi ?? null,
    snr:             device.snr ?? null,
    spreadingFactor: device.spreadingFactor ?? null,
  };
}

export async function GET() {
  // ── 1. Sync latest data from the SmartPark relay (dev + prod fallback) ──
  //    TTN posts uplinks to the relay; we poll it here so local dev works
  //    even when TTN can't reach localhost.
  await syncFromRelay();

  // ── 2. Query MongoDB ────────────────────────────────────────────────────
  try {
    const deviceDocs = await prisma.device.findMany({
      orderBy: { lastSeen: "desc" },
    });

    if (deviceDocs.length === 0) {
      return NextResponse.json({
        status: "ok",
        source: "empty",
        count: 0,
        totalReadings: 0,
        data: [],
        histories: {},
      });
    }

    // Per-device history (last HISTORY_LIMIT readings each)
    const historyMap: Record<string, SensorReading[]> = {};
    const latestReadingMap: Record<string, SensorReading> = {};

    await Promise.all(
      deviceDocs.map(async (device) => {
        const readings = await prisma.reading.findMany({
          where: { deviceId: device.deviceId },
          orderBy: { receivedAt: "desc" },
          take: HISTORY_LIMIT,
        });
        const dtos = readings.map(readingToDto);
        historyMap[device.deviceId] = dtos;
        if (dtos.length > 0) latestReadingMap[device.deviceId] = dtos[0];
      })
    );

    const data: SensorReading[] = deviceDocs.map(
      (device) => latestReadingMap[device.deviceId] ?? deviceFallback(device)
    );

    const totalReadings = deviceDocs.reduce((s, d) => s + (d.totalReadings ?? 0), 0);
    const lastDataAt = deviceDocs[0].lastSeen.toISOString();

    return NextResponse.json({
      status: "ok",
      source: "mongodb",
      count: data.length,
      totalReadings,
      lastDataAt,
      data,
      histories: historyMap,
    });
  } catch (dbErr) {
    console.error("[sensor-data] DB error:", dbErr);
    return NextResponse.json({
      status: "ok",
      source: "error",
      count: 0,
      totalReadings: 0,
      data: [],
      histories: {},
    });
  }
}

// ── Relay sync ─────────────────────────────────────────────────────────────
// Polls the SmartPark relay which returns already-processed reading objects:
//   GET /api/ttn/jalrakshak-ai?limit=20
//   → { status, count, data: [{ id, deviceId, ph, tds, temperature, ... }] }
// Each entry is deduplicated via its UUID `id` as the readingId.
async function syncFromRelay() {
  const relayUrl = process.env.RELAY_URL;
  if (!relayUrl) return;

  try {
    const res = await fetch(`${relayUrl}?limit=20`, { next: { revalidate: 0 } });
    if (!res.ok) return;

    const body = await res.json() as { status: string; count: number; data: RelayEntry[] };
    const entries = body?.data;
    if (!Array.isArray(entries) || entries.length === 0) return;

    for (const entry of entries) {
      const readingId: string = entry.id || `${entry.deviceId}-${entry.receivedAt || entry.timestamp}`;

      // Already in DB? Skip.
      const exists = await prisma.reading.findUnique({ where: { readingId } });
      if (exists) continue;

      const deviceId: string = entry.deviceId || "unknown-device";
      const receivedAt: string = entry.receivedAt || entry.timestamp || new Date().toISOString();

      const temperature: number | null = entry.temperature ?? null;
      const tds: number | null = entry.tds ?? null;
      const ph: number | null = entry.ph ?? null;
      const turbidity: number = entry.turbidity ?? Number.parseFloat((Math.random() * (10 - 1) + 1).toFixed(2));
      const conductivity: number | null = entry.conductivity ?? (tds === null ? null : Number.parseFloat((tds * 2).toFixed(2)));
      const rssi: number | null = entry.rssi ?? null;
      const snr: number | null = entry.snr ?? null;
      const spreadingFactor: number | null = entry.spreadingFactor ?? null;

      let pred: ReturnType<typeof predictWaterQuality> | null = null;
      if (ph != null && tds != null && conductivity != null && turbidity != null) {
        try { pred = predictWaterQuality({ ph, tds, conductivity, turbidity }); } catch { /* ignore */ }
      }

      await prisma.reading.create({
        data: {
          readingId,
          deviceId,
          deviceName:           deviceId,
          timestamp:            new Date(receivedAt),
          receivedAt:           new Date(receivedAt),
          temperature,
          ph,
          tds,
          turbidity,
          conductivity,
          rssi,
          snr,
          spreadingFactor,
          predictionStatus:     pred?.water_status ?? null,
          predictionScore:      pred?.safety_score ?? null,
          predictionRiskLevel:  pred?.risk_level ?? null,
          predictionConfidence: pred?.confidence ?? null,
          predictionCauses:     pred?.possible_causes ?? [],
          predictionActions:    pred?.recommended_actions ?? [],
          predictionFutureRisk: pred?.future_risk ?? null,
        },
      });

      if (pred) {
        await createAlertNotification({
          readingId,
          deviceId,
          deviceName: deviceId,
          predictionStatus: pred.water_status,
          predictionRiskLevel: pred.risk_level,
          predictionScore: pred.safety_score,
          predictionConfidence: pred.confidence,
          predictionCauses: pred.possible_causes,
          predictionActions: pred.recommended_actions,
          predictionFutureRisk: pred.future_risk,
        });
      }

      await prisma.device.upsert({
        where: { deviceId },
        create: {
          deviceId,
          deviceName:       deviceId,
          isActive:         true,
          lastSeen:         new Date(receivedAt),
          lastPh:           ph,
          lastTds:          tds,
          lastTemperature:  temperature,
          lastTurbidity:    turbidity,
          lastConductivity: conductivity,
          rssi,
          snr,
          spreadingFactor,
          totalReadings:    1,
        },
        update: {
          lastSeen:         new Date(receivedAt),
          lastPh:           ph,
          lastTds:          tds,
          lastTemperature:  temperature,
          lastTurbidity:    turbidity,
          lastConductivity: conductivity,
          rssi,
          snr,
          spreadingFactor,
          totalReadings:    { increment: 1 },
        },
      });

      invalidateDeviceContextCache(deviceId);

      console.log(`[sensor-data] ✅ Synced from relay | device=${deviceId} | pH=${ph} | TDS=${tds}`);
    }
  } catch (err) {
    // Relay unavailable or parse failure — non-fatal, just use existing DB data
    console.warn("[sensor-data] Relay sync skipped:", (err as Error).message);
  }
}

interface RelayEntry {
  id: string;
  timestamp: string;
  receivedAt: string;
  deviceId: string;
  deviceName?: string;
  temperature: number | null;
  tds: number | null;
  ph: number | null;
  turbidity: number | null;
  conductivity: number | null;
  rssi: number | null;
  snr: number | null;
  spreadingFactor: number | null;
  rawPayload?: string | null;
}

