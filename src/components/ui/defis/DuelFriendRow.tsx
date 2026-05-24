import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@constants/Colors';
import type { DuelFriendResult } from '@services/defis/duelFriendsSearch';

interface DuelFriendRowProps {
  friend: DuelFriendResult;
  onChallenge: () => void;
}

export function DuelFriendRow({ friend, onChallenge }: DuelFriendRowProps) {
  return (
    <View style={styles.row}>
      <Image source={{ uri: friend.avatarUri }} style={styles.avatar} />
      <View style={styles.info}>
        <Text style={styles.name}>{friend.displayName}</Text>
        <Text style={styles.handle}>{friend.handle}</Text>
      </View>
      <Pressable style={styles.challengeBtn} onPress={onChallenge}>
        <Text style={styles.challengeBtnText}>Défier</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.border,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  handle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  challengeBtn: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  challengeBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: COLORS.primaryDark,
  },
});
