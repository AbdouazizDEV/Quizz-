import { Stack } from 'expo-router';

export default function DefisLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="challenge/index" />
      <Stack.Screen name="challenge/[id]" />
      <Stack.Screen name="challenge/classement/[id]" />
      <Stack.Screen name="tournoi/index" />
      <Stack.Screen name="tournoi/[id]" />
      <Stack.Screen name="tournoi/bracket/[id]" />
      <Stack.Screen name="duel/index" />
      <Stack.Screen name="duel/amis/index" />
      <Stack.Screen name="duel/en-attente/index" />
      <Stack.Screen name="duel/recents/index" />
      <Stack.Screen name="duel/[id]" />
      <Stack.Screen name="duel/resultat/[id]" />
    </Stack>
  );
}
