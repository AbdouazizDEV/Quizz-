/** Stub types — remplacer par le vrai package dès `npx expo install expo-notifications`. */
declare module 'expo-notifications' {
  export function getPermissionsAsync(): Promise<{ status: string }>;
  export function requestPermissionsAsync(): Promise<{ status: string }>;
  export function getExpoPushTokenAsync(): Promise<{ data: string }>;
}
