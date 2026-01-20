// Healthcare Sample Data - Mock Records for Demo Queries
// Pre-computed results for instant display

import type { AppointmentStatus, Specialty } from './schema';

// Dataset summary statistics
export const DATASET_STATS = {
  totalPatients: 5000,
  activePatients: 4200,
  totalProviders: 200,
  totalAppointments: 25000,
  completedAppointments: 21500,
  totalProcedures: 15000,
  totalPrescriptions: 30000,
  avgWaitTime: 12,
  dateRange: {
    start: '2024-01-01',
    end: '2025-01-15',
  },
};

// Appointments by status
export interface AppointmentsByStatus {
  status: AppointmentStatus;
  count: number;
  percentage: number;
}

export const APPOINTMENTS_BY_STATUS: AppointmentsByStatus[] = [
  { status: 'completed', count: 21500, percentage: 86.0 },
  { status: 'scheduled', count: 2000, percentage: 8.0 },
  { status: 'cancelled', count: 1000, percentage: 4.0 },
  { status: 'no_show', count: 500, percentage: 2.0 },
];

// Appointments by specialty
export interface AppointmentsBySpecialty {
  specialty: Specialty;
  appointments: number;
  avg_wait_time: number;
  completion_rate: number;
  providers: number;
}

export const APPOINTMENTS_BY_SPECIALTY: AppointmentsBySpecialty[] = [
  { specialty: 'General Practice', appointments: 8500, avg_wait_time: 10, completion_rate: 88.5, providers: 45 },
  { specialty: 'Cardiology', appointments: 4200, avg_wait_time: 15, completion_rate: 85.2, providers: 28 },
  { specialty: 'Orthopedics', appointments: 3800, avg_wait_time: 18, completion_rate: 84.0, providers: 32 },
  { specialty: 'Dermatology', appointments: 3200, avg_wait_time: 12, completion_rate: 87.5, providers: 25 },
  { specialty: 'Pediatrics', appointments: 2800, avg_wait_time: 8, completion_rate: 90.2, providers: 35 },
  { specialty: 'Neurology', appointments: 2500, avg_wait_time: 20, completion_rate: 82.8, providers: 35 },
];

// Monthly appointments trend
export interface MonthlyAppointments {
  month: string;
  month_display: string;
  scheduled: number;
  completed: number;
  cancelled: number;
  no_show: number;
  revenue: number;
}

export const MONTHLY_APPOINTMENTS: MonthlyAppointments[] = [
  { month: '2024-01', month_display: 'Jan 2024', scheduled: 2100, completed: 1800, cancelled: 180, no_show: 45, revenue: 245000 },
  { month: '2024-02', month_display: 'Feb 2024', scheduled: 1950, completed: 1680, cancelled: 165, no_show: 42, revenue: 228000 },
  { month: '2024-03', month_display: 'Mar 2024', scheduled: 2200, completed: 1890, cancelled: 190, no_show: 48, revenue: 256000 },
  { month: '2024-04', month_display: 'Apr 2024', scheduled: 2050, completed: 1760, cancelled: 175, no_show: 44, revenue: 238000 },
  { month: '2024-05', month_display: 'May 2024', scheduled: 2150, completed: 1850, cancelled: 185, no_show: 46, revenue: 251000 },
  { month: '2024-06', month_display: 'Jun 2024', scheduled: 2000, completed: 1720, cancelled: 170, no_show: 43, revenue: 233000 },
  { month: '2024-07', month_display: 'Jul 2024', scheduled: 1900, completed: 1630, cancelled: 165, no_show: 41, revenue: 221000 },
  { month: '2024-08', month_display: 'Aug 2024', scheduled: 2100, completed: 1800, cancelled: 180, no_show: 45, revenue: 244000 },
  { month: '2024-09', month_display: 'Sep 2024', scheduled: 2250, completed: 1935, cancelled: 195, no_show: 49, revenue: 262000 },
  { month: '2024-10', month_display: 'Oct 2024', scheduled: 2300, completed: 1975, cancelled: 200, no_show: 50, revenue: 268000 },
  { month: '2024-11', month_display: 'Nov 2024', scheduled: 2100, completed: 1800, cancelled: 180, no_show: 45, revenue: 244000 },
  { month: '2024-12', month_display: 'Dec 2024', scheduled: 1900, completed: 1630, cancelled: 165, no_show: 41, revenue: 221000 },
];

// Top providers by appointments
export interface TopProvider {
  provider_id: string;
  provider_name: string;
  specialty: Specialty;
  appointments: number;
  completion_rate: number;
  avg_rating: number;
  patients: number;
}

export const TOP_PROVIDERS: TopProvider[] = [
  { provider_id: 'prov-001', provider_name: 'Dr. Sarah Johnson', specialty: 'General Practice', appointments: 850, completion_rate: 92.5, avg_rating: 4.8, patients: 420 },
  { provider_id: 'prov-002', provider_name: 'Dr. Michael Chen', specialty: 'Cardiology', appointments: 720, completion_rate: 88.2, avg_rating: 4.7, patients: 310 },
  { provider_id: 'prov-003', provider_name: 'Dr. Emily Rodriguez', specialty: 'Pediatrics', appointments: 680, completion_rate: 94.1, avg_rating: 4.9, patients: 380 },
  { provider_id: 'prov-004', provider_name: 'Dr. James Wilson', specialty: 'Orthopedics', appointments: 620, completion_rate: 86.5, avg_rating: 4.6, patients: 285 },
  { provider_id: 'prov-005', provider_name: 'Dr. Lisa Park', specialty: 'Dermatology', appointments: 580, completion_rate: 90.8, avg_rating: 4.8, patients: 340 },
  { provider_id: 'prov-006', provider_name: 'Dr. Robert Taylor', specialty: 'Neurology', appointments: 520, completion_rate: 85.2, avg_rating: 4.5, patients: 240 },
];

