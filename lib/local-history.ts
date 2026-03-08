"use client";

import { useEffect, useCallback, useRef } from "react";
import { SensorReading } from "@/types";

const STORAGE_KEY = "jalrakshak_history";
const MAX_STORED = 500; // max readings across all devices

export function loadHistory(): SensorReading[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SensorReading[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(readings: SensorReading[]) {
  if (typeof window === "undefined") return;
  try {
    const trimmed = readings.slice(0, MAX_STORED);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // storage full — clear and retry
    localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * Merges new readings into the persisted localStorage history.
 * De-duplicates by reading `id`.
 * Returns the merged full history.
 */
export function mergeIntoHistory(newReadings: SensorReading[]): SensorReading[] {
  const existing = loadHistory();
  const existingIds = new Set(existing.map((r) => r.id));

  const toAdd = newReadings.filter((r) => !existingIds.has(r.id));
  if (toAdd.length === 0) return existing;

  // Newest first
  const merged = [...toAdd, ...existing].slice(0, MAX_STORED);
  saveHistory(merged);
  return merged;
}

/**
 * Returns history for a specific device from localStorage.
 */
export function getDeviceHistory(deviceId: string, limit = 50): SensorReading[] {
  return loadHistory()
    .filter((r) => r.deviceId === deviceId)
    .slice(0, limit);
}

/**
 * React hook: automatically merges incoming readings into localStorage
 * and returns the full persisted history.
 */
export function useLocalHistory(latestReadings: SensorReading[]) {
  const historyRef = useRef<SensorReading[]>([]);

  const refresh = useCallback(() => {
    historyRef.current = loadHistory();
  }, []);

  useEffect(() => {
    // Load on mount
    historyRef.current = loadHistory();
  }, []);

  useEffect(() => {
    if (latestReadings.length === 0) return;
    historyRef.current = mergeIntoHistory(latestReadings);
  }, [latestReadings]);

  return { history: historyRef.current, refresh };
}
