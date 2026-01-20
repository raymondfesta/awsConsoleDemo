// IoT Sensor Sample Data - Mock Records for Demo Queries
// Pre-computed results for instant display

import type { DeviceType, SeverityLevel } from './schema';

// Dataset summary statistics
export const DATASET_STATS = {
  totalDevices: 500,
  activeDevices: 478,
  totalReadings: 100000,
  avgReadingsPerHour: 4500,
  anomaliesDetected: 1500,
  criticalAnomalies: 45,
  maintenanceCompleted: 2800,
  uptime: 99.2,
  dateRange: {
    start: '2024-01-01',
    end: '2025-01-15',
  },
};

// Device summary by type
export interface DeviceTypeSummary {
  device_type: DeviceType;
  count: number;
  active: number;
  offline: number;
  maintenance: number;
  avg_uptime: number;
}

export const DEVICE_TYPE_SUMMARY: DeviceTypeSummary[] = [
  { device_type: 'temperature', count: 150, active: 145, offline: 2, maintenance: 3, avg_uptime: 99.5 },
  { device_type: 'pressure', count: 120, active: 115, offline: 3, maintenance: 2, avg_uptime: 99.1 },
  { device_type: 'vibration', count: 100, active: 95, offline: 3, maintenance: 2, avg_uptime: 98.8 },
  { device_type: 'humidity', count: 80, active: 78, offline: 1, maintenance: 1, avg_uptime: 99.3 },
  { device_type: 'flow_rate', count: 50, active: 45, offline: 3, maintenance: 2, avg_uptime: 98.5 },
];

// Zone status
export interface ZoneStatus {
  zone: string;
  devices: number;
  active: number;
  anomalies_24h: number;
  avg_temp: number;
  avg_humidity: number;
  status: 'normal' | 'warning' | 'critical';
}

export const ZONE_STATUS: ZoneStatus[] = [
  { zone: 'Production Line A', devices: 120, active: 118, anomalies_24h: 12, avg_temp: 72.3, avg_humidity: 45.2, status: 'normal' },
  { zone: 'Production Line B', devices: 95, active: 94, anomalies_24h: 5, avg_temp: 71.8, avg_humidity: 44.8, status: 'normal' },
  { zone: 'Assembly Area', devices: 85, active: 82, anomalies_24h: 8, avg_temp: 73.1, avg_humidity: 46.5, status: 'normal' },
  { zone: 'Quality Control', devices: 60, active: 59, anomalies_24h: 3, avg_temp: 70.5, avg_humidity: 42.0, status: 'normal' },
  { zone: 'Warehouse', devices: 70, active: 68, anomalies_24h: 15, avg_temp: 68.2, avg_humidity: 52.1, status: 'warning' },
  { zone: 'Server Room', devices: 40, active: 38, anomalies_24h: 2, avg_temp: 65.0, avg_humidity: 40.0, status: 'normal' },
  { zone: 'Cold Storage', devices: 20, active: 19, anomalies_24h: 18, avg_temp: 35.2, avg_humidity: 30.5, status: 'critical' },
  { zone: 'Loading Dock', devices: 10, active: 10, anomalies_24h: 1, avg_temp: 74.5, avg_humidity: 55.3, status: 'normal' },
];

// Top anomaly devices
export interface TopAnomalyDevice {
  device_id: string;
  device_name: string;
  device_type: DeviceType;
  zone: string;
  anomaly_count: number;
  last_anomaly: string;
  severity: SeverityLevel;
}

export const TOP_ANOMALY_DEVICES: TopAnomalyDevice[] = [
  { device_id: 'd-cs-001', device_name: 'Cold Storage Temp #1', device_type: 'temperature', zone: 'Cold Storage', anomaly_count: 23, last_anomaly: '2025-01-15T14:30:00Z', severity: 'critical' },
  { device_id: 'd-wh-012', device_name: 'Warehouse Humidity #12', device_type: 'humidity', zone: 'Warehouse', anomaly_count: 18, last_anomaly: '2025-01-15T12:15:00Z', severity: 'warning' },
  { device_id: 'd-pl-045', device_name: 'Line A Vibration #45', device_type: 'vibration', zone: 'Production Line A', anomaly_count: 15, last_anomaly: '2025-01-14T23:45:00Z', severity: 'warning' },
  { device_id: 'd-cs-003', device_name: 'Cold Storage Temp #3', device_type: 'temperature', zone: 'Cold Storage', anomaly_count: 12, last_anomaly: '2025-01-15T11:00:00Z', severity: 'critical' },
  { device_id: 'd-pl-078', device_name: 'Line B Pressure #78', device_type: 'pressure', zone: 'Production Line B', anomaly_count: 10, last_anomaly: '2025-01-15T09:30:00Z', severity: 'warning' },
  { device_id: 'd-as-023', device_name: 'Assembly Flow #23', device_type: 'flow_rate', zone: 'Assembly Area', anomaly_count: 8, last_anomaly: '2025-01-14T16:20:00Z', severity: 'info' },
  { device_id: 'd-wh-008', device_name: 'Warehouse Temp #8', device_type: 'temperature', zone: 'Warehouse', anomaly_count: 7, last_anomaly: '2025-01-15T08:45:00Z', severity: 'warning' },
  { device_id: 'd-qc-015', device_name: 'QC Pressure #15', device_type: 'pressure', zone: 'Quality Control', anomaly_count: 5, last_anomaly: '2025-01-13T14:00:00Z', severity: 'info' },
];

