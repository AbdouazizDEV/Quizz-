import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

import type { PersonalInfoFormValues } from '@app-types/personalInfo.types';
import { getUserAvatarUri } from '@utils/getUserAvatarUri';

import type { ProfileFontFamilies } from '@components/ui/profile/ProfileFonts';

interface PersonalInfoHeroCardProps {
  form: PersonalInfoFormValues;
  userId: string;
  fonts: ProfileFontFamilies;
}

export function PersonalInfoHeroCard({ form, userId, fonts }: PersonalInfoHeroCardProps) {
  const avatarUri = getUserAvatarUri(userId, form.avatarUrl);

  return (
    <LinearGradient colors={['#FFE066', '#FFB703']} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <View style={styles.inner}>
        <View style={styles.avatarWrap}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <Text style={[styles.avatarLetter, fonts.bold && { fontFamily: fonts.bold }]}>
              {form.fullName[0]?.toUpperCase() ?? '?'}
            </Text>
          )}
        </View>
        <View style={styles.textCol}>
          <Text style={[styles.name, fonts.bold && { fontFamily: fonts.bold }]} numberOfLines={1}>
            {form.fullName || 'Joueur'}
          </Text>
          <Text style={[styles.handle, fonts.medium && { fontFamily: fonts.medium }]} numberOfLines={1}>
            @{form.username || 'joueur'}
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Feather name="award" size={14} color="#1F2261" />
              <Text style={[styles.statTxt, fonts.semiBold && { fontFamily: fonts.semiBold }]}>
                Niveau {form.levelCode}
              </Text>
            </View>
            <View style={styles.statPill}>
              <Feather name="star" size={14} color="#FFB703" />
              <Text style={[styles.statTxt, fonts.semiBold && { fontFamily: fonts.semiBold }]}>
                {form.totalScore} pts
              </Text>
            </View>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    borderRadius: 22,
    padding: 3,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 19,
    padding: 16,
  },
  avatarWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E8EEFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFE082',
  },
  avatar: { width: '100%', height: '100%' },
  avatarLetter: { fontSize: 28, fontWeight: '900', color: '#315ECC' },
  textCol: { flex: 1, gap: 4, minWidth: 0 },
  name: { fontSize: 20, fontWeight: '800', color: '#212121' },
  handle: { fontSize: 14, color: '#616161' },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF8E1',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statTxt: { fontSize: 12, fontWeight: '700', color: '#1F2261' },
});
