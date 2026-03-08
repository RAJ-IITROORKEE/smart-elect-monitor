export interface SensorReading {
  id: string;
  timestamp: string;
  receivedAt: string;
  deviceId: string;
  deviceName: string;
  temperature: number | null;
  tds: number | null;
  ph: number | null;
  turbidity: number | null;
  conductivity: number | null;
  rssi?: number | null;
  snr?: number | null;
  spreadingFactor?: number | null;
}

export interface WaterPrediction {
  water_status: "Safe" | "Unsafe";
  confidence: string;
  safety_score: number;
  risk_level: "Low" | "Moderate" | "High";
  possible_causes: string[];
  recommended_actions: string[];
  future_risk: string;
}

export interface DeviceReading extends SensorReading {
  prediction?: WaterPrediction;
}
