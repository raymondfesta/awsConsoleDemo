// Healthcare Suggested Queries
// Pre-defined queries with natural language mappings

import type { SuggestedQuery, QueryResultColumn } from '../types';

export const HEALTHCARE_QUERIES: SuggestedQuery[] = [
  {
    id: 'appointments-by-status',
    name: 'Appointments by Status',
    description: 'Distribution of appointment statuses',
    naturalLanguage: 'Show appointment status breakdown',
    sql: `SELECT
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM appointments
GROUP BY status
ORDER BY count DESC;`,
    resultKey: 'appointmentsByStatus',
    category: 'Operations',
  },
  {
    id: 'appointments-by-specialty',
    name: 'Appointments by Specialty',
    description: 'Appointment volume and metrics by specialty',
    naturalLanguage: 'Show appointments by specialty',
    sql: `SELECT
  p.specialty,
  COUNT(a.appointment_id) as appointments,
  AVG(wait_time_minutes) as avg_wait_time,
  ROUND(SUM(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as completion_rate,
  COUNT(DISTINCT p.provider_id) as providers
FROM providers p
LEFT JOIN appointments a ON p.provider_id = a.provider_id
GROUP BY p.specialty
ORDER BY appointments DESC;`,
    resultKey: 'appointmentsBySpecialty',
    category: 'Operations',
  },
  {
    id: 'monthly-appointments',
    name: 'Monthly Appointment Trend',
    description: 'Appointment volume trend over time',
    naturalLanguage: 'Show monthly appointments',
    sql: `SELECT
  DATE_TRUNC('month', appointment_date) as month,
  COUNT(*) as scheduled,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
  SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
  SUM(CASE WHEN status = 'no_show' THEN 1 ELSE 0 END) as no_show,
  SUM(charge_amount) as revenue
FROM appointments
GROUP BY DATE_TRUNC('month', appointment_date)
ORDER BY month;`,
    resultKey: 'monthlyAppointments',
    category: 'Analytics',
  },
  {
    id: 'top-providers',
    name: 'Top Providers',
    description: 'Providers with highest appointment volume',
    naturalLanguage: 'Show top providers',
    sql: `SELECT
  p.provider_id,
  CONCAT(p.first_name, ' ', p.last_name) as provider_name,
  p.specialty,
  COUNT(a.appointment_id) as appointments,
  ROUND(SUM(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as completion_rate,
  p.avg_rating,
  COUNT(DISTINCT a.patient_id) as patients
FROM providers p
LEFT JOIN appointments a ON p.provider_id = a.provider_id
GROUP BY p.provider_id, p.first_name, p.last_name, p.specialty, p.avg_rating
ORDER BY appointments DESC
LIMIT 10;`,
    resultKey: 'topProviders',
    category: 'Providers',
  },
  {
    id: 'top-procedures',
    name: 'Top Procedures',
    description: 'Most common procedures by volume',
    naturalLanguage: 'Show top procedures',
    sql: `SELECT
  procedure_code,
  procedure_name,
  specialty,
  COUNT(*) as count,
  AVG(charge_amount) as avg_charge,
  SUM(charge_amount) as total_revenue
FROM procedures pr
JOIN providers p ON pr.provider_id = p.provider_id
GROUP BY procedure_code, procedure_name, specialty
ORDER BY count DESC
LIMIT 10;`,
    resultKey: 'topProcedures',
    category: 'Clinical',
  },
  {
    id: 'upcoming-appointments',
    name: 'Upcoming Appointments',
    description: 'Next scheduled appointments',
    naturalLanguage: 'Show upcoming appointments',
    sql: `SELECT
  a.appointment_id,
  CONCAT(pt.first_name, ' ', pt.last_name) as patient_name,
  CONCAT('Dr. ', p.last_name) as provider_name,
  a.appointment_date,
  a.appointment_time,
  a.appointment_type,
  a.status
FROM appointments a
JOIN patients pt ON a.patient_id = pt.patient_id
JOIN providers p ON a.provider_id = p.provider_id
WHERE a.appointment_date >= CURRENT_DATE AND a.status = 'scheduled'
ORDER BY a.appointment_date, a.appointment_time
LIMIT 10;`,
    resultKey: 'upcomingAppointments',
    category: 'Operations',
  },
  {
    id: 'sample-patients',
    name: 'Patient List',
    description: 'Sample of registered patients',
    naturalLanguage: 'Show patient list',
    sql: `SELECT
  patient_id,
  mrn,
  CONCAT(first_name, ' ', last_name) as patient_name,
  date_of_birth,
  insurance_provider,
  CONCAT('Dr. ', p.last_name) as primary_provider,
  last_visit
FROM patients pt
JOIN providers p ON pt.primary_provider_id = p.provider_id
ORDER BY last_visit DESC
LIMIT 10;`,
    resultKey: 'samplePatients',
    category: 'Patients',
  },
];

