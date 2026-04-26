import type { ProfileScreenData } from '@app-types/profile.types';
import { apiClient } from '@services/api/apiClient';
import { useAuthStore } from '@stores/authStore';
import { formatCompactNumber } from '@utils/formatCompactNumber';
import { getUserAvatarUri } from '@utils/getUserAvatarUri';

import type { IProfileDataProvider } from './IProfileDataProvider';

const COVER_PLACEHOLDER =
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80';

interface ApiProfilePayload {
  identity?: {
    id: string;
    display_name?: string;
    handle?: string;
    avatar_url?: string | null;
    cover_url?: string | null;
    gender?: 'female' | 'male' | 'unknown';
    viewer_relationship?: 'self' | 'none' | 'pending' | 'friends';
  };
  stats?: {
    quiz_count?: number;
    plays?: number;
    players?: number;
    collections?: number;
    followers?: number;
    following?: number;
  };
  quizzes?: Array<{
    id: string;
    title?: string;
    thumbnail_url?: string | null;
    question_count?: number;
    played_at?: string | null;
    play_count?: number;
  }>;
}

function relativeLabelFromIso(dateIso?: string | null): string {
  if (!dateIso) return 'Récemment';
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return 'Récemment';
  const diffMs = Date.now() - d.getTime();
  if (diffMs < 0) return 'Récemment';
  const day = 24 * 60 * 60 * 1000;
  const days = Math.floor(diffMs / day);
  if (days <= 0) return "Aujourd'hui";
  if (days === 1) return 'il y a 1 jour';
  if (days < 7) return `il y a ${days} jours`;
  const weeks = Math.floor(days / 7);
  if (weeks <= 1) return 'il y a 1 semaine';
  return `il y a ${weeks} semaines`;
}

async function resolveTargetUserId(userId?: string): Promise<string> {
  if (userId?.trim()) return userId.trim();
  const token = useAuthStore.getState().token?.trim();
  if (!token) throw new Error('Utilisateur non connecté.');
  const { data } = await apiClient.get<{ user?: { id?: string } }>('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const id = data.user?.id?.trim();
  if (!id) throw new Error('Impossible de résoudre le profil utilisateur.');
  return id;
}

export class ApiProfileDataProvider implements IProfileDataProvider {
  async getProfileScreenData(userId?: string): Promise<ProfileScreenData> {
    const token = useAuthStore.getState().token?.trim();
    if (!token) throw new Error('Utilisateur non connecté.');
    const targetUserId = await resolveTargetUserId(userId);

    const { data } = await apiClient.get<ApiProfilePayload>(`/users/${encodeURIComponent(targetUserId)}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const identity = data.identity;
    const stats = data.stats;
    const quizzes = data.quizzes ?? [];

    const displayName = identity?.display_name?.trim() || 'Joueur';
    const uid = identity?.id || targetUserId;
    const avatarUri = getUserAvatarUri(uid, identity?.avatar_url);

    return {
      identity: {
        id: uid,
        displayName,
        handle: identity?.handle?.trim() || '@joueur',
        avatarUri,
        coverUri: identity?.cover_url?.trim() || COVER_PLACEHOLDER,
        gender: identity?.gender ?? 'unknown',
        viewerRelationship: identity?.viewer_relationship ?? (userId ? 'none' : 'self'),
      },
      stats: [
        { id: 'quizzo', valueLabel: String(stats?.quiz_count ?? 0), caption: 'Quizzo' },
        { id: 'plays', valueLabel: formatCompactNumber(stats?.plays ?? 0), caption: 'Plays' },
        { id: 'players', valueLabel: formatCompactNumber(stats?.players ?? 0), caption: 'Players' },
        { id: 'collections', valueLabel: String(stats?.collections ?? 0), caption: 'Collections' },
        { id: 'followers', valueLabel: formatCompactNumber(stats?.followers ?? 0), caption: 'followers' },
        { id: 'following', valueLabel: String(stats?.following ?? 0), caption: 'following' },
      ],
      quizTotalCount: stats?.quiz_count ?? 0,
      quizzes: quizzes.map((q) => ({
        id: q.id,
        title: q.title?.trim() || 'Quiz',
        thumbnailUri:
          q.thumbnail_url?.trim() ||
          'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=400&q=80',
        questionCount: q.question_count ?? 0,
        relativeTimeLabel: relativeLabelFromIso(q.played_at),
        playCount: q.play_count ?? 0,
        visibility: 'public',
      })),
    };
  }
}

