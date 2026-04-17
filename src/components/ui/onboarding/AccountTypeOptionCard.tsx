import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

export interface AccountTypeOption {
  id: string;
  label: string;
  gradientStart: string;
  gradientEnd: string;
  icon: keyof typeof Feather.glyphMap;
}

interface AccountTypeOptionCardProps {
  option: AccountTypeOption;
  selected?: boolean;
  onPress?: (id: string) => void;
}

export function AccountTypeOptionCard({
  option,
  selected,
  onPress,
}: AccountTypeOptionCardProps) {
  const handlePress = () => {
    onPress?.(option.id);
  };

  return (
    <Pressable onPress={handlePress} style={styles.root}>
      <View
        style={[
          styles.iconColumn,
          {
            backgroundColor: option.gradientStart,
          },
        ]}
      >
        <View style={styles.iconCircle}>
          <Feather name={option.icon} size={24} color="#FFFFFF" />
        </View>
      </View>
      <View style={[styles.contentColumn, selected && styles.contentSelected]}>
        <Text style={[styles.label, selected && styles.labelSelected]}>{option.label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  iconColumn: {
    width: 92,
    minHeight: 92,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(31, 34, 42, 0.12)',
  },
  contentColumn: {
    boxSizing: 'border-box' as const,
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 92,
    paddingVertical: 16,
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: '#E0E0E0',
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  contentSelected: {
    borderColor: 'rgba(255, 215, 0, 0.87)',
  },
  label: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: '#212121',
    flexShrink: 1,
  },
  labelSelected: {
    color: '#000000',
  },
});

