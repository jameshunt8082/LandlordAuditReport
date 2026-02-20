// Risk Rating Definition Page Component
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { PageHeader } from '../shared/PageHeader';
import { PageFooter } from '../shared/PageFooter';
import { TrafficLight } from '../shared/TrafficLight';
import { styles as globalStyles, COLORS } from '@/lib/pdf/styles';

const styles = StyleSheet.create({
  page: {
    ...globalStyles.page,
  },
  tierBox: {
    marginBottom: 15,
    padding: 15,
    borderWidth: 2,
    borderRadius: 4,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tierNumber: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    marginRight: 12,
    minWidth: 70,
    lineHeight: 1,
  },
  tierTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    flex: 1,
    lineHeight: 1,
  },
  tierDescription: {
    fontSize: 10,
    lineHeight: 1.4,
    marginBottom: 8,
  },
  tierImplication: {
    fontSize: 9,
    fontFamily: 'Helvetica-Oblique',
    color: COLORS.mediumGray,
    marginTop: 5,
  },
  scoreScaleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  scoreRange: {
    width: 80,
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    lineHeight: 1,
  },
  scoreDescription: {
    flex: 1,
    fontSize: 10,
    marginLeft: 15,
    lineHeight: 1,
  },
});

export const RiskRatingPage = () => (
  <Page size="A4" style={styles.page}>
    <PageHeader title="Landlord Risk Audit Report" />
    
    <Text style={globalStyles.h1}>Understanding Your Risk Rating</Text>
    
    <View style={globalStyles.paragraph}>
      <Text>
        Your overall risk rating determines the level of legal exposure and potential financial liability 
        you face. This rating influences insurance premiums, lending decisions, and licensing authority assessments.
      </Text>
    </View>
    
    <Text style={globalStyles.h2}>Risk Tier Classifications</Text>
    
    {/* Tier 0 - Minimal Risk */}
    <View style={[styles.tierBox, { borderColor: COLORS.darkGreen }]} wrap={false}>
      <View style={styles.tierHeader}>
        <Text style={[styles.tierNumber, { color: COLORS.darkGreen }]}>Tier 0</Text>
        <Text style={[styles.tierTitle, { color: COLORS.darkGreen }]}>Minimal Risk</Text>
      </View>
      <Text style={styles.tierDescription}>
        Exemplary compliance. All legal requirements met with robust systems in place. 
        Minimal probability of enforcement action or tenant tribunal claims.
      </Text>
      <Text style={styles.tierImplication}>
        Insurance: Premium rates. Lending: Favorable terms. Licensing: Fast-track renewals.
      </Text>
    </View>
    
    {/* Tier 1 - Low Risk */}
    <View style={[styles.tierBox, { borderColor: COLORS.darkGreen }]} wrap={false}>
      <View style={styles.tierHeader}>
        <Text style={[styles.tierNumber, { color: COLORS.darkGreen }]}>Tier 1</Text>
        <Text style={[styles.tierTitle, { color: COLORS.darkGreen }]}>Low Risk</Text>
      </View>
      <Text style={styles.tierDescription}>
        Good compliance with minor improvements needed. Legal requirements met. 
        Low probability of legal issues if current practices maintained.
      </Text>
      <Text style={styles.tierImplication}>
        Insurance: Standard rates. Lending: Normal terms. Licensing: Routine renewals.
      </Text>
    </View>
    
    {/* Tier 2 - Moderate Risk */}
    <View style={[styles.tierBox, { borderColor: COLORS.orange }]} wrap={false}>
      <View style={styles.tierHeader}>
        <Text style={[styles.tierNumber, { color: COLORS.orange }]}>Tier 2</Text>
        <Text style={[styles.tierTitle, { color: COLORS.orange }]}>Moderate Risk</Text>
      </View>
      <Text style={styles.tierDescription}>
        Compliance gaps present. Some legal requirements not fully met. 
        Moderate probability of enforcement action if improvements not made within 90 days.
      </Text>
      <Text style={styles.tierImplication}>
        Insurance: Elevated premiums or coverage restrictions. Lending: Additional scrutiny. Licensing: May face renewal delays.
      </Text>
    </View>
    
    {/* Tier 3 - High Risk */}
    <View style={[styles.tierBox, { borderColor: COLORS.red }]} wrap={false}>
      <View style={styles.tierHeader}>
        <Text style={[styles.tierNumber, { color: COLORS.red }]}>Tier 3</Text>
        <Text style={[styles.tierTitle, { color: COLORS.red }]}>High Risk</Text>
      </View>
      <Text style={styles.tierDescription}>
        Significant compliance failures. Multiple legal violations. 
        High probability of enforcement action, tribunal claims, and financial penalties.
      </Text>
      <Text style={styles.tierImplication}>
        Insurance: May be refused or heavily loaded. Lending: Difficult to obtain. Licensing: Renewal likely refused.
      </Text>
    </View>
    
    {/* Tier 4 - Severe Risk */}
    <View style={[styles.tierBox, { borderColor: COLORS.red }]} wrap={false}>
      <View style={styles.tierHeader}>
        <Text style={[styles.tierNumber, { color: COLORS.red }]}>Tier 4</Text>
        <Text style={[styles.tierTitle, { color: COLORS.red }]}>Severe Risk</Text>
      </View>
      <Text style={styles.tierDescription}>
        Critical compliance failures. Immediate legal exposure to prosecution, prohibition orders, 
        and substantial financial penalties. Property may be unlettable until full remediation.
      </Text>
      <Text style={styles.tierImplication}>
        Insurance: Refused. Lending: Refused. Licensing: Will be refused. Property prohibition orders possible.
      </Text>
    </View>
    
    <Text style={[globalStyles.h2, { marginTop: 25 }]}>Score Interpretation</Text>
    
    <View style={{ marginTop: 10 }}>
      <View style={styles.scoreScaleRow}>
        <TrafficLight color="green" />
        <Text style={[styles.scoreRange, { color: COLORS.darkGreen }]}>7.0 - 10.0</Text>
        <Text style={styles.scoreDescription}>
          Compliant. Continue current practices with regular reviews.
        </Text>
      </View>
      
      <View style={styles.scoreScaleRow}>
        <TrafficLight color="orange" />
        <Text style={[styles.scoreRange, { color: COLORS.orange }]}>4.0 - 6.9</Text>
        <Text style={styles.scoreDescription}>
          Improvements needed. Address within 30-90 days to avoid legal risk.
        </Text>
      </View>
      
      <View style={styles.scoreScaleRow}>
        <TrafficLight color="red" />
        <Text style={[styles.scoreRange, { color: COLORS.red }]}>1.0 - 3.9</Text>
        <Text style={styles.scoreDescription}>
          Critical non-compliance. Immediate action required within 7 days.
        </Text>
      </View>
    </View>
    
    <PageFooter />
  </Page>
);

