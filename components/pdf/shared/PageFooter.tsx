// Page Footer Component
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { COLORS, LAYOUT } from '@/lib/pdf/styles';

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 30,
    left: LAYOUT.margins.left,
    right: LAYOUT.margins.right,
    textAlign: 'center',
    fontSize: 9,
    color: COLORS.mediumGray,
  },
});

interface PageFooterProps {
  text?: string;
}

export const PageFooter = ({ text = '© Copyright Landlord Safeguarding. 2003 - 2025' }: PageFooterProps) => (
  <View style={styles.footer} fixed>
    <Text>{text}</Text>
  </View>
);

