// Sensor data types
export interface SensorReading {
  device_id: string;
  temperature: number;
  humidity: number;
  occupied: boolean;
  timestamp: string;
}

export interface DeviceInfo {
  device_id: string;
  name: string;
  location?: string;
  lastSeen: string;
  status: 'online' | 'offline';
  totalReadings: number;
}

export interface DeviceControl {
  device_id: string;
  pir_enabled: boolean;
  led_enabled: boolean;
}

export interface SensorDataStats {
  avgTemperature: number;
  avgHumidity: number;
  minTemperature: number;
  maxTemperature: number;
  minHumidity: number;
  maxHumidity: number;
  occupancyRate: number; // Percentage of time occupied
}
