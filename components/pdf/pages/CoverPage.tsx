// Cover Page Component
import { Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { DecorativeLine } from '../shared/DecorativeLine';
import { PageFooter } from '../shared/PageFooter';
import { COLORS, FONTS, LAYOUT } from '@/lib/pdf/styles';
import { formatReportDate } from '@/lib/pdf/formatters';

const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.white,
  },
  decorativeTopBar: {
    width: '100%',
    height: LAYOUT.decorativeBars.greenBarHeight,
    backgroundColor: COLORS.primaryGreen,
  },
  titleSection: {
    marginTop: 100,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.black,
    marginBottom: 20,
  },
  gradientBar: {
    width: '80%',
    backgroundColor: COLORS.primaryGreen,
    padding: 15,
    marginVertical: 20,
    alignItems: 'center',
  },
  gradientBarText: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
  },
  propertyInfo: {
    marginTop: 20,
    alignItems: 'center',
  },
  propertyAddress: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 10,
  },
  dateRange: {
    fontSize: 12,
    marginTop: 30,
    color: COLORS.mediumGray,
  },
  confidentialLabel: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    marginTop: 20,
    color: COLORS.darkGray,
  },
  chartContainer: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chart: {
    width: 334,
    height: 419,
  },
});

interface CoverPageProps {
  propertyAddress: string;
  startDate: Date;
  endDate: Date;
  pillarsChartUrl: string;
}

export const CoverPage = ({ 
  propertyAddress, 
  startDate, 
  endDate, 
  pillarsChartUrl 
}: CoverPageProps) => (
  <Page size="A4" style={styles.page}>
    {/* Decorative top bar */}
    <View style={styles.decorativeTopBar} />
    
    {/* Title section */}
    <View style={styles.titleSection}>
      <Text style={styles.mainTitle}>Landlord Risk Audit Report</Text>
      
      <View style={{ width: '100%', height: 1, backgroundColor: COLORS.lightGray, marginBottom: 20 }} />
      
      <View style={styles.gradientBar}>
        <Text style={styles.gradientBarText}>LANDLORD RISK AUDIT</Text>
      </View>
      
      <View style={styles.propertyInfo}>
        <Text style={styles.propertyAddress}>Report for {propertyAddress}</Text>
      </View>
      
      <View style={{ width: '50%', height: 1, backgroundColor: COLORS.primaryGreen, marginVertical: 15 }} />
      
      <Text style={styles.dateRange}>
        Conducted {formatReportDate(startDate)} to {formatReportDate(endDate)}
      </Text>
      
      <Text style={styles.confidentialLabel}>Confidential Contents</Text>
    </View>
    
    {/* 5 Pillars Chart */}
    <View style={styles.chartContainer}>
      <Image src={pillarsChartUrl} style={styles.chart} />
    </View>
    
    {/* Footer */}
    <PageFooter />
  </Page>
);

