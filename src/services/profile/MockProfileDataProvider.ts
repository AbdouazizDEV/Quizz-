import type { ProfileScreenData } from '@app-types/profile.types';
import { formatCompactNumber } from '@utils/formatCompactNumber';

import type { IProfileDataProvider } from './IProfileDataProvider';

const COVER_PLACEHOLDER =
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80';
const AVATAR_PLACEHOLDER =
  'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&q=80';

/** Données de démo ; remplaçable par un provider API sans changer l’UI. */
export class MockProfileDataProvider implements IProfileDataProvider {
  async getProfileScreenData(_userId?: string): Promise<ProfileScreenData> {
    const quizTotalCount = 45;
    const plays = 5_600_000;
    const players = 16_800_000;
    const collections = 7;
    const followers = 372_500;
    const following = 269;

    return {
      identity: {
        id: 'demo-user',
        displayName: 'Andrew Ainsley',
        handle: '@andrew_ainsley',
        avatarUri: AVATAR_PLACEHOLDER,
        coverUri: COVER_PLACEHOLDER,
        gender: 'unknown',
        viewerRelationship: _userId ? 'none' : 'self',
      },
      stats: [
        { id: 'quizzo', valueLabel: String(quizTotalCount), caption: 'Quizzo' },
        { id: 'plays', valueLabel: formatCompactNumber(plays), caption: 'Plays' },
        { id: 'players', valueLabel: formatCompactNumber(players), caption: 'Players' },
        { id: 'collections', valueLabel: String(collections), caption: 'Collections' },
        { id: 'followers', valueLabel: formatCompactNumber(followers), caption: 'followers' },
        { id: 'following', valueLabel: String(following), caption: 'following' },
      ],
      quizTotalCount,
      quizzes: [
        {
          id: 'q1',
          title: 'Back to School Quiz Game',
          thumbnailUri:
            'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80',
          questionCount: 10,
          relativeTimeLabel: 'Today',
          playCount: 20,
          visibility: 'public',
        },
        {
          id: 'q2',
          title: 'Science Trivia Night',
          thumbnailUri:
            'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&q=80',
          questionCount: 16,
          relativeTimeLabel: '3 days ago',
          playCount: 4,
          visibility: 'private',
        },
        {
          id: 'q3',
          title: 'Weekend Fun Quiz',
          thumbnailUri:
            'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=400&q=80',
          questionCount: 12,
          relativeTimeLabel: '1 week ago',
          playCount: 128,
          visibility: 'public',
        },
      ],
    };
  }
}
