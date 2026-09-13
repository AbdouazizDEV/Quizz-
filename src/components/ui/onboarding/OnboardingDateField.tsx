import { Feather } from '@expo/vector-icons';
import { createElement, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DatePicker from 'react-native-date-picker';

import { onboardingColumn } from '@constants/layout';

interface OnboardingDateFieldProps {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
  maximumDate?: Date;
  minimumDate?: Date;
  labelFontFamily?: string;
  valueFontFamily?: string;
}

const DEFAULT_MIN = new Date(1900, 0, 1);

function formatFr(d: Date): string {
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function toIsoDateOnly(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function endOfToday(): Date {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return today;
}

export function OnboardingDateField({
  label,
  value,
  onChange,
  placeholder = 'JJ/MM/AAAA',
  maximumDate,
  minimumDate = DEFAULT_MIN,
  labelFontFamily,
  valueFontFamily,
}: OnboardingDateFieldProps) {
  const [open, setOpen] = useState(false);

  const maxDate = maximumDate ?? endOfToday();
  const minDate = minimumDate;
  const pickerDate = value ?? maxDate;

  const isWeb = Platform.OS === 'web';

  const applyPickedDate = (iso: string) => {
    const trimmed = iso.trim();
    if (!trimmed) return;

    const next = new Date(`${trimmed}T12:00:00`);
    if (Number.isNaN(next.getTime())) return;
    if (next < minDate || next > maxDate) return;

    onChange(next);
  };

  const displayValue = value ? formatFr(value) : placeholder;
  const displayStyle = value
    ? [styles.value, valueFontFamily ? { fontFamily: valueFontFamily } : { fontWeight: '700' as const }]
    : [styles.value, styles.placeholder, valueFontFamily ? { fontFamily: valueFontFamily } : { fontWeight: '700' as const }];

  return (
    <View style={[styles.fieldOuter, onboardingColumn]}>
      <Text
        style={[styles.label, labelFontFamily ? { fontFamily: labelFontFamily } : { fontWeight: '600' }]}
      >
        {label}
      </Text>

      <View style={styles.fieldInner}>
        {isWeb ? (
          <View style={styles.webFieldWrap}>
            {createElement('input', {
              type: 'date',
              value: value ? toIsoDateOnly(value) : '',
              min: toIsoDateOnly(minDate),
              max: toIsoDateOnly(maxDate),
              onChange: (event: { target: { value: string } }) => {
                applyPickedDate(event.target.value);
              },
              'aria-label': 'Choisir la date de naissance',
              style: {
                flex: 1,
                width: '100%',
                fontSize: 16,
                lineHeight: '22px',
                color: '#212121',
                paddingTop: 4,
                paddingBottom: 4,
                paddingRight: 32,
                paddingLeft: 0,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                cursor: 'pointer',
                fontFamily: valueFontFamily,
                fontWeight: valueFontFamily ? undefined : 700,
                minHeight: 44,
                boxSizing: 'border-box',
              },
            })}
            <View style={styles.webCalendarIcon} pointerEvents="none">
              <Feather name="calendar" size={20} color="#FFD700" />
            </View>
          </View>
        ) : (
          <Pressable onPress={() => setOpen(true)} style={styles.valueRow}>
            <Text style={displayStyle}>{displayValue}</Text>
            <Feather name="calendar" size={20} color="#FFD700" />
          </Pressable>
        )}
        <View style={styles.underline} />
      </View>

      {!isWeb ? (
        <DatePicker
          modal
          open={open}
          date={pickerDate}
          mode="date"
          locale="fr"
          title={label}
          confirmText="OK"
          cancelText="Annuler"
          minimumDate={minDate}
          maximumDate={maxDate}
          onConfirm={(date) => {
            setOpen(false);
            onChange(date);
          }}
          onCancel={() => setOpen(false)}
        />
      ) : null}
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
  placeholder: {
    color: '#9CA3AF',
  },
  webFieldWrap: {
    width: '100%',
    minHeight: 44,
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  webCalendarIcon: {
    position: 'absolute',
    right: 0,
    top: '50%',
    marginTop: -10,
  },
  underline: {
    width: '100%',
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 215, 0, 0.87)',
  },
});
