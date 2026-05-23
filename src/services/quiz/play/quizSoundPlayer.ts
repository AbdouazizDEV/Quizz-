import { Audio } from 'expo-av';

const soundCache = new Map<number, Audio.Sound>();

export async function playBundledSound(assetModuleId: number): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
    let sound = soundCache.get(assetModuleId);
    if (!sound) {
      const created = await Audio.Sound.createAsync(assetModuleId);
      sound = created.sound;
      soundCache.set(assetModuleId, sound);
    }
    await sound.setPositionAsync(0);
    await sound.playAsync();
  } catch {
    // Web ou module audio indisponible
  }
}
