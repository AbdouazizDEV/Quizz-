export interface PersonalInfoFormValues {
  email: string;
  fullName: string;
  username: string;
  phone: string;
  bio: string;
  birthDate: string;
  countryCode: string;
  accountTypeSlug: string;
  workplaceSlug: string;
  levelCode: string;
  totalScore: number;
  quizzesCompleted: number;
  avatarUrl: string | null;
}

export interface PersonalInfoUpdatePayload {
  full_name?: string;
  username?: string;
  phone?: string | null;
  bio?: string | null;
  birth_date?: string | null;
  country_code?: string | null;
  account_type_slug?: string | null;
  workplace_slug?: string | null;
}
