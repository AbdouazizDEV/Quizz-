import { Routes } from '@constants/Routes';

import type { SettingsMenuEntry } from '@app-types/settingsMenu.types';

/** Source unique de la liste des entrées Paramètres (SOLID : ouvert à extension, fermé à modification via copie). */
export function getSettingsMenuEntries(): SettingsMenuEntry[] {
  return [
    {
      id: 'personal',
      kind: 'link',
      label: 'Informations personnelles',
      icon: 'user',
      iconBackground: '#FFF3E0',
      iconColor: '#F57C00',
      href: Routes.SETTINGS_PERSONAL,
    },
    {
      id: 'notifications',
      kind: 'link',
      label: 'Notifications',
      icon: 'bell',
      iconBackground: '#FCE4EC',
      iconColor: '#D81B60',
      href: Routes.SETTINGS_NOTIFICATIONS,
    },
    {
      id: 'music',
      kind: 'link',
      label: 'Musique et effets',
      icon: 'volume-2',
      iconBackground: '#EDE7F6',
      iconColor: '#F9A825',
      href: Routes.SETTINGS_MUSIC,
    },
    {
      id: 'security',
      kind: 'link',
      label: 'Sécurité',
      icon: 'shield',
      iconBackground: '#E8F5E9',
      iconColor: '#43A047',
      href: Routes.SETTINGS_SECURITY,
    },
    {
      id: 'dark',
      kind: 'toggle',
      label: 'Mode sombre',
      icon: 'eye',
      iconBackground: '#E3F2FD',
      iconColor: '#FFB703',
      toggleKey: 'darkMode',
    },
    {
      id: 'help',
      kind: 'link',
      label: "Centre d'aide",
      icon: 'file-text',
      iconBackground: '#FFF8E1',
      iconColor: '#FB8C00',
      href: Routes.SETTINGS_HELP,
    },
    {
      id: 'about',
      kind: 'link',
      label: 'À propos de Quizzo',
      icon: 'info',
      iconBackground: '#F3E5F5',
      iconColor: '#8E24AA',
      href: Routes.SETTINGS_ABOUT,
    },
    {
      id: 'logout',
      kind: 'logout',
      label: 'Se déconnecter',
      icon: 'log-out',
      iconBackground: '#FFEBEE',
      iconColor: '#E53935',
    },
  ];
}
