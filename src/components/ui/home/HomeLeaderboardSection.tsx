import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export interface HomeLeaderboardUser {
  id: string;
  name: string;
  points: number;
  /** URL d’avatar optionnelle ; sinon initiale du prénom. */
  avatar?: string;
  /** Optionnel ; sinon dérivé de la position dans la liste. */
  rank?: number;
}

interface HomeLeaderboardSectionProps {
  users: HomeLeaderboardUser[];
  onPressAvatar?: (userId: string) => void;
}

export function HomeLeaderboardSection({ users, onPressAvatar }: HomeLeaderboardSectionProps) {
  if (users.length === 0) {
    return (
      <View style={styles.rankCard}>
        <Text style={styles.emptyText}>Aucun score disponible pour le moment.</Text>
      </View>
    );
  }

  return (
    <View style={styles.rankCard}>
      {users.map((user, index) => {
        const position = user.rank ?? index + 1;
        return (
          <View key={user.id} style={styles.rankRow}>
            <View style={styles.rankLeft}>
              <Text style={styles.rankIndex}>{position}</Text>
              <Pressable
                style={styles.rankAvatar}
                onPress={() => onPressAvatar?.(user.id)}
                accessibilityRole="button"
              >
                {user.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.rankAvatarImage} />
                ) : (
                  <Text style={styles.rankAvatarText}>{user.name[0]?.toUpperCase() ?? '?'}</Text>
                )}
              </Pressable>
              <Text style={styles.rankName} numberOfLines={1}>
                {user.name}
              </Text>
            </View>
            <Text style={styles.rankPoints}>{user.points} pts</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  rankCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    overflow: 'hidden',
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F1F1',
  },
  rankLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginRight: 8,
  },
  rankIndex: {
    width: 20,
    color: '#B88700',
    fontWeight: '800',
    fontSize: 15,
  },
  rankAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  rankAvatarImage: {
    width: '100%',
    height: '100%',
  },
  rankAvatarText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '700',
  },
  rankName: {
    flex: 1,
    color: '#212121',
    fontSize: 15,
    fontWeight: '600',
  },
  rankPoints: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyText: {
    paddingHorizontal: 14,
    paddingVertical: 16,
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
  },
});
