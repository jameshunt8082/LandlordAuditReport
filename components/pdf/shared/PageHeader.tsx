// Page Header Component
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { COLORS, LAYOUT } from '@/lib/pdf/styles';

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 30,
    left: LAYOUT.margins.left,
    right: LAYOUT.margins.right,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 9,
    color: COLORS.mediumGray,
  },
});

interface PageHeaderProps {
  title: string;
}

export const PageHeader = ({ title }: PageHeaderProps) => (
  <View style={styles.header} fixed>
    <Text>{title}</Text>
    <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
  </View>
);

