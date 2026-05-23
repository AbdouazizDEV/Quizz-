import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

interface DefisSurfaceCardProps extends ViewProps {
  children: ReactNode;
}

export function DefisSurfaceCard({ children, style, ...rest }: DefisSurfaceCardProps) {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#10173B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 3,
  },
});
