// Traffic Light Indicator Component
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { COLORS } from '@/lib/pdf/styles';

const styles = StyleSheet.create({
  symbol: {
    fontSize: 16,
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
  <Text style={[styles.symbol, { color: COLOR_MAP[color] }]}>◀</Text>
);

