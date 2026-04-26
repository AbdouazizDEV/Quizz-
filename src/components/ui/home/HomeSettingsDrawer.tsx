import { useEffect, useMemo, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SettingsPanelContent } from '@components/ui/settings/SettingsPanelContent';

interface HomeSettingsDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export function HomeSettingsDrawer({ visible, onClose }: HomeSettingsDrawerProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const drawerWidth = useMemo(() => Math.min(width * 0.92, 420), [width]);
  const tx = useRef(new Animated.Value(-drawerWidth)).current;
  const backdrop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      tx.setValue(-drawerWidth);
      backdrop.setValue(0);
      Animated.parallel([
        Animated.timing(tx, { toValue: 0, duration: 230, useNativeDriver: true }),
        Animated.timing(backdrop, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
      return;
    }
    Animated.parallel([
      Animated.timing(tx, { toValue: -drawerWidth, duration: 180, useNativeDriver: true }),
      Animated.timing(backdrop, { toValue: 0, duration: 170, useNativeDriver: true }),
    ]).start();
  }, [backdrop, drawerWidth, tx, visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: backdrop }]}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.drawer,
            {
              width: drawerWidth,
              paddingTop: insets.top,
              transform: [{ translateX: tx }],
            },
          ]}
        >
          <SettingsPanelContent title="Settings" onBack={onClose} fullWidth topPaddingOverride={16} />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.32)',
  },
  drawer: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 4, height: 0 },
    elevation: 12,
  },
});

