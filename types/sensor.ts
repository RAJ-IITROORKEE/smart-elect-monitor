// Sensor data types
export interface SensorReading {
  device_id: string;
  temperature: number;
  humidity: number;
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

export interface SensorDataStats {
  avgTemperature: number;
  avgHumidity: number;
  minTemperature: number;
  maxTemperature: number;
  minHumidity: number;
  maxHumidity: number;
}
