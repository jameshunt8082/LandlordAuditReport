// Decorative Line Component
import { View, StyleSheet } from '@react-pdf/renderer';
import { COLORS, LAYOUT } from '@/lib/pdf/styles';

const styles = StyleSheet.create({
  thinLine: {
    width: '100%',
    height: LAYOUT.decorativeBars.greenBarHeight,
    backgroundColor: COLORS.primaryGreen,
    marginVertical: 10,
  },
  gradientBar: {
    width: '100%',
    height: LAYOUT.decorativeBars.gradientBarHeight,
    backgroundColor: COLORS.primaryGreen,
    marginVertical: 5,
  },
  simpleLine: {
    width: '100%',
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: 8,
  },
});

interface DecorativeLineProps {
  type?: 'thin' | 'gradient' | 'simple';
}

export const DecorativeLine = ({ type = 'thin' }: DecorativeLineProps) => {
  const styleMap = {
    thin: styles.thinLine,
    gradient: styles.gradientBar,
    simple: styles.simpleLine,
  };
  
  return <View style={styleMap[type]} />;
};