// Top procedures by volume
export interface TopProcedure {
  procedure_code: string;
  procedure_name: string;
  specialty: Specialty;
  count: number;
  avg_charge: number;
  total_revenue: number;
}

export const TOP_PROCEDURES: TopProcedure[] = [
  { procedure_code: '99213', procedure_name: 'Office Visit - Established Patient', specialty: 'General Practice', count: 4500, avg_charge: 125, total_revenue: 562500 },
  { procedure_code: '99214', procedure_name: 'Office Visit - Detailed', specialty: 'General Practice', count: 2800, avg_charge: 175, total_revenue: 490000 },
  { procedure_code: '93000', procedure_name: 'Electrocardiogram', specialty: 'Cardiology', count: 1200, avg_charge: 85, total_revenue: 102000 },
  { procedure_code: '29881', procedure_name: 'Knee Arthroscopy', specialty: 'Orthopedics', count: 450, avg_charge: 3500, total_revenue: 1575000 },
  { procedure_code: '11102', procedure_name: 'Skin Biopsy', specialty: 'Dermatology', count: 850, avg_charge: 250, total_revenue: 212500 },
  { procedure_code: '95810', procedure_name: 'Sleep Study', specialty: 'Neurology', count: 320, avg_charge: 1200, total_revenue: 384000 },
];

// Upcoming appointments
export interface UpcomingAppointment {
  appointment_id: string;
  patient_name: string;
  provider_name: string;
  appointment_date: string;
  appointment_time: string;
  appointment_type: string;
  status: AppointmentStatus;
}

export const UPCOMING_APPOINTMENTS: UpcomingAppointment[] = [
  { appointment_id: 'appt-001', patient_name: 'John Smith', provider_name: 'Dr. Sarah Johnson', appointment_date: '2025-01-16', appointment_time: '09:00', appointment_type: 'Follow-up', status: 'scheduled' },
  { appointment_id: 'appt-002', patient_name: 'Mary Williams', provider_name: 'Dr. Michael Chen', appointment_date: '2025-01-16', appointment_time: '09:30', appointment_type: 'New Patient', status: 'scheduled' },
  { appointment_id: 'appt-003', patient_name: 'David Brown', provider_name: 'Dr. Emily Rodriguez', appointment_date: '2025-01-16', appointment_time: '10:00', appointment_type: 'Well Child', status: 'scheduled' },
  { appointment_id: 'appt-004', patient_name: 'Susan Davis', provider_name: 'Dr. James Wilson', appointment_date: '2025-01-16', appointment_time: '10:30', appointment_type: 'Post-Op', status: 'scheduled' },
  { appointment_id: 'appt-005', patient_name: 'Robert Miller', provider_name: 'Dr. Lisa Park', appointment_date: '2025-01-16', appointment_time: '11:00', appointment_type: 'Consultation', status: 'scheduled' },
];

// Sample patients for listing
export interface SamplePatient {
  patient_id: string;
  mrn: string;
  patient_name: string;
  date_of_birth: string;
  insurance_provider: string;
  primary_provider: string;
  last_visit: string;
}

export const SAMPLE_PATIENTS: SamplePatient[] = [
  { patient_id: 'pat-001', mrn: 'MRN-10001', patient_name: 'John Smith', date_of_birth: '1985-03-15', insurance_provider: 'Blue Cross', primary_provider: 'Dr. Sarah Johnson', last_visit: '2025-01-10' },
  { patient_id: 'pat-002', mrn: 'MRN-10002', patient_name: 'Mary Williams', date_of_birth: '1978-08-22', insurance_provider: 'Aetna', primary_provider: 'Dr. Michael Chen', last_visit: '2025-01-08' },
  { patient_id: 'pat-003', mrn: 'MRN-10003', patient_name: 'David Brown', date_of_birth: '2018-05-10', insurance_provider: 'United', primary_provider: 'Dr. Emily Rodriguez', last_visit: '2025-01-12' },
  { patient_id: 'pat-004', mrn: 'MRN-10004', patient_name: 'Susan Davis', date_of_birth: '1992-11-28', insurance_provider: 'Cigna', primary_provider: 'Dr. James Wilson', last_visit: '2025-01-05' },
  { patient_id: 'pat-005', mrn: 'MRN-10005', patient_name: 'Robert Miller', date_of_birth: '1965-01-03', insurance_provider: 'Medicare', primary_provider: 'Dr. Lisa Park', last_visit: '2025-01-11' },
];

// All sample data combined
export const HEALTHCARE_DATA = {
  stats: DATASET_STATS,
  appointmentsByStatus: APPOINTMENTS_BY_STATUS,
  appointmentsBySpecialty: APPOINTMENTS_BY_SPECIALTY,
  monthlyAppointments: MONTHLY_APPOINTMENTS,
  topProviders: TOP_PROVIDERS,
  topProcedures: TOP_PROCEDURES,
  upcomingAppointments: UPCOMING_APPOINTMENTS,
  samplePatients: SAMPLE_PATIENTS,
};
