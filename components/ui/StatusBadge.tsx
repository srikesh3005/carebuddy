import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';

type StatusType = 'taken' | 'missed' | 'upcoming' | 'snoozed';

interface StatusBadgeProps {
  status: StatusType;
  text?: string;
  style?: ViewStyle;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text, style }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'taken':
        return {
          backgroundColor: Colors.badgeGreen,
          textColor: Colors.badgeGreenText,
          icon: '✓',
          label: text || 'Taken',
        };
      case 'missed':
        return {
          backgroundColor: Colors.badgeRed,
          textColor: Colors.badgeRedText,
          icon: '✕',
          label: text || 'Missed',
        };
      case 'upcoming':
        return {
          backgroundColor: Colors.badgeOrange,
          textColor: Colors.badgeOrangeText,
          icon: '○',
          label: text || 'Upcoming',
        };
      case 'snoozed':
        return {
          backgroundColor: Colors.badgeTeal,
          textColor: Colors.badgeTealText,
          icon: '⏰',
          label: text || 'Snoozed',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={[styles.badge, { backgroundColor: config.backgroundColor }, style]}>
      <Text style={[styles.icon, { color: config.textColor }]}>{config.icon}</Text>
      <Text style={[styles.text, { color: config.textColor }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Spacing.radiusSm,
    gap: 4,
  },
  icon: {
    ...Typography.caption,
    fontWeight: '600',
  },
  text: {
    ...Typography.captionBold,
  },
});
