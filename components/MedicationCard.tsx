import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Pill, Clock } from 'lucide-react-native';
import { Medication } from '@/types/database';
import { Card } from './ui/Card';
import { PillBadge } from './ui/PillBadge';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';

interface MedicationCardProps {
  medication: Medication;
  onPress?: () => void;
  showSchedules?: boolean;
}

export function MedicationCard({ medication, onPress, showSchedules = false }: MedicationCardProps) {
  const isLowStock = medication.quantity <= medication.refill_threshold;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: Colors.badgeTeal }]}>
            <Pill color={Colors.primary} size={24} />
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{medication.name}</Text>
            <Text style={styles.dose}>{medication.dose}</Text>
          </View>
          {isLowStock && (
            <PillBadge text="Low Stock" variant="red" />
          )}
        </View>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Form:</Text>
            <Text style={styles.detailValue}>{medication.form}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Quantity:</Text>
            <Text style={[styles.detailValue, isLowStock && styles.lowStockValue]}>
              {medication.quantity} units
            </Text>
          </View>
        </View>

        {showSchedules && medication.schedules && medication.schedules.length > 0 && (
          <View style={styles.schedules}>
            <Text style={styles.schedulesTitle}>Schedule:</Text>
            <View style={styles.scheduleList}>
              {medication.schedules.map((schedule) => (
                <PillBadge 
                  key={schedule.id}
                  text={schedule.time}
                  variant="purple"
                />
              ))}
            </View>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.itemGap,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Spacing.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: 4,
  },
  dose: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  details: {
    gap: Spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  detailValue: {
    ...Typography.smallBold,
    color: Colors.text,
  },
  lowStockValue: {
    color: Colors.error,
  },
  schedules: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  schedulesTitle: {
    ...Typography.smallBold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  scheduleList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
});
