import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  limit,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Medication, Schedule, History } from '@/types/database';

export class MedicationService {
  static async getMedications(userId: string): Promise<Medication[]> {
    try {
      // Fetch medications and schedules in parallel for better performance
      const [medicationsSnapshot, schedulesSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'medications'), where('user_id', '==', userId))),
        getDocs(collection(db, 'schedules'))
      ]);

      // Group schedules by medication_id for O(1) lookup
      const schedulesByMedId = new Map<string, Schedule[]>();
      schedulesSnapshot.docs.forEach(doc => {
        const schedule = { id: doc.id, ...doc.data() } as Schedule;
        const medId = schedule.medication_id;
        if (!schedulesByMedId.has(medId)) {
          schedulesByMedId.set(medId, []);
        }
        schedulesByMedId.get(medId)!.push(schedule);
      });

      // Build medications array with schedules
      const medications: Medication[] = [];
      medicationsSnapshot.docs.forEach(docSnap => {
        const data = docSnap.data();
        
        // Skip inactive medications
        if (!data.is_active) return;

        medications.push({
          id: docSnap.id,
          ...data,
          schedules: schedulesByMedId.get(docSnap.id) || []
        } as Medication);
      });

      // Sort by created_at in memory
      return medications.sort((a, b) => {
        const timeA = new Date(a.created_at).getTime();
        const timeB = new Date(b.created_at).getTime();
        return timeB - timeA; // desc order
      });
    } catch (error) {
      console.error('Error getting medications:', error);
      throw error;
    }
  }

  static async createMedication(userId: string, medicationData: Omit<Medication, 'id' | 'schedules'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'medications'), {
        ...medicationData,
        user_id: userId,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating medication:', error);
      throw error;
    }
  }

  static async updateMedication(medicationId: string, updates: Partial<Medication>): Promise<void> {
    try {
      const docRef = doc(db, 'medications', medicationId);
      await updateDoc(docRef, {
        ...updates,
        updated_at: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating medication:', error);
      throw error;
    }
  }

  static async deleteMedication(medicationId: string): Promise<void> {
    try {
      console.log('[FirebaseService] Starting delete for:', medicationId);
      const startTime = Date.now();
      
      // Just soft delete - don't bother with schedules for performance
      // Schedules will be filtered out when we query by is_active medications
      await updateDoc(doc(db, 'medications', medicationId), {
        is_active: false,
        updated_at: serverTimestamp()
      });
      
      console.log(`[FirebaseService] Delete completed in ${Date.now() - startTime}ms`);
    } catch (error) {
      console.error('[FirebaseService] Error deleting medication:', error);
      throw error;
    }
  }

  static async createSchedule(medicationId: string, scheduleData: { time: string; days_of_week: number[] }): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'schedules'), {
        medication_id: medicationId,
        ...scheduleData,
        created_at: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  }

  static async deleteSchedules(medicationId: string): Promise<void> {
    try {
      const schedulesRef = collection(db, 'schedules');
      const q = query(schedulesRef, where('medication_id', '==', medicationId));
      const snapshot = await getDocs(q);
      
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting schedules:', error);
      throw error;
    }
  }

  // Cleanup orphaned schedules (run in background)
  static cleanupOrphanedSchedules(activeMedicationIds: string[]): void {
    const idSet = new Set(activeMedicationIds);
    getDocs(collection(db, 'schedules'))
      .then(snapshot => {
        const orphanedSchedules = snapshot.docs.filter(
          doc => !idSet.has(doc.data().medication_id)
        );
        if (orphanedSchedules.length > 0) {
          Promise.all(orphanedSchedules.map(doc => deleteDoc(doc.ref)))
            .catch(err => console.error('Cleanup error:', err));
        }
      })
      .catch(err => console.error('Cleanup query error:', err));
  }
}

export class HistoryService {
  static async getHistory(userId: string, limitCount: number = 100): Promise<History[]> {
    try {
      // Fetch history entries
      const historySnapshot = await getDocs(
        query(collection(db, 'history'), where('user_id', '==', userId))
      );
      
      // Collect unique medication IDs
      const medicationIds = new Set<string>();
      historySnapshot.docs.forEach(doc => {
        medicationIds.add(doc.data().medication_id);
      });

      // Batch fetch all medications
      const medicationsMap = new Map<string, any>();
      await Promise.all(
        Array.from(medicationIds).map(async (medId) => {
          const medicationDoc = await getDoc(doc(db, 'medications', medId));
          if (medicationDoc.exists()) {
            medicationsMap.set(medId, {
              id: medicationDoc.id,
              name: medicationDoc.data().name,
              dose: medicationDoc.data().dose,
              form: medicationDoc.data().form
            });
          }
        })
      );

      // Build history array with medication details
      const history: History[] = historySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          medication: medicationsMap.get(data.medication_id)
        } as History;
      });

      // Sort by actual_time in memory and limit
      return history
        .sort((a, b) => {
          const timeA = new Date(a.actual_time).getTime();
          const timeB = new Date(b.actual_time).getTime();
          return timeB - timeA; // desc order
        })
        .slice(0, limitCount);
    } catch (error) {
      console.error('Error getting history:', error);
      throw error;
    }
  }

  static async addHistoryEntry(userId: string, entry: {
    medication_id: string;
    status: 'taken' | 'missed' | 'snoozed';
    scheduled_time: string;
    actual_time: string;
    notes?: string;
  }): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'history'), {
        user_id: userId,
        ...entry,
        created_at: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding history entry:', error);
      throw error;
    }
  }
}
