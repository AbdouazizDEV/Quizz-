import type { Href } from 'expo-router';

export type SettingsMenuEntry =
  | {
      id: string;
      kind: 'link';
      label: string;
      icon: string;
      iconBackground: string;
      iconColor: string;
      href: Href;
    }
  | {
      id: string;
      kind: 'toggle';
      label: string;
      icon: string;
      iconBackground: string;
      iconColor: string;
      toggleKey: 'darkMode';
    }
  | {
      id: string;
      kind: 'logout';
      label: string;
      icon: string;
      iconBackground: string;
      iconColor: string;
    };
