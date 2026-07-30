import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import type { NotificationEventType } from '@domain/notifications/notificationEventTypes';

interface NotificationToggleItemProps {
  type: NotificationEventType | string;
  label: string;
  description?: string;
  enabled: boolean;
  busy?: boolean;
  onChange: (enabled: boolean) => void;
}

export function NotificationToggleItem({
  label,
  description,
  enabled,
  busy,
  onChange,
}: NotificationToggleItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.9 }]}
      onPress={() => !busy && onChange(!enabled)}
      disabled={busy}
    >
      <View style={styles.textCol}>
        <Text style={styles.label}>{label}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      <Switch
        value={enabled}
        onValueChange={onChange}
        disabled={busy}
        trackColor={{ false: '#E0E0E0', true: '#FFB703' }}
        thumbColor="#FFFFFF"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEEEEE',
  },
  textCol: { flex: 1, gap: 2 },
  label: { fontSize: 15, fontWeight: '700', color: '#212121' },
  description: { fontSize: 12, color: '#757575', lineHeight: 16 },
});
