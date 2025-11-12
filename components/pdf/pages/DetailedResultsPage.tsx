// Detailed Results Page Component
import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { PageHeader } from '../shared/PageHeader';
import { PageFooter } from '../shared/PageFooter';
import { QuestionCard, QuestionResponse } from '../shared/QuestionCard';
import { styles as globalStyles, COLORS } from '@/lib/pdf/styles';

const styles = StyleSheet.create({
  page: {
    ...globalStyles.page,
  },
  section: {
    marginBottom: 20,
  },
  sectionIntro: {
    fontSize: 11,
    marginBottom: 15,
    fontFamily: 'Helvetica-Oblique',
    color: COLORS.mediumGray,
  },
  noQuestionsText: {
    fontSize: 11,
    color: COLORS.darkGreen,
    marginTop: 10,
    marginBottom: 20,
  },
});

interface DetailedResultsPageProps {
  redQuestions: QuestionResponse[];
  orangeQuestions: QuestionResponse[];
  greenQuestions: QuestionResponse[];
}

export const DetailedResultsPage = ({ 
  redQuestions, 
  orangeQuestions, 
  greenQuestions
}: DetailedResultsPageProps) => (
  <>
    {/* Intro Page */}
    <Page size="A4" style={styles.page}>
      <PageHeader title="Landlord Risk Audit Report" />
      
      <Text style={globalStyles.h1}>Detailed Results</Text>
      
      <View style={styles.section}>
        <Text style={globalStyles.paragraph}>
          This section provides a comprehensive breakdown of all audit questions, categorized by their scoring level. 
          Each question includes the selected answer, any additional comments provided, and the associated score.
        </Text>
        
        <Text style={globalStyles.paragraph}>
          Questions are organized into three traffic light categories:
        </Text>
        
        <Text style={globalStyles.bulletPoint}>
          • <Text style={{ fontFamily: 'Helvetica-Bold', color: COLORS.red }}>Red (Low Scoring - 1-3)</Text>: 
          Critical issues requiring immediate attention and corrective action.
        </Text>
        
        <Text style={globalStyles.bulletPoint}>
          • <Text style={{ fontFamily: 'Helvetica-Bold', color: COLORS.orange }}>Orange (Medium Scoring - 4-6)</Text>: 
          Areas that need improvement to meet compliance standards.
        </Text>
        
        <Text style={globalStyles.bulletPoint}>
          • <Text style={{ fontFamily: 'Helvetica-Bold', color: COLORS.darkGreen }}>Green (High Scoring - 7-10)</Text>: 
          Well-managed areas demonstrating good compliance practices.
        </Text>
      </View>
      
      <PageFooter />
    </Page>
    
    {/* Red Questions Section */}
    <Page size="A4" style={styles.page}>
      <PageHeader title="Landlord Risk Audit Report" />
      
      <Text style={globalStyles.h2}>Red (Low) Scoring Answers</Text>
      
      {redQuestions.length === 0 ? (
        <Text style={styles.noQuestionsText}>
          ✓ Excellent! You have no critical issues. All questions scored above the red threshold.
        </Text>
      ) : (
        <>
          <Text style={styles.sectionIntro}>
            These questions received low scores (1-3) and require immediate attention. 
            Critical compliance issues that could result in fines or legal action.
          </Text>
          
          {redQuestions.map((question, idx) => (
            <QuestionCard key={`red-${question.number}-${idx}`} question={question} />
          ))}
        </>
      )}
      
      <PageFooter />
    </Page>
    
    {/* Orange Questions Section */}
    <Page size="A4" style={styles.page}>
      <PageHeader title="Landlord Risk Audit Report" />
      
      <Text style={globalStyles.h2}>Orange (Medium) Scoring Statements</Text>
      
      {orangeQuestions.length === 0 ? (
        <Text style={styles.noQuestionsText}>
          ✓ Great! You have no medium-level issues. All questions scored either high (green) or are addressed above.
        </Text>
      ) : (
        <>
          <Text style={styles.sectionIntro}>
            These questions received medium scores (4-6) and should be improved. 
            Areas that need attention to avoid potential legal issues.
          </Text>
          
          {orangeQuestions.map((question, idx) => (
            <QuestionCard key={`orange-${question.number}-${idx}`} question={question} />
          ))}
        </>
      )}
      
      <PageFooter />
    </Page>
    
    {/* Green Questions Section */}
    <Page size="A4" style={styles.page}>
      <PageHeader title="Landlord Risk Audit Report" />
      
      <Text style={globalStyles.h2}>Green (High) Scoring Answers</Text>
      
      {greenQuestions.length === 0 ? (
        <Text style={styles.noQuestionsText}>
          No green-scoring answers recorded.
        </Text>
      ) : (
        <>
          <Text style={styles.sectionIntro}>
            These questions received high scores (7-10) and demonstrate good compliance practices. 
            Well-managed areas that serve as examples of proper procedures.
          </Text>
          
          {greenQuestions.map((question, idx) => (
            <QuestionCard key={`green-${question.number}-${idx}`} question={question} />
          ))}
        </>
      )}
      
      <PageFooter />
    </Page>
  </>
);
