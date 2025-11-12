// Introduction Page Component
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { PageHeader } from '../shared/PageHeader';
import { PageFooter } from '../shared/PageFooter';
import { TrafficLight } from '../shared/TrafficLight';
import { styles as globalStyles, COLORS } from '@/lib/pdf/styles';

const styles = StyleSheet.create({
  page: {
    ...globalStyles.page,
  },
  section: {
    marginBottom: 20,
  },
  trafficLightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  trafficLightText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 11,
  },
  bulletList: {
    marginLeft: 20,
    marginTop: 5,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  bullet: {
    width: 15,
    fontSize: 11,
  },
  bulletText: {
    flex: 1,
    fontSize: 11,
  },
});

export const IntroductionPage = () => (
  <>
    <Page size="A4" style={styles.page}>
      <PageHeader title="Landlord Risk Audit Report" pageNumber={3} />
      
      <Text style={globalStyles.h1}>Introduction</Text>
      
      <View style={styles.section}>
        <Text style={globalStyles.paragraph}>
          This Landlord Risk Audit Report provides a comprehensive assessment of your property management 
          practices and compliance status. The audit evaluates three critical areas of landlord responsibility: 
          Documentation, Landlord-Tenant Communication, and Evidence Gathering Systems and Procedures.
        </Text>
        
        <Text style={globalStyles.paragraph}>
          Each area has been assessed using a structured questionnaire designed to identify potential risks, 
          compliance gaps, and areas for improvement. The results are presented using a traffic light system 
          to help you quickly identify priority actions.
        </Text>
      </View>
      
      <Text style={globalStyles.h2}>Purpose of Survey</Text>
      
      <View style={styles.section}>
        <Text style={globalStyles.paragraph}>
          The primary purpose of this audit is to help landlords:
        </Text>
        
        <View style={styles.bulletList}>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Identify compliance risks before they result in legal issues or fines
            </Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Understand their current practices relative to best practices and legal requirements
            </Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Develop a prioritized action plan for improvement
            </Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Protect themselves from tenant claims and disputes
            </Text>
          </View>
        </View>
      </View>
      
      <Text style={globalStyles.h2}>What the Colours and Scores Mean</Text>
      
      <View style={styles.section}>
        <View style={styles.trafficLightRow}>
          <TrafficLight color="red" />
          <Text style={styles.trafficLightText}>
            <Text style={{ fontFamily: 'Helvetica-Bold' }}>Red (1-3): </Text>
            Actions need to be taken immediately. You can be fined or tenants have power to claim money from you. 
            These are critical compliance issues that require urgent attention.
          </Text>
        </View>
        
        <View style={styles.trafficLightRow}>
          <TrafficLight color="orange" />
          <Text style={styles.trafficLightText}>
            <Text style={{ fontFamily: 'Helvetica-Bold' }}>Orange (4-6): </Text>
            Improvements need to be planned. Tenants will be able to win if you are taken to court. 
            These areas require attention to avoid potential legal issues.
          </Text>
        </View>
        
        <View style={styles.trafficLightRow}>
          <TrafficLight color="green" />
          <Text style={styles.trafficLightText}>
            <Text style={{ fontFamily: 'Helvetica-Bold' }}>Green (7-10): </Text>
            Doing well in this area. Maintain regular inspection and continue good practices. 
            You are safe from compliance issues in these areas.
          </Text>
        </View>
      </View>
      
      <PageFooter />
    </Page>
    
    {/* Theory Page */}
    <Page size="A4" style={styles.page}>
      <PageHeader title="Landlord Risk Audit Report" pageNumber={4} />
      
      <Text style={globalStyles.h2}>Theory</Text>
      
      <View style={styles.section}>
        <Text style={globalStyles.paragraph}>
          The audit is structured around three main categories, each containing multiple subcategories 
          that address specific aspects of landlord compliance and best practices.
        </Text>
      </View>
      
      <Text style={globalStyles.h3}>1. Documentation</Text>
      
      <View style={styles.section}>
        <Text style={globalStyles.paragraph}>
          Proper documentation is the foundation of compliant property management. This category assesses:
        </Text>
        
        <View style={styles.bulletList}>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Certificates (Gas, Electrical, EPC, PAT)</Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Tenant Manuals & Welcome Documents</Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Council Required Documents (HMO licenses, planning permissions)</Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Tenant Responsibilities Documentation</Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Rent & Financial Tracking Systems</Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Complaint & Repair Systems</Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Tenant Agreement Compliance</Text>
          </View>
        </View>
      </View>
      
      <Text style={globalStyles.h3}>2. Landlord-Tenant Communication</Text>
      
      <View style={styles.section}>
        <Text style={globalStyles.paragraph}>
          Effective communication prevents disputes and demonstrates professionalism. This category evaluates:
        </Text>
        
        <View style={styles.bulletList}>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Written Records of Communications</Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Contact & Complaint Logs</Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Notice Procedures & Documentation</Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Response Time & Quality</Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Accessibility & Availability</Text>
          </View>
        </View>
      </View>
      
      <PageFooter />
    </Page>
    
    {/* Continue Theory Page */}
    <Page size="A4" style={styles.page}>
      <PageHeader title="Landlord Risk Audit Report" pageNumber={5} />
      
      <Text style={globalStyles.h3}>3. Evidence Gathering Systems and Procedures</Text>
      
      <View style={styles.section}>
        <Text style={globalStyles.paragraph}>
          Strong evidence systems protect landlords in disputes and demonstrate due diligence. This category assesses:
        </Text>
        
        <View style={styles.bulletList}>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Inspection Process & Documentation</Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Photographic & Video Evidence</Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Evidence Archives & Storage</Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Maintenance & Repair Records</Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Incident Documentation</Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Tenant Communication Archives</Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Deposit Protection Documentation</Text>
          </View>
        </View>
      </View>
      
      <Text style={globalStyles.h2}>Background and Methodology</Text>
      
      <View style={styles.section}>
        <Text style={globalStyles.paragraph}>
          This audit uses a structured questionnaire approach with questions weighted by importance and legal 
          significance. Critical compliance areas (such as safety certificates) carry higher weight in the 
          overall score calculation.
        </Text>
        
        <Text style={globalStyles.paragraph}>
          Each question is scored on a scale where higher scores indicate better compliance and lower risk. 
          Questions are grouped into subcategories, and subcategory scores are aggregated to produce category 
          and overall scores.
        </Text>
        
        <Text style={globalStyles.paragraph}>
          The audit results identify specific actions needed to improve compliance, reduce risk, and 
          implement best practices in property management.
        </Text>
      </View>
      
      <PageFooter />
    </Page>
  </>
);