// Hourly readings average
export interface HourlyReading {
  hour: string;
  avg_temp: number;
  avg_pressure: number;
  avg_humidity: number;
  reading_count: number;
}

export const HOURLY_READINGS: HourlyReading[] = [
  { hour: '00:00', avg_temp: 68.5, avg_pressure: 101.2, avg_humidity: 45.2, reading_count: 4500 },
  { hour: '01:00', avg_temp: 68.2, avg_pressure: 101.1, avg_humidity: 45.5, reading_count: 4480 },
  { hour: '02:00', avg_temp: 67.9, avg_pressure: 101.0, avg_humidity: 45.8, reading_count: 4490 },
  { hour: '03:00', avg_temp: 67.8, avg_pressure: 101.0, avg_humidity: 46.0, reading_count: 4485 },
  { hour: '04:00', avg_temp: 67.5, avg_pressure: 100.9, avg_humidity: 46.2, reading_count: 4470 },
  { hour: '05:00', avg_temp: 68.0, avg_pressure: 101.0, avg_humidity: 45.8, reading_count: 4510 },
  { hour: '06:00', avg_temp: 69.5, avg_pressure: 101.2, avg_humidity: 44.5, reading_count: 4550 },
  { hour: '07:00', avg_temp: 71.2, avg_pressure: 101.3, avg_humidity: 43.2, reading_count: 4580 },
  { hour: '08:00', avg_temp: 72.8, avg_pressure: 101.4, avg_humidity: 42.5, reading_count: 4600 },
  { hour: '09:00', avg_temp: 73.5, avg_pressure: 101.5, avg_humidity: 42.0, reading_count: 4620 },
  { hour: '10:00', avg_temp: 74.2, avg_pressure: 101.6, avg_humidity: 41.8, reading_count: 4650 },
  { hour: '11:00', avg_temp: 74.8, avg_pressure: 101.7, avg_humidity: 41.5, reading_count: 4680 },
  { hour: '12:00', avg_temp: 75.2, avg_pressure: 101.8, avg_humidity: 41.2, reading_count: 4700 },
  { hour: '13:00', avg_temp: 75.5, avg_pressure: 101.8, avg_humidity: 41.0, reading_count: 4690 },
  { hour: '14:00', avg_temp: 75.8, avg_pressure: 101.7, avg_humidity: 41.2, reading_count: 4680 },
  { hour: '15:00', avg_temp: 75.5, avg_pressure: 101.6, avg_humidity: 41.5, reading_count: 4660 },
  { hour: '16:00', avg_temp: 74.8, avg_pressure: 101.5, avg_humidity: 42.0, reading_count: 4620 },
  { hour: '17:00', avg_temp: 73.5, avg_pressure: 101.4, avg_humidity: 42.8, reading_count: 4580 },
  { hour: '18:00', avg_temp: 72.2, avg_pressure: 101.3, avg_humidity: 43.5, reading_count: 4550 },
  { hour: '19:00', avg_temp: 71.0, avg_pressure: 101.2, avg_humidity: 44.2, reading_count: 4530 },
  { hour: '20:00', avg_temp: 70.2, avg_pressure: 101.2, avg_humidity: 44.8, reading_count: 4510 },
  { hour: '21:00', avg_temp: 69.5, avg_pressure: 101.1, avg_humidity: 45.0, reading_count: 4500 },
  { hour: '22:00', avg_temp: 69.0, avg_pressure: 101.1, avg_humidity: 45.2, reading_count: 4490 },
  { hour: '23:00', avg_temp: 68.8, avg_pressure: 101.1, avg_humidity: 45.3, reading_count: 4485 },
];

// Recent anomalies
export interface RecentAnomaly {
  anomaly_id: string;
  device_name: string;
  zone: string;
  severity: SeverityLevel;
  anomaly_type: string;
  detected_at: string;
  value_recorded: number;
  expected_range: string;
  acknowledged: boolean;
}

