export type MedicationForm = 'tablet' | 'capsule' | 'syrup' | 'injection' | 'drops' | 'inhaler' | 'patch' | 'other';
export type HistoryStatus = 'taken' | 'missed' | 'snoozed';

export interface Profile {
  id: string;
  name: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface Medication {
  id: string;
  user_id: string;
  name: string;
  dose: string;
  form: MedicationForm;
  quantity: number;
  units_per_dose: number;
  refill_threshold: number;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  schedules?: Schedule[];
}

export interface Schedule {
  id: string;
  medication_id: string;
  time: string;
  days_of_week: number[];
  created_at: string;
}

export interface History {
  id: string;
  user_id: string;
  medication_id: string;
  status: HistoryStatus;
  scheduled_time: string;
  actual_time: string;
  notes?: string;
  created_at: string;
  medication?: Medication;
}

export interface ScheduledDose {
  medication: Medication;
  schedule: Schedule;
  scheduledTime: Date;
  historyId?: string;
  status?: HistoryStatus;
}
