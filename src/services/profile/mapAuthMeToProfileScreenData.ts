import type { ProfileScreenData } from '@app-types/profile.types';
import type { AuthMeResponse } from '@services/auth/fetchAuthMe';
import { formatCompactNumber } from '@utils/formatCompactNumber';

const COVER_PLACEHOLDER =
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80';
const AVATAR_PLACEHOLDER =
  'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&q=80';

function metaString(user: AuthMeResponse['user'], key: string): string | undefined {
  const m = user.user_metadata as Record<string, unknown> | undefined;
  const v = m?.[key];
  return typeof v === 'string' && v.trim() ? v.trim() : undefined;
}

export function mapAuthMeToProfileScreenData(me: AuthMeResponse): ProfileScreenData {
  const { user, profile } = me;
  const email = typeof user.email === 'string' ? user.email : undefined;
  const displayName =
    profile?.full_name?.trim() ||
    metaString(user, 'full_name') ||
    metaString(user, 'username') ||
    email?.split('@')[0] ||
    'Joueur';

  const rawHandle = profile?.username?.trim() || metaString(user, 'username') || 'user';
  const handle = rawHandle.startsWith('@') ? rawHandle : `@${rawHandle}`;

  const avatarUri = profile?.avatar_url?.trim() || AVATAR_PLACEHOLDER;

  const totalScore = profile?.total_score ?? 0;
  const quizzesDone = profile?.quizzes_completed ?? 0;
  const daysActive = profile?.days_active ?? 0;
  const streak = profile?.streak_days ?? 0;
  const level = profile?.level_code ?? 'Z0';
  const premium = profile?.is_premium ?? false;

  return {
    identity: {
      id: user.id,
      displayName,
      handle,
      avatarUri,
      coverUri: COVER_PLACEHOLDER,
      gender: 'unknown',
      viewerRelationship: 'self',
    },
    stats: [
      { id: 'quizzo', valueLabel: String(quizzesDone), caption: 'Quizzo' },
      { id: 'points', valueLabel: formatCompactNumber(totalScore), caption: 'Points' },
      { id: 'days', valueLabel: String(daysActive), caption: 'Jours actifs' },
      { id: 'streak', valueLabel: String(streak), caption: 'Série' },
      { id: 'level', valueLabel: level, caption: 'Niveau' },
      { id: 'premium', valueLabel: premium ? 'Oui' : 'Non', caption: 'Premium' },
    ],
    quizTotalCount: quizzesDone,
    quizzes: [],
  };
}
