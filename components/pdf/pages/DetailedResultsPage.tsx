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
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGray,
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginTop: 10,
    marginBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.mediumGray,
  },
  headerCell: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
  },
  questionHeaderCell: {
    width: '35%',
    paddingRight: 8,
  },
  answerHeaderCell: {
    width: '35%',
    paddingRight: 8,
  },
  commentHeaderCell: {
    width: '30%',
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
}: DetailedResultsPageProps) => {
  // Combine all questions into a single array
  const allQuestions = [...redQuestions, ...orangeQuestions, ...greenQuestions];
  
  return (
  <Page size="A4" style={styles.page}>
    <PageHeader title="Landlord Risk Audit Report" />
    
    <Text style={globalStyles.h1}>Detailed Results</Text>
    
    <View style={styles.section}>
      <Text style={globalStyles.paragraph}>
        This section provides a comprehensive breakdown of all audit questions. 
        Each question includes the selected answer and any additional comments provided.
      </Text>
    </View>
    
    {/* Table Header */}
    <View style={styles.tableHeader}>
      <Text style={[styles.headerCell, styles.questionHeaderCell]}>Question</Text>
      <Text style={[styles.headerCell, styles.answerHeaderCell]}>Answer</Text>
      <Text style={[styles.headerCell, styles.commentHeaderCell]}>Comment</Text>
    </View>
    
    {/* All Questions in Table Format */}
    {allQuestions.map((question, idx) => (
      <QuestionCard key={`question-${question.number}-${idx}`} question={question} />
    ))}
    
    <PageFooter />
  </Page>
  );
};
