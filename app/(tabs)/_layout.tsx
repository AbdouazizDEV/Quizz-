import { Redirect, Stack } from 'expo-router';

import { useAuthStore } from '@stores/authStore';

export default function TabsGroupLayout() {
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s.hydrated);

  if (hydrated && !token) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
