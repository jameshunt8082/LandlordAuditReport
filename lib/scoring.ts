import { questions, CATEGORIES } from "./questions";
import { FormResponse } from "@/types/database";

export interface CategoryScore {
  category: string;
  score: number;
  maxScore: number;
  percentage: number;
  riskLevel: "low" | "medium" | "high";
  color: string;
}

export interface OverallScore {
  score: number;
  riskLevel: "low" | "medium" | "high";
  color: string;
}

export interface RecommendedAction {
  priority: "critical" | "high" | "medium" | "low";
  questionId: string;
  questionText: string;
  currentAnswer: string;
  recommendation: string;
  timeframe: string;
}

// Calculate score for a single question
function calculateQuestionScore(
  questionId: string,
  answerValue: number
): number {
  const question = questions.find((q) => q.id === questionId);
  if (!question) return 0;
  
  return answerValue * question.weight;
}

// Get risk level based on score (1-10 scale)
function getRiskLevel(score: number): "low" | "medium" | "high" {
  if (score >= 7.5) return "low";
  if (score >= 4.0) return "medium";
  return "high";
}

// Get color for risk level
function getRiskColor(riskLevel: "low" | "medium" | "high"): string {
  switch (riskLevel) {
    case "low":
      return "green";
    case "medium":
      return "yellow";
    case "high":
      return "red";
  }
}

// Calculate category scores
export function calculateCategoryScores(
  responses: FormResponse[]
): CategoryScore[] {
  const categoryScores: CategoryScore[] = [];
  
  const categories = Object.values(CATEGORIES);
  
  categories.forEach((category) => {
    const categoryQuestions = questions.filter((q) => q.category === category);
    const totalWeight = categoryQuestions.reduce((sum, q) => sum + q.weight, 0);
    
    let totalScore = 0;
    
    categoryQuestions.forEach((question) => {
      const response = responses.find((r) => r.question_id === question.id);
      if (response) {
        totalScore += calculateQuestionScore(question.id, response.answer_value);
      }
    });
    
    // Normalize to 1-10 scale
    const normalizedScore = totalWeight > 0 ? totalScore / totalWeight : 0;
    const riskLevel = getRiskLevel(normalizedScore);
    
    categoryScores.push({
      category,
      score: Number(normalizedScore.toFixed(2)),
      maxScore: 10,
      percentage: Number(((normalizedScore / 10) * 100).toFixed(1)),
      riskLevel,
      color: getRiskColor(riskLevel),
    });
  });
  
  return categoryScores;
}

// Calculate overall score
export function calculateOverallScore(
  categoryScores: CategoryScore[]
): OverallScore {
  const averageScore =
    categoryScores.reduce((sum, cat) => sum + cat.score, 0) /
    categoryScores.length;
  
  const score = Number(averageScore.toFixed(2));
  const riskLevel = getRiskLevel(score);
  
  return {
    score,
    riskLevel,
    color: getRiskColor(riskLevel),
  };
}

// Generate recommended actions
export function generateRecommendedActions(
  responses: FormResponse[]
): RecommendedAction[] {
  const actions: RecommendedAction[] = [];
  
  responses.forEach((response) => {
    const question = questions.find((q) => q.id === response.question_id);
    if (!question) return;
    
    const selectedOption = question.options.find(
      (opt) => opt.value === response.answer_value
    );
    if (!selectedOption) return;
    
    // Determine priority
    let priority: "critical" | "high" | "medium" | "low";
    let timeframe: string;
    let recommendation: string;
    
    if (question.critical && response.answer_value === 1) {
      priority = "critical";
      timeframe = "Immediate action required (within 7 days)";
      recommendation = `This is a CRITICAL compliance issue. ${selectedOption.label}. You must address this immediately to avoid legal issues and protect your tenancy.`;
      
      actions.push({
        priority,
        questionId: question.id,
        questionText: question.text,
        currentAnswer: selectedOption.label,
        recommendation,
        timeframe,
      });
    } else if (question.weight >= 2.0 && response.answer_value < 5) {
      priority = "critical";
      timeframe = "Immediate action required (within 7 days)";
      recommendation = `This high-importance area needs urgent attention. ${selectedOption.label}. Take action immediately to improve compliance.`;
      
      actions.push({
        priority,
        questionId: question.id,
        questionText: question.text,
        currentAnswer: selectedOption.label,
        recommendation,
        timeframe,
      });
    } else if (response.answer_value === 1) {
      priority = "high";
      timeframe = "Action required within 30 days";
      recommendation = `${selectedOption.label}. This area requires attention to ensure full compliance and reduce risk.`;
      
      actions.push({
        priority,
        questionId: question.id,
        questionText: question.text,
        currentAnswer: selectedOption.label,
        recommendation,
        timeframe,
      });
    } else if (response.answer_value === 5 && question.weight >= 1.0) {
      priority = "medium";
      timeframe = "Recommended within 90 days";
      recommendation = `${selectedOption.label}. Consider improving your systems in this area for better compliance.`;
      
      actions.push({
        priority,
        questionId: question.id,
        questionText: question.text,
        currentAnswer: selectedOption.label,
        recommendation,
        timeframe,
      });
    } else if (response.answer_value === 5) {
      priority = "low";
      timeframe = "Ongoing improvement";
      recommendation = `${selectedOption.label}. This area is functioning but could be optimized.`;
      
      actions.push({
        priority,
        questionId: question.id,
        questionText: question.text,
        currentAnswer: selectedOption.label,
        recommendation,
        timeframe,
      });
    }
  });
  
  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  return actions;
}

// Calculate all scores and actions
export function calculateAuditScores(responses: FormResponse[]) {
  const categoryScores = calculateCategoryScores(responses);
  const overallScore = calculateOverallScore(categoryScores);
  const recommendedActions = generateRecommendedActions(responses);
  
  return {
    categoryScores,
    overallScore,
    recommendedActions,
  };
}

