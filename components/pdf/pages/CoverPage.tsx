// Cover Page Component
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { DecorativeLine } from '../shared/DecorativeLine';
import { PageFooter } from '../shared/PageFooter';
import { COLORS, FONTS, LAYOUT, getTrafficLightColor, getColorForTrafficLight } from '@/lib/pdf/styles';
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
  metadataContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    marginBottom: -70,
    paddingRight: 0, // Respects page margins from parent
  },
  metadataBox: {
    alignItems: 'flex-end',
    paddingRight: 8, // Extra breathing room from edge
  },
  metadataText: {
    fontSize: 9,
    color: COLORS.mediumGray,
    marginBottom: 2,
  },
  tierText: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
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
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: COLORS.lightGray,
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
  clientText: {
    fontSize: 12,
    marginTop: 5,
    color: COLORS.mediumGray,
  },
  greenLine: {
    width: '50%',
    height: 1,
    backgroundColor: COLORS.primaryGreen,
    marginVertical: 15,
  },
  dateRange: {
    fontSize: 12,
    marginTop: 30,
    color: COLORS.mediumGray,
  },
  auditorText: {
    fontSize: 11,
    marginTop: 8,
    color: COLORS.mediumGray,
  },
  confidentialLabel: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    marginTop: 20,
    color: COLORS.darkGray,
  },
});

interface CoverPageProps {
  propertyAddress: string;
  startDate: Date;
  endDate: Date;
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
  reportId,
  landlordName,
  auditorName,
  overallScore,
  riskTier
}: CoverPageProps) => {
  const tierNumber = parseInt(riskTier.split('_')[1]);
  const trafficLightColor = getTrafficLightColor(overallScore);
  const riskColor = getColorForTrafficLight(trafficLightColor);
  
  return (
    <Page size="A4" style={styles.page}>
      {/* Decorative top bar */}
      <View style={styles.decorativeTopBar} />
      
      {/* Report Metadata - Top Right (using flex, not absolute) */}
      <View style={styles.metadataContainer}>
        <View style={styles.metadataBox}>
          <Text style={styles.metadataText}>Report ID: {reportId}</Text>
          <Text style={styles.metadataText}>
            Report Date: {formatReportDate(endDate)}
          </Text>
          <Text style={[styles.tierText, { color: riskColor }]}>
            Risk Tier {tierNumber}
          </Text>
        </View>
      </View>
      
      {/* Title section */}
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>Landlord Risk Audit Report</Text>
        
        <View style={styles.separator} />
        
        <View style={styles.gradientBar}>
          <Text style={styles.gradientBarText}>COMPLIANCE ASSESSMENT</Text>
        </View>
        
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyAddress}>Report for {propertyAddress}</Text>
          <Text style={styles.clientText}>
            Client: {landlordName}
          </Text>
        </View>
        
        <View style={styles.greenLine} />
        
        <Text style={styles.dateRange}>
          Conducted {formatReportDate(startDate)} to {formatReportDate(endDate)}
        </Text>
        
        <Text style={styles.auditorText}>
          Audited by: {auditorName}
        </Text>
        
        <Text style={styles.confidentialLabel}>Confidential Contents</Text>
      </View>
      
      {/* Footer */}
      <PageFooter />
    </Page>
  );
};

