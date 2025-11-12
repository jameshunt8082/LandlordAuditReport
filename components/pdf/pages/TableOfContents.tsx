// Table of Contents Component
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { PageHeader } from '../shared/PageHeader';
import { PageFooter } from '../shared/PageFooter';
import { styles as globalStyles } from '@/lib/pdf/styles';

const styles = StyleSheet.create({
  page: {
    ...globalStyles.page,
  },
  title: {
    ...globalStyles.h1,
    marginTop: 50,
  },
  tocItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 0,
  },
  tocItemIndent1: {
    paddingLeft: 20,
  },
  tocItemIndent2: {
    paddingLeft: 40,
  },
  tocText: {
    flex: 1,
    fontSize: 11,
  },
  tocPage: {
    fontSize: 11,
    width: 30,
    textAlign: 'right',
  },
  dots: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    borderBottomStyle: 'dotted',
    marginHorizontal: 5,
    marginBottom: 3,
  },
});

export const TableOfContents = () => (
  <Page size="A4" style={styles.page}>
    <PageHeader title="Landlord Risk Audit Report" />
    
    <Text style={styles.title}>Contents</Text>
    
    {/* Main sections */}
    <View style={styles.tocItem}>
      <Text style={styles.tocText}>Introduction</Text>
      <View style={styles.dots} />
      <Text style={styles.tocPage}>3</Text>
    </View>
    
    {/* Introduction subsections */}
    <View style={[styles.tocItem, styles.tocItemIndent1]}>
      <Text style={styles.tocText}>Purpose of Survey</Text>
      <View style={styles.dots} />
      <Text style={styles.tocPage}>4</Text>
    </View>
    
    <View style={[styles.tocItem, styles.tocItemIndent1]}>
      <Text style={styles.tocText}>Theory</Text>
      <View style={styles.dots} />
      <Text style={styles.tocPage}>4</Text>
    </View>
    
    <View style={[styles.tocItem, styles.tocItemIndent2]}>
      <Text style={styles.tocText}>Documentation Subcategories</Text>
      <View style={styles.dots} />
      <Text style={styles.tocPage}>4</Text>
    </View>
    
    <View style={[styles.tocItem, styles.tocItemIndent2]}>
      <Text style={styles.tocText}>Landlord-Tenant Communication Subcategories</Text>
      <View style={styles.dots} />
      <Text style={styles.tocPage}>5</Text>
    </View>
    
    <View style={[styles.tocItem, styles.tocItemIndent2]}>
      <Text style={styles.tocText}>Evidence Gathering Systems and Procedures Subcategories</Text>
      <View style={styles.dots} />
      <Text style={styles.tocPage}>5</Text>
    </View>
    
    <View style={[styles.tocItem, styles.tocItemIndent1]}>
      <Text style={styles.tocText}>Background and Methodology</Text>
      <View style={styles.dots} />
      <Text style={styles.tocPage}>6</Text>
    </View>
    
    <View style={[styles.tocItem, styles.tocItemIndent1]}>
      <Text style={styles.tocText}>What the Colours and Scores Mean</Text>
      <View style={styles.dots} />
      <Text style={styles.tocPage}>6</Text>
    </View>
    
    {/* Results section */}
    <View style={styles.tocItem}>
      <Text style={styles.tocText}>The Results</Text>
      <View style={styles.dots} />
      <Text style={styles.tocPage}>8</Text>
    </View>
    
    <View style={[styles.tocItem, styles.tocItemIndent1]}>
      <Text style={styles.tocText}>Category Scores</Text>
      <View style={styles.dots} />
      <Text style={styles.tocPage}>8</Text>
    </View>
    
    <View style={[styles.tocItem, styles.tocItemIndent1]}>
      <Text style={styles.tocText}>Subcategory Scores</Text>
      <View style={styles.dots} />
      <Text style={styles.tocPage}>9</Text>
    </View>
    
    {/* Recommendations section */}
    <View style={styles.tocItem}>
      <Text style={styles.tocText}>Recommended Actions</Text>
      <View style={styles.dots} />
      <Text style={styles.tocPage}>10</Text>
    </View>
    
    <View style={[styles.tocItem, styles.tocItemIndent1]}>
      <Text style={styles.tocText}>Suggestions for Improvement</Text>
      <View style={styles.dots} />
      <Text style={styles.tocPage}>10</Text>
    </View>
    
    <View style={[styles.tocItem, styles.tocItemIndent2]}>
      <Text style={styles.tocText}>Documentation</Text>
      <View style={styles.dots} />
      <Text style={styles.tocPage}>10</Text>
    </View>
    
    <View style={[styles.tocItem, styles.tocItemIndent2]}>
      <Text style={styles.tocText}>Landlord-Tenant Communication</Text>
      <View style={styles.dots} />
      <Text style={styles.tocPage}>10</Text>
    </View>
    
    <View style={[styles.tocItem, styles.tocItemIndent2]}>
      <Text style={styles.tocText}>Evidence Gathering Systems and Procedures</Text>
      <View style={styles.dots} />
      <Text style={styles.tocPage}>11</Text>
    </View>
    
    <View style={[styles.tocItem, styles.tocItemIndent1]}>
      <Text style={styles.tocText}>Follow-on Products and Services</Text>
      <View style={styles.dots} />
      <Text style={styles.tocPage}>12</Text>
    </View>
    
    {/* Detailed Results section */}
    <View style={styles.tocItem}>
      <Text style={styles.tocText}>Detailed Results</Text>
      <View style={styles.dots} />
      <Text style={styles.tocPage}>13</Text>
    </View>
    
    <View style={[styles.tocItem, styles.tocItemIndent1]}>
      <Text style={styles.tocText}>Answers and Scores</Text>
      <View style={styles.dots} />
      <Text style={styles.tocPage}>13</Text>
    </View>
    
    <View style={[styles.tocItem, styles.tocItemIndent1]}>
      <Text style={styles.tocText}>Red (Low) Scoring Answers</Text>
      <View style={styles.dots} />
      <Text style={styles.tocPage}>13</Text>
    </View>
    
    <View style={[styles.tocItem, styles.tocItemIndent1]}>
      <Text style={styles.tocText}>Orange (Medium) Scoring Statements</Text>
      <View style={styles.dots} />
      <Text style={styles.tocPage}>15</Text>
    </View>
    
    <View style={[styles.tocItem, styles.tocItemIndent1]}>
      <Text style={styles.tocText}>Green (High) Scoring Answers</Text>
      <View style={styles.dots} />
      <Text style={styles.tocPage}>15</Text>
    </View>
    
    <PageFooter />
  </Page>
);

