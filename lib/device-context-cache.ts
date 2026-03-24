import { prisma } from "@/lib/prisma";
import { buildDeviceContext, calculateDeviceStats } from "@/lib/chat-context";
import type { Device, Reading } from "@prisma/client";

interface CacheEntry {
  expiresAt: number;
  data: DeviceContextData;
}

export interface DeviceContextData {
  device: Device;
  readings: Reading[];
  stats: ReturnType<typeof calculateDeviceStats>;
  contextStr: string;
}

const DEFAULT_TTL_MS = 30_000;
const ttlFromEnv = Number(process.env.DEVICE_CONTEXT_CACHE_TTL_MS);
const CACHE_TTL_MS = Number.isFinite(ttlFromEnv) && ttlFromEnv > 0 ? ttlFromEnv : DEFAULT_TTL_MS;

const deviceContextCache = new Map<string, CacheEntry>();

async function loadDeviceContextFromDatabase(deviceId: string): Promise<DeviceContextData | null> {
  const [device, readings] = await Promise.all([
    prisma.device.findUnique({ where: { deviceId } }),
    prisma.reading.findMany({
      where: { deviceId },
      orderBy: { receivedAt: "desc" },
      take: 500,
    }),
  ]);

  if (!device) {
    return null;
  }

  const stats = calculateDeviceStats(readings);
  const contextStr = buildDeviceContext(device, readings, stats);

  return {
    device,
    readings,
    stats,
    contextStr,
  };
}

export async function getDeviceContext(deviceId: string, bypassCache = false): Promise<DeviceContextData | null> {
  const now = Date.now();
  const existing = deviceContextCache.get(deviceId);

  if (!bypassCache && existing && existing.expiresAt > now) {
    return existing.data;
  }

  const fresh = await loadDeviceContextFromDatabase(deviceId);
  if (!fresh) {
    deviceContextCache.delete(deviceId);
    return null;
  }

  deviceContextCache.set(deviceId, {
    data: fresh,
    expiresAt: now + CACHE_TTL_MS,
  });

  return fresh;
}

export function invalidateDeviceContextCache(deviceId?: string) {
  if (!deviceId) {
    deviceContextCache.clear();
    return;
  }
  deviceContextCache.delete(deviceId);
}
