// Healthcare Dataset Schema
// Medical Practice Management - Patient and Appointment Analytics

import type { BaseSchema, TableDefinition, Relationship } from '../types';

// Appointment status
export const APPOINTMENT_STATUSES = ['scheduled', 'completed', 'cancelled', 'no_show'] as const;
export type AppointmentStatus = typeof APPOINTMENT_STATUSES[number];

// Specialties
export const SPECIALTIES = ['General Practice', 'Cardiology', 'Orthopedics', 'Dermatology', 'Pediatrics', 'Neurology'] as const;
export type Specialty = typeof SPECIALTIES[number];

// Healthcare specific schema
export interface HealthcareSchema extends BaseSchema {
  specialties: string[];
}

// Core tables
const TABLES: TableDefinition[] = [
  {
    name: 'patients',
    displayName: 'Patients',
    description: 'Patient demographics and medical history summary',
    category: 'Core',
    recordCount: 5000,
    columns: [
      { name: 'patient_id', type: 'UUID', primaryKey: true, description: 'Unique patient identifier' },
      { name: 'mrn', type: 'VARCHAR(20)', nullable: false, description: 'Medical record number' },
      { name: 'first_name', type: 'VARCHAR(100)', description: 'First name' },
      { name: 'last_name', type: 'VARCHAR(100)', description: 'Last name' },
      { name: 'date_of_birth', type: 'DATE', description: 'Date of birth' },
      { name: 'gender', type: 'VARCHAR(20)', description: 'Gender' },
      { name: 'phone', type: 'VARCHAR(20)', description: 'Contact phone' },
      { name: 'email', type: 'VARCHAR(255)', description: 'Email address' },
      { name: 'insurance_provider', type: 'VARCHAR(100)', description: 'Insurance provider' },
      { name: 'primary_provider_id', type: 'UUID', foreignKey: 'providers.provider_id', description: 'Primary care provider' },
      { name: 'created_at', type: 'TIMESTAMP', description: 'Registration date' },
      { name: 'last_visit', type: 'DATE', description: 'Last visit date' },
    ],
  },
  {
    name: 'providers',
    displayName: 'Providers',
    description: 'Healthcare providers and staff',
    category: 'Core',
    recordCount: 200,
    columns: [
      { name: 'provider_id', type: 'UUID', primaryKey: true, description: 'Unique provider identifier' },
      { name: 'npi', type: 'VARCHAR(20)', nullable: false, description: 'National Provider Identifier' },
      { name: 'first_name', type: 'VARCHAR(100)', description: 'First name' },
      { name: 'last_name', type: 'VARCHAR(100)', description: 'Last name' },
      { name: 'specialty', type: 'VARCHAR(100)', description: 'Medical specialty' },
      { name: 'department', type: 'VARCHAR(100)', description: 'Department' },
      { name: 'email', type: 'VARCHAR(255)', description: 'Email address' },
      { name: 'is_accepting_patients', type: 'BOOLEAN', default: 'true', description: 'Accepting new patients' },
      { name: 'avg_rating', type: 'DECIMAL(3,2)', description: 'Average patient rating' },
    ],
  },
  {
    name: 'appointments',
    displayName: 'Appointments',
    description: 'Patient appointment scheduling',
    category: 'Operations',
    recordCount: 25000,
    columns: [
      { name: 'appointment_id', type: 'UUID', primaryKey: true, description: 'Unique appointment identifier' },
      { name: 'patient_id', type: 'UUID', foreignKey: 'patients.patient_id', description: 'Patient' },
      { name: 'provider_id', type: 'UUID', foreignKey: 'providers.provider_id', description: 'Provider' },
      { name: 'appointment_date', type: 'DATE', nullable: false, description: 'Appointment date' },
      { name: 'appointment_time', type: 'TIME', nullable: false, description: 'Appointment time' },
      { name: 'duration_minutes', type: 'INTEGER', description: 'Appointment duration' },
      { name: 'appointment_type', type: 'VARCHAR(50)', description: 'Type of appointment' },
      { name: 'status', type: 'VARCHAR(50)', nullable: false, description: 'Appointment status' },
      { name: 'reason', type: 'TEXT', description: 'Reason for visit' },
      { name: 'notes', type: 'TEXT', description: 'Provider notes' },
      { name: 'created_at', type: 'TIMESTAMP', description: 'When scheduled' },
    ],
  },
  {
    name: 'procedures',
    displayName: 'Procedures',
    description: 'Medical procedures performed',
    category: 'Clinical',
    recordCount: 15000,
    columns: [
      { name: 'procedure_id', type: 'UUID', primaryKey: true, description: 'Unique procedure identifier' },
      { name: 'appointment_id', type: 'UUID', foreignKey: 'appointments.appointment_id', description: 'Related appointment' },
      { name: 'patient_id', type: 'UUID', foreignKey: 'patients.patient_id', description: 'Patient' },
      { name: 'provider_id', type: 'UUID', foreignKey: 'providers.provider_id', description: 'Performing provider' },
      { name: 'procedure_code', type: 'VARCHAR(20)', description: 'CPT code' },
      { name: 'procedure_name', type: 'VARCHAR(255)', description: 'Procedure name' },
      { name: 'performed_date', type: 'DATE', description: 'Date performed' },
      { name: 'diagnosis_code', type: 'VARCHAR(20)', description: 'ICD-10 diagnosis code' },
      { name: 'charge_amount', type: 'DECIMAL(10,2)', description: 'Charge amount' },
    ],
  },
  {
    name: 'prescriptions',
    displayName: 'Prescriptions',
    description: 'Medication prescriptions',
    category: 'Clinical',
    recordCount: 30000,
    columns: [
      { name: 'prescription_id', type: 'UUID', primaryKey: true, description: 'Unique prescription identifier' },
      { name: 'patient_id', type: 'UUID', foreignKey: 'patients.patient_id', description: 'Patient' },
      { name: 'provider_id', type: 'UUID', foreignKey: 'providers.provider_id', description: 'Prescribing provider' },
      { name: 'medication_name', type: 'VARCHAR(255)', nullable: false, description: 'Medication name' },
      { name: 'dosage', type: 'VARCHAR(100)', description: 'Dosage instructions' },
      { name: 'quantity', type: 'INTEGER', description: 'Quantity prescribed' },
      { name: 'refills', type: 'INTEGER', description: 'Number of refills' },
      { name: 'prescribed_date', type: 'DATE', description: 'Prescription date' },
      { name: 'is_active', type: 'BOOLEAN', default: 'true', description: 'Active prescription' },
    ],
  },
];

