import { ImageBackground, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

import { ProfileTheme } from '@constants/profileTheme';

interface ProfileCoverBannerProps {
  coverUri: string;
  onPressChangeCover: () => void;
}

export function ProfileCoverBanner({ coverUri, onPressChangeCover }: ProfileCoverBannerProps) {
  return (
    <View style={styles.wrap}>
      <ImageBackground source={{ uri: coverUri }} style={styles.image} imageStyle={styles.imageRadius}>
        <LinearGradient
          colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.25)']}
          style={StyleSheet.absoluteFill}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Modifier la photo de couverture"
          onPress={onPressChangeCover}
          style={styles.photoBtn}
        >
          <View style={styles.photoBtnInner}>
            <Feather name="camera" size={20} color={ProfileTheme.white} />
          </View>
        </Pressable>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    maxWidth: ProfileTheme.contentMaxWidth,
    height: ProfileTheme.coverHeight,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E8E0FF',
  },
  image: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  imageRadius: {
    borderRadius: 12,
  },
  photoBtn: {
    margin: 10,
  },
  photoBtnInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
