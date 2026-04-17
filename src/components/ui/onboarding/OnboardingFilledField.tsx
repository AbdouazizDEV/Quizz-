import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { onboardingColumn } from '@constants/layout';

export type OnboardingFieldRightIcon = 'calendar' | 'chevron-down';

interface OnboardingFilledFieldProps {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  editable?: boolean;
  rightIcon?: OnboardingFieldRightIcon;
  onPressField?: () => void;
  labelFontFamily?: string;
  valueFontFamily?: string;
}

export function OnboardingFilledField({
  label,
  value,
  onChangeText,
  placeholder,
  editable = true,
  rightIcon,
  onPressField,
  labelFontFamily,
  valueFontFamily,
}: OnboardingFilledFieldProps) {
  const rowContent = (
    <>
      <TextInput
        style={[
          styles.value,
          valueFontFamily ? { fontFamily: valueFontFamily } : { fontWeight: '700' },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        editable={editable}
        pointerEvents={onPressField && !editable ? 'none' : 'auto'}
      />
      {rightIcon ? (
        <Feather
          name={rightIcon === 'calendar' ? 'calendar' : 'chevron-down'}
          size={20}
          color="#FFD700"
        />
      ) : null}
    </>
  );

  return (
    <View style={[styles.fieldOuter, onboardingColumn]}>
      <Text
        style={[styles.label, labelFontFamily ? { fontFamily: labelFontFamily } : { fontWeight: '600' }]}
      >
        {label}
      </Text>

      <View style={styles.fieldInner}>
        {onPressField ? (
          <Pressable onPress={onPressField} style={styles.valueRow}>
            {rowContent}
          </Pressable>
        ) : (
          <View style={styles.valueRow}>{rowContent}</View>
        )}
        <View style={styles.underline} />
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
  fieldInner: {
    width: '100%',
    minHeight: 41,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
  },
  valueRow: {
    width: '100%',
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  value: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    color: '#212121',
    padding: 0,
    margin: 0,
  },
  underline: {
    width: '100%',
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 215, 0, 0.87)',
  },
});
