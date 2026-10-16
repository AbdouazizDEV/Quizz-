import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ProfileGender } from '@app-types/profile.types';
import { onboardingColumn } from '@constants/layout';

export type OnboardingGender = Extract<ProfileGender, 'male' | 'female'>;

interface OnboardingGenderFieldProps {
  label: string;
  value: OnboardingGender | null;
  onChange: (gender: OnboardingGender) => void;
  labelFontFamily?: string;
  valueFontFamily?: string;
}

const OPTIONS: { id: OnboardingGender; label: string; emoji: string }[] = [
  { id: 'male', label: 'Homme', emoji: '👨' },
  { id: 'female', label: 'Femme', emoji: '👩' },
];

export function OnboardingGenderField({
  label,
  value,
  onChange,
  labelFontFamily,
  valueFontFamily,
}: OnboardingGenderFieldProps) {
  return (
    <View style={[styles.fieldOuter, onboardingColumn]}>
      <Text
        style={[styles.label, labelFontFamily ? { fontFamily: labelFontFamily } : { fontWeight: '600' }]}
      >
        {label}
      </Text>

      <View style={styles.optionsRow}>
        {OPTIONS.map((option) => {
          const selected = value === option.id;
          return (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onChange(option.id)}
              style={[styles.option, selected && styles.optionSelected]}
            >
              <Text style={styles.optionEmoji}>{option.emoji}</Text>
              <Text
                style={[
                  styles.optionLabel,
                  selected && styles.optionLabelSelected,
                  valueFontFamily ? { fontFamily: valueFontFamily } : { fontWeight: '700' },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldOuter: {
    minHeight: 79,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 16,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    color: '#212121',
  },
  optionsRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
  },
  option: {
    flex: 1,
    minHeight: 72,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  optionSelected: {
    borderColor: '#FFB703',
    backgroundColor: '#FFF8E1',
  },
  optionEmoji: {
    fontSize: 24,
  },
  optionLabel: {
    fontSize: 15,
    color: '#616161',
  },
  optionLabelSelected: {
    color: '#212121',
  },
});
