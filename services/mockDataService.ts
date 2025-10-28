import { Medication, Schedule, History } from '@/types/database';

// In-memory storage
let medications: Medication[] = [];
let schedules: Schedule[] = [];
let history: History[] = [];

// Helper to generate unique IDs
const generateId = () => `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Initialize with some mock data
const initializeMockData = () => {
  if (medications.length === 0) {
    const mockMedId1 = generateId();
    const mockMedId2 = generateId();
    
    medications = [
      {
        id: mockMedId1,
        user_id: 'mock_user',
        name: 'Vitamin D',
        dose: '1000 IU',
        form: 'tablet',
        quantity: 30,
        units_per_dose: 1,
        refill_threshold: 5,
        start_date: new Date().toISOString().split('T')[0],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: mockMedId2,
        user_id: 'mock_user',
        name: 'Aspirin',
        dose: '81 mg',
        form: 'tablet',
        quantity: 15,
        units_per_dose: 1,
        refill_threshold: 10,
        start_date: new Date().toISOString().split('T')[0],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    schedules = [
      {
        id: generateId(),
        medication_id: mockMedId1,
        time: '09:00',
        days_of_week: [0, 1, 2, 3, 4, 5, 6],
        created_at: new Date().toISOString(),
      },
      {
        id: generateId(),
        medication_id: mockMedId2,
        time: '08:00',
        days_of_week: [0, 1, 2, 3, 4, 5, 6],
        created_at: new Date().toISOString(),
      },
      {
        id: generateId(),
        medication_id: mockMedId2,
        time: '20:00',
        days_of_week: [0, 1, 2, 3, 4, 5, 6],
        created_at: new Date().toISOString(),
      },
    ];
  }
};

// Initialize on import
initializeMockData();

export class MockMedicationService {
  static async getMedications(userId: string): Promise<Medication[]> {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Filter active medications and attach schedules
    const activeMedications = medications
      .filter(med => med.is_active)
      .map(med => ({
        ...med,
        schedules: schedules.filter(s => s.medication_id === med.id),
      }))
      .sort((a, b) => {
        const timeA = new Date(a.created_at).getTime();
        const timeB = new Date(b.created_at).getTime();
        return timeB - timeA;
      });

    return activeMedications;
  }

  static async createMedication(
    userId: string,
    medicationData: Omit<Medication, 'id' | 'schedules'>
  ): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const newMedication: Medication = {
      ...medicationData,
      id: generateId(),
    };

    medications.push(newMedication);
    console.log('[MockService] Created medication:', newMedication.name);
    return newMedication.id;
  }

  static async updateMedication(medicationId: string, updates: Partial<Medication>): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const index = medications.findIndex(m => m.id === medicationId);
    if (index !== -1) {
      medications[index] = {
        ...medications[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      console.log('[MockService] Updated medication:', medications[index].name);
    }
  }

  static async deleteMedication(medicationId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const index = medications.findIndex(m => m.id === medicationId);
    if (index !== -1) {
      medications[index].is_active = false;
      medications[index].updated_at = new Date().toISOString();
      console.log('[MockService] Soft-deleted medication:', medications[index].name);
    }
  }

  static async createSchedule(
    medicationId: string,
    scheduleData: { time: string; days_of_week: number[] }
  ): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const newSchedule: Schedule = {
      id: generateId(),
      medication_id: medicationId,
      ...scheduleData,
      created_at: new Date().toISOString(),
    };

    schedules.push(newSchedule);
    console.log('[MockService] Created schedule:', newSchedule.time);
    return newSchedule.id;
  }

  static async deleteSchedules(medicationId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const beforeCount = schedules.length;
    schedules = schedules.filter(s => s.medication_id !== medicationId);
    const deletedCount = beforeCount - schedules.length;
    console.log(`[MockService] Deleted ${deletedCount} schedules`);
  }

  static cleanupOrphanedSchedules(activeMedicationIds: string[]): void {
    const idSet = new Set(activeMedicationIds);
    const beforeCount = schedules.length;
    schedules = schedules.filter(s => idSet.has(s.medication_id));
    const deletedCount = beforeCount - schedules.length;
    if (deletedCount > 0) {
      console.log(`[MockService] Cleaned up ${deletedCount} orphaned schedules`);
    }
  }
}

export class MockHistoryService {
  static async getHistory(userId: string, limitCount: number = 100): Promise<History[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Build history with medication details
    const historyWithMeds: History[] = history.map(h => {
      const medication = medications.find(m => m.id === h.medication_id);
      return {
        ...h,
        medication: medication ? {
          id: medication.id,
          name: medication.name,
          dose: medication.dose,
          form: medication.form,
        } as any : undefined,
      };
    });

    // Sort by actual_time desc and limit
    return historyWithMeds
      .sort((a, b) => {
        const timeA = new Date(a.actual_time).getTime();
        const timeB = new Date(b.actual_time).getTime();
        return timeB - timeA;
      })
      .slice(0, limitCount);
  }

  static async addHistoryEntry(
    userId: string,
    entry: {
      medication_id: string;
      status: 'taken' | 'missed' | 'snoozed';
      scheduled_time: string;
      actual_time: string;
      notes?: string;
    }
  ): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const newEntry: History = {
      id: generateId(),
      user_id: userId,
      ...entry,
      created_at: new Date().toISOString(),
    };

    history.push(newEntry);
    console.log('[MockService] Added history entry:', newEntry.status);
    return newEntry.id;
  }
}

// Export helper to get all data (for debugging)
export const getMockData = () => ({
  medications,
  schedules,
  history,
});

// Export helper to reset data
export const resetMockData = () => {
  medications = [];
  schedules = [];
  history = [];
  initializeMockData();
};
