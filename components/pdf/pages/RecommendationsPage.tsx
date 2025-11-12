// Recommendations Page Component
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { PageHeader } from '../shared/PageHeader';
import { PageFooter } from '../shared/PageFooter';
import { styles as globalStyles, COLORS } from '@/lib/pdf/styles';
import { ReportData, Recommendation, ServiceRecommendation } from '@/lib/pdf/formatters';

const styles = StyleSheet.create({
  page: {
    ...globalStyles.page,
  },
  table: {
    marginTop: 15,
    marginBottom: 25,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    minHeight: 30,
  },
  tableHeaderRow: {
    backgroundColor: COLORS.paleBlue,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  tableCell: {
    padding: 8,
    fontSize: 10,
  },
  tableCellLeft: {
    width: '35%',
    borderRightWidth: 1,
    borderRightColor: COLORS.lightGray,
  },
  tableCellRight: {
    width: '65%',
  },
  subcategoryName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    marginBottom: 3,
  },
  score: {
    fontSize: 10,
    color: COLORS.mediumGray,
  },
  suggestion: {
    marginBottom: 4,
    fontSize: 10,
    lineHeight: 1.3,
  },
});

interface RecommendationsPageProps {
  data: ReportData;
}

const RecommendationTable = ({ 
  title, 
  recommendations 
}: { 
  title: string; 
  recommendations: Recommendation[];
}) => {
  if (recommendations.length === 0) {
    return (
      <View style={styles.table}>
        <Text style={globalStyles.h3}>{title}</Text>
        <Text style={{ fontSize: 11, marginTop: 10, color: COLORS.darkGreen }}>
          ✓ All areas in this category are performing well. Continue maintaining current practices.
        </Text>
      </View>
    );
  }
  
  return (
    <View style={styles.table}>
      <Text style={globalStyles.h3}>{title}</Text>
      
      {/* Table Header */}
      <View style={[styles.tableRow, styles.tableHeaderRow]}>
        <View style={[styles.tableCell, styles.tableCellLeft]}>
          <Text style={{ fontFamily: 'Helvetica-Bold' }}>Subcategory</Text>
        </View>
        <View style={[styles.tableCell, styles.tableCellRight]}>
          <Text style={{ fontFamily: 'Helvetica-Bold' }}>Suggestions for Improvement</Text>
        </View>
      </View>
      
      {/* Table Rows */}
      {recommendations.map((rec, index) => (
        <View key={index} style={styles.tableRow} wrap={false}>
          <View style={[styles.tableCell, styles.tableCellLeft]}>
            <Text style={styles.subcategoryName}>{rec.subcategory}</Text>
            <Text style={styles.score}>Score: {rec.score.toFixed(1)}</Text>
          </View>
          <View style={[styles.tableCell, styles.tableCellRight]}>
            {rec.suggestions.map((suggestion, idx) => (
              <Text key={idx} style={styles.suggestion}>
                • {suggestion}
              </Text>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
};

const ServicesTable = ({ services }: { services: ServiceRecommendation[] }) => {
  if (services.length === 0) {
    return (
      <View style={{ marginTop: 15 }}>
        <Text style={{ fontSize: 11, color: COLORS.darkGreen }}>
          ✓ No specific follow-on services recommended. Your overall compliance level is satisfactory.
        </Text>
      </View>
    );
  }
  
  return (
    <View style={styles.table}>
      {/* Table Header */}
      <View style={[styles.tableRow, styles.tableHeaderRow]}>
        <View style={[styles.tableCell, styles.tableCellLeft]}>
          <Text style={{ fontFamily: 'Helvetica-Bold' }}>Low-scoring Subcategory</Text>
        </View>
        <View style={[styles.tableCell, styles.tableCellRight]}>
          <Text style={{ fontFamily: 'Helvetica-Bold' }}>Suggested Follow-on Product/Service</Text>
        </View>
      </View>
      
      {/* Table Rows */}
      {services.map((service, index) => (
        <View key={index} style={styles.tableRow} wrap={false}>
          <View style={[styles.tableCell, styles.tableCellLeft]}>
            <Text style={{ fontSize: 10 }}>{service.lowScoringArea}</Text>
          </View>
          <View style={[styles.tableCell, styles.tableCellRight]}>
            <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold' }}>
              {service.suggestedService}
            </Text>
            {service.tier && (
              <Text style={{ fontSize: 9, color: COLORS.mediumGray, marginTop: 2 }}>
                ({service.tier})
              </Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
};

export const RecommendationsPage = ({ data }: RecommendationsPageProps) => (
  <>
    <Page size="A4" style={styles.page}>
      <PageHeader title="Landlord Risk Audit Report" pageNumber={10} />
      
      <Text style={globalStyles.h1}>Recommended Actions</Text>
      
      <View style={globalStyles.paragraph}>
        <Text>
          Based on your audit results, the following actions are recommended to improve compliance 
          and reduce risk. Priority should be given to areas with lower scores (red and orange).
        </Text>
      </View>
      
      <Text style={globalStyles.h2}>Suggestions for Improvement</Text>
      
      <RecommendationTable 
        title="Documentation" 
        recommendations={data.recommendationsByCategory.documentation}
      />
      
      <PageFooter />
    </Page>
    
    <Page size="A4" style={styles.page}>
      <PageHeader title="Landlord Risk Audit Report" pageNumber={11} />
      
      <RecommendationTable 
        title="Landlord-Tenant Communication" 
        recommendations={data.recommendationsByCategory.communication}
      />
      
      <RecommendationTable 
        title="Evidence Gathering Systems and Procedures" 
        recommendations={data.recommendationsByCategory.evidenceGathering}
      />
      
      <PageFooter />
    </Page>
    
    <Page size="A4" style={styles.page}>
      <PageHeader title="Landlord Risk Audit Report" pageNumber={12} />
      
      <Text style={globalStyles.h2}>Follow-on Products and Services</Text>
      
      <View style={globalStyles.paragraph}>
        <Text>
          The following professional services and products are recommended to address specific 
          low-scoring areas identified in your audit:
        </Text>
      </View>
      
      <ServicesTable services={data.suggestedServices} />
      
      <PageFooter />
    </Page>
  </>
);

