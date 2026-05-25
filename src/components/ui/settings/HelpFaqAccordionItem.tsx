import { useState } from 'react';
import { LayoutAnimation, Platform, Pressable, StyleSheet, Text, UIManager, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { SettingsScreenTheme } from '@constants/settingsScreenTheme';

import type { ProfileFontFamilies } from '@components/ui/profile/ProfileFonts';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface HelpFaqAccordionItemProps {
  question: string;
  answer: string;
  fonts: ProfileFontFamilies;
  defaultOpen?: boolean;
}

export function HelpFaqAccordionItem({
  question,
  answer,
  fonts,
  defaultOpen = false,
}: HelpFaqAccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((v) => !v);
  };

  return (
    <View style={styles.wrap}>
      <Pressable onPress={toggle} style={styles.header} accessibilityRole="button">
        <Text style={[styles.question, fonts.semiBold && { fontFamily: fonts.semiBold }]}>{question}</Text>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={20} color="#9E9E9E" />
      </Pressable>
      {open ? (
        <Text style={[styles.answer, fonts.medium && { fontFamily: fonts.medium }]}>{answer}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEEEEE',
    paddingVertical: 14,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  question: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: SettingsScreenTheme.grey900,
    lineHeight: 21,
  },
  answer: {
    fontSize: 14,
    lineHeight: 21,
    color: '#616161',
  },
});
