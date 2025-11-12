// Executive Summary Page Component
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { PageHeader } from '../shared/PageHeader';
import { PageFooter } from '../shared/PageFooter';
import { TrafficLight } from '../shared/TrafficLight';
import { styles as globalStyles, COLORS } from '@/lib/pdf/styles';
import { ReportData } from '@/lib/pdf/formatters';

const styles = StyleSheet.create({
  page: {
    ...globalStyles.page,
  },
  metadataGrid: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primaryGreen,
  },
  metadataRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  metadataLabel: {
    width: '35%',
    fontSize: 10,
    color: COLORS.mediumGray,
  },
  metadataValue: {
    width: '65%',
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
  },
  overallRiskBox: {
    marginTop: 20,
    marginBottom: 25,
    padding: 20,
    backgroundColor: COLORS.paleBlue,
    borderWidth: 2,
    borderColor: COLORS.blue,
    borderRadius: 4,
  },
  riskRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  riskLabel: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
  },
  riskScore: {
    fontSize: 36,
    fontFamily: 'Helvetica-Bold',
  },
  riskStatus: {
    fontSize: 12,
    marginTop: 10,
    lineHeight: 1.4,
  },
  complianceGrid: {
    marginTop: 15,
    marginBottom: 20,
  },
  complianceRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  complianceCategory: {
    width: '60%',
    fontSize: 11,
  },
  complianceScore: {
    width: '20%',
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  complianceStatus: {
    width: '20%',
    textAlign: 'center',
  },
  criticalBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff5f5',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.red,
  },
  criticalTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.red,
    marginBottom: 8,
  },
  criticalItem: {
    fontSize: 10,
    marginBottom: 5,
    lineHeight: 1.4,
  },
});

interface ExecutiveSummaryProps {
  data: ReportData;
  reportId: string;
  criticalFindings: string[];
}

