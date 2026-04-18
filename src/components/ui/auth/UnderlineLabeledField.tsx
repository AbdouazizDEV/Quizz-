import type { ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

const ACCENT = '#FFD700';
const LABEL_COLOR = '#212121';
const INPUT_COLOR = '#212121';

export interface UnderlineLabeledFieldProps extends Pick<
  TextInputProps,
  'placeholder' | 'keyboardType' | 'autoCapitalize' | 'secureTextEntry' | 'accessibilityLabel'
> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  rightSlot?: ReactNode;
  labelFontFamily?: string;
  inputFontFamily?: string;
}

export function UnderlineLabeledField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  secureTextEntry,
  accessibilityLabel,
  rightSlot,
  labelFontFamily,
  inputFontFamily,
}: UnderlineLabeledFieldProps) {
  return (
    <View style={styles.block}>
      <Text
        style={[styles.label, labelFontFamily ? { fontFamily: labelFontFamily } : { fontWeight: '600' }]}
      >
        {label}
      </Text>
      <View style={styles.inputRow}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#8E8E93"
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry}
          accessibilityLabel={accessibilityLabel ?? label}
          style={[
            styles.input,
            rightSlot ? styles.inputWithSlot : undefined,
            inputFontFamily ? { fontFamily: inputFontFamily } : { fontWeight: '700' },
          ]}
        />
        {rightSlot ? <View style={styles.slot}>{rightSlot}</View> : null}
      </View>
      <View style={styles.underline} />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    width: '100%',
    gap: 8,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    color: LABEL_COLOR,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 28,
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    color: INPUT_COLOR,
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  inputWithSlot: {
    paddingRight: 8,
  },
  slot: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  underline: {
    height: 2,
    width: '100%',
    backgroundColor: ACCENT,
    borderRadius: 1,
  },
});
