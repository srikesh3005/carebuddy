import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep }) => {
  return (
    <View style={styles.container}>
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <View style={styles.stepContainer}>
            <View
              style={[
                styles.circle,
                index < currentStep && styles.circleCompleted,
                index === currentStep && styles.circleCurrent,
              ]}
            >
              {index < currentStep ? (
                <Text style={styles.checkmark}>✓</Text>
              ) : (
                <Text
                  style={[
                    styles.stepNumber,
                    index === currentStep && styles.stepNumberCurrent,
                  ]}
                >
                  {index + 1}
                </Text>
              )}
            </View>
            <Text
              style={[
                styles.stepLabel,
                index === currentStep && styles.stepLabelCurrent,
              ]}
            >
              {step}
            </Text>
          </View>
          {index < steps.length - 1 && (
            <View
              style={[
                styles.line,
                index < currentStep && styles.lineCompleted,
              ]}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgroundDark,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  circleCompleted: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  circleCurrent: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepNumber: {
    ...Typography.smallBold,
    color: Colors.textSecondary,
  },
  stepNumberCurrent: {
    color: Colors.textWhite,
  },
  checkmark: {
    ...Typography.smallBold,
    color: Colors.textWhite,
  },
  stepLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  stepLabelCurrent: {
    ...Typography.captionBold,
    color: Colors.primary,
  },
  line: {
    height: 2,
    backgroundColor: Colors.border,
    flex: 1,
    marginHorizontal: Spacing.xs,
    marginBottom: 24,
  },
  lineCompleted: {
    backgroundColor: Colors.primary,
  },
});
