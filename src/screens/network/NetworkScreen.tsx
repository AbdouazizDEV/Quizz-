import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ListRenderItem,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ConnectionFilter, ConnectionUser } from '@app-types/network.types';
import { ConnectionListItem } from '@components/ui/network/ConnectionListItem';
import { NetworkFilterTabs } from '@components/ui/network/NetworkFilterTabs';
import { NetworkSearchNavBar } from '@components/ui/network/NetworkSearchNavBar';
import { StatisticsNavbar } from '@components/ui/statistics/StatisticsNavbar';
import { NetworkTheme } from '@constants/networkTheme';
import { Routes } from '@constants/Routes';
import { useConnectionsScreenData } from '@hooks/useConnectionsScreenData';
import { getConnectionFollowService } from '@services/network/connectionFollowServiceInstance';
import { filterConnectionsByQuery } from '@utils/filterConnectionsByQuery';
import { getNetworkHorizontalPadding } from '@utils/networkResponsiveLayout';

function ListSeparator() {
  return <View style={separatorStyles.h} />;
}

const separatorStyles = StyleSheet.create({
  h: { height: NetworkTheme.listRowGap },
});

export default function NetworkScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const pagePaddingX = useMemo(() => getNetworkHorizontalPadding(screenWidth), [screenWidth]);

  const [fontsLoaded] = useFonts({
    Nunito_700Bold,
    Nunito_600SemiBold,
    Nunito_500Medium,
  });

  const fonts = useMemo(
    () => ({
      bold: fontsLoaded ? 'Nunito_700Bold' : undefined,
      semiBold: fontsLoaded ? 'Nunito_600SemiBold' : undefined,
      medium: fontsLoaded ? 'Nunito_500Medium' : undefined,
    }),
    [fontsLoaded],
  );

  const { data, loading, error, refetch } = useConnectionsScreenData();
  const [filter, setFilter] = useState<ConnectionFilter>('followers');
  const [relationshipOverrides, setRelationshipOverrides] = useState<Record<string, boolean>>({});
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const onBack = useCallback(() => {
    if (searchMode) {
      setSearchMode(false);
      setSearchQuery('');
      return;
    }
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(Routes.PROFILE);
  }, [router, searchMode]);

  const openSearch = useCallback(() => {
    setSearchMode(true);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchMode(false);
    setSearchQuery('');
  }, []);

  const list = useMemo(() => {
    if (!data) return [];
    return filter === 'followers' ? data.followers : data.following;
  }, [data, filter]);

  const filteredList = useMemo(
    () => filterConnectionsByQuery(list, searchQuery),
    [list, searchQuery],
  );

  const effectiveRelationship = useCallback(
    (user: ConnectionUser) => relationshipOverrides[user.id] ?? user.relationshipIsActive,
    [relationshipOverrides],
  );

  const onToggleFollow = useCallback(
    async (user: ConnectionUser) => {
      const next = !effectiveRelationship(user);
      setRelationshipOverrides((prev) => ({ ...prev, [user.id]: next }));
      const follow = getConnectionFollowService();
      try {
        await follow.setFollowing(user.id, next);
      } catch {
        setRelationshipOverrides((prev) => {
          const nextMap = { ...prev };
          delete nextMap[user.id];
          return nextMap;
        });
        Alert.alert('Erreur', 'Impossible de mettre à jour le suivi.');
      }
    },
    [effectiveRelationship],
  );

  const renderItem: ListRenderItem<ConnectionUser> = useCallback(
    ({ item }) => (
      <ConnectionListItem
        user={item}
        fonts={fonts}
        relationshipActive={effectiveRelationship(item)}
        onToggleFollow={() => void onToggleFollow(item)}
      />
    ),
    [fonts, effectiveRelationship, onToggleFollow],
  );

  const keyExtractor = useCallback((item: ConnectionUser) => item.id, []);

  const ListHeader = useMemo(
    () =>
      data ? (
        <View style={styles.headerBlock}>
          {searchMode ? (
            <NetworkSearchNavBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              onClose={closeSearch}
              fonts={fonts}
            />
          ) : (
            <StatisticsNavbar
              title={data.viewerDisplayName}
              fonts={fonts}
              onBack={onBack}
              fullWidth
              rightAction={{ type: 'search', onPress: openSearch }}
            />
          )}
          <NetworkFilterTabs active={filter} onChange={setFilter} fonts={fonts} />
        </View>
      ) : null,
    [data, fonts, onBack, openSearch, closeSearch, searchMode, searchQuery, filter],
  );

  const listContentStyle = useMemo(
    () => [
      styles.listContent,
      {
        paddingTop: insets.top + NetworkTheme.pagePaddingTop,
        paddingHorizontal: pagePaddingX,
        paddingBottom: NetworkTheme.pagePaddingBottom + insets.bottom,
      },
    ],
    [insets.top, insets.bottom, pagePaddingX],
  );

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#FFFFFF', '#F8F8F8']} style={StyleSheet.absoluteFillObject} />

      {loading && !data ? (
        <View style={[styles.centered, { paddingTop: insets.top }]}>
          <ActivityIndicator size="large" color="#212121" />
        </View>
      ) : error ? (
        <View style={[styles.centered, { paddingTop: insets.top, paddingHorizontal: 24 }]}>
          <Text style={styles.errorText}>Impossible de charger les connexions.</Text>
          <Text style={styles.retry} onPress={() => refetch()}>
            Réessayer
          </Text>
        </View>
      ) : data ? (
        <FlatList
          style={styles.flatList}
          data={filteredList}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={
            searchQuery.trim().length > 0 ? (
              <Text style={[styles.emptyHint, fonts.medium && { fontFamily: fonts.medium }]}>
                Aucun utilisateur ne correspond à « {searchQuery.trim()} ».
              </Text>
            ) : null
          }
          contentContainerStyle={listContentStyle}
          ItemSeparatorComponent={ListSeparator}
          showsVerticalScrollIndicator={false}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: NetworkTheme.listSurface },
  flatList: {
    flex: 1,
    width: '100%',
    backgroundColor: NetworkTheme.listSurface,
  },
  listContent: {
    flexGrow: 1,
    width: '100%',
  },
  headerBlock: {
    width: '100%',
    alignItems: 'stretch',
    gap: NetworkTheme.sectionGap,
    marginBottom: NetworkTheme.headerToListGap,
  },
  emptyHint: {
    textAlign: 'center',
    paddingVertical: 24,
    paddingHorizontal: 8,
    fontSize: 15,
    color: NetworkTheme.grey700,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 15,
    color: '#616161',
    textAlign: 'center',
  },
  retry: {
    fontSize: 15,
    fontWeight: '600',
    color: '#C9A000',
  },
});
