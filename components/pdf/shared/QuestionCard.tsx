// Question Card Component for Detailed Results
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { COLORS } from '@/lib/pdf/styles';

const styles = StyleSheet.create({
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.mediumGray,
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: 'flex-start',
  },
  questionCell: {
    width: '35%',
    fontSize: 9,
    lineHeight: 1.3,
    paddingRight: 8,
  },
  answerCell: {
    width: '35%',
    fontSize: 9,
    lineHeight: 1.3,
    paddingRight: 8,
  },
  commentCell: {
    width: '30%',
    fontSize: 9,
    lineHeight: 1.3,
    color: COLORS.mediumGray,
  },
});

export interface QuestionResponse {
  number: string;         // e.g. "1.1"
  category: string;
  subcategory: string;
  questionText: string;
  answer: string;
  score: number;
  color: 'red' | 'orange' | 'green';
  comment?: string;
}

interface QuestionCardProps {
  question: QuestionResponse;
}

export const QuestionCard = ({ question }: QuestionCardProps) => (
  <View style={styles.tableRow} wrap={false}>
    <Text style={styles.questionCell}>{question.questionText}</Text>
    <Text style={styles.answerCell}>{question.answer}</Text>
    <Text style={styles.commentCell}>{question.comment || ''}</Text>
  </View>
);

