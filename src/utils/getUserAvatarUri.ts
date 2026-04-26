export function getUserAvatarUri(userId: string, avatarUrl?: string | null): string {
  const clean = avatarUrl?.trim();
  if (clean) return clean;
  return `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(userId)}`;
}

