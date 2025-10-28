import { View, Text, StyleSheet } from 'react-native';
import { Check, X, Bell, Clock, Pill } from 'lucide-react-native';
import { History } from '@/types/database';

interface HistoryItemProps {
  item: History;
}

export function HistoryItem({ item }: HistoryItemProps) {
  const isTaken = item.status === 'taken';
  const isMissed = item.status === 'missed';
  const isSnoozed = item.status === 'snoozed';

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const timeString = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    if (isToday) return `Today at ${timeString}`;
    if (isYesterday) return `Yesterday at ${timeString}`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getIcon = () => {
    if (isTaken) return <Check size={18} color="#14B8A6" strokeWidth={2.5} />;
    if (isMissed) return <X size={18} color="#EF4444" strokeWidth={2.5} />;
    return <Bell size={18} color="#F59E0B" strokeWidth={2.5} />;
  };

  const getIconBgColor = () => {
    if (isTaken) return '#F0FDFA';
    if (isMissed) return '#FEF2F2';
    return '#FEF3C7';
  };

  const getAccentColor = () => {
    if (isTaken) return '#14B8A6';
    if (isMissed) return '#EF4444';
    return '#F59E0B';
  };

  return (
    <View style={styles.container}>
      {/* Left accent border */}
      <View style={[styles.accent, { backgroundColor: getAccentColor() }]} />
      
      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: getIconBgColor() }]}>
        {getIcon()}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.medicationName}>
          {item.medication?.name || 'Unknown Medication'}
        </Text>
        {item.medication?.dose && (
          <View style={styles.infoRow}>
            <Pill size={14} color="#64748B" strokeWidth={2} />
            <Text style={styles.dose}>
              {item.medication.dose}
            </Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Clock size={14} color="#64748B" strokeWidth={2} />
          <Text style={styles.time}>{formatDateTime(item.actual_time)}</Text>
        </View>
        {item.notes && (
          <Text style={styles.notes}>{item.notes}</Text>
        )}
      </View>

      {/* Status Badge */}
      <View style={[
        styles.statusBadge,
        isTaken && styles.statusBadgeTaken,
        isMissed && styles.statusBadgeMissed,
        isSnoozed && styles.statusBadgeSnoozed,
      ]}>
        <Text style={[
          styles.statusText,
          isTaken && styles.statusTextTaken,
          isMissed && styles.statusTextMissed,
          isSnoozed && styles.statusTextSnoozed,
        ]}>
          {isTaken ? 'Taken' : isMissed ? 'Missed' : 'Snoozed'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
    marginVertical: 16,
    marginRight: 12,
  },
  content: {
    flex: 1,
    paddingVertical: 16,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  dose: {
    fontSize: 13,
    color: '#64748B',
  },
  time: {
    fontSize: 12,
    color: '#64748B',
  },
  notes: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginRight: 16,
  },
  statusBadgeTaken: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  statusBadgeMissed: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  statusBadgeSnoozed: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusTextTaken: {
    color: '#14B8A6',
  },
  statusTextMissed: {
    color: '#EF4444',
  },
  statusTextSnoozed: {
    color: '#F59E0B',
  },
});
