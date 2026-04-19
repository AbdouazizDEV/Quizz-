import { Pressable, StyleSheet, Text, View } from 'react-native';

interface HomeSectionTitleProps {
  title: string;
  action?: string;
  onActionPress?: () => void;
}

export function HomeSectionTitle({ title, action, onActionPress }: HomeSectionTitleProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        onActionPress ? (
          <Pressable onPress={onActionPress} hitSlop={8} accessibilityRole="button">
            <Text style={styles.sectionAction}>{action}</Text>
          </Pressable>
        ) : (
          <Text style={styles.sectionAction}>{action}</Text>
        )
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#212121',
    fontSize: 20,
    fontWeight: '800',
  },
  sectionAction: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
});
