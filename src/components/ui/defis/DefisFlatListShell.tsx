import type { ReactElement, ReactNode } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  View,
  type ListRenderItem,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '@components/ui/common/AppHeader';
import { COLORS } from '@constants/Colors';
import { Spacing } from '@constants/Spacing';

interface DefisFlatListShellProps<T> {
  title: string;
  data: T[];
  keyExtractor: (item: T) => string;
  renderItem: ListRenderItem<T>;
  ListHeaderComponent?: ReactNode;
  ListEmptyComponent?: ReactElement | null;
  ListFooterComponent?: ReactElement | null;
  onEndReached?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  isFetchingNextPage?: boolean;
}

export function DefisFlatListShell<T>({
  title,
  data,
  keyExtractor,
  renderItem,
  ListHeaderComponent,
  ListEmptyComponent,
  ListFooterComponent,
  onEndReached,
  refreshing,
  onRefresh,
  isFetchingNextPage,
}: DefisFlatListShellProps<T>) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const contentWidth = Math.min(screenWidth - Spacing.screenHorizontal * 2, Spacing.onboardingMaxWidth);

  const wrappedRenderItem: ListRenderItem<T> = (info) => (
    <View style={{ width: contentWidth, maxWidth: contentWidth }}>{renderItem(info)}</View>
  );

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#FFFFFF', COLORS.background]} style={styles.bg} />
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        renderItem={wrappedRenderItem}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingHorizontal: Spacing.screenHorizontal,
          paddingBottom: insets.bottom + 24,
          alignItems: 'center',
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListHeaderComponent={
          <View style={[styles.column, { maxWidth: contentWidth, width: contentWidth }]}>
            <AppHeader title={title} />
            {ListHeaderComponent}
          </View>
        }
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={
          <View style={[styles.footer, { maxWidth: contentWidth, width: contentWidth }]}>
            {isFetchingNextPage ? <ActivityIndicator color={COLORS.primary} style={styles.loader} /> : null}
            {ListFooterComponent}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surface },
  bg: { ...StyleSheet.absoluteFillObject },
  column: { gap: 16, marginBottom: 8 },
  footer: { paddingVertical: 16 },
  loader: { marginVertical: 12 },
});
