import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Check, AlertCircle, Clock, ChevronRight } from 'lucide-react-native';
import { ScheduledDose } from '@/types/database';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';

interface DoseCardProps {
  dose: ScheduledDose;
  onTaken: () => void;
  onMissed: () => void;
  onSnooze: (minutes: number) => void;
}

export function DoseCard({ dose, onTaken, onMissed, onSnooze }: DoseCardProps) {
  const isTaken = dose.status === 'taken';
  const isMissed = dose.status === 'missed';
  const isSnoozed = dose.status === 'snoozed';
  const isPending = !dose.status;

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes.padStart(2, '0')} ${ampm}`;
  };

  const getStatusConfig = () => {
    if (isTaken) return { 
      icon: Check, 
      color: '#14B8A6', 
      bg: '#F0FDFA', 
      label: 'Taken',
      borderColor: '#99F6E4'
    };
    if (isMissed) return { 
      icon: AlertCircle, 
      color: '#EF4444', 
      bg: '#FEF2F2', 
      label: 'Missed',
      borderColor: '#FECACA'
    };
    if (isSnoozed) return { 
      icon: Clock, 
      color: '#F59E0B', 
      bg: '#FFFBEB', 
      label: 'Snoozed',
      borderColor: '#FED7AA'
    };
    return { 
      icon: Clock, 
      color: '#0D9488', 
      bg: '#F0FDFA', 
      label: 'Upcoming',
      borderColor: '#CCFBF1'
    };
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <TouchableOpacity 
      style={[
        styles.container,
        { borderLeftColor: statusConfig.color }
      ]}
      activeOpacity={0.7}
      onPress={() => {
        if (isPending) {
          // Show action menu
        }
      }}
    >
      {/* Time Badge */}
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTime(dose.schedule.time)}</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Status Indicator */}
        <View style={[styles.statusIndicator, { backgroundColor: statusConfig.bg }]}>
          <StatusIcon size={18} color={statusConfig.color} strokeWidth={2.5} />
        </View>

        {/* Medication Info */}
        <View style={styles.medInfo}>
          <Text style={styles.medName}>{dose.medication.name}</Text>
          <Text style={styles.medDose}>{dose.medication.dose}</Text>
        </View>

        {/* Status Label */}
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
          <Text style={[styles.statusLabel, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      {/* Action Buttons for Pending */}
      {isPending && (
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionTaken}
            onPress={onTaken}
            activeOpacity={0.8}
          >
            <Check size={16} color="#FFF" strokeWidth={3} />
            <Text style={styles.actionTakenText}>Mark Taken</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionSkip}
            onPress={onMissed}
            activeOpacity={0.8}
          >
            <Text style={styles.actionSkipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  timeContainer: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  statusIndicator: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medInfo: {
    flex: 1,
  },
  medName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  medDose: {
    fontSize: 14,
    color: '#64748B',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  actionTaken: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#14B8A6',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  actionTakenText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  actionSkip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  actionSkipText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
});
