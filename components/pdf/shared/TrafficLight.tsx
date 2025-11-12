// Traffic Light Indicator Component
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { COLORS } from '@/lib/pdf/styles';

const styles = StyleSheet.create({
  container: {
    width: 35,
    height: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: {
    fontSize: 24,
  },
});

const COLOR_MAP = {
  red: COLORS.red,
  orange: COLORS.orange,
  green: COLORS.green,
};

interface TrafficLightProps {
  color: 'red' | 'orange' | 'green';
}

export const TrafficLight = ({ color }: TrafficLightProps) => (
  <View style={styles.container}>
    <Text style={[styles.symbol, { color: COLOR_MAP[color] }]}>
      ◀
    </Text>
  </View>
);

