import type { Feather } from '@expo/vector-icons';

export interface DefisSummaryItem {
  id: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
}

export interface DefisParticipationItem {
  id: string;
  title: string;
  subtitle: string;
  status: string;
}
