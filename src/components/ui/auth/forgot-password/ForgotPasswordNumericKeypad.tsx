import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ForgotPasswordFlowTheme } from '@constants/forgotPasswordFlowTheme';

const ROWS: (string | 'back')[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['empty', '0', 'back'],
];

export interface ForgotPasswordNumericKeypadProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  disabled?: boolean;
}

function ForgotPasswordNumericKeypadComponent({
  onDigit,
  onBackspace,
  disabled,
}: ForgotPasswordNumericKeypadProps) {
  const insets = useSafeAreaInsets();

  const onKey = useCallback(
    (key: string | 'back' | 'empty') => {
      if (disabled) return;
      if (key === 'empty') return;
      if (key === 'back') {
        onBackspace();
        return;
      }
      onDigit(key);
    },
    [disabled, onBackspace, onDigit],
  );

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(12, insets.bottom) }]}>
      {ROWS.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((key) => {
            if (key === 'empty') {
              return <View key="e" style={styles.keySpacer} />;
            }
            if (key === 'back') {
              return (
                <Pressable
                  key="back"
                  onPress={() => onKey('back')}
                  style={({ pressed }) => [styles.key, pressed && styles.pressed]}
                  disabled={disabled}
                  accessibilityRole="button"
                  accessibilityLabel="Effacer le dernier chiffre"
                >
                  <Feather name="delete" size={22} color={ForgotPasswordFlowTheme.textPrimary} />
                </Pressable>
              );
            }
            return (
              <Pressable
                key={key}
                onPress={() => onKey(key)}
                style={({ pressed }) => [styles.key, pressed && styles.pressed]}
                disabled={disabled}
                accessibilityRole="keyboardkey"
                accessibilityLabel={key}
              >
                <Text style={styles.keyLabel}>{key}</Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

export const ForgotPasswordNumericKeypad = memo(ForgotPasswordNumericKeypadComponent);

const KEY_GAP = 10;

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    paddingTop: 12,
    paddingHorizontal: 16,
    backgroundColor: ForgotPasswordFlowTheme.keypadBg,
    borderTopWidth: 1,
    borderTopColor: ForgotPasswordFlowTheme.divider,
    gap: KEY_GAP,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: KEY_GAP,
  },
  key: {
    flex: 1,
    minWidth: 0,
    maxWidth: 120,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ForgotPasswordFlowTheme.keypadKeyBorder,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keySpacer: {
    flex: 1,
    minWidth: 0,
    maxWidth: 120,
    height: 52,
  },
  keyLabel: {
    fontSize: 22,
    fontWeight: '600',
    color: ForgotPasswordFlowTheme.textPrimary,
  },
  pressed: {
    opacity: 0.88,
  },
});
