import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage Keys
const KEYS = {
  USER_PROFILE: '@carebuddy_user_profile',
  MEDICATIONS: '@carebuddy_medications',
  DOSE_HISTORY: '@carebuddy_dose_history',
  NOTIFICATIONS: '@carebuddy_notifications',
};

// Types
export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  startDate: string;
  endDate?: string;
  instructions?: string;
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DoseRecord {
  id: string;
  medicationId: string;
  medicationName: string;
  scheduledTime: string;
  takenTime?: string;
  status: 'pending' | 'taken' | 'missed' | 'skipped';
  notes?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  timezone: string;
  createdAt: string;
}

// User Profile Storage
export const storageService = {
  // User Profile
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  },

  async setUserProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (error) {
      console.error('Error setting user profile:', error);
      throw error;
    }
  },

  async clearUserProfile(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.USER_PROFILE);
    } catch (error) {
      console.error('Error clearing user profile:', error);
      throw error;
    }
  },

  // Medications
  async getMedications(): Promise<Medication[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.MEDICATIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting medications:', error);
      return [];
    }
  },

  async saveMedication(medication: Medication): Promise<void> {
    try {
      const medications = await this.getMedications();
      const existingIndex = medications.findIndex(m => m.id === medication.id);
      
      if (existingIndex >= 0) {
        medications[existingIndex] = { ...medication, updatedAt: new Date().toISOString() };
      } else {
        medications.push(medication);
      }
      
      await AsyncStorage.setItem(KEYS.MEDICATIONS, JSON.stringify(medications));
    } catch (error) {
      console.error('Error saving medication:', error);
      throw error;
    }
  },

  async deleteMedication(medicationId: string): Promise<void> {
    try {
      const medications = await this.getMedications();
      const filtered = medications.filter(m => m.id !== medicationId);
      await AsyncStorage.setItem(KEYS.MEDICATIONS, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting medication:', error);
      throw error;
    }
  },

  async updateMedication(medicationId: string, updates: Partial<Medication>): Promise<void> {
    try {
      const medications = await this.getMedications();
      const index = medications.findIndex(m => m.id === medicationId);
      
      if (index >= 0) {
        medications[index] = {
          ...medications[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        await AsyncStorage.setItem(KEYS.MEDICATIONS, JSON.stringify(medications));
      }
    } catch (error) {
      console.error('Error updating medication:', error);
      throw error;
    }
  },

  // Dose History
  async getDoseHistory(): Promise<DoseRecord[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.DOSE_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting dose history:', error);
      return [];
    }
  },

  async saveDoseRecord(record: DoseRecord): Promise<void> {
    try {
      const history = await this.getDoseHistory();
      const existingIndex = history.findIndex(r => r.id === record.id);
      
      if (existingIndex >= 0) {
        history[existingIndex] = record;
      } else {
        history.push(record);
      }
      
      await AsyncStorage.setItem(KEYS.DOSE_HISTORY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving dose record:', error);
      throw error;
    }
  },

  async updateDoseRecord(recordId: string, updates: Partial<DoseRecord>): Promise<void> {
    try {
      const history = await this.getDoseHistory();
      const index = history.findIndex(r => r.id === recordId);
      
      if (index >= 0) {
        history[index] = { ...history[index], ...updates };
        await AsyncStorage.setItem(KEYS.DOSE_HISTORY, JSON.stringify(history));
      }
    } catch (error) {
      console.error('Error updating dose record:', error);
      throw error;
    }
  },

  async getDoseHistoryByMedication(medicationId: string): Promise<DoseRecord[]> {
    try {
      const history = await this.getDoseHistory();
      return history.filter(r => r.medicationId === medicationId);
    } catch (error) {
      console.error('Error getting dose history by medication:', error);
      return [];
    }
  },

  async getDoseHistoryByDateRange(startDate: string, endDate: string): Promise<DoseRecord[]> {
    try {
      const history = await this.getDoseHistory();
      return history.filter(r => {
        const recordDate = new Date(r.scheduledTime);
        return recordDate >= new Date(startDate) && recordDate <= new Date(endDate);
      });
    } catch (error) {
      console.error('Error getting dose history by date range:', error);
      return [];
    }
  },

  // Clear all data
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        KEYS.USER_PROFILE,
        KEYS.MEDICATIONS,
        KEYS.DOSE_HISTORY,
        KEYS.NOTIFICATIONS,
      ]);
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  },

  // Export all data (for backup)
  async exportAllData(): Promise<string> {
    try {
      const [profile, medications, history] = await Promise.all([
        this.getUserProfile(),
        this.getMedications(),
        this.getDoseHistory(),
      ]);

      return JSON.stringify({
        profile,
        medications,
        history,
        exportedAt: new Date().toISOString(),
      }, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  },

  // Import data (from backup)
  async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.profile) {
        await this.setUserProfile(data.profile);
      }
      if (data.medications) {
        await AsyncStorage.setItem(KEYS.MEDICATIONS, JSON.stringify(data.medications));
      }
      if (data.history) {
        await AsyncStorage.setItem(KEYS.DOSE_HISTORY, JSON.stringify(data.history));
      }
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  },
};
