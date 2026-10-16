export interface ArenaCampus {
  id: string;
  code: string;
  name: string;
  role: 'priority' | 'backup' | string;
  prospect_order: number;
}

export interface ArenaPeriodCampus {
  id: string;
  code: string;
  name: string;
}

export interface ArenaPeriod {
  id: string;
  kind: string;
  label: string;
  starts_on: string;
  ends_on: string;
  sort_order: number;
  campus: ArenaPeriodCampus | null;
  campus_confirmed_at?: string | null;
}

export interface ArenaEditionSchedule {
  daily_open_hours: string[];
  weekday_closes_at: string;
  friday_appeal_until: string;
}

export interface ArenaEdition {
  edition_key: string;
  timezone: string;
  status: string;
  premium_expires_at: string;
  schedule: ArenaEditionSchedule;
  campuses: ArenaCampus[];
  periods: ArenaPeriod[];
}

export interface ArenaRegistrationCampus {
  id: string;
  code: string;
  name: string;
}

export interface ArenaRegistration {
  status: string;
  document_status: string;
  campus: ArenaRegistrationCampus;
  created_at: string;
}

export interface ArenaMeResponse {
  edition_key: string;
  registration: ArenaRegistration | null;
}

export interface ArenaRegisterResponse {
  created: boolean;
  registration: ArenaRegistration;
  premium?: unknown;
}
