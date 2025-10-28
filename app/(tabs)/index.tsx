import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert, Image } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { Bell, Pill, CheckCircle, XCircle, Clock } from 'lucide-react-native';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { MedicationService, HistoryService } from '@/services/firebaseService';
import { ScheduledDose, Medication } from '@/types/database';
import { DoseCard } from '@/components/DoseCard';
import { StatCard } from '@/components/ui/StatCard';
import { NotificationService } from '@/services/notificationService';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';

export default function Home() {
  const { user, profile } = useFirebaseAuth();
  const [todaysDoses, setTodaysDoses] = useState<ScheduledDose[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadTodaysDoses();
    }, [user])
  );

  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  const requestNotificationPermissions = async () => {
    const granted = await NotificationService.requestPermissions();
    if (!granted) {
      Alert.alert(
        'Notifications Disabled',
        'Please enable notifications to receive medication reminders.'
      );
    }
  };

  const loadTodaysDoses = async () => {
    if (!user) return;

    try {
      const medications = await MedicationService.getMedications(user.uid);

      const today = new Date();
      const todayDayOfWeek = today.getDay();
      const todayDateString = today.toISOString().split('T')[0];

      const doses: ScheduledDose[] = [];

      for (const medication of medications) {
        if (!medication.schedules) continue;

        for (const schedule of medication.schedules) {
          if (!schedule.days_of_week.includes(todayDayOfWeek)) continue;

          const [hours, minutes] = schedule.time.split(':');
          const scheduledTime = new Date(today);
          scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

          // Check history for this dose
          const history = await HistoryService.getHistory(user.uid, 100);
          const historyForDose = history.find(h => 
            h.medication_id === medication.id &&
            h.scheduled_time >= `${todayDateString}T${schedule.time}` &&
            h.scheduled_time < `${todayDateString}T23:59:59`
          );

          doses.push({
            medication,
            schedule,
            scheduledTime,
            historyId: historyForDose?.id,
            status: historyForDose?.status,
          });
        }
      }

      doses.sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());
      setTodaysDoses(doses);
    } catch (error) {
      console.error('Error loading doses:', error);
      Alert.alert('Error', 'Failed to load today\'s medications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleTaken = async (dose: ScheduledDose) => {
    if (!user) return;

    try {
      // Optimistically update UI immediately
      setTodaysDoses(prev => prev.map(d => 
        d.medication.id === dose.medication.id && d.schedule.id === dose.schedule.id
          ? { ...d, status: 'taken' as const }
          : d
      ));

      // Then save to database in background
      await HistoryService.addHistoryEntry(user.uid, {
        medication_id: dose.medication.id,
        status: 'taken',
        scheduled_time: dose.scheduledTime.toISOString(),
        actual_time: new Date().toISOString(),
      });

      const newQuantity = dose.medication.quantity - dose.medication.units_per_dose;

      await MedicationService.updateMedication(dose.medication.id, {
        quantity: Math.max(0, newQuantity)
      } as Partial<Medication>);

      if (newQuantity <= dose.medication.refill_threshold) {
        await NotificationService.scheduleRefillAlert(dose.medication);
      }
    } catch (error) {
      console.error('Error marking dose as taken:', error);
      Alert.alert('Error', 'Failed to update medication status');
      // Reload on error to restore correct state
      loadTodaysDoses();
    }
  };

  const handleMissed = async (dose: ScheduledDose) => {
    if (!user) return;

    try {
      // Optimistically update UI immediately
      setTodaysDoses(prev => prev.map(d => 
        d.medication.id === dose.medication.id && d.schedule.id === dose.schedule.id
          ? { ...d, status: 'missed' as const }
          : d
      ));

      // Then save to database in background
      await HistoryService.addHistoryEntry(user.uid, {
        medication_id: dose.medication.id,
        status: 'missed',
        scheduled_time: dose.scheduledTime.toISOString(),
        actual_time: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error marking dose as missed:', error);
      Alert.alert('Error', 'Failed to update medication status');
      // Reload on error to restore correct state
      loadTodaysDoses();
    }
  };

  const handleSnooze = async (dose: ScheduledDose, minutes: number) => {
    if (!user) return;

    try {
      // Optimistically update UI immediately
      setTodaysDoses(prev => prev.map(d => 
        d.medication.id === dose.medication.id && d.schedule.id === dose.schedule.id
          ? { ...d, status: 'snoozed' as const }
          : d
      ));

      // Then save to database in background
      await HistoryService.addHistoryEntry(user.uid, {
        medication_id: dose.medication.id,
        status: 'snoozed',
        scheduled_time: dose.scheduledTime.toISOString(),
        actual_time: new Date().toISOString(),
        notes: `Snoozed for ${minutes} minutes`,
      });

      await NotificationService.scheduleSnoozeNotification(dose.medication, minutes);

      Alert.alert('Snoozed', `Reminder set for ${minutes} minutes from now`);
    } catch (error) {
      console.error('Error snoozing dose:', error);
      Alert.alert('Error', 'Failed to snooze medication');
      // Reload on error to restore correct state
      loadTodaysDoses();
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTodaysDoses();
  };

  const takenCount = todaysDoses.filter(d => d.status === 'taken').length;
  const missedCount = todaysDoses.filter(d => d.status === 'missed').length;
  const totalCount = todaysDoses.length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getGreetingIcon = () => {
    const hour = new Date().getHours();
    if (hour < 6 || hour >= 20) return '🌙'; // Moon for night/early morning
    if (hour < 12) return '☀️'; // Sun for morning
    if (hour < 18) return '☀️'; // Sun for afternoon
    return '🌙'; // Moon for evening
  };

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.topHeader}>
        <Text style={styles.topHeaderTitle}>Home</Text>
        <View style={styles.topHeaderRight}>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => {/* Handle notification press */}}
          >
            <Bell size={24} color={Colors.text} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <View style={styles.profileCircle}>
              <Text style={styles.profileInitial}>
                {(profile?.name || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Modern Header Greeting */}
        <View style={styles.headerGreeting}>
          <View>
            <Text style={styles.greetingTime}>{getGreeting()}</Text>
            <Text style={styles.greetingName}>{profile?.name || 'there'}</Text>
          </View>
          <Text style={styles.greetingDate}>
            {new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <View style={styles.statIconBox}>
              <Pill size={20} color="#0D9488" strokeWidth={2.5} />
            </View>
            <Text style={styles.statValue}>{totalCount}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          
          <View style={styles.statItem}>
            <View style={[styles.statIconBox, { backgroundColor: '#F0FDFA' }]}>
              <CheckCircle size={20} color="#14B8A6" strokeWidth={2.5} />
            </View>
            <Text style={styles.statValue}>{takenCount}</Text>
            <Text style={styles.statLabel}>Done</Text>
          </View>
          
          <View style={styles.statItem}>
            <View style={[styles.statIconBox, { backgroundColor: '#FEF2F2' }]}>
              <XCircle size={20} color="#EF4444" strokeWidth={2.5} />
            </View>
            <Text style={styles.statValue}>{missedCount}</Text>
            <Text style={styles.statLabel}>Missed</Text>
          </View>
        </View>

        {/* Today's Schedule */}
        <View style={styles.scheduleSection}>
          <Text style={styles.scheduleTitle}>Today's Schedule</Text>
          
          {todaysDoses.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>💊</Text>
              <Text style={styles.emptyTitle}>No medications scheduled</Text>
              <Text style={styles.emptyText}>
                Add your medications to start tracking
              </Text>
            </View>
          )}

          {todaysDoses.map((dose, index) => (
            <DoseCard
              key={`${dose.medication.id}-${dose.schedule.id}-${index}`}
              dose={dose}
              onTaken={() => handleTaken(dose)}
              onMissed={() => handleMissed(dose)}
              onSnooze={(minutes) => handleSnooze(dose, minutes)}
            />
          ))}
        </View>
      </ScrollView>

      {/* FAB - Redesigned */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('/(tabs)/medications')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    zIndex: 10,
  },
  topHeaderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  topHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    padding: 8,
  },
  profileButton: {
    padding: 4,
  },
  profileCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#14B8A6',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileInitial: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 120,
    paddingBottom: 100,
  },
  headerGreeting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greetingTime: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
    fontWeight: '500',
  },
  greetingName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
  },
  greetingDate: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  quickStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  scheduleSection: {
    marginBottom: 16,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#14B8A6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '300',
    marginTop: -2,
  },
});
