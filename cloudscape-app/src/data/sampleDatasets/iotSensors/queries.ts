// IoT Sensor Suggested Queries
// Pre-defined queries with natural language mappings

import type { SuggestedQuery, QueryResultColumn } from '../types';

export const IOT_QUERIES: SuggestedQuery[] = [
  {
    id: 'zone-status',
    name: 'Zone Status',
    description: 'Current status of all factory zones',
    naturalLanguage: 'Show zone status',
    sql: `SELECT
  zone,
  COUNT(*) as devices,
  SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
  COUNT(DISTINCT CASE WHEN a.detected_at > NOW() - INTERVAL '24 hours' THEN a.anomaly_id END) as anomalies_24h,
  AVG(CASE WHEN device_type = 'temperature' THEN sr.value END) as avg_temp,
  AVG(CASE WHEN device_type = 'humidity' THEN sr.value END) as avg_humidity
FROM devices d
LEFT JOIN sensor_readings sr ON d.device_id = sr.device_id
LEFT JOIN anomalies a ON d.device_id = a.device_id
GROUP BY zone;`,
    resultKey: 'zoneStatus',
    category: 'Overview',
  },
  {
    id: 'device-types',
    name: 'Devices by Type',
    description: 'Summary of devices grouped by sensor type',
    naturalLanguage: 'Show devices by type',
    sql: `SELECT
  device_type,
  COUNT(*) as count,
  SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
  SUM(CASE WHEN status = 'offline' THEN 1 ELSE 0 END) as offline,
  SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance
FROM devices
GROUP BY device_type
ORDER BY count DESC;`,
    resultKey: 'deviceTypeSummary',
    category: 'Devices',
  },
  {
    id: 'top-anomaly-devices',
    name: 'Top Anomaly Devices',
    description: 'Devices with most anomalies detected',
    naturalLanguage: 'Show devices with most anomalies',
    sql: `SELECT
  d.device_id,
  d.device_name,
  d.device_type,
  d.zone,
  COUNT(a.anomaly_id) as anomaly_count,
  MAX(a.detected_at) as last_anomaly,
  MAX(a.severity) as severity
FROM devices d
JOIN anomalies a ON d.device_id = a.device_id
GROUP BY d.device_id, d.device_name, d.device_type, d.zone
ORDER BY anomaly_count DESC
LIMIT 10;`,
    resultKey: 'topAnomalyDevices',
    category: 'Anomalies',
  },
  {
    id: 'hourly-readings',
    name: 'Hourly Averages',
    description: 'Average sensor readings by hour',
    naturalLanguage: 'Show hourly sensor readings',
    sql: `SELECT
  DATE_TRUNC('hour', timestamp) as hour,
  AVG(CASE WHEN d.device_type = 'temperature' THEN value END) as avg_temp,
  AVG(CASE WHEN d.device_type = 'pressure' THEN value END) as avg_pressure,
  AVG(CASE WHEN d.device_type = 'humidity' THEN value END) as avg_humidity,
  COUNT(*) as reading_count
FROM sensor_readings sr
JOIN devices d ON sr.device_id = d.device_id
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', timestamp)
ORDER BY hour;`,
    resultKey: 'hourlyReadings',
    category: 'Telemetry',
  },
  {
    id: 'recent-anomalies',
    name: 'Recent Anomalies',
    description: 'Latest detected anomalies',
    naturalLanguage: 'Show recent anomalies',
    sql: `SELECT
  a.anomaly_id,
  d.device_name,
  d.zone,
  a.severity,
  a.anomaly_type,
  a.detected_at,
  a.value_recorded,
  CONCAT(a.expected_min, '-', a.expected_max) as expected_range,
  a.acknowledged
FROM anomalies a
JOIN devices d ON a.device_id = d.device_id
ORDER BY a.detected_at DESC
LIMIT 10;`,
    resultKey: 'recentAnomalies',
    category: 'Anomalies',
  },
  {
    id: 'maintenance-schedule',
    name: 'Maintenance Schedule',
    description: 'Upcoming and recent maintenance',
    naturalLanguage: 'Show maintenance schedule',
    sql: `SELECT
  ml.log_id,
  d.device_name,
  d.zone,
  ml.maintenance_type,
  ml.scheduled_date,
  ml.technician,
  CASE
    WHEN ml.completed_date IS NOT NULL THEN 'completed'
    WHEN ml.scheduled_date < CURRENT_DATE THEN 'overdue'
    ELSE 'scheduled'
  END as status
FROM maintenance_logs ml
JOIN devices d ON ml.device_id = d.device_id
ORDER BY ml.scheduled_date DESC
LIMIT 10;`,
    resultKey: 'maintenanceSchedule',
    category: 'Operations',
  },
  {
    id: 'sample-devices',
    name: 'Device List',
    description: 'Sample of registered devices',
    naturalLanguage: 'Show device list',
    sql: `SELECT
  device_id,
  device_name,
  device_type,
  zone,
  status,
  last_seen,
  firmware_version
FROM devices
ORDER BY device_name
LIMIT 10;`,
    resultKey: 'sampleDevices',
    category: 'Devices',
  },
];