export const ExecutiveSummary = ({ data, reportId, criticalFindings }: ExecutiveSummaryProps) => {
  const overallColor = data.overallScore <= 3 ? 'red' : data.overallScore <= 6 ? 'orange' : 'green';
  const tierNumber = parseInt(data.riskTier.split('_')[1]);
  
  // Calculate compliance metrics
  const totalAreas = data.subcategoryScores.length;
  const compliantAreas = data.subcategoryScores.filter(s => s.score >= 7).length;
  const atRiskAreas = data.subcategoryScores.filter(s => s.score >= 4 && s.score < 7).length;
  const nonCompliantAreas = data.subcategoryScores.filter(s => s.score < 4).length;
  
  return (
    <Page size="A4" style={styles.page}>
      <PageHeader title="Landlord Risk Audit Report" pageNumber={2} />
      
      <Text style={globalStyles.h1}>Executive Summary</Text>
      
      {/* Report Metadata */}
      <View style={styles.metadataGrid}>
        <View style={styles.metadataRow}>
          <Text style={styles.metadataLabel}>Report ID:</Text>
          <Text style={styles.metadataValue}>{reportId}</Text>
        </View>
        <View style={styles.metadataRow}>
          <Text style={styles.metadataLabel}>Property:</Text>
          <Text style={styles.metadataValue}>{data.propertyAddress}</Text>
        </View>
        <View style={styles.metadataRow}>
          <Text style={styles.metadataLabel}>Landlord:</Text>
          <Text style={styles.metadataValue}>{data.landlordName}</Text>
        </View>
        <View style={styles.metadataRow}>
          <Text style={styles.metadataLabel}>Auditor:</Text>
          <Text style={styles.metadataValue}>{data.auditorName}</Text>
        </View>
        <View style={styles.metadataRow}>
          <Text style={styles.metadataLabel}>Audit Date:</Text>
          <Text style={styles.metadataValue}>
            {data.auditEndDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </Text>
        </View>
      </View>
      
      {/* Overall Risk Assessment */}
      <View style={styles.overallRiskBox}>
        <View style={styles.riskRatingRow}>
          <View>
            <Text style={styles.riskLabel}>Overall Compliance Score</Text>
            <Text style={[styles.riskScore, { color: COLORS[overallColor] }]}>
              {data.overallScore.toFixed(1)}
            </Text>
          </View>
          <TrafficLight color={overallColor} />
        </View>
        
        <Text style={styles.riskStatus}>
          <Text style={{ fontFamily: 'Helvetica-Bold' }}>Risk Classification: </Text>
          Tier {tierNumber} - {
            tierNumber === 0 ? 'Minimal Risk' :
            tierNumber === 1 ? 'Low Risk' :
            tierNumber === 2 ? 'Moderate Risk' :
            tierNumber === 3 ? 'High Risk' : 'Severe Risk'
          }
        </Text>
        
        <Text style={[styles.riskStatus, { marginTop: 5 }]}>
          <Text style={{ fontFamily: 'Helvetica-Bold' }}>Compliance Status: </Text>
          {compliantAreas} of {totalAreas} areas meet standards ({nonCompliantAreas} require immediate action)
        </Text>
      </View>
      
      {/* Compliance Breakdown */}
      <Text style={globalStyles.h2}>Compliance Overview</Text>
      
      <View style={styles.complianceGrid}>
        <View style={[styles.complianceRow, { backgroundColor: COLORS.paleBlue }]}>
          <Text style={[styles.complianceCategory, { fontFamily: 'Helvetica-Bold' }]}>Category</Text>
          <Text style={[styles.complianceScore, { fontFamily: 'Helvetica-Bold' }]}>Score</Text>
          <Text style={[styles.complianceStatus, { fontFamily: 'Helvetica-Bold' }]}>Status</Text>
        </View>
        
        <View style={styles.complianceRow}>
          <Text style={styles.complianceCategory}>Documentation</Text>
          <Text style={styles.complianceScore}>{data.categoryScores.documentation.score.toFixed(1)}</Text>
          <View style={styles.complianceStatus}>
            <TrafficLight color={data.categoryScores.documentation.score <= 3 ? 'red' : data.categoryScores.documentation.score <= 6 ? 'orange' : 'green'} />
          </View>
        </View>
        
        <View style={styles.complianceRow}>
          <Text style={styles.complianceCategory}>Landlord-Tenant Communication</Text>
          <Text style={styles.complianceScore}>{data.categoryScores.communication.score.toFixed(1)}</Text>
          <View style={styles.complianceStatus}>
            <TrafficLight color={data.categoryScores.communication.score <= 3 ? 'red' : data.categoryScores.communication.score <= 6 ? 'orange' : 'green'} />
          </View>
        </View>
        
        <View style={styles.complianceRow}>
          <Text style={styles.complianceCategory}>Evidence Gathering Systems</Text>
          <Text style={styles.complianceScore}>{data.categoryScores.evidenceGathering.score.toFixed(1)}</Text>
          <View style={styles.complianceStatus}>
            <TrafficLight color={data.categoryScores.evidenceGathering.score <= 3 ? 'red' : data.categoryScores.evidenceGathering.score <= 6 ? 'orange' : 'green'} />
          </View>
        </View>
      </View>
      
      {/* Critical Findings */}
      {criticalFindings.length > 0 && (
        <View style={styles.criticalBox}>
          <Text style={styles.criticalTitle}>⚠ CRITICAL FINDINGS REQUIRING IMMEDIATE ACTION</Text>
          {criticalFindings.slice(0, 5).map((finding, idx) => (
            <Text key={idx} style={styles.criticalItem}>• {finding}</Text>
          ))}
          {criticalFindings.length > 5 && (
            <Text style={[styles.criticalItem, { fontStyle: 'italic', marginTop: 5 }]}>
              ...and {criticalFindings.length - 5} additional critical item(s). See Detailed Results section.
            </Text>
          )}
        </View>
      )}
      
      {/* Auditor's Opinion */}
      <View style={{ marginTop: 20 }}>
        <Text style={globalStyles.h3}>Auditor's Professional Opinion</Text>
        <Text style={[globalStyles.paragraph, { marginTop: 10 }]}>
          {data.overallScore >= 7.5
            ? 'This property demonstrates strong compliance practices. Continue maintaining current systems with regular reviews to ensure ongoing compliance.'
            : data.overallScore >= 4.0
            ? 'This property shows moderate compliance with several areas requiring attention. Immediate action on critical items will significantly reduce legal exposure. Implementation of recommended improvements within 30-90 days is advised.'
            : 'This property presents significant compliance risks requiring urgent remediation. Multiple critical violations expose you to immediate legal action, fines, and potential loss of letting privileges. Immediate professional intervention is strongly recommended.'}
        </Text>
      </View>
      
      <PageFooter />
    </Page>
  );
};

