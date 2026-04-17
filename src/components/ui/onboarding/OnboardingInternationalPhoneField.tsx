import { StyleSheet, Text, View } from 'react-native';
import PhoneInput from 'rn-international-phone-number';
import type { ICountry } from 'rn-country-select';

import { onboardingColumn } from '@constants/layout';

interface OnboardingInternationalPhoneFieldProps {
  label: string;
  country: ICountry;
  onChangeCountry: (country: ICountry) => void;
  onChangePhoneNumber: (phone: string) => void;
  defaultCountry: string;
  defaultPhoneNumber?: string;
  labelFontFamily?: string;
}

export function OnboardingInternationalPhoneField({
  label,
  country,
  onChangeCountry,
  onChangePhoneNumber,
  defaultCountry,
  defaultPhoneNumber,
  labelFontFamily,
}: OnboardingInternationalPhoneFieldProps) {
  return (
    <View style={[styles.fieldOuter, onboardingColumn]}>
      <Text
        style={[styles.label, labelFontFamily ? { fontFamily: labelFontFamily } : { fontWeight: '600' }]}
      >
        {label}
      </Text>

      <View style={styles.fieldInner}>
        <PhoneInput
          defaultCountry={defaultCountry as ICountry['cca2']}
          defaultPhoneNumber={defaultPhoneNumber}
          country={country}
          onChangeCountry={onChangeCountry}
          onChangePhoneNumber={onChangePhoneNumber}
          language="fra"
          keyboardType="phone-pad"
          modalType="bottomSheet"
          phoneInputStyles={{
            container: styles.phoneContainer,
            flagContainer: styles.flagContainer,
            input: styles.phoneInput,
            callingCode: styles.callingCode,
            divider: styles.divider,
          }}
        />
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
  phoneContainer: {
    width: '100%',
    borderWidth: 0,
    paddingHorizontal: 0,
  },
  flagContainer: {
    paddingLeft: 0,
  },
  divider: {
    backgroundColor: 'rgba(31, 34, 42, 0.12)',
  },
  callingCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: '#212121',
  },
  underline: {
    width: '100%',
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 215, 0, 0.87)',
  },
});
