import AsyncStorage from '@react-native-async-storage/async-storage';

const PENDING_FRIEND_INVITE_KEY = 'quizz.pending_friend_invite_d';

export async function storePendingFriendInvite(token: string): Promise<void> {
  const value = token.trim();
  if (!value) return;
  await AsyncStorage.setItem(PENDING_FRIEND_INVITE_KEY, value);
}

export async function readPendingFriendInvite(): Promise<string | null> {
  const value = await AsyncStorage.getItem(PENDING_FRIEND_INVITE_KEY);
  return value?.trim() || null;
}

export async function clearPendingFriendInvite(): Promise<void> {
  await AsyncStorage.removeItem(PENDING_FRIEND_INVITE_KEY);
}

export async function consumePendingFriendInvite(): Promise<string | null> {
  const value = await readPendingFriendInvite();
  if (!value) return null;
  await clearPendingFriendInvite();
  return value;
}
