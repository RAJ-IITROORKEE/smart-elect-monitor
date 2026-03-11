/**
 * POST /api/webhook
 * Receives TTN uplink data for JalRakshak AI nodes.
 * Configure your TTN webhook to point to:
 *   https://<your-domain>/api/webhook
 *
 * For local development, use the live SmartPark relay:
 *   POST iot-smart-park.vercel.app/api/ttn/jalrakshak-ai
 *   GET  iot-smart-park.vercel.app/api/ttn/jalrakshak-ai  (read latest)
 */

import { NextRequest, NextResponse } from "next/server";
import { SensorReading } from "@/types";
import { prisma } from "@/lib/prisma";
import { predictWaterQuality } from "@/lib/predict";

const TTN_SECRET = process.env.TTN_WEBHOOK_SECRET || null;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-TTN-Secret",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  // Optional secret check
  if (TTN_SECRET) {
    const secret = req.headers.get("x-ttn-secret") || "";
    if (secret !== TTN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: CORS });
    }
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: CORS });
  }

  const deviceId: string =
    (body?.end_device_ids as Record<string, unknown>)?.device_id as string ||
    "unknown-device";

  const decoded = (body?.uplink_message as Record<string, unknown>)?.decoded_payload as Record<string, unknown> || {};
  const rawPayload = (body?.uplink_message as Record<string, unknown>)?.frm_payload as string || null;
  const rxMeta = ((body?.uplink_message as Record<string, unknown>)?.rx_metadata as unknown[]) || [];
  const firstMeta = (rxMeta[0] as Record<string, unknown>) || {};
  const settings = (body?.uplink_message as Record<string, unknown>)?.settings as Record<string, unknown> || {};

  let temperature: number | null = (decoded.temperature as number) ?? null;
  let tds: number | null = (decoded.tds as number) ?? null;
  let ph: number | null = (decoded.ph as number) ?? null;

  // Raw byte decode fallback
  if ((temperature === null || tds === null || ph === null) && rawPayload) {
    try {
      const bytes = Buffer.from(rawPayload, "base64");
      if (bytes.length >= 6) {
        temperature = ((bytes[0] << 8) | bytes[1]) / 10;
        tds = (bytes[2] << 8) | bytes[3];
        ph = ((bytes[4] << 8) | bytes[5]) / 100;
      }
    } catch {
      // ignore
    }
  }

  const turbidity = parseFloat((Math.random() * (10 - 1) + 1).toFixed(2));
  const conductivity = tds !== null ? parseFloat((tds * 2).toFixed(2)) : null;

  const reading: SensorReading = {
    id: crypto.randomUUID(),
    timestamp: (body?.received_at as string) || new Date().toISOString(),
    receivedAt: new Date().toISOString(),
    deviceId,
    deviceName: deviceId,
    temperature,
    tds,
    ph,
    turbidity,
    conductivity,
    rssi: (firstMeta.rssi as number) ?? null,
    snr: (firstMeta.snr as number) ?? null,
    spreadingFactor:
      ((settings?.data_rate as Record<string, unknown>)?.lora as Record<string, unknown>)?.spreading_factor as number ?? null,
  };

  // ── Persist to MongoDB via Prisma ──────────────────────────────────────
  try {
    // Run AI prediction inline so it is saved with the reading
    let pred: ReturnType<typeof predictWaterQuality> | null = null;
    if (
      reading.ph != null &&
      reading.tds != null &&
      reading.conductivity != null &&
      reading.turbidity != null
    ) {
      try {
        pred = predictWaterQuality({
          ph: Number(reading.ph),
          tds: Number(reading.tds),
          conductivity: Number(reading.conductivity),
          turbidity: Number(reading.turbidity),
        });
      } catch {
        // prediction failure must not block the webhook response
      }
    }

    // Upsert the reading (idempotent on readingId)
    await prisma.reading.upsert({
      where: { readingId: reading.id },
      create: {
        readingId:            reading.id,
        deviceId:             reading.deviceId,
        deviceName:           reading.deviceName,
        timestamp:            new Date(reading.timestamp),
        receivedAt:           new Date(reading.receivedAt),
        temperature:          reading.temperature,
        ph:                   reading.ph,
        tds:                  reading.tds,
        turbidity:            reading.turbidity,
        conductivity:         reading.conductivity,
        rssi:                 reading.rssi ?? null,
        snr:                  reading.snr ?? null,
        spreadingFactor:      reading.spreadingFactor ?? null,
        predictionStatus:     pred?.water_status ?? null,
        predictionScore:      pred?.safety_score ?? null,
        predictionRiskLevel:  pred?.risk_level ?? null,
        predictionConfidence: pred?.confidence ?? null,
        predictionCauses:     pred?.possible_causes ?? [],
        predictionActions:    pred?.recommended_actions ?? [],
        predictionFutureRisk: pred?.future_risk ?? null,
      },
      update: {
        deviceName:           reading.deviceName,
        timestamp:            new Date(reading.timestamp),
        receivedAt:           new Date(reading.receivedAt),
        temperature:          reading.temperature,
        ph:                   reading.ph,
        tds:                  reading.tds,
        turbidity:            reading.turbidity,
        conductivity:         reading.conductivity,
        rssi:                 reading.rssi ?? null,
        snr:                  reading.snr ?? null,
        spreadingFactor:      reading.spreadingFactor ?? null,
        predictionStatus:     pred?.water_status ?? null,
        predictionScore:      pred?.safety_score ?? null,
        predictionRiskLevel:  pred?.risk_level ?? null,
        predictionConfidence: pred?.confidence ?? null,
        predictionCauses:     pred?.possible_causes ?? [],
        predictionActions:    pred?.recommended_actions ?? [],
        predictionFutureRisk: pred?.future_risk ?? null,
      },
    });

    // Upsert device (update last-seen + latest sensor values)
    await prisma.device.upsert({
      where: { deviceId },
      create: {
        deviceId,
        deviceName:       deviceId,
        isActive:         true,
        lastSeen:         new Date(),
        lastPh:           reading.ph,
        lastTds:          reading.tds,
        lastTemperature:  reading.temperature,
        lastTurbidity:    reading.turbidity,
        lastConductivity: reading.conductivity,
        rssi:             reading.rssi ?? null,
        snr:              reading.snr ?? null,
        spreadingFactor:  reading.spreadingFactor ?? null,
        totalReadings:    1,
      },
      update: {
        deviceName:       deviceId,
        lastSeen:         new Date(),
        lastPh:           reading.ph,
        lastTds:          reading.tds,
        lastTemperature:  reading.temperature,
        lastTurbidity:    reading.turbidity,
        lastConductivity: reading.conductivity,
        rssi:             reading.rssi ?? null,
        snr:              reading.snr ?? null,
        spreadingFactor:  reading.spreadingFactor ?? null,
        totalReadings:    { increment: 1 },
      },
    });

    console.log(`[JalRakshak] ✅ Saved to MongoDB | device=${deviceId}`);
  } catch (dbErr) {
    console.error("[JalRakshak] ⚠ MongoDB save failed:", dbErr);
    // Don't fail the webhook — TTN won't retry on 5xx if we return ok below
  }

  return NextResponse.json(
    { status: "ok", id: reading.id },
    { headers: CORS }
  );
}
