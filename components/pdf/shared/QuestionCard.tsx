// Question Card Component for Detailed Results
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { TrafficLight } from './TrafficLight';
import { COLORS } from '@/lib/pdf/styles';

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    paddingVertical: 5,
  },
  questionNumber: {
    width: 50,
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
  },
  questionText: {
    flex: 1,
    fontSize: 11,
  },
  scoreIcon: {
    width: 75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metadata: {
    fontSize: 9,
    color: COLORS.lightBlue,
    marginTop: 5,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    marginTop: 10,
    marginBottom: 3,
  },
  contentText: {
    fontSize: 11,
    marginLeft: 15,
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
  <View style={styles.card}>
    {/* Question Header Row */}
    <View style={styles.row}>
      <Text style={styles.questionNumber}>Q{question.number}</Text>
      <Text style={styles.questionText}>{question.questionText}</Text>
      <View style={styles.scoreIcon}>
        <TrafficLight color={question.color} style={{ fontSize: 16 }} />
      </View>
    </View>
    
    {/* Metadata */}
    <Text style={styles.metadata}>
      Category: {question.category} | Subcategory: {question.subcategory}
    </Text>
    
    {/* Answer Section */}
    <Text style={styles.sectionLabel}>Answer:</Text>
    <Text style={styles.contentText}>• {question.answer}</Text>
    
    {/* Comment Section (if exists) */}
    {question.comment && (
      <>
        <Text style={styles.sectionLabel}>Comment:</Text>
        <Text style={styles.contentText}>• {question.comment}</Text>
      </>
    )}
  </View>
);

