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
}: DetailedResultsPageProps) => {
  const pages: React.ReactElement[] = [];
  
  // Helper to create page with questions
  const createQuestionsPage = (questions: QuestionResponse[], title: string, intro: string, startIdx: number, questionsPerPage: number, key: string) => {
    const pageQuestions = questions.slice(startIdx, startIdx + questionsPerPage);
    
    return (
      <Page key={key} size="A4" style={styles.page}>
        <PageHeader title="Landlord Risk Audit Report" />
        
        {startIdx === 0 && (
          <>
            {title && <Text style={globalStyles.h2}>{title}</Text>}
            {intro && <Text style={styles.sectionIntro}>{intro}</Text>}
          </>
        )}
        
        {pageQuestions.map((question, idx) => (
          <QuestionCard key={`${question.number}-${idx}`} question={question} />
        ))}
        
        <PageFooter />
      </Page>
    );
  };
  
  // First page with title and introduction
  pages.push(
    <Page key="detailed-intro" size="A4" style={styles.page}>
      <PageHeader title="Landlord Risk Audit Report" />
      
      <Text style={globalStyles.h1}>Detailed Results</Text>
      
      <View style={styles.section}>
        <Text style={globalStyles.paragraph}>
          This section provides detailed information about each question answered in the audit, 
          organized by score level. Questions are grouped into three categories based on their 
          traffic light indicator.
        </Text>
      </View>
      
      <Text style={globalStyles.h2}>Answers and Scores</Text>
      
      <View style={styles.section}>
        <Text style={globalStyles.paragraph}>
          The following pages show your responses to each audit question, along with the score received 
          and any comments provided. Use this information to understand specific areas requiring attention.
        </Text>
      </View>
      
      <PageFooter />
    </Page>
  );
  
  // Red (Low) Scoring Answers
  pages.push(
    <Page key="red-intro" size="A4" style={styles.page}>
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
          
          {redQuestions.slice(0, 3).map((question, idx) => (
            <QuestionCard key={`red-${question.number}-${idx}`} question={question} />
          ))}
        </>
      )}
      
      <PageFooter />
    </Page>
  );
  
  // Continue red questions if more than 3
  if (redQuestions.length > 3) {
    let idx = 3;
    while (idx < redQuestions.length) {
      pages.push(createQuestionsPage(redQuestions, '', '', idx, 4, `red-cont-${idx}`));
      idx += 4;
    }
  }
  
  // Orange (Medium) Scoring Statements
  pages.push(
    <Page key="orange-intro" size="A4" style={styles.page}>
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
          
          {orangeQuestions.slice(0, 3).map((question, idx) => (
            <QuestionCard key={`orange-${question.number}-${idx}`} question={question} />
          ))}
        </>
      )}
      
      <PageFooter />
    </Page>
  );
  
  // Continue orange questions if more than 3
  if (orangeQuestions.length > 3) {
    let idx = 3;
    while (idx < orangeQuestions.length) {
      pages.push(createQuestionsPage(orangeQuestions, '', '', idx, 4, `orange-cont-${idx}`));
      idx += 4;
    }
  }
  
  // Green (High) Scoring Answers
  pages.push(
    <Page key="green-intro" size="A4" style={styles.page}>
      <PageHeader title="Landlord Risk Audit Report" />
      
      <Text style={globalStyles.h2}>Green (High) Scoring Answers</Text>
      
      {greenQuestions.length === 0 ? (
        <Text style={styles.noQuestionsText}>
          No high-scoring areas yet. Focus on improving red and orange categories first.
        </Text>
      ) : (
        <>
          <Text style={styles.sectionIntro}>
            These questions received high scores (7-10). Excellent work! 
            Continue maintaining these good practices and regular inspections.
          </Text>
          
          {greenQuestions.slice(0, 3).map((question, idx) => (
            <QuestionCard key={`green-${question.number}-${idx}`} question={question} />
          ))}
        </>
      )}
      
      <PageFooter />
    </Page>
  );
  
  // Continue green questions if more than 3
  if (greenQuestions.length > 3) {
    let idx = 3;
    while (idx < greenQuestions.length) {
      pages.push(createQuestionsPage(greenQuestions, '', '', idx, 4, `green-cont-${idx}`));
      idx += 4;
    }
  }
  
  return <>{pages}</>;
};

