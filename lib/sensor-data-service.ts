'use client';

import { SensorReading, DeviceInfo, SensorDataStats } from '@/types/sensor';

// Storage keys
const SENSOR_DATA_KEY = 'sensor_readings';
const DEVICES_KEY = 'devices_info';
const MAX_READINGS_PER_DEVICE = 1000; // Store last 1000 readings per device

/**
 * LocalStorage service for managing sensor data
 */
export class SensorDataService {
  /**
   * Check if running in browser environment
   */
  private static isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  /**
   * Save a sensor reading
   */
  static saveSensorReading(reading: SensorReading): void {
    if (!this.isBrowser()) return;

    try {
      const existingData = this.getAllReadings();
      const deviceReadings = existingData[reading.device_id] || [];
      
      // Add new reading
      deviceReadings.push(reading);
      
      // Keep only the last MAX_READINGS_PER_DEVICE readings
      if (deviceReadings.length > MAX_READINGS_PER_DEVICE) {
        deviceReadings.shift();
      }
      
      existingData[reading.device_id] = deviceReadings;
      
      localStorage.setItem(SENSOR_DATA_KEY, JSON.stringify(existingData));
      
      // Update device info
      this.updateDeviceInfo(reading.device_id);
    } catch (error) {
      console.error('Error saving sensor reading:', error);
    }
  }

  /**
   * Get all readings for all devices
   */
  static getAllReadings(): Record<string, SensorReading[]> {
    if (!this.isBrowser()) return {};

    try {
      const data = localStorage.getItem(SENSOR_DATA_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error reading sensor data:', error);
      return {};
    }
  }

  /**
   * Get readings for a specific device
   */
  static getDeviceReadings(deviceId: string, limit?: number): SensorReading[] {
    const allReadings = this.getAllReadings();
    const deviceReadings = allReadings[deviceId] || [];
    
    if (limit) {
      return deviceReadings.slice(-limit);
    }
    
    return deviceReadings;
  }

  /**
   * Get the latest reading for a device
   */
  static getLatestReading(deviceId: string): SensorReading | null {
    const readings = this.getDeviceReadings(deviceId);
    return readings.length > 0 ? readings[readings.length - 1] : null;
  }

  /**
   * Get readings within a time range
   */
  static getReadingsByTimeRange(
    deviceId: string,
    startTime: Date,
    endTime: Date
  ): SensorReading[] {
    const readings = this.getDeviceReadings(deviceId);
    
    return readings.filter((reading) => {
      const readingTime = new Date(reading.timestamp);
      return readingTime >= startTime && readingTime <= endTime;
    });
  }

  /**
   * Calculate statistics for a device
   */
  static getDeviceStats(deviceId: string, hours: number = 24): SensorDataStats | null {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    const readings = this.getReadingsByTimeRange(deviceId, cutoffTime, new Date());
    
    if (readings.length === 0) return null;
    
    const temperatures = readings.map((r) => r.temperature);
    const humidities = readings.map((r) => r.humidity);
    
    return {
      avgTemperature: temperatures.reduce((a, b) => a + b, 0) / temperatures.length,
      avgHumidity: humidities.reduce((a, b) => a + b, 0) / humidities.length,
      minTemperature: Math.min(...temperatures),
      maxTemperature: Math.max(...temperatures),
      minHumidity: Math.min(...humidities),
      maxHumidity: Math.max(...humidities),
    };
  }

  /**
   * Update device information
   */
  private static updateDeviceInfo(deviceId: string): void {
    if (!this.isBrowser()) return;

    try {
      const devices = this.getAllDevices();
      const readings = this.getDeviceReadings(deviceId);
      
      const deviceInfo: DeviceInfo = {
        device_id: deviceId,
        name: devices[deviceId]?.name || `Device ${deviceId}`,
        location: devices[deviceId]?.location,
        lastSeen: new Date().toISOString(),
        status: 'online',
        totalReadings: readings.length,
      };
      
      devices[deviceId] = deviceInfo;
      localStorage.setItem(DEVICES_KEY, JSON.stringify(devices));
    } catch (error) {
      console.error('Error updating device info:', error);
    }
  }

  /**
   * Get all registered devices
   */
  static getAllDevices(): Record<string, DeviceInfo> {
    if (!this.isBrowser()) return {};

    try {
      const data = localStorage.getItem(DEVICES_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error reading devices:', error);
      return {};
    }
  }

  /**
   * Get a specific device
   */
  static getDevice(deviceId: string): DeviceInfo | null {
    const devices = this.getAllDevices();
    return devices[deviceId] || null;
  }

  /**
   * Update device metadata (name, location)
   */
  static updateDeviceMetadata(deviceId: string, updates: Partial<DeviceInfo>): void {
    if (!this.isBrowser()) return;

    try {
      const devices = this.getAllDevices();
      if (devices[deviceId]) {
        devices[deviceId] = { ...devices[deviceId], ...updates };
        localStorage.setItem(DEVICES_KEY, JSON.stringify(devices));
      }
    } catch (error) {
      console.error('Error updating device metadata:', error);
    }
  }

  /**
   * Clear all data for a specific device
   */
  static clearDeviceData(deviceId: string): void {
    if (!this.isBrowser()) return;

    try {
      const allReadings = this.getAllReadings();
      delete allReadings[deviceId];
      localStorage.setItem(SENSOR_DATA_KEY, JSON.stringify(allReadings));
      
      const devices = this.getAllDevices();
      delete devices[deviceId];
      localStorage.setItem(DEVICES_KEY, JSON.stringify(devices));
    } catch (error) {
      console.error('Error clearing device data:', error);
    }
  }

  /**
   * Clear all stored data
   */
  static clearAllData(): void {
    if (!this.isBrowser()) return;

    try {
      localStorage.removeItem(SENSOR_DATA_KEY);
      localStorage.removeItem(DEVICES_KEY);
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }

  /**
   * Export data as JSON
   */
  static exportData(): string {
    return JSON.stringify({
      readings: this.getAllReadings(),
      devices: this.getAllDevices(),
      exportedAt: new Date().toISOString(),
    }, null, 2);
  }

  /**
   * Import data from JSON
   */
  static importData(jsonData: string): boolean {
    if (!this.isBrowser()) return false;

    try {
      const data = JSON.parse(jsonData);
      
      if (data.readings) {
        localStorage.setItem(SENSOR_DATA_KEY, JSON.stringify(data.readings));
      }
      
      if (data.devices) {
        localStorage.setItem(DEVICES_KEY, JSON.stringify(data.devices));
      }
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}
