export interface Farm {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  alert_threshold: number;
  alert_frequency_hours: number;
  alerts_enabled: boolean;
  created_at: string;
  latitude: number | null;
  longitude: number | null;
  elevation: number | null;
  crop_type: string | null;
  pending_capture: boolean;
  instant_reading_requested: boolean;
  invite_token: string | null;
  frost_alerts_enabled: boolean;
  pairing_code: string | null;
}

export interface SensorNode {
  id: string;
  farm_id: string;
  node_id: string;
  name: string;
  created_at: string;
}

export interface Reading {
  id: string;
  node_id: string;
  farm_id: string | null;
  moisture_percent: number;
  temperature_f: number;
  raw_value: number | null;
  created_at: string;
}

export interface AlertLog {
  id: string;
  farm_id: string;
  alert_type: string;
  moisture_at_alert: number | null;
  sent_at: string;
}

export type DiagnosisStatus = "Healthy" | "Water Soon" | "Water Now";
export type DiagnosisConfidence = "High" | "Medium" | "Low";

export interface Diagnosis {
  id: string;
  farm_id: string;
  node_id: string | null;
  status: DiagnosisStatus;
  explanation: string;
  confidence: DiagnosisConfidence;
  days_until_irrigation: number | null;
  best_watering_window: string | null;
  created_at: string;
}

export interface DiagnosisInput {
  moisture: number;
  temperature: number;
  history: { moisture: number; temperature: number; created_at: string }[];
  trend: number;
  hourOfDay: number;
}
