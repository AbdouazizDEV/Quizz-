import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { createElement, useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

export function OnboardingDateField({
  label,
  value,
  onChange,
  placeholder = 'JJ/MM/AAAA',
  maximumDate = new Date(),
  minimumDate = DEFAULT_MIN,
  labelFontFamily,
  valueFontFamily,
}: OnboardingDateFieldProps) {
  const insets = useSafeAreaInsets();
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerSeed = value ?? maximumDate;
  const [draft, setDraft] = useState(pickerSeed);

  useEffect(() => {
    setDraft(value ?? maximumDate);
  }, [value, maximumDate]);

  const openPicker = () => {
    setDraft(value ?? maximumDate);
    setPickerOpen(true);
  };

  const handleNativeChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setPickerOpen(false);
    }
    if (event.type === 'set' && date) {
      onChange(date);
      setDraft(date);
    }
  };

  const confirmIos = () => {
    onChange(draft);
    setPickerOpen(false);
  };

  const isWeb = Platform.OS === 'web';

  const applyPickedDate = (iso: string) => {
    const trimmed = iso.trim();
    if (!trimmed) {
      return;
    }
    const next = new Date(`${trimmed}T12:00:00`);
    if (Number.isNaN(next.getTime())) {
      return;
    }
    if (next < minimumDate || next > maximumDate) {
      return;
    }
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
              min: toIsoDateOnly(minimumDate),
              max: toIsoDateOnly(maximumDate),
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
          <Pressable onPress={openPicker} style={styles.valueRow}>
            <Text style={displayStyle}>{displayValue}</Text>
            <Feather name="calendar" size={20} color="#FFD700" />
          </Pressable>
        )}
        <View style={styles.underline} />
      </View>

      {/* Android : montage = ouverture du dialogue natif (voir datetimepicker.android.js) */}
      {pickerOpen && Platform.OS === 'android' ? (
        <DateTimePicker
          value={draft}
          mode="date"
          display="default"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={handleNativeChange}
        />
      ) : null}

      {/* iOS : modal avec roue + validation */}
      {pickerOpen && Platform.OS === 'ios' ? (
        <Modal visible transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
          <Pressable style={styles.modalBackdrop} onPress={() => setPickerOpen(false)}>
            <Pressable
              style={[styles.modalCard, { paddingBottom: Math.max(insets.bottom, 16) }]}
              onPress={(e) => e.stopPropagation()}
            >
              <DateTimePicker
                value={draft}
                mode="date"
                display="spinner"
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                themeVariant="light"
                onChange={(_, date) => {
                  if (date) {
                    setDraft(date);
                  }
                }}
              />
              <View style={styles.modalActions}>
                <Pressable onPress={() => setPickerOpen(false)} style={styles.modalBtn}>
                  <Text style={styles.modalBtnText}>Annuler</Text>
                </Pressable>
                <Pressable onPress={confirmIos} style={styles.modalBtn}>
                  <Text style={[styles.modalBtnText, styles.modalBtnPrimary]}>OK</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingTop: 16,
    alignItems: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 24,
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  modalBtn: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  modalBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalBtnPrimary: {
    color: '#212121',
    fontWeight: '700',
  },
});
