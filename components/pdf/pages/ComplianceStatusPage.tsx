// Legal Compliance Status Page Component
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { PageHeader } from '../shared/PageHeader';
import { PageFooter } from '../shared/PageFooter';
import { styles as globalStyles, COLORS } from '@/lib/pdf/styles';
import { ReportData } from '@/lib/pdf/formatters';

const styles = StyleSheet.create({
  page: {
    ...globalStyles.page,
  },
  statusTable: {
    marginTop: 15,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.paleBlue,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderTopWidth: 2,
    borderTopColor: COLORS.blue,
  },
  tableHeaderText: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center', // Vertical centering
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  requirementCell: {
    width: '45%',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 1,
  },
  statusCell: {
    width: '15%',
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    lineHeight: 1,
  },
  actionCell: {
    width: '40%',
    fontSize: 9,
    lineHeight: 1.3,
    textAlign: 'center',
  },
  riskBox: {
    marginTop: 20,
    padding: 15,
    borderLeftWidth: 4,
  },
  riskTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
  },
  riskText: {
    fontSize: 10,
    lineHeight: 1.4,
  },
});

interface ComplianceItem {
  requirement: string;
  status: 'PASS' | 'FAIL' | 'PARTIAL';
  action: string;
  penalty?: string;
}

interface ComplianceStatusPageProps {
  data: ReportData;
}

