import { create } from 'zustand';

/** Données collectées avant l’écran Register (envoyées à POST /auth/register). */
export interface OnboardingRegisterPayload {
  accountTypeId: string;
  workplaceId: string;
  fullName: string;
  birthDateIso: string;
  countryCca2: string;
  phoneE164: string;
}

interface OnboardingRegisterState extends OnboardingRegisterPayload {
  setAccountTypeId: (id: string) => void;
  setWorkplaceId: (id: string) => void;
  setProfile: (
    p: Pick<OnboardingRegisterPayload, 'fullName' | 'birthDateIso' | 'countryCca2' | 'phoneE164'>,
  ) => void;
  isComplete: () => boolean;
  clear: () => void;
}

const empty = (): OnboardingRegisterPayload => ({
  accountTypeId: '',
  workplaceId: '',
  fullName: '',
  birthDateIso: '',
  countryCca2: '',
  phoneE164: '',
});

export const useOnboardingRegisterStore = create<OnboardingRegisterState>((set, get) => ({
  ...empty(),
  setAccountTypeId: (accountTypeId) => set({ accountTypeId }),
  setWorkplaceId: (workplaceId) => set({ workplaceId }),
  setProfile: ({ fullName, birthDateIso, countryCca2, phoneE164 }) =>
    set({ fullName, birthDateIso, countryCca2, phoneE164 }),
  isComplete: () => {
    const s = get();
    return Boolean(
      s.accountTypeId &&
        s.workplaceId &&
        s.fullName.trim() &&
        s.birthDateIso &&
        s.countryCca2 &&
        s.phoneE164.trim(),
    );
  },
  clear: () => set(empty()),
}));
