import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Medication, Schedule } from '@/types/database';

export interface NotificationData extends Record<string, unknown> {
  medicationId: string;
  medicationName: string;
  dose: string;
  scheduleId: string;
  scheduledTime: string;
}

const STORAGE_KEY = 'scheduled_notifications';

// Notification service that gracefully disables in Expo Go
export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    console.log('[NotificationService] Notifications disabled in Expo Go');
    return false;
  }

  static async scheduleAllMedications(medications: Medication[]) {
    console.log('[NotificationService] Notifications disabled in Expo Go');
    return;
  }

  static async scheduleMedicationNotification(medication: Medication, schedule: Schedule) {
    console.log('[NotificationService] Notifications disabled in Expo Go');
    return;
  }

  static async cancelMedicationNotifications(medicationId: string) {
    console.log('[NotificationService] Notifications disabled in Expo Go');
    return;
  }

  static async cancelAllNotifications() {
    console.log('[NotificationService] Notifications disabled in Expo Go');
    return;
  }

  static async scheduleSnoozeNotification(
    medication: Medication,
    minutes: number
  ) {
    console.log('[NotificationService] Notifications disabled in Expo Go');
    return;
  }

  static async scheduleRefillAlert(medication: Medication) {
    console.log('[NotificationService] Notifications disabled in Expo Go');
    return;
  }

  private static async saveNotificationId(
    medicationId: string,
    scheduleId: string,
    notificationId: string
  ) {
    return;
  }

  private static async getStoredNotifications(): Promise<Record<string, string>> {
    return {};
  }

  static addNotificationReceivedListener(
    listener: (notification: any) => void
  ) {
    return undefined;
  }

  static addNotificationResponseReceivedListener(
    listener: (response: any) => void
  ) {
    return undefined;
  }
}
