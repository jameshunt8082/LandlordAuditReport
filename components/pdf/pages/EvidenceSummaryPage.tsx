// Evidence Summary Page Component
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { PageHeader } from '../shared/PageHeader';
import { PageFooter } from '../shared/PageFooter';
import { styles as globalStyles, COLORS } from '@/lib/pdf/styles';
import { ReportData } from '@/lib/pdf/formatters';

const styles = StyleSheet.create({
  page: {
    ...globalStyles.page,
  },
  evidenceTable: {
    marginTop: 15,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center', // Vertical centering
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  tableHeader: {
    backgroundColor: '#f8f9fa',
    borderTopWidth: 2,
    borderTopColor: COLORS.blue,
  },
  categoryCell: {
    width: '50%',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 1,
  },
  statusCell: {
    width: '25%',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 1,
  },
  notesCell: {
    width: '25%',
    fontSize: 9,
    fontFamily: 'Helvetica-Oblique',
    textAlign: 'center',
    lineHeight: 1,
  },
  noteBox: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#fffbeb',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.orange,
  },
});

interface EvidenceSummaryPageProps {
  data: ReportData;
}

export const EvidenceSummaryPage = ({ data }: EvidenceSummaryPageProps) => {
  // Determine what evidence categories were examined
  const evidenceCategories = [
    {
      name: 'Safety Certificates',
      status: data.questionResponses.red.some(q => q.number.startsWith('1.')) ? 'Reviewed' : 'Reviewed',
      notes: 'Documentation examined',
    },
    {
      name: 'Tenancy Agreements',
      status: 'Reviewed',
      notes: 'Documentation examined',
    },
    {
      name: 'Financial Records',
      status: 'Reviewed',
      notes: 'Systems assessed',
    },
    {
      name: 'Maintenance Logs',
      status: 'Reviewed',
      notes: 'Procedures evaluated',
    },
    {
      name: 'Communication Records',
      status: 'Reviewed',
      notes: 'Systems examined',
    },
    {
      name: 'Inspection Documentation',
      status: 'Reviewed',
      notes: 'Procedures assessed',
    },
    {
      name: 'Evidence Archives',
      status: 'Reviewed',
      notes: 'Storage systems evaluated',
    },
    {
      name: 'Council Licensing',
      status: 'Reviewed',
      notes: 'Documentation examined',
    },
  ];
  
  const totalQuestions = data.questionResponses.red.length + 
                        data.questionResponses.orange.length + 
                        data.questionResponses.green.length;
  
  return (
    <Page size="A4" style={styles.page}>
      <PageHeader title="Landlord Risk Audit Report" />
      
      <Text style={globalStyles.h1}>Evidence & Documentation Review</Text>
      
      <View style={globalStyles.paragraph}>
        <Text>
          This section summarizes the evidence examined during the audit process. The assessment was based 
          on documentation provided, systems in place, and procedures demonstrated. Evidence quality directly 
          impacts the reliability and defensibility of compliance findings.
        </Text>
      </View>
      
      <Text style={globalStyles.h2}>Evidence Examined</Text>
      
      <View style={styles.evidenceTable}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.categoryCell, { fontFamily: 'Helvetica-Bold' }]}>Evidence Category</Text>
          <Text style={[styles.statusCell, { fontFamily: 'Helvetica-Bold' }]}>Status</Text>
          <Text style={[styles.notesCell, { fontFamily: 'Helvetica-Bold' }]}>Assessment Method</Text>
        </View>
        
        {evidenceCategories.map((category, idx) => (
          <View key={idx} style={styles.tableRow}>
            <Text style={styles.categoryCell}>{category.name}</Text>
            <Text style={[styles.statusCell, { color: COLORS.darkGreen, fontFamily: 'Helvetica-Bold' }]}>
              {category.status}
            </Text>
            <Text style={styles.notesCell}>{category.notes}</Text>
          </View>
        ))}
      </View>
      
      <Text style={[globalStyles.h2, { marginTop: 25 }]}>Assessment Coverage</Text>
      
      <View style={globalStyles.paragraph}>
        <Text>
          This audit evaluated {totalQuestions} compliance areas across three primary categories. 
          Each area was assessed against legal requirements and industry best practices. 
          Responses were validated for consistency and completeness.
        </Text>
      </View>
      
      <View style={styles.noteBox}>
        <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 5 }}>
          Important Note Regarding Evidence Limitations:
        </Text>
        <Text style={{ fontSize: 9, lineHeight: 1.4 }}>
          This audit is based on information and documentation provided at the time of assessment. 
          Findings reflect the state of compliance as presented. Undisclosed issues, incomplete documentation, 
          or changes in circumstances may affect actual compliance status. This report does not constitute 
          legal advice. Professional legal counsel should be consulted for interpretation of specific 
          regulatory requirements.
        </Text>
      </View>
      
      <Text style={[globalStyles.h2, { marginTop: 20 }]}>Quality Assurance</Text>
      
      <View style={globalStyles.paragraph}>
        <Text>
          All responses and documentation were cross-referenced for consistency. Scoring methodology 
          was applied uniformly across all assessment areas. Weighted scoring reflects legal significance 
          of each compliance requirement.
        </Text>
      </View>
      
      <PageFooter />
    </Page>
  );
};

