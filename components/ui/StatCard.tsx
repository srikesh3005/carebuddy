import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  icon, 
  color = Colors.primary 
}) => {
  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <View style={styles.textContainer}>
          <Text style={[styles.value, { color }]}>{value}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 80,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  icon: {
    fontSize: 32,
  },
  textContainer: {
    flex: 1,
  },
  value: {
    ...Typography.h2,
    marginBottom: 2,
  },
  label: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
});