export const ComplianceStatusPage = ({ data }: ComplianceStatusPageProps) => {
  // Determine compliance items based on actual data
  const getComplianceStatus = (questionNumber: string): 'PASS' | 'FAIL' | 'PARTIAL' => {
    const allQuestions = [
      ...data.questionResponses.red,
      ...data.questionResponses.orange,
      ...data.questionResponses.green,
    ];
    const question = allQuestions.find(q => q.number === questionNumber);
    if (!question) return 'PARTIAL';
    
    if (question.score >= 7) return 'PASS';
    if (question.score <= 3) return 'FAIL';
    return 'PARTIAL';
  };
  
  const complianceItems: ComplianceItem[] = [
    {
      requirement: 'Current Gas Safety Certificate',
      status: getComplianceStatus('1.1'),
      action: getComplianceStatus('1.1') === 'PASS' 
        ? 'Maintain annual renewals' 
        : 'Obtain valid certificate within 7 days. Letting property without valid gas certificate is criminal offense.',
      penalty: '£5,000+ fine per violation',
    },
    {
      requirement: 'Current Electrical Installation Condition Report (EICR)',
      status: getComplianceStatus('1.1'),
      action: getComplianceStatus('1.1') === 'PASS'
        ? 'Renew every 5 years (HMO) or 10 years (standard)'
        : 'Obtain valid EICR immediately. Required for all tenancies.',
      penalty: '£5,000+ fine, insurance void',
    },
    {
      requirement: 'Current Energy Performance Certificate (EPC)',
      status: getComplianceStatus('1.1'),
      action: getComplianceStatus('1.1') === 'PASS'
        ? 'Valid for 10 years from issue date'
        : 'Obtain EPC rated E or above. Cannot legally let property without valid EPC.',
      penalty: '£5,000 fine, cannot let property',
    },
    {
      requirement: 'Certificate Provision to Tenants',
      status: getComplianceStatus('1.2'),
      action: getComplianceStatus('1.2') === 'PASS'
        ? 'Maintain proof of delivery records'
        : 'Provide copies to tenants within 28 days and retain proof of delivery.',
      penalty: 'Rent repayment claims possible',
    },
    {
      requirement: 'HMO Licensing (if applicable)',
      status: getComplianceStatus('3.1'),
      action: getComplianceStatus('3.1') === 'PASS'
        ? 'Review renewal dates'
        : 'Apply for mandatory HMO license immediately if required.',
      penalty: '£30,000 fine + 12 months rent repayment',
    },
    {
      requirement: 'Fire Risk Assessment (HMO)',
      status: getComplianceStatus('1.5'),
      action: getComplianceStatus('1.5') === 'PASS'
        ? 'Review annually or after significant changes'
        : 'Commission professional fire risk assessment for HMO properties.',
      penalty: 'Unlimited fines, property prohibition',
    },
    {
      requirement: 'Deposit Protection',
      status: getComplianceStatus('19.1'),
      action: getComplianceStatus('19.1') === 'PASS'
        ? 'Ensure prescribed information provided'
        : 'Protect deposits within 30 days and provide prescribed information.',
      penalty: '1-3x deposit amount compensation',
    },
    {
      requirement: 'Written Tenancy Agreement',
      status: getComplianceStatus('4.1'),
      action: getComplianceStatus('4.1') === 'PASS'
        ? 'Keep signed copies secure'
        : 'Implement written agreements with clear tenant responsibilities.',
      penalty: 'Cannot enforce any tenancy terms',
    },
  ];
  
  const failCount = complianceItems.filter(i => i.status === 'FAIL').length;
  const partialCount = complianceItems.filter(i => i.status === 'PARTIAL').length;
  const passCount = complianceItems.filter(i => i.status === 'PASS').length;
  
  return (
    <Page size="A4" style={styles.page}>
      <PageHeader title="Landlord Risk Audit Report" />
      
      <Text style={globalStyles.h1}>Legal Compliance Status</Text>
      
      <View style={globalStyles.paragraph}>
        <Text>
          This section assesses compliance with legal requirements. These are not recommendations 
          but legal obligations. Non-compliance exposes you to prosecution, fines, and property prohibition orders.
        </Text>
      </View>
      
      {/* Compliance Summary */}
      <View style={{ 
        marginVertical: 15, 
        padding: 12, 
        backgroundColor: failCount > 0 ? '#fff5f5' : passCount === complianceItems.length ? '#f0fdf4' : '#fffbeb',
        borderWidth: 2,
        borderColor: failCount > 0 ? COLORS.red : passCount === complianceItems.length ? COLORS.darkGreen : COLORS.orange,
      }}>
        <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', marginBottom: 5 }}>
          Compliance Summary: {passCount} of {complianceItems.length} Requirements Met
        </Text>
        <Text style={{ fontSize: 10 }}>
          Pass: {passCount} | Partial: {partialCount} | Fail: {failCount}
        </Text>
      </View>
      
      {/* Legal Requirements Table */}
      <View style={styles.statusTable}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { width: '45%' }]}>Legal Requirement</Text>
          <Text style={[styles.tableHeaderText, { width: '15%', textAlign: 'center' }]}>Status</Text>
          <Text style={[styles.tableHeaderText, { width: '40%' }]}>Action Required</Text>
        </View>
        
        {complianceItems.map((item, idx) => {
          const statusColor = item.status === 'PASS' ? COLORS.darkGreen : item.status === 'FAIL' ? COLORS.red : COLORS.orange;
          
          return (
            <View key={idx} style={styles.tableRow} wrap={false}>
              <View style={styles.requirementCell}>
                <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 3 }}>{item.requirement}</Text>
                {item.penalty ? (
                  <Text style={{ fontSize: 8, color: COLORS.red, marginTop: 2 }}>
                    Penalty: {item.penalty}
                  </Text>
                ) : null}
              </View>
              <Text style={[styles.statusCell, { color: statusColor }]}>
                {item.status}
              </Text>
              <Text style={styles.actionCell}>{item.action}</Text>
            </View>
          );
        })}
      </View>
      
      {/* Risk Warning if critical non-compliance */}
      {failCount > 0 ? (
        <View style={[styles.riskBox, { borderLeftColor: COLORS.red }]} wrap={false}>
          <Text style={[styles.riskTitle, { color: COLORS.red }]}>
            ⚠ CRITICAL: {failCount} Legal Violation{failCount > 1 ? 's' : ''}
          </Text>
          <Text style={styles.riskText}>
            You are currently in violation of {failCount} legal requirement{failCount > 1 ? 's' : ''}. 
            This exposes you to immediate prosecution, substantial fines, and potential prohibition from letting. 
            Urgent remediation within 7 days is required. Professional legal advice is strongly recommended.
          </Text>
        </View>
      ) : null}
      
      <PageFooter />
    </Page>
  );
};

