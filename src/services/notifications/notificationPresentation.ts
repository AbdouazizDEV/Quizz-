import type { ComponentProps } from 'react';
import { Feather } from '@expo/vector-icons';

type FeatherName = ComponentProps<typeof Feather>['name'];

export interface NotificationVisual {
  icon: FeatherName;
  iconBackground: string;
  iconColor: string;
  accent: string;
}

export function getNotificationVisual(type: string): NotificationVisual {
  switch (type) {
    case 'friend_request':
      return { icon: 'user-plus', iconBackground: '#E8F5E9', iconColor: '#2E7D32', accent: '#43A047' };
    case 'duel_request':
      return { icon: 'zap', iconBackground: '#FFF3E0', iconColor: '#F57C00', accent: '#FFB703' };
    case 'duel_accepted':
      return { icon: 'check-circle', iconBackground: '#E3F2FD', iconColor: '#1565C0', accent: '#1F2261' };
    case 'duel_declined':
      return { icon: 'x-circle', iconBackground: '#FFEBEE', iconColor: '#C62828', accent: '#E53935' };
    case 'duel_completed':
      return { icon: 'award', iconBackground: '#FFF8E1', iconColor: '#F9A825', accent: '#FFB703' };
    case 'duel_score':
      return { icon: 'bell', iconBackground: '#F3E5F5', iconColor: '#8E24AA', accent: '#7B1FA2' };
    case 'admin_notice':
      return { icon: 'bell', iconBackground: '#FCE4EC', iconColor: '#D81B60', accent: '#AD1457' };
    default:
      return { icon: 'bell', iconBackground: '#F3E5F5', iconColor: '#8E24AA', accent: '#7B1FA2' };
  }
}

export function formatNotificationTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "À l'instant";
  if (min < 60) return `Il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Il y a ${h} h`;
  const days = Math.floor(h / 24);
  if (days === 1) return 'Hier';
  if (days < 7) return `Il y a ${days} j`;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
