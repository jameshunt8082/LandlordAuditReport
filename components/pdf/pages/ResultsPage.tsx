// Results Page Component
import { Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { PageHeader } from '../shared/PageHeader';
import { PageFooter } from '../shared/PageFooter';
import { TrafficLight } from '../shared/TrafficLight';
import { styles as globalStyles, COLORS } from '@/lib/pdf/styles';
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
  subcategoryChartUrl: string;
}

export const ResultsPage = ({ data, subcategoryChartUrl }: ResultsPageProps) => (
  <>
    <Page size="A4" style={styles.page}>
      <PageHeader title="Landlord Risk Audit Report" pageNumber={8} />
      
      <Text style={globalStyles.h1}>The Results</Text>
      
      <Text style={globalStyles.h2}>Overall Score</Text>
      
      <View style={styles.scoreRow}>
        <Text style={styles.scoreLabel}>Overall Compliance Score</Text>
        <Text style={[styles.scoreValue, { color: data.overallScore <= 3 ? COLORS.red : data.overallScore <= 6 ? COLORS.orange : COLORS.green }]}>
          {data.overallScore.toFixed(1)}
        </Text>
        <TrafficLight color={data.overallScore <= 3 ? 'red' : data.overallScore <= 6 ? 'orange' : 'green'} />
      </View>
      
      <Text style={globalStyles.h2}>Category Scores</Text>
      
      <View style={{ marginBottom: 20 }}>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>Documentation</Text>
          <Text style={[styles.scoreValue, { color: data.categoryScores.documentation.score <= 3 ? COLORS.red : data.categoryScores.documentation.score <= 6 ? COLORS.orange : COLORS.green }]}>
            {data.categoryScores.documentation.score.toFixed(1)}
          </Text>
          <TrafficLight color={data.categoryScores.documentation.score <= 3 ? 'red' : data.categoryScores.documentation.score <= 6 ? 'orange' : 'green'} />
        </View>
        
        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>Landlord-Tenant Communication</Text>
          <Text style={[styles.scoreValue, { color: data.categoryScores.communication.score <= 3 ? COLORS.red : data.categoryScores.communication.score <= 6 ? COLORS.orange : COLORS.green }]}>
            {data.categoryScores.communication.score.toFixed(1)}
          </Text>
          <TrafficLight color={data.categoryScores.communication.score <= 3 ? 'red' : data.categoryScores.communication.score <= 6 ? 'orange' : 'green'} />
        </View>
        
        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>Evidence Gathering Systems and Procedures</Text>
          <Text style={[styles.scoreValue, { color: data.categoryScores.evidenceGathering.score <= 3 ? COLORS.red : data.categoryScores.evidenceGathering.score <= 6 ? COLORS.orange : COLORS.green }]}>
            {data.categoryScores.evidenceGathering.score.toFixed(1)}
          </Text>
          <TrafficLight color={data.categoryScores.evidenceGathering.score <= 3 ? 'red' : data.categoryScores.evidenceGathering.score <= 6 ? 'orange' : 'green'} />
        </View>
      </View>
      
      <PageFooter />
    </Page>
    
    {/* Subcategory Scores Chart Page */}
    <Page size="A4" style={styles.page}>
      <PageHeader title="Landlord Risk Audit Report" pageNumber={9} />
      
      <Text style={globalStyles.h2}>Subcategory Scores</Text>
      
      <View style={globalStyles.paragraph}>
        <Text>
          The chart below shows detailed scores for each subcategory within the three main assessment areas. 
          Subcategories are color-coded by their score: red (critical), orange (needs improvement), and green (satisfactory).
        </Text>
      </View>
      
      <View style={styles.chartContainer}>
        <Image src={subcategoryChartUrl} style={styles.chart} />
      </View>
      
      <PageFooter />
    </Page>
  </>
);

