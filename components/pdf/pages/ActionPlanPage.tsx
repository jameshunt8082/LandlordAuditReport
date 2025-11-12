// Action Plan Page Component
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { PageHeader } from '../shared/PageHeader';
import { PageFooter } from '../shared/PageFooter';
import { styles as globalStyles, COLORS } from '@/lib/pdf/styles';
import { ReportData } from '@/lib/pdf/formatters';

const styles = StyleSheet.create({
  page: {
    ...globalStyles.page,
  },
  timelineSection: {
    marginBottom: 25,
  },
  timelineHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.paleBlue,
    padding: 10,
    marginBottom: 10,
    borderTopWidth: 2,
    borderTopColor: COLORS.blue,
  },
  timelineHeaderText: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
  },
  actionItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  priorityBadge: {
    width: 70,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  actionText: {
    flex: 1,
    fontSize: 10,
    marginLeft: 10,
    lineHeight: 1.4,
  },
});

interface ActionPlanPageProps {
  data: ReportData;
}

export const ActionPlanPage = ({ data }: ActionPlanPageProps) => {
  // Categorize actions by priority/timeline
  const immediateActions: string[] = [];
  const shortTermActions: string[] = [];
  const mediumTermActions: string[] = [];
  
  // Critical findings (score 1-3) = Immediate (0-7 days)
  data.questionResponses.red.forEach(q => {
    immediateActions.push(`${q.subcategory}: ${q.questionText.substring(0, 100)}${q.questionText.length > 100 ? '...' : ''}`);
  });
  
  // Orange findings (score 4-6) = Short-term (30 days)
  data.questionResponses.orange.forEach(q => {
    shortTermActions.push(`${q.subcategory}: ${q.questionText.substring(0, 100)}${q.questionText.length > 100 ? '...' : ''}`);
  });
  
  // Recommendations = Medium-term (90 days)
  Object.values(data.recommendationsByCategory).flat().forEach(rec => {
    if (rec.score < 7) {
      const { formatScore } = require('@/lib/pdf/styles');
      mediumTermActions.push(`${rec.subcategory}: Implement recommended improvements (Score: ${formatScore(rec.score)})`);
    }
  });
  
  return (
    <Page size="A4" style={styles.page}>
      <PageHeader title="Landlord Risk Audit Report" />
      
      <Text style={globalStyles.h1}>Action Plan</Text>
      
      <View style={globalStyles.paragraph}>
        <Text>
          This action plan provides a prioritized timeline for addressing findings identified in this audit. 
          Actions are categorized by urgency and legal risk, with immediate actions requiring attention 
          within 7 days to avoid legal exposure.
        </Text>
      </View>
      
      {/* Immediate Actions (0-7 days) */}
      {immediateActions.length > 0 && (
        <View style={styles.timelineSection}>
          <View style={styles.timelineHeader}>
            <Text style={[styles.timelineHeaderText, { color: COLORS.red }]}>
              ⚠ IMMEDIATE ACTIONS (0-7 Days)
            </Text>
          </View>
          <View style={{ paddingLeft: 10, marginBottom: 10 }}>
            <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Oblique', color: COLORS.red }}>
              Critical compliance issues exposing you to immediate fines or prosecution.
            </Text>
          </View>
          {immediateActions.map((action, idx) => (
            <View key={idx} style={styles.actionItem} wrap={false}>
              <Text style={[styles.priorityBadge, { color: COLORS.red }]}>CRITICAL</Text>
              <Text style={styles.actionText}>{action}</Text>
            </View>
          ))}
        </View>
      )}
      
      {/* Short-term Actions (30 days) */}
      {shortTermActions.length > 0 && (
        <View style={styles.timelineSection}>
          <View style={styles.timelineHeader}>
            <Text style={[styles.timelineHeaderText, { color: COLORS.orange }]}>
              HIGH PRIORITY (30 Days)
            </Text>
          </View>
          <View style={{ paddingLeft: 10, marginBottom: 10 }}>
            <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Oblique', color: COLORS.orange }}>
              Significant gaps that increase tribunal vulnerability and legal risk.
            </Text>
          </View>
          {shortTermActions.map((action, idx) => (
            <View key={idx} style={styles.actionItem} wrap={false}>
              <Text style={[styles.priorityBadge, { color: COLORS.orange }]}>HIGH</Text>
              <Text style={styles.actionText}>{action}</Text>
            </View>
          ))}
        </View>
      )}
      
      {/* Medium-term Actions (90 days) */}
      {mediumTermActions.length > 0 && (
        <View style={styles.timelineSection}>
          <View style={styles.timelineHeader}>
            <Text style={[styles.timelineHeaderText, { color: COLORS.darkGreen }]}>
              MEDIUM PRIORITY (90 Days)
            </Text>
          </View>
          <View style={{ paddingLeft: 10, marginBottom: 10 }}>
            <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Oblique', color: COLORS.darkGreen }}>
              Best practice improvements to strengthen overall compliance position.
            </Text>
          </View>
          {mediumTermActions.map((action, idx) => (
            <View key={idx} style={styles.actionItem} wrap={false}>
              <Text style={[styles.priorityBadge, { color: COLORS.darkGreen }]}>MEDIUM</Text>
              <Text style={styles.actionText}>{action}</Text>
            </View>
          ))}
        </View>
      )}
      
      {/* No actions needed */}
      {immediateActions.length === 0 && shortTermActions.length === 0 && mediumTermActions.length === 0 && (
        <View style={{ marginTop: 30, padding: 20, backgroundColor: '#f0fdf4', borderWidth: 2, borderColor: COLORS.darkGreen }}>
          <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', color: COLORS.darkGreen }}>
            ✓ Excellent Compliance Status
          </Text>
          <Text style={{ fontSize: 11, marginTop: 8 }}>
            No immediate or short-term actions required. Continue maintaining current systems and 
            conduct regular reviews to ensure ongoing compliance.
          </Text>
        </View>
      )}
      
      <PageFooter />
    </Page>
  );
};

