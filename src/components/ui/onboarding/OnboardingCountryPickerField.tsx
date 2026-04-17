import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import CountrySelect from 'rn-country-select';
import type { ICountry } from 'rn-country-select';

import { onboardingColumn } from '@constants/layout';
import { getCountryLabelFr } from '@utils/countryDisplay';

interface OnboardingCountryPickerFieldProps {
  label: string;
  country: ICountry;
  onChangeCountry: (country: ICountry) => void;
  labelFontFamily?: string;
  valueFontFamily?: string;
}

export function OnboardingCountryPickerField({
  label,
  country,
  onChangeCountry,
  labelFontFamily,
  valueFontFamily,
}: OnboardingCountryPickerFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <View style={[styles.fieldOuter, onboardingColumn]}>
      <Text
        style={[styles.label, labelFontFamily ? { fontFamily: labelFontFamily } : { fontWeight: '600' }]}
      >
        {label}
      </Text>

      <View style={styles.fieldInner}>
        <Pressable onPress={() => setOpen(true)} style={styles.valueRow}>
          <Text style={styles.flag}>{country.flag}</Text>
          <Text
            style={[
              styles.value,
              valueFontFamily ? { fontFamily: valueFontFamily } : { fontWeight: '700' },
            ]}
            numberOfLines={1}
          >
            {getCountryLabelFr(country)}
          </Text>
          <Feather name="chevron-down" size={20} color="#FFD700" />
        </Pressable>
        <View style={styles.underline} />
      </View>

      <CountrySelect
        visible={open}
        onClose={() => setOpen(false)}
        isMultiSelect={false}
        onSelect={(selected) => {
          onChangeCountry(selected);
          setOpen(false);
        }}
        language="fra"
        modalType="bottomSheet"
        showSearchInput
        showCloseButton
      />
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
  flag: {
    fontSize: 22,
    lineHeight: 24,
  },
  value: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    color: '#212121',
  },
  underline: {
    width: '100%',
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 215, 0, 0.87)',
  },
});
