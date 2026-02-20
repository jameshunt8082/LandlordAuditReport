// Methodology & Scope Page Component
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { PageHeader } from '../shared/PageHeader';
import { PageFooter } from '../shared/PageFooter';
import { styles as globalStyles, COLORS } from '@/lib/pdf/styles';
import { ReportData } from '@/lib/pdf/formatters';

const styles = StyleSheet.create({
  page: {
    ...globalStyles.page,
  },
  section: {
    marginBottom: 20,
  },
  bulletList: {
    marginLeft: 15,
    marginTop: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  bullet: {
    width: 15,
    fontSize: 11,
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.4,
  },
  infoBox: {
    marginVertical: 15,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.blue,
  },
  infoText: {
    fontSize: 10,
    lineHeight: 1.4,
  },
});

interface MethodologyPageProps {
  data: ReportData;
  auditScope: {
    documentationReviewed: boolean;
    siteInspection: boolean;
    tenantInterviews: boolean;
    recordsExamined: boolean;
  };
}

export const MethodologyPage = ({ data, auditScope }: MethodologyPageProps) => {
  const totalQuestions = data.questionResponses.red.length + 
                        data.questionResponses.orange.length + 
                        data.questionResponses.green.length;
  
  return (
    <Page size="A4" style={styles.page}>
      <PageHeader title="Landlord Risk Audit Report" />
      
      <Text style={globalStyles.h1}>Audit Methodology</Text>
      
      <View style={styles.section}>
        <Text style={globalStyles.paragraph}>
          This compliance audit was conducted using a structured assessment framework designed to evaluate 
                    landlord practices against legal requirements and industry best practices. The methodology 
                    ensures comprehensive coverage of critical compliance areas while maintaining objectivity 
                    and consistency.
        </Text>
      </View>
      
      <Text style={globalStyles.h2}>Audit Scope</Text>
      
      <View style={styles.section}>
        <Text style={globalStyles.paragraph}>
          This audit examined the following areas:
        </Text>
        
        <View style={styles.bulletList}>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>Documentation Systems: </Text>
              Safety certificates, tenancy agreements, council licensing, financial records, 
              maintenance logs, and tenant communications.
            </Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>Communication Protocols: </Text>
              Written record systems, complaint handling procedures, notice protocols, 
              response time tracking, and tenant accessibility.
            </Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>Evidence Systems: </Text>
              Inspection processes, photographic documentation, evidence archives, 
              maintenance records, and digital backup procedures.
            </Text>
          </View>
        </View>
      </View>
      
      <Text style={globalStyles.h2}>Assessment Framework</Text>
      
      <View style={styles.section}>
        <Text style={globalStyles.paragraph}>
          The audit utilized a {totalQuestions}-question structured questionnaire addressing statutory 
          requirements and professional standards. Questions are weighted by legal significance, with 
          critical compliance items carrying higher impact on overall scoring.
        </Text>
        
        <View style={styles.infoBox}>
          <Text style={[styles.infoText, { fontFamily: 'Helvetica-Bold', marginBottom: 5 }]}>
            Assessment Standards Referenced:
          </Text>
          <Text style={styles.infoText}>
            Housing Act 2004, Health and Safety at Work Act 1974, Gas Safety Regulations, 
            Electrical Safety Standards, Energy Performance of Buildings Regulations, 
            Tenancy Deposit Protection Requirements, and relevant local authority licensing schemes.
          </Text>
        </View>
      </View>
      
      <Text style={globalStyles.h2}>Scoring Methodology</Text>
      
      <View style={styles.section}>
        <Text style={globalStyles.paragraph}>
          Each question receives a score from 1-10 based on compliance level demonstrated. 
          Scores are weighted by question significance and aggregated to produce subcategory, 
          category, and overall scores. The scoring system is designed to reflect both legal 
          compliance and operational risk.
        </Text>
        
        <View style={styles.bulletList}>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>Critical Questions: </Text>
              Weighted 2.0x (legal requirements with prosecution risk)
            </Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>Standard Questions: </Text>
              Weighted 1.0x (best practices and operational procedures)
            </Text>
          </View>
        </View>
      </View>
      
      <Text style={globalStyles.h2}>Limitations & Assumptions</Text>
      
      <View style={styles.section}>
        <View style={styles.bulletList}>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              This audit is based on information provided and documentation presented at the time of assessment. 
              Changes to regulations or property circumstances may affect compliance status.
            </Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Recommendations reflect general best practices. Specific legal advice should be obtained 
              for complex situations or where enforcement action is threatened.
            </Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              This report does not constitute legal advice. Professional legal counsel should be 
              consulted for interpretation of specific legal requirements.
            </Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Physical site inspection scope: {auditScope.siteInspection ? 'Conducted' : 'Documentation review only'}
            </Text>
          </View>
        </View>
      </View>
      
      <Text style={globalStyles.h2}>Auditor Credentials</Text>
      
      <View style={styles.section}>
        <Text style={globalStyles.paragraph}>
          This audit was conducted by {data.auditorName}, a qualified property compliance auditor 
          with expertise in residential letting regulations, tenancy law, and property management best practices.
        </Text>
      </View>
      
      <PageFooter />
    </Page>
  );
};