// Table relationships
const RELATIONSHIPS: Relationship[] = [
  {
    from: { table: 'patients', column: 'primary_provider_id' },
    to: { table: 'providers', column: 'provider_id' },
    type: 'many-to-one',
    description: 'Each patient has one primary provider',
  },
  {
    from: { table: 'appointments', column: 'patient_id' },
    to: { table: 'patients', column: 'patient_id' },
    type: 'many-to-one',
    description: 'Each appointment is for one patient',
  },
  {
    from: { table: 'appointments', column: 'provider_id' },
    to: { table: 'providers', column: 'provider_id' },
    type: 'many-to-one',
    description: 'Each appointment is with one provider',
  },
  {
    from: { table: 'procedures', column: 'patient_id' },
    to: { table: 'patients', column: 'patient_id' },
    type: 'many-to-one',
    description: 'Each procedure is for one patient',
  },
  {
    from: { table: 'prescriptions', column: 'patient_id' },
    to: { table: 'patients', column: 'patient_id' },
    type: 'many-to-one',
    description: 'Each prescription is for one patient',
  },
];

// Complete schema
export const HEALTHCARE_SCHEMA: HealthcareSchema = {
  name: 'Medical Practice Analytics',
  description: 'Healthcare practice management with patients, providers, appointments, and clinical data',
  totalRecords: TABLES.reduce((sum, t) => sum + t.recordCount, 0),
  categories: ['Core', 'Operations', 'Clinical'],
  specialties: [...SPECIALTIES],
  tables: TABLES,
  relationships: RELATIONSHIPS,
};
