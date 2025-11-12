// Results Page Component
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { PageHeader } from '../shared/PageHeader';
import { PageFooter } from '../shared/PageFooter';
import { TrafficLight } from '../shared/TrafficLight';
import { styles as globalStyles, COLORS, getTrafficLightColor, getColorForTrafficLight, formatScore } from '@/lib/pdf/styles';
import { ReportData } from '@/lib/pdf/formatters';

const styles = StyleSheet.create({
  page: {
    ...globalStyles.page,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  scoreLabel: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
  },
  scoreValue: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    marginRight: 15,
    width: 50,
    textAlign: 'right',
  },
  chartContainer: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  chart: {
    width: 500,
    maxHeight: 600,
  },
});

interface ResultsPageProps {
  data: ReportData;
}

export const ResultsPage = ({ data }: ResultsPageProps) => (
  <>
    <Page size="A4" style={styles.page}>
      <PageHeader title="Landlord Risk Audit Report" />
      
      <Text style={globalStyles.h1}>The Results</Text>
      
      <Text style={globalStyles.h2}>Overall Score</Text>
      
      <View style={styles.scoreRow}>
        <Text style={styles.scoreLabel}>Overall Compliance Score</Text>
        <Text style={[styles.scoreValue, { color: getColorForTrafficLight(getTrafficLightColor(data.overallScore)) }]}>
          {formatScore(data.overallScore)}
        </Text>
        <TrafficLight color={getTrafficLightColor(data.overallScore)} />
      </View>
      
      <Text style={globalStyles.h2}>Category Scores</Text>
      
      <View style={{ marginBottom: 20 }}>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>Documentation</Text>
          <Text style={[styles.scoreValue, { color: getColorForTrafficLight(getTrafficLightColor(data.categoryScores.documentation.score)) }]}>
            {formatScore(data.categoryScores.documentation.score)}
          </Text>
          <TrafficLight color={getTrafficLightColor(data.categoryScores.documentation.score)} />
        </View>
        
        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>Landlord-Tenant Communication</Text>
          <Text style={[styles.scoreValue, { color: getColorForTrafficLight(getTrafficLightColor(data.categoryScores.communication.score)) }]}>
            {formatScore(data.categoryScores.communication.score)}
          </Text>
          <TrafficLight color={getTrafficLightColor(data.categoryScores.communication.score)} />
        </View>
        
        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>Evidence Gathering Systems and Procedures</Text>
          <Text style={[styles.scoreValue, { color: getColorForTrafficLight(getTrafficLightColor(data.categoryScores.evidenceGathering.score)) }]}>
            {formatScore(data.categoryScores.evidenceGathering.score)}
          </Text>
          <TrafficLight color={getTrafficLightColor(data.categoryScores.evidenceGathering.score)} />
        </View>
      </View>
      
      <PageFooter />
    </Page>
    
    {/* Subcategory Scores Chart Page */}
    <Page size="A4" style={styles.page}>
      <PageHeader title="Landlord Risk Audit Report" />
      
      <Text style={globalStyles.h2}>Subcategory Scores</Text>
      
      <View style={globalStyles.paragraph}>
        <Text>
          The chart below shows detailed scores for each subcategory within the three main assessment areas. 
          Subcategories are color-coded by their score: red (critical), orange (needs improvement), and green (satisfactory).
        </Text>
      </View>
      
      <View style={{ marginVertical: 10, padding: 10, backgroundColor: '#f8f9fa' }}>
        <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>Benchmarking Reference:</Text>
        <Text style={{ fontSize: 9, lineHeight: 1.3 }}>
          Industry Standard: 7.0+ (acceptable for insurance and licensing). Professional Target: 8.5+ (demonstrates 
          robust compliance systems). Scores below 7.0 indicate areas requiring improvement to meet standard expectations.
        </Text>
      </View>
      
      <PageFooter />
    </Page>
  </>
);