// Column definitions for query results
export const HEALTHCARE_QUERY_COLUMNS: Record<string, QueryResultColumn[]> = {
  appointmentsByStatus: [
    { key: 'status', label: 'Status', type: 'status' },
    { key: 'count', label: 'Count', type: 'number' },
    { key: 'percentage', label: 'Percentage', type: 'percentage' },
  ],
  appointmentsBySpecialty: [
    { key: 'specialty', label: 'Specialty', type: 'string' },
    { key: 'appointments', label: 'Appointments', type: 'number' },
    { key: 'avg_wait_time', label: 'Avg Wait (min)', type: 'number' },
    { key: 'completion_rate', label: 'Completion %', type: 'percentage' },
    { key: 'providers', label: 'Providers', type: 'number' },
  ],
  monthlyAppointments: [
    { key: 'month_display', label: 'Month', type: 'string' },
    { key: 'scheduled', label: 'Scheduled', type: 'number' },
    { key: 'completed', label: 'Completed', type: 'number' },
    { key: 'cancelled', label: 'Cancelled', type: 'number' },
    { key: 'no_show', label: 'No Show', type: 'number' },
    { key: 'revenue', label: 'Revenue', type: 'currency' },
  ],
  topProviders: [
    { key: 'provider_name', label: 'Provider', type: 'string' },
    { key: 'specialty', label: 'Specialty', type: 'string' },
    { key: 'appointments', label: 'Appointments', type: 'number' },
    { key: 'completion_rate', label: 'Completion %', type: 'percentage' },
    { key: 'avg_rating', label: 'Rating', type: 'number' },
    { key: 'patients', label: 'Patients', type: 'number' },
  ],
  topProcedures: [
    { key: 'procedure_code', label: 'Code', type: 'string' },
    { key: 'procedure_name', label: 'Procedure', type: 'string' },
    { key: 'count', label: 'Count', type: 'number' },
    { key: 'avg_charge', label: 'Avg Charge', type: 'currency' },
    { key: 'total_revenue', label: 'Revenue', type: 'currency' },
  ],
  upcomingAppointments: [
    { key: 'patient_name', label: 'Patient', type: 'string' },
    { key: 'provider_name', label: 'Provider', type: 'string' },
    { key: 'appointment_date', label: 'Date', type: 'date' },
    { key: 'appointment_time', label: 'Time', type: 'string' },
    { key: 'appointment_type', label: 'Type', type: 'string' },
    { key: 'status', label: 'Status', type: 'status' },
  ],
  samplePatients: [
    { key: 'mrn', label: 'MRN', type: 'string' },
    { key: 'patient_name', label: 'Patient', type: 'string' },
    { key: 'date_of_birth', label: 'DOB', type: 'date' },
    { key: 'insurance_provider', label: 'Insurance', type: 'string' },
    { key: 'primary_provider', label: 'Provider', type: 'string' },
    { key: 'last_visit', label: 'Last Visit', type: 'date' },
  ],
};
