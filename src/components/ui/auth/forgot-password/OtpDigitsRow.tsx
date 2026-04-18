import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ForgotPasswordFlowTheme } from '@constants/forgotPasswordFlowTheme';

const LENGTH = 4;

export interface OtpDigitsRowProps {
  value: string;
  activeIndex: number;
  onBoxPress?: (index: number) => void;
  fontFamily?: string;
}

function OtpDigitsRowComponent({ value, activeIndex, onBoxPress, fontFamily }: OtpDigitsRowProps) {
  const chars = value.padEnd(LENGTH, ' ').slice(0, LENGTH).split('');

  return (
    <View style={styles.row}>
      {chars.map((ch, i) => {
        const focused = i === activeIndex;
        const display = ch.trim() === '' ? '' : ch;
        const cellStyle = [styles.cell, focused ? styles.cellActive : styles.cellIdle];
        const label = (
          <Text style={[styles.digit, fontFamily ? { fontFamily } : { fontWeight: '700' }]}>
            {display}
          </Text>
        );
        if (onBoxPress) {
          return (
            <Pressable
              key={i}
              onPress={() => onBoxPress(i)}
              style={cellStyle}
              accessibilityRole="button"
              accessibilityLabel={`Chiffre ${i + 1} du code`}
            >
              {label}
            </Pressable>
          );
        }
        return (
          <View key={i} style={cellStyle} accessibilityLabel={`Chiffre ${i + 1} du code`}>
            {label}
          </View>
        );
      })}
    </View>
  );
}

export const OtpDigitsRow = memo(OtpDigitsRowComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
    justifyContent: 'space-between',
  },
  cell: {
    flex: 1,
    minWidth: 0,
    maxWidth: 88,
    height: 60,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  cellIdle: {
    borderColor: ForgotPasswordFlowTheme.otpBoxBorderIdle,
  },
  cellActive: {
    borderColor: ForgotPasswordFlowTheme.otpBoxBorderActive,
  },
  digit: {
    fontSize: 22,
    color: ForgotPasswordFlowTheme.textPrimary,
  },
});
