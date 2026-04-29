'use client';

import { useState, useEffect, useCallback } from 'react';
import { SensorReading, DeviceInfo, SensorDataStats } from '@/types/sensor';
import { SensorDataService } from '@/lib/sensor-data-service';

interface UseSensorDataOptions {
  deviceId?: string;
  pollingInterval?: number; // in milliseconds
  autoStart?: boolean;
}

interface UseSensorDataReturn {
  latestReading: SensorReading | null;
  readings: SensorReading[];
  devices: Record<string, DeviceInfo>;
  stats: SensorDataStats | null;
  isLoading: boolean;
  error: string | null;
  refreshData: () => void;
  clearDeviceData: (deviceId: string) => void;
  exportData: () => string;
}

/**
 * Custom hook for managing sensor data with polling
 */
export function useSensorData(options: UseSensorDataOptions = {}): UseSensorDataReturn {
  const { deviceId, pollingInterval = 5000, autoStart = true } = options;

  const [latestReading, setLatestReading] = useState<SensorReading | null>(null);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [devices, setDevices] = useState<Record<string, DeviceInfo>>({});
  const [stats, setStats] = useState<SensorDataStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Refresh all sensor data - fetch from API and merge with localStorage
   */
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch data from API
      try {
        const apiUrl = deviceId 
          ? `/api/sensor-data?device_id=${deviceId}&limit=500`
          : '/api/sensor-data';
        
        const response = await fetch(apiUrl);
        
        if (response.ok) {
          const apiData = await response.json();
          
          if (apiData.success) {
            if (deviceId && apiData.readings) {
              // Store fetched readings in localStorage
              apiData.readings.forEach((reading: SensorReading) => {
                SensorDataService.saveSensorReading(reading);
              });
            } else if (apiData.devices) {
              // Store all device readings
              Object.values(apiData.devices).forEach((device: any) => {
                if (device.latest_reading) {
                  SensorDataService.saveSensorReading(device.latest_reading);
                }
              });
            }
          }
        }
      } catch (apiError) {
        console.warn('API fetch failed, using localStorage only:', apiError);
      }

      // Get all devices from localStorage (now includes API data)
      const allDevices = SensorDataService.getAllDevices();
      setDevices(allDevices);

      if (deviceId) {
        // Get data for specific device
        const deviceReadings = SensorDataService.getDeviceReadings(deviceId);
        setReadings(deviceReadings);

        const latest = SensorDataService.getLatestReading(deviceId);
        setLatestReading(latest);

        const deviceStats = SensorDataService.getDeviceStats(deviceId);
        setStats(deviceStats);
      } else {
        // Get latest reading from all devices
        const allDeviceIds = Object.keys(allDevices);
        if (allDeviceIds.length > 0) {
          const latest = SensorDataService.getLatestReading(allDeviceIds[0]);
          setLatestReading(latest);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sensor data');
      console.error('Error refreshing sensor data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [deviceId]);

  /**
   * Clear data for a specific device
   */
  const clearDeviceData = useCallback((deviceId: string) => {
    try {
      SensorDataService.clearDeviceData(deviceId);
      refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear device data');
      console.error('Error clearing device data:', err);
    }
  }, [refreshData]);

  /**
   * Export all data
   */
  const exportData = useCallback(() => {
    return SensorDataService.exportData();
  }, []);

  /**
   * Initial data load
   */
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  /**
   * Set up polling interval
   */
  useEffect(() => {
    if (!autoStart) return;

    const interval = setInterval(() => {
      refreshData();
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [autoStart, pollingInterval, refreshData]);

  return {
    latestReading,
    readings,
    devices,
    stats,
    isLoading,
    error,
    refreshData,
    clearDeviceData,
    exportData,
  };
}

/**
 * Hook for simulating live sensor data (for testing)
 */
export function useSimulateSensorData(deviceId: string = 'node_01', interval: number = 10000) {
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    if (!isSimulating) return;

    const simulateReading = () => {
      const reading: SensorReading = {
        device_id: deviceId,
        temperature: 20 + Math.random() * 15, // 20-35°C
        humidity: 40 + Math.random() * 40, // 40-80%
        timestamp: new Date().toISOString(),
      };

      SensorDataService.saveSensorReading(reading);
    };

    const intervalId = setInterval(simulateReading, interval);

    return () => clearInterval(intervalId);
  }, [deviceId, interval, isSimulating]);

  return {
    isSimulating,
    startSimulation: () => setIsSimulating(true),
    stopSimulation: () => setIsSimulating(false),
  };
}