// Column definitions for query results
export const IOT_QUERY_COLUMNS: Record<string, QueryResultColumn[]> = {
  zoneStatus: [
    { key: 'zone', label: 'Zone', type: 'string' },
    { key: 'devices', label: 'Devices', type: 'number' },
    { key: 'active', label: 'Active', type: 'number' },
    { key: 'anomalies_24h', label: 'Anomalies (24h)', type: 'number' },
    { key: 'avg_temp', label: 'Avg Temp', type: 'number' },
    { key: 'status', label: 'Status', type: 'status' },
  ],
  deviceTypeSummary: [
    { key: 'device_type', label: 'Type', type: 'string' },
    { key: 'count', label: 'Total', type: 'number' },
    { key: 'active', label: 'Active', type: 'number' },
    { key: 'offline', label: 'Offline', type: 'number' },
    { key: 'maintenance', label: 'Maintenance', type: 'number' },
    { key: 'avg_uptime', label: 'Uptime %', type: 'percentage' },
  ],
  topAnomalyDevices: [
    { key: 'device_name', label: 'Device', type: 'string' },
    { key: 'device_type', label: 'Type', type: 'string' },
    { key: 'zone', label: 'Zone', type: 'string' },
    { key: 'anomaly_count', label: 'Anomalies', type: 'number' },
    { key: 'last_anomaly', label: 'Last Anomaly', type: 'date' },
    { key: 'severity', label: 'Severity', type: 'status' },
  ],
  hourlyReadings: [
    { key: 'hour', label: 'Hour', type: 'string' },
    { key: 'avg_temp', label: 'Avg Temp (°F)', type: 'number' },
    { key: 'avg_pressure', label: 'Avg Pressure (kPa)', type: 'number' },
    { key: 'avg_humidity', label: 'Avg Humidity (%)', type: 'number' },
    { key: 'reading_count', label: 'Readings', type: 'number' },
  ],
  recentAnomalies: [
    { key: 'device_name', label: 'Device', type: 'string' },
    { key: 'zone', label: 'Zone', type: 'string' },
    { key: 'severity', label: 'Severity', type: 'status' },
    { key: 'anomaly_type', label: 'Type', type: 'string' },
    { key: 'detected_at', label: 'Detected', type: 'date' },
    { key: 'acknowledged', label: 'Ack', type: 'string' },
  ],
  maintenanceSchedule: [
    { key: 'device_name', label: 'Device', type: 'string' },
    { key: 'zone', label: 'Zone', type: 'string' },
    { key: 'maintenance_type', label: 'Type', type: 'string' },
    { key: 'scheduled_date', label: 'Scheduled', type: 'date' },
    { key: 'technician', label: 'Technician', type: 'string' },
    { key: 'status', label: 'Status', type: 'status' },
  ],
  sampleDevices: [
    { key: 'device_id', label: 'ID', type: 'string' },
    { key: 'device_name', label: 'Name', type: 'string' },
    { key: 'device_type', label: 'Type', type: 'string' },
    { key: 'zone', label: 'Zone', type: 'string' },
    { key: 'status', label: 'Status', type: 'status' },
    { key: 'firmware_version', label: 'Firmware', type: 'string' },
  ],
};
