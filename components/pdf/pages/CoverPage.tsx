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
  reportId: string;
  landlordName: string;
  auditorName: string;
  overallScore: number;
  riskTier: string;
}

export const CoverPage = ({ 
  propertyAddress, 
  startDate, 
  endDate, 
  pillarsChartUrl,
  reportId,
  landlordName,
  auditorName,
  overallScore,
  riskTier
}: CoverPageProps) => {
  const tierNumber = parseInt(riskTier.split('_')[1]);
  const riskColor = overallScore <= 3 ? COLORS.red : overallScore <= 6 ? COLORS.orange : COLORS.green;
  
  return (
    <Page size="A4" style={styles.page}>
      {/* Decorative top bar */}
      <View style={styles.decorativeTopBar} />
      
      {/* Report Metadata - Top Right */}
      <View style={{ position: 'absolute', top: 20, right: 72, alignItems: 'flex-end' }}>
        <Text style={{ fontSize: 9, color: COLORS.mediumGray, marginBottom: 2 }}>Report ID: {reportId}</Text>
        <Text style={{ fontSize: 9, color: COLORS.mediumGray, marginBottom: 2 }}>
          Report Date: {formatReportDate(endDate)}
        </Text>
        <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: riskColor }}>
          Risk Tier {tierNumber}
        </Text>
      </View>
      
      {/* Title section */}
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>Landlord Risk Audit Report</Text>
        
        <View style={{ width: '100%', height: 1, backgroundColor: COLORS.lightGray, marginBottom: 20 }} />
        
        <View style={styles.gradientBar}>
          <Text style={styles.gradientBarText}>LANDLORD RISK AUDIT</Text>
        </View>
        
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyAddress}>Report for {propertyAddress}</Text>
          <Text style={{ fontSize: 12, marginTop: 5, color: COLORS.mediumGray }}>
            Client: {landlordName}
          </Text>
        </View>
        
        <View style={{ width: '50%', height: 1, backgroundColor: COLORS.primaryGreen, marginVertical: 15 }} />
        
        <Text style={styles.dateRange}>
          Conducted {formatReportDate(startDate)} to {formatReportDate(endDate)}
        </Text>
        
        <Text style={{ fontSize: 11, marginTop: 8, color: COLORS.mediumGray }}>
          Audited by: {auditorName}
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
};

