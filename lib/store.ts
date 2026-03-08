/**
 * In-memory data store for JalRakshak sensor readings.
 * Persists for the lifetime of the Next.js server process.
 * On Vercel, this resets on each cold start — add a DB (e.g., Upstash KV)
 * for persistence if needed later.
 */

import { SensorReading } from "@/types";

interface Store {
  readings: SensorReading[];
}

// Use globalThis to survive hot-reloads in dev
const globalStore = globalThis as typeof globalThis & { jalrakshakStore?: Store };

if (!globalStore.jalrakshakStore) {
  globalStore.jalrakshakStore = { readings: [] };
}

export const store = globalStore.jalrakshakStore;

export function addReading(reading: SensorReading) {
  store.readings.unshift(reading);
  if (store.readings.length > 200) {
    store.readings = store.readings.slice(0, 200);
  }
}

export function getReadings(limit = 50): SensorReading[] {
  return store.readings.slice(0, limit);
}

export function getLatestReading(): SensorReading | null {
  return store.readings[0] ?? null;
}

/** Seed with demo data so the dashboard isn't empty on first load */
export function seedDemoData() {
  if (store.readings.length > 0) return;

  const devices = ["jalrakshak-node-01", "jalrakshak-node-02"];

  for (let i = 0; i < 10; i++) {
    const deviceId = devices[i % 2];
    const minutesAgo = i * 5;
    const ts = new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();

    const ph = parseFloat((Math.random() * (8.5 - 6.2) + 6.2).toFixed(2));
    const tds = parseFloat((Math.random() * 400 + 80).toFixed(1));
    const turbidity = parseFloat((Math.random() * 9 + 1).toFixed(2));
    const conductivity = parseFloat((tds * 2).toFixed(2));

    store.readings.push({
      id: `demo-${i}`,
      timestamp: ts,
      receivedAt: ts,
      deviceId,
      deviceName: deviceId,
      temperature: parseFloat((Math.random() * 15 + 18).toFixed(1)),
      tds,
      ph,
      turbidity,
      conductivity,
      rssi: -80 + Math.floor(Math.random() * 30),
      snr: parseFloat((Math.random() * 10 + 1).toFixed(1)),
    });
  }
}
