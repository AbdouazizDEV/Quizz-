import { useCallback } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { GainsExpressCta } from '@components/ui/gains/GainsExpressCta';
import { GainsLeaderboardCard } from '@components/ui/gains/GainsLeaderboardCard';
import { GainsNavCard } from '@components/ui/gains/GainsNavCard';
import { GainsPageShell } from '@components/ui/gains/GainsPageShell';
import { GainsRankHero } from '@components/ui/gains/GainsRankHero';
import { GainsStreakBonuses } from '@components/ui/gains/GainsStreakBonuses';
import { GainsRoutes } from '@constants/gainsRoutes';
import { Routes } from '@constants/Routes';
import { useGainsHubData } from '@hooks/useGainsHubData';

export default function GainsHubScreen() {
  const router = useRouter();
  const { data, loading, error, refetch } = useGainsHubData();

  const goExpress = useCallback(() => {
    router.push(Routes.CATEGORIES);
  }, [router]);

  return (
    <GainsPageShell title="Gains" showBottomNav showBack={false}>
      <Animated.View entering={FadeInDown.duration(400)} style={styles.intro}>
        <Text style={styles.introTitle}>Classement, récompenses & avantages</Text>
        <Text style={styles.introSub}>
          Jouez stratégiquement, suivez vos gains et échangez vos points.
        </Text>
      </Animated.View>

      {loading && !data ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1F2347" />
        </View>
      ) : error && !data ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Impossible de charger tes gains.</Text>
          <Text style={styles.retry} onPress={() => void refetch()}>
            Réessayer
          </Text>
        </View>
      ) : data ? (
        <View style={styles.body}>
          <GainsRankHero
            rank={data.rank}
            totalPoints={data.totalPoints}
            pointsToTop3={data.pointsToTop3}
          />

          <GainsExpressCta onPress={goExpress} />

          <GainsStreakBonuses streakDays={data.streakDays} />

          <GainsLeaderboardCard
            rows={data.leaderboard}
            onSeeAll={() => router.push(Routes.SCOREBOARD)}
          />

          <Animated.View entering={FadeInDown.delay(180).duration(400)} style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Explorer</Text>
          </Animated.View>

          <GainsNavCard
            icon="compass"
            title="Comment gagner"
            subtitle="Joue stratégiquement : Express, défis, série…"
            onPress={() => router.push(GainsRoutes.howToWin)}
            delayMs={200}
            accent="#FFB703"
          />
          <GainsNavCard
            icon="gift"
            title="Ce que je peux gagner"
            subtitle="Cash prizes & offres partenaires"
            onPress={() => router.push(GainsRoutes.prizes)}
            delayMs={240}
            accent="#F97316"
          />
          <GainsNavCard
            icon="shopping-bag"
            title="Récompenses"
            subtitle="Échange tes points contre des lots"
            onPress={() => router.push(GainsRoutes.rewards)}
            delayMs={280}
            accent="#22C55E"
          />
          <GainsNavCard
            icon="inbox"
            title="Mes gains"
            subtitle="Historique, stats et activité"
            onPress={() => router.push(GainsRoutes.myEarnings)}
            delayMs={320}
            accent="#6366F1"
          />
        </View>
      ) : null}
    </GainsPageShell>
  );
}

const styles = StyleSheet.create({
  intro: { gap: 4, marginTop: -4 },
  introTitle: { fontSize: 15, fontWeight: '800', color: '#212121' },
  introSub: { fontSize: 13, lineHeight: 18, color: '#757575' },
  body: { gap: 14 },
  sectionHead: { marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#212121' },
  centered: { paddingVertical: 40, alignItems: 'center', gap: 10 },
  errorText: { fontSize: 14, color: '#616161', textAlign: 'center' },
  retry: { fontSize: 14, fontWeight: '700', color: '#C9A000' },
});