export const RECENT_ANOMALIES: RecentAnomaly[] = [
  { anomaly_id: 'a-001', device_name: 'Cold Storage Temp #1', zone: 'Cold Storage', severity: 'critical', anomaly_type: 'Temperature spike', detected_at: '2025-01-15T14:30:00Z', value_recorded: 42.5, expected_range: '32-38°F', acknowledged: false },
  { anomaly_id: 'a-002', device_name: 'Warehouse Humidity #12', zone: 'Warehouse', severity: 'warning', anomaly_type: 'High humidity', detected_at: '2025-01-15T12:15:00Z', value_recorded: 68.2, expected_range: '40-55%', acknowledged: true },
  { anomaly_id: 'a-003', device_name: 'Line A Vibration #45', zone: 'Production Line A', severity: 'warning', anomaly_type: 'Excessive vibration', detected_at: '2025-01-14T23:45:00Z', value_recorded: 8.5, expected_range: '0-5 mm/s', acknowledged: true },
  { anomaly_id: 'a-004', device_name: 'Cold Storage Temp #3', zone: 'Cold Storage', severity: 'critical', anomaly_type: 'Temperature spike', detected_at: '2025-01-15T11:00:00Z', value_recorded: 40.1, expected_range: '32-38°F', acknowledged: false },
  { anomaly_id: 'a-005', device_name: 'Line B Pressure #78', zone: 'Production Line B', severity: 'warning', anomaly_type: 'Low pressure', detected_at: '2025-01-15T09:30:00Z', value_recorded: 95.2, expected_range: '100-105 kPa', acknowledged: true },
];

// Maintenance schedule
export interface MaintenanceRecord {
  log_id: string;
  device_name: string;
  zone: string;
  maintenance_type: string;
  scheduled_date: string;
  technician: string;
  status: 'completed' | 'scheduled' | 'overdue';
}

export const MAINTENANCE_SCHEDULE: MaintenanceRecord[] = [
  { log_id: 'm-001', device_name: 'Line A Vibration #45', zone: 'Production Line A', maintenance_type: 'Calibration', scheduled_date: '2025-01-16', technician: 'John Smith', status: 'scheduled' },
  { log_id: 'm-002', device_name: 'Cold Storage Temp #1', zone: 'Cold Storage', maintenance_type: 'Sensor replacement', scheduled_date: '2025-01-15', technician: 'Sarah Johnson', status: 'scheduled' },
  { log_id: 'm-003', device_name: 'Warehouse Humidity #8', zone: 'Warehouse', maintenance_type: 'Firmware update', scheduled_date: '2025-01-17', technician: 'Mike Chen', status: 'scheduled' },
  { log_id: 'm-004', device_name: 'QC Pressure #15', zone: 'Quality Control', maintenance_type: 'Calibration', scheduled_date: '2025-01-14', technician: 'Lisa Wang', status: 'completed' },
  { log_id: 'm-005', device_name: 'Assembly Flow #23', zone: 'Assembly Area', maintenance_type: 'Inspection', scheduled_date: '2025-01-13', technician: 'Tom Brown', status: 'completed' },
  { log_id: 'm-006', device_name: 'Server Room Temp #5', zone: 'Server Room', maintenance_type: 'Battery check', scheduled_date: '2025-01-10', technician: 'John Smith', status: 'overdue' },
];

// Sample devices for listing
export interface SampleDevice {
  device_id: string;
  device_name: string;
  device_type: DeviceType;
  zone: string;
  status: 'active' | 'maintenance' | 'offline';
  last_seen: string;
  firmware_version: string;
}

export const SAMPLE_DEVICES: SampleDevice[] = [
  { device_id: 'd-pl-001', device_name: 'Line A Temp #1', device_type: 'temperature', zone: 'Production Line A', status: 'active', last_seen: '2025-01-15T15:00:00Z', firmware_version: '2.4.1' },
  { device_id: 'd-pl-002', device_name: 'Line A Pressure #2', device_type: 'pressure', zone: 'Production Line A', status: 'active', last_seen: '2025-01-15T15:00:00Z', firmware_version: '2.4.1' },
  { device_id: 'd-pl-045', device_name: 'Line A Vibration #45', device_type: 'vibration', zone: 'Production Line A', status: 'maintenance', last_seen: '2025-01-14T23:45:00Z', firmware_version: '2.3.8' },
  { device_id: 'd-wh-001', device_name: 'Warehouse Temp #1', device_type: 'temperature', zone: 'Warehouse', status: 'active', last_seen: '2025-01-15T15:00:00Z', firmware_version: '2.4.0' },
  { device_id: 'd-cs-001', device_name: 'Cold Storage Temp #1', device_type: 'temperature', zone: 'Cold Storage', status: 'active', last_seen: '2025-01-15T14:30:00Z', firmware_version: '2.4.1' },
];

// All sample data combined
export const IOT_DATA = {
  stats: DATASET_STATS,
  deviceTypeSummary: DEVICE_TYPE_SUMMARY,
  zoneStatus: ZONE_STATUS,
  topAnomalyDevices: TOP_ANOMALY_DEVICES,
  hourlyReadings: HOURLY_READINGS,
  recentAnomalies: RECENT_ANOMALIES,
  maintenanceSchedule: MAINTENANCE_SCHEDULE,
  sampleDevices: SAMPLE_DEVICES,
};
