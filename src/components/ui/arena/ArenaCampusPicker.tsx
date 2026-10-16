import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import type { ArenaCampus } from '@app-types/arena.types';
import { Colors } from '@constants/Colors';
import { arenaCampusDisplayName } from '@utils/arenaDisplay';

interface ArenaCampusPickerProps {
  campuses: ArenaCampus[];
  selectedId: string | null;
  onSelect: (campusId: string) => void;
  disabled?: boolean;
}

export function ArenaCampusPicker({
  campuses,
  selectedId,
  onSelect,
  disabled = false,
}: ArenaCampusPickerProps) {
  return (
    <View style={styles.list}>
      {campuses.map((campus) => {
        const selected = campus.id === selectedId;
        return (
          <Pressable
            key={campus.id}
            accessibilityRole="radio"
            accessibilityState={{ selected, disabled }}
            disabled={disabled}
            onPress={() => onSelect(campus.id)}
            style={({ pressed }) => [
              styles.row,
              selected && styles.rowSelected,
              pressed && !disabled && { opacity: 0.92 },
              disabled && styles.rowDisabled,
            ]}
          >
            <View style={[styles.radio, selected && styles.radioSelected]}>
              {selected ? <Feather name="check" size={14} color="#FFFFFF" /> : null}
            </View>
            <View style={styles.labelCol}>
              <Text style={[styles.name, selected && styles.nameSelected]}>
                {arenaCampusDisplayName(campus)}
              </Text>
              {campus.role === 'backup' ? (
                <Text style={styles.hint}>Campus secours</Text>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    minHeight: 56,
  },
  rowSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.premiumSurface,
  },
  rowDisabled: { opacity: 0.6 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  labelCol: { flex: 1, gap: 2 },
  name: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  nameSelected: { color: Colors.textPrimary },
  hint: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
});
