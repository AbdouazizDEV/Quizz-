import { Pressable, StyleSheet, Text, View } from 'react-native';

export type AuthMethod = 'passkey' | 'password';

interface AuthMethodSwitchProps {
  value: AuthMethod;
  onChange: (method: AuthMethod) => void;
  passkeyAvailable?: boolean;
  labelFontFamily?: string;
}

export function AuthMethodSwitch({
  value,
  onChange,
  passkeyAvailable = true,
  labelFontFamily,
}: AuthMethodSwitchProps) {
  return (
    <View style={styles.row} accessibilityRole="tablist">
      {passkeyAvailable ? (
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: value === 'passkey' }}
          onPress={() => onChange('passkey')}
          style={[styles.chip, value === 'passkey' ? styles.chipActive : styles.chipIdle]}
        >
          <Text
            style={[
              styles.chipText,
              value === 'passkey' ? styles.chipTextActive : styles.chipTextIdle,
              labelFontFamily ? { fontFamily: labelFontFamily } : undefined,
            ]}
          >
            Passkey
          </Text>
        </Pressable>
      ) : null}
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: value === 'password' }}
        onPress={() => onChange('password')}
        style={[
          styles.chip,
          value === 'password' ? styles.chipActive : styles.chipIdle,
          !passkeyAvailable && styles.chipFull,
        ]}
      >
        <Text
          style={[
            styles.chipText,
            value === 'password' ? styles.chipTextActive : styles.chipTextIdle,
            labelFontFamily ? { fontFamily: labelFontFamily } : undefined,
          ]}
        >
          E-mail et mot de passe
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  chip: {
    flex: 1,
    minHeight: 44,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  chipFull: {
    flex: 1,
  },
  chipActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.87)',
    borderColor: '#543ACC',
    borderBottomWidth: 3,
  },
  chipIdle: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EEEEEE',
  },
  chipText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#212121',
  },
  chipTextIdle: {
    color: '#616161',
  },
});
