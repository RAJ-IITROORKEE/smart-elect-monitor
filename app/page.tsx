"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { DeviceReading, WaterPrediction, SensorReading } from "@/types";
import { DeviceCard } from "@/components/device-card";
import { HeroSection } from "@/components/hero-section";
import { StatsBar } from "@/components/stats-bar";
import { mergeIntoHistory, getDeviceHistory } from "@/lib/local-history";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const POLL_INTERVAL_MS = 60_000;

/** Feed the latest reading for each device through the prediction API */
async function buildDeviceCards(
  latestPerDevice: Map<string, SensorReading>
): Promise<DeviceReading[]> {
  const results: DeviceReading[] = [];

  for (const [, reading] of latestPerDevice) {
    const { ph, tds, turbidity, conductivity } = reading;

    // All four params must be present (0 is valid, null/undefined is not)
    const canPredict =
      ph != null && tds != null && turbidity != null && conductivity != null;

    if (!canPredict) {
      results.push({ ...reading });
      continue;
    }

    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ph: Number(ph),
          tds: Number(tds),
          conductivity: Number(conductivity),
          turbidity: Number(turbidity),
        }),
      });
      const prediction: WaterPrediction = res.ok ? await res.json() : undefined;
      results.push({ ...reading, prediction });
    } catch {
      results.push({ ...reading });
    }
  }

  return results;
}

export default function DashboardPage() {
  const [devices, setDevices] = useState<DeviceReading[]>([]);
  // deviceId → full history from localStorage
  const [deviceHistories, setDeviceHistories] = useState<Map<string, SensorReading[]>>(
    new Map()
  );
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [online, setOnline] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const res = await fetch("/api/sensor-data");
      if (!res.ok) throw new Error("fetch failed");
      const json = await res.json();
      const readings: SensorReading[] = json.data ?? [];

      // ── Persist into localStorage and get full history ──────────────────
      const allHistory = mergeIntoHistory(readings);

      // ── Build latest-per-device map (newest first from relay) ────────────
      const latestPerDevice = new Map<string, SensorReading>();
      for (const r of readings) {
        if (!latestPerDevice.has(r.deviceId)) {
          latestPerDevice.set(r.deviceId, r);
        }
      }

      // ── Build per-device history maps from localStorage ──────────────────
      const historyMap = new Map<string, SensorReading[]>();
      for (const deviceId of latestPerDevice.keys()) {
        historyMap.set(
          deviceId,
          allHistory.filter((r) => r.deviceId === deviceId).slice(0, 50)
        );
      }

      // ── Run AI predictions for each device ──────────────────────────────
      const enriched = await buildDeviceCards(latestPerDevice);

      if (!mountedRef.current) return;
      setDevices(enriched);
      setDeviceHistories(historyMap);
      setLastUpdated(new Date());
      setOnline(true);
    } catch {
      if (!mountedRef.current) return;
      setOnline(false);
    } finally {
      if (!mountedRef.current) return;
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    const timer = setInterval(() => fetchData(), POLL_INTERVAL_MS);
    return () => {
      mountedRef.current = false;
      clearInterval(timer);
    };
  }, [fetchData]);

  const safeCount = devices.filter((d) => d.prediction?.water_status === "Safe").length;
  const unsafeCount = devices.filter((d) => d.prediction?.water_status === "Unsafe").length;
  const totalReadings = Array.from(deviceHistories.values()).reduce(
    (sum, h) => sum + h.length,
    0
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <HeroSection />

      {/* Status bar */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={cn(
                "absolute inline-flex h-full w-full rounded-full opacity-75",
                online ? "animate-ping-slow bg-emerald-400" : "bg-zinc-500"
              )}
            />
            <span
              className={cn(
                "relative inline-flex h-2.5 w-2.5 rounded-full",
                online ? "bg-emerald-500" : "bg-zinc-500"
              )}
            />
          </span>
          {online ? (
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-500">
              <Wifi className="h-3.5 w-3.5" />
              Live · Auto-refreshes every 60s
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <WifiOff className="h-3.5 w-3.5" />
              Offline — showing cached data
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Last updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <StatsBar
        total={devices.length}
        safe={safeCount}
        unsafe={unsafeCount}
        readings={totalReadings}
        className="mt-4"
      />

      {/* Device Cards */}
      <section className="mt-8">
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Active Monitoring Nodes
          {devices.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({devices.length} device{devices.length !== 1 ? "s" : ""})
            </span>
          )}
        </h2>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-96 animate-pulse rounded-xl border border-border bg-card"
              />
            ))}
          </div>
        ) : devices.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
            <WifiOff className="mb-4 h-10 w-10 text-muted-foreground/40" />
            <p className="text-base font-medium text-muted-foreground">
              No devices detected yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              Waiting for TTN uplink data from LoRaWAN nodes
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {devices.map((device) => (
              <DeviceCard
                key={device.deviceId}
                device={device}
                history={deviceHistories.get(device.deviceId) ?? []}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
