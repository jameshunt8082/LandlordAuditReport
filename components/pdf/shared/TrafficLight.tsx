// Traffic Light Indicator Component
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { COLORS } from '@/lib/pdf/styles';

const styles = StyleSheet.create({
  symbol: {
    // fontSize will come from parent style
  },
});

const COLOR_MAP = {
  red: COLORS.red,
  orange: COLORS.orange,
  green: COLORS.green,
};

interface TrafficLightProps {
  color: 'red' | 'orange' | 'green';
  style?: any; // Accept external styles
}

export const TrafficLight = ({ color, style }: TrafficLightProps) => (
  <Text style={[style, styles.symbol, { color: COLOR_MAP[color] }]}>•</Text>
);

