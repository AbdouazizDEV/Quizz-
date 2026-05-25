import type { AuthMeResponse } from '@sdk';
import type { PersonalInfoFormValues, PersonalInfoUpdatePayload } from '@app-types/personalInfo.types';

function metaString(user: AuthMeResponse['user'], key: string): string {
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const v = meta?.[key];
  return typeof v === 'string' ? v.trim() : '';
}

export function mapAuthMeToPersonalInfoForm(me: AuthMeResponse): PersonalInfoFormValues {
  const profile = me.profile;
  const user = me.user;

  return {
    email: user.email?.trim() ?? '',
    fullName: profile?.full_name?.trim() || metaString(user, 'full_name') || '',
    username: profile?.username?.trim() || metaString(user, 'username') || '',
    phone:
      (profile as { phone?: string | null } | null | undefined)?.phone?.trim() ||
      metaString(user, 'phone') ||
      '',
    bio: (profile as { bio?: string | null } | null | undefined)?.bio?.trim() ?? '',
    birthDate:
      (profile as { birth_date?: string | null } | null | undefined)?.birth_date?.toString().slice(0, 10) ??
      metaString(user, 'birth_date'),
    countryCode: metaString(user, 'country_code'),
    accountTypeSlug:
      (profile as { account_type_slug?: string | null } | null | undefined)?.account_type_slug?.trim() ||
      metaString(user, 'account_type'),
    workplaceSlug:
      (profile as { workplace_slug?: string | null } | null | undefined)?.workplace_slug?.trim() ||
      metaString(user, 'workplace'),
    levelCode: profile?.level_code ?? 'Z0',
    totalScore: profile?.total_score ?? 0,
    quizzesCompleted: profile?.quizzes_completed ?? 0,
    avatarUrl: profile?.avatar_url ?? null,
  };
}

export function mapFormToUpdatePayload(form: PersonalInfoFormValues): PersonalInfoUpdatePayload {
  return {
    full_name: form.fullName.trim() || undefined,
    username: form.username.trim() || undefined,
    phone: form.phone.trim() || null,
    bio: form.bio.trim() || null,
    birth_date: form.birthDate.trim() || null,
    country_code: form.countryCode.trim() || null,
    account_type_slug: form.accountTypeSlug.trim() || null,
    workplace_slug: form.workplaceSlug.trim() || null,
  };
}
