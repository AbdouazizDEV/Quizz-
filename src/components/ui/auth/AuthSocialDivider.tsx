import { StyleSheet, Text, View } from 'react-native';

type Props = {
  fontFamily?: string;
};

export function AuthSocialDivider({ fontFamily }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <Text style={[styles.label, fontFamily ? { fontFamily } : undefined]}>ou</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#EEEEEE',
  },
  label: {
    fontSize: 14,
    color: '#9E9E9E',
    textTransform: 'lowercase',
  },
});
