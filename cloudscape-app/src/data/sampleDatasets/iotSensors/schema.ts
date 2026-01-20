// IoT Sensor Dataset Schema
// Industrial IoT Monitoring - Smart Factory Sensor Network

import type { BaseSchema, TableDefinition, Relationship } from '../types';

// Device types
export const DEVICE_TYPES = [
  'temperature',
  'pressure',
  'vibration',
  'humidity',
  'flow_rate',
] as const;

export type DeviceType = typeof DEVICE_TYPES[number];

// Severity levels
export const SEVERITY_LEVELS = ['critical', 'warning', 'info'] as const;
export type SeverityLevel = typeof SEVERITY_LEVELS[number];

// IoT specific schema
export interface IoTSchema extends BaseSchema {
  deviceTypes: string[];
}

// Core tables
const TABLES: TableDefinition[] = [
  {
    name: 'devices',
    displayName: 'Devices',
    description: 'IoT device registry with locations and types',
    category: 'Core',
    recordCount: 500,
    columns: [
      { name: 'device_id', type: 'UUID', primaryKey: true, description: 'Unique device identifier' },
      { name: 'device_name', type: 'VARCHAR(100)', nullable: false, description: 'Human-readable device name' },
      { name: 'device_type', type: 'VARCHAR(50)', nullable: false, description: 'Sensor type (temperature, pressure, etc.)' },
      { name: 'location', type: 'VARCHAR(100)', description: 'Physical location description' },
      { name: 'zone', type: 'VARCHAR(50)', description: 'Factory zone assignment' },
      { name: 'installed_date', type: 'TIMESTAMP', description: 'Installation date' },
      { name: 'firmware_version', type: 'VARCHAR(20)', description: 'Current firmware version' },
      { name: 'status', type: 'VARCHAR(20)', default: "'active'", description: 'Device status (active, maintenance, offline)' },
      { name: 'last_seen', type: 'TIMESTAMP', description: 'Last communication timestamp' },
      { name: 'calibration_date', type: 'DATE', description: 'Last calibration date' },
    ],
  },
  {
    name: 'sensor_readings',
    displayName: 'Sensor Readings',
    description: 'Time-series sensor measurements',
    category: 'Telemetry',
    recordCount: 100000,
    columns: [
      { name: 'reading_id', type: 'UUID', primaryKey: true, description: 'Unique reading identifier' },
      { name: 'device_id', type: 'UUID', foreignKey: 'devices.device_id', description: 'Source device' },
      { name: 'timestamp', type: 'TIMESTAMPTZ', nullable: false, description: 'Reading timestamp' },
      { name: 'value', type: 'DECIMAL(10,4)', nullable: false, description: 'Sensor reading value' },
      { name: 'unit', type: 'VARCHAR(20)', description: 'Measurement unit' },
      { name: 'quality_score', type: 'INTEGER', description: 'Data quality score (0-100)' },
      { name: 'is_anomaly', type: 'BOOLEAN', default: 'false', description: 'Flagged as anomalous' },
    ],
  },
  {
    name: 'anomalies',
    displayName: 'Anomalies',
    description: 'Detected sensor anomalies and alerts',
    category: 'Analytics',
    recordCount: 1500,
    columns: [
      { name: 'anomaly_id', type: 'UUID', primaryKey: true, description: 'Unique anomaly identifier' },
      { name: 'device_id', type: 'UUID', foreignKey: 'devices.device_id', description: 'Affected device' },
      { name: 'detected_at', type: 'TIMESTAMPTZ', nullable: false, description: 'Detection timestamp' },
      { name: 'severity', type: 'VARCHAR(20)', nullable: false, description: 'Severity level (critical, warning, info)' },
      { name: 'anomaly_type', type: 'VARCHAR(50)', description: 'Type of anomaly detected' },
      { name: 'value_recorded', type: 'DECIMAL(10,4)', description: 'Value that triggered anomaly' },
      { name: 'expected_min', type: 'DECIMAL(10,4)', description: 'Expected minimum value' },
      { name: 'expected_max', type: 'DECIMAL(10,4)', description: 'Expected maximum value' },
      { name: 'acknowledged', type: 'BOOLEAN', default: 'false', description: 'Acknowledged by operator' },
      { name: 'resolved_at', type: 'TIMESTAMPTZ', nullable: true, description: 'Resolution timestamp' },
    ],
  },
  {
    name: 'maintenance_logs',
    displayName: 'Maintenance Logs',
    description: 'Device maintenance and service records',
    category: 'Operations',
    recordCount: 3000,
    columns: [
      { name: 'log_id', type: 'UUID', primaryKey: true, description: 'Unique log identifier' },
      { name: 'device_id', type: 'UUID', foreignKey: 'devices.device_id', description: 'Maintained device' },
      { name: 'maintenance_type', type: 'VARCHAR(50)', description: 'Type of maintenance' },
      { name: 'scheduled_date', type: 'DATE', description: 'Scheduled maintenance date' },
      { name: 'completed_date', type: 'DATE', nullable: true, description: 'Completion date' },
      { name: 'technician', type: 'VARCHAR(100)', description: 'Technician name' },
      { name: 'notes', type: 'TEXT', description: 'Maintenance notes' },
      { name: 'downtime_minutes', type: 'INTEGER', description: 'Device downtime in minutes' },
      { name: 'parts_replaced', type: 'TEXT', nullable: true, description: 'Parts replaced during maintenance' },
    ],
  },
  {
    name: 'zones',
    displayName: 'Factory Zones',
    description: 'Factory zone definitions and thresholds',
    category: 'Configuration',
    recordCount: 8,
    columns: [
      { name: 'zone_id', type: 'UUID', primaryKey: true, description: 'Unique zone identifier' },
      { name: 'zone_name', type: 'VARCHAR(50)', nullable: false, description: 'Zone name' },
      { name: 'description', type: 'TEXT', description: 'Zone description' },
      { name: 'temp_min', type: 'DECIMAL(5,2)', description: 'Minimum acceptable temperature' },
      { name: 'temp_max', type: 'DECIMAL(5,2)', description: 'Maximum acceptable temperature' },
      { name: 'humidity_min', type: 'DECIMAL(5,2)', description: 'Minimum acceptable humidity' },
      { name: 'humidity_max', type: 'DECIMAL(5,2)', description: 'Maximum acceptable humidity' },
      { name: 'manager', type: 'VARCHAR(100)', description: 'Zone manager' },
    ],
  },
];

// Table relationships
const RELATIONSHIPS: Relationship[] = [
  {
    from: { table: 'sensor_readings', column: 'device_id' },
    to: { table: 'devices', column: 'device_id' },
    type: 'many-to-one',
    description: 'Each reading comes from one device',
  },
  {
    from: { table: 'anomalies', column: 'device_id' },
    to: { table: 'devices', column: 'device_id' },
    type: 'many-to-one',
    description: 'Each anomaly is detected on one device',
  },
  {
    from: { table: 'maintenance_logs', column: 'device_id' },
    to: { table: 'devices', column: 'device_id' },
    type: 'many-to-one',
    description: 'Each maintenance record is for one device',
  },
];

// Complete schema
export const IOT_SCHEMA: IoTSchema = {
  name: 'Industrial IoT Monitoring',
  description: 'Smart factory sensor network with 500+ devices tracking temperature, pressure, and vibration',
  totalRecords: TABLES.reduce((sum, t) => sum + t.recordCount, 0),
  categories: ['Core', 'Telemetry', 'Analytics', 'Operations', 'Configuration'],
  deviceTypes: [...DEVICE_TYPES],
  tables: TABLES,
  relationships: RELATIONSHIPS,
};
