import { StyleSheet, Text, TextInput, View } from 'react-native';

import { SettingsScreenTheme } from '@constants/settingsScreenTheme';

import type { ProfileFontFamilies } from '@components/ui/profile/ProfileFonts';

interface SettingsFormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  fonts: ProfileFontFamilies;
  placeholder?: string;
  editable?: boolean;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words';
}

export function SettingsFormField({
  label,
  value,
  onChangeText,
  fonts,
  placeholder,
  editable = true,
  multiline = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
}: SettingsFormFieldProps) {
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, fonts.medium && { fontFamily: fonts.medium }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          !editable && styles.inputReadonly,
          fonts.medium && { fontFamily: fonts.medium },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9E9E9E"
        editable={editable}
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#757575',
  },
  input: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: SettingsScreenTheme.grey900,
  },
  inputMultiline: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  inputReadonly: {
    backgroundColor: '#F5F5F5',
    color: '#616161',
  },
});
