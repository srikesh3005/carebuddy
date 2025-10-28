import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, Platform, TextInput } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { Plus, X, Trash2, Clock, Pill, Edit2, ChevronRight } from 'lucide-react-native';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
// import { MedicationService } from '@/services/firebaseService';
import { MockMedicationService as MedicationService } from '@/services/mockDataService';
import { Medication, MedicationForm, Schedule } from '@/types/database';
import { MedicationCard } from '@/components/MedicationCard';
import { NotificationService } from '@/services/notificationService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';

type FormType = 'tablet' | 'capsule' | 'syrup' | 'injection' | 'drops' | 'inhaler' | 'patch' | 'other';

export default function Medications() {
  const { user } = useFirebaseAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);

  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [form, setForm] = useState<FormType>('tablet');
  const [quantity, setQuantity] = useState('30');
  const [unitsPerDose, setUnitsPerDose] = useState('1');
  const [refillThreshold, setRefillThreshold] = useState('5');
  const [schedules, setSchedules] = useState<{ time: string }[]>([{ time: '09:00' }]);

  useFocusEffect(
    useCallback(() => {
      loadMedications();
    }, [user])
  );

  const loadMedications = async () => {
    // Use mock user ID if no user is logged in
    const userId = user?.uid || 'mock_user';

    try {
      console.log('[Load] Starting medications load...');
      const startTime = Date.now();
      
      const data = await MedicationService.getMedications(userId);
      console.log(`[Load] Loaded ${data.length} medications in ${Date.now() - startTime}ms`);
      
      setMedications(data);

      const scheduleStartTime = Date.now();
      await NotificationService.scheduleAllMedications(data);
      console.log(`[Load] Scheduled notifications in ${Date.now() - scheduleStartTime}ms`);
      
      console.log(`[Load] Total load time: ${Date.now() - startTime}ms`);
    } catch (error) {
      console.error('[Load] Error loading medications:', error);
      Alert.alert('Error', 'Failed to load medications');
    }
  };

  const openAddModal = () => {
    resetForm();
    setEditingMedication(null);
    setShowModal(true);
  };

  const openEditModal = (medication: Medication) => {
    setEditingMedication(medication);
    setName(medication.name);
    setDose(medication.dose);
    setForm(medication.form as FormType);
    setQuantity(medication.quantity.toString());
    setUnitsPerDose(medication.units_per_dose.toString());
    setRefillThreshold(medication.refill_threshold.toString());

    if (medication.schedules && medication.schedules.length > 0) {
      setSchedules(medication.schedules.map(s => ({ time: s.time })));
    }

    setShowModal(true);
  };

  const resetForm = () => {
    setName('');
    setDose('');
    setForm('tablet');
    setQuantity('30');
    setUnitsPerDose('1');
    setRefillThreshold('5');
    setSchedules([{ time: '09:00' }]);
  };

  const saveMedication = async () => {
    // Use mock user ID if no user is logged in
    const userId = user?.uid || 'mock_user';

    if (!name || !dose || schedules.length === 0) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      if (editingMedication) {
        await MedicationService.updateMedication(editingMedication.id, {
          name,
          dose,
          form,
          quantity: parseInt(quantity),
          units_per_dose: parseInt(unitsPerDose),
          refill_threshold: parseInt(refillThreshold),
        } as Partial<Medication>);

        await MedicationService.deleteSchedules(editingMedication.id);

        for (const schedule of schedules) {
          await MedicationService.createSchedule(editingMedication.id, {
            time: schedule.time,
            days_of_week: [0, 1, 2, 3, 4, 5, 6],
          });
        }
      } else {
        const medicationId = await MedicationService.createMedication(userId, {
          user_id: userId,
          name,
          dose,
          form,
          quantity: parseInt(quantity),
          units_per_dose: parseInt(unitsPerDose),
          refill_threshold: parseInt(refillThreshold),
          start_date: new Date().toISOString().split('T')[0],
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        for (const schedule of schedules) {
          await MedicationService.createSchedule(medicationId, {
            time: schedule.time,
            days_of_week: [0, 1, 2, 3, 4, 5, 6],
          });
        }
      }

      setShowModal(false);
      await loadMedications();
    } catch (error) {
      console.error('Error saving medication:', error);
      Alert.alert('Error', 'Failed to save medication');
    }
  };

  const deleteMedication = (medication: Medication) => {
    console.log('=== DELETE STARTED ===');
    console.log('Medication:', medication.name, medication.id);
    
    // Use window.confirm for web compatibility
    const confirmed = Platform.OS === 'web' 
      ? window.confirm(`Are you sure you want to delete ${medication.name}?`)
      : true; // Will show Alert for native
    
    if (!confirmed && Platform.OS === 'web') {
      console.log('Delete cancelled');
      return;
    }
    
    const performDelete = () => {
      console.log('[UI] Delete confirmed, updating UI...');
      const uiStartTime = Date.now();
      
      // Optimistically remove from UI immediately for instant response
      setMedications(prev => prev.filter(m => m.id !== medication.id));
      const uiTime = Date.now() - uiStartTime;
      console.log(`[UI] UI updated in ${uiTime}ms ✅`);
      
      console.log('[Background] Starting notification cancel...');
      // Fire-and-forget: delete in background without blocking
      NotificationService.cancelMedicationNotifications(medication.id)
        .then(() => console.log('[Background] Notifications cancelled ✅'))
        .catch(err => console.error('[Background] Notification cancel error:', err));
      
      console.log('[Background] Starting database delete...');
      MedicationService.deleteMedication(medication.id)
        .then(() => console.log('[Background] Database delete complete ✅'))
        .catch(error => {
          console.error('[Background] Database delete error:', error);
          Alert.alert('Error', 'Failed to delete medication');
          loadMedications();
        });
      
      console.log('=== DELETE UI COMPLETE (background operations continuing) ===');
    };
    
    if (Platform.OS === 'web') {
      performDelete();
    } else {
      Alert.alert(
        'Delete Medication',
        `Are you sure you want to delete ${medication.name}?`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => console.log('Delete cancelled') },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: performDelete,
          },
        ]
      );
    }
  };

  const addScheduleTime = () => {
    setSchedules([...schedules, { time: '09:00' }]);
  };

  const removeScheduleTime = (index: number) => {
    if (schedules.length > 1) {
      setSchedules(schedules.filter((_, i) => i !== index));
    }
  };

  const updateScheduleTime = (index: number, time: string) => {
    const updated = [...schedules];
    updated[index] = { time };
    setSchedules(updated);
  };

  const forms: FormType[] = ['tablet', 'capsule', 'syrup', 'injection', 'drops', 'inhaler', 'patch', 'other'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Medications</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Plus color="#FFFFFF" size={24} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {medications.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <Pill size={48} color="#CBD5E1" strokeWidth={2} />
            </View>
            <Text style={styles.emptyTitle}>No Medications</Text>
            <Text style={styles.emptyText}>Add your first medication to start tracking</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={openAddModal}>
              <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.emptyButtonText}>Add Medication</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Active Medications</Text>
              <Text style={styles.summaryCount}>{medications.length}</Text>
            </View>

            {medications.map((medication) => (
              <View key={medication.id} style={styles.medicationCard}>
                {/* Left accent border */}
                <View style={styles.medicationAccent} />
                
                {/* Medication Header */}
                <View style={styles.medicationHeader}>
                  <View style={styles.medicationIconBox}>
                    <Pill size={20} color="#14B8A6" strokeWidth={2.5} />
                  </View>
                  <View style={styles.medicationHeaderText}>
                    <Text style={styles.medicationName}>{medication.name}</Text>
                    <Text style={styles.medicationDose}>{medication.dose} • {medication.form}</Text>
                  </View>
                </View>

                {/* Schedules */}
                {medication.schedules && medication.schedules.length > 0 && (
                  <View style={styles.schedulesSection}>
                    <Text style={styles.schedulesLabel}>Schedule</Text>
                    <View style={styles.schedulesList}>
                      {medication.schedules.map((schedule, index) => (
                        <View key={schedule.id} style={styles.scheduleChip}>
                          <Clock size={14} color="#0D9488" strokeWidth={2} />
                          <Text style={styles.scheduleTime}>{schedule.time}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Quantity Info */}
                <View style={styles.quantitySection}>
                  <View style={styles.quantityItem}>
                    <Text style={styles.quantityLabel}>Quantity</Text>
                    <Text style={styles.quantityValue}>{medication.quantity}</Text>
                  </View>
                  <View style={styles.quantityDivider} />
                  <View style={styles.quantityItem}>
                    <Text style={styles.quantityLabel}>Per Dose</Text>
                    <Text style={styles.quantityValue}>{medication.units_per_dose}</Text>
                  </View>
                  <View style={styles.quantityDivider} />
                  <View style={styles.quantityItem}>
                    <Text style={styles.quantityLabel}>Refill At</Text>
                    <Text style={styles.quantityValue}>{medication.refill_threshold}</Text>
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity 
                    style={styles.editButton} 
                    onPress={() => openEditModal(medication)}
                  >
                    <Edit2 size={16} color="#14B8A6" strokeWidth={2.5} />
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.deleteButtonNew} 
                    onPress={() => deleteMedication(medication)}
                  >
                    <Trash2 size={16} color="#EF4444" strokeWidth={2.5} />
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingMedication ? 'Edit Medication' : 'Add Medication'}
            </Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <X color="#64748B" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Input
              label="Medication Name *"
              placeholder="e.g., Aspirin"
              value={name}
              onChangeText={setName}
            />

            <Input
              label="Dose *"
              placeholder="e.g., 500mg"
              value={dose}
              onChangeText={setDose}
            />

            <Text style={styles.label}>Form *</Text>
            <View style={styles.formGrid}>
              {forms.map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.formChip, form === f && styles.formChipActive]}
                  onPress={() => setForm(f)}
                >
                  <Text style={[styles.formChipText, form === f && styles.formChipTextActive]}>
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.row}>
              <View style={styles.column}>
                <Input
                  label="Quantity"
                  placeholder="30"
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.column}>
                <Input
                  label="Per Dose"
                  placeholder="1"
                  value={unitsPerDose}
                  onChangeText={setUnitsPerDose}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <Input
              label="Refill Alert Threshold"
              placeholder="5"
              value={refillThreshold}
              onChangeText={setRefillThreshold}
              keyboardType="number-pad"
            />

            <View style={styles.schedulesHeader}>
              <Text style={styles.label}>Schedule Times *</Text>
              <TouchableOpacity onPress={addScheduleTime} style={styles.addTimeButton}>
                <Plus color="#0EA5E9" size={20} />
                <Text style={styles.addTimeText}>Add Time</Text>
              </TouchableOpacity>
            </View>

            {schedules.map((schedule, index) => (
              <View key={index} style={styles.scheduleRow}>
                <Clock color="#64748B" size={20} />
                <TextInput
                  style={styles.timeInput}
                  placeholder="09:00"
                  value={schedule.time}
                  onChangeText={(text) => updateScheduleTime(index, text)}
                />
                {schedules.length > 1 && (
                  <TouchableOpacity onPress={() => removeScheduleTime(index)}>
                    <X color="#EF4444" size={20} />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <TouchableOpacity style={styles.saveButton} onPress={saveMedication}>
              <Text style={styles.saveButtonText}>
                {editingMedication ? 'Update Medication' : 'Add Medication'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#14B8A6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIconBox: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#14B8A6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Summary Card
  summaryCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#14B8A6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  summaryCount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#14B8A6',
  },

  // Medication Card
  medicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  medicationAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#14B8A6',
  },
  medicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingLeft: 20,
  },
  medicationIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  medicationHeaderText: {
    flex: 1,
  },
  medicationName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  medicationDose: {
    fontSize: 14,
    color: '#64748B',
  },

  // Schedules Section
  schedulesSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  schedulesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  schedulesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  scheduleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  scheduleTime: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0D9488',
  },

  // Quantity Section
  quantitySection: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  quantityItem: {
    flex: 1,
    alignItems: 'center',
  },
  quantityLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  quantityDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },

  // Actions Row
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F0FDFA',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#14B8A6',
  },
  deleteButtonNew: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
    marginTop: 16,
  },
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  formChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  formChipActive: {
    backgroundColor: '#14B8A6',
    borderColor: '#14B8A6',
  },
  formChipText: {
    fontSize: 14,
    color: '#64748B',
    textTransform: 'capitalize',
  },
  formChipTextActive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    flex: 1,
  },
  schedulesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  addTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addTimeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#14B8A6',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeInput: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
  },
  saveButton: {
    backgroundColor: '#14B8A6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
