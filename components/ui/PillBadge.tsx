import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';

type BadgeVariant = 'teal' | 'purple' | 'orange' | 'green' | 'red' | 'default';

interface PillBadgeProps {
  text: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export const PillBadge: React.FC<PillBadgeProps> = ({ text, variant = 'teal', style }) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'teal':
        return {
          backgroundColor: Colors.badgeTeal,
          textColor: Colors.badgeTealText,
        };
      case 'purple':
        return {
          backgroundColor: Colors.badgePurple,
          textColor: Colors.badgePurpleText,
        };
      case 'orange':
        return {
          backgroundColor: Colors.badgeOrange,
          textColor: Colors.badgeOrangeText,
        };
      case 'green':
        return {
          backgroundColor: Colors.badgeGreen,
          textColor: Colors.badgeGreenText,
        };
      case 'red':
        return {
          backgroundColor: Colors.badgeRed,
          textColor: Colors.badgeRedText,
        };
      default:
        return {
          backgroundColor: Colors.backgroundDark,
          textColor: Colors.text,
        };
    }
  };

  const variantStyle = getVariantStyle();

  return (
    <View style={[styles.badge, { backgroundColor: variantStyle.backgroundColor }, style]}>
      <Text style={[styles.text, { color: variantStyle.textColor }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    height: Spacing.pillBadgeHeight,
    paddingHorizontal: Spacing.md,
    borderRadius: Spacing.radiusFull,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    ...Typography.smallMedium,
  },
});
