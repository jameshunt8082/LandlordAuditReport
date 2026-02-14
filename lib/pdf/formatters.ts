// PDF Report Data Formatters
import { Audit, FormResponse } from '@/types/database';
import { Question } from '@/lib/questions';
import { CategoryScore, OverallScore, RecommendedAction } from '@/lib/scoring';
import { getTrafficLightColor } from './styles';

// Report Data Interfaces
export interface SubcategoryScore {
  name: string;
  category: string;
  score: number;
  color: 'red' | 'orange' | 'green';
  questionsCount: number;
}

export interface Recommendation {
  subcategory: string;
  score: number;
  suggestions: string[];
  priority: 1 | 2 | 3 | 4; // 1=Critical, 2=High, 3=Medium, 4=Low
  impact: 'Legal Exposure' | 'Tribunal Risk' | 'Best Practice' | 'Optimization';
}

export interface QuestionResponseData {
  number: string;
  category: string;
  subcategory: string;
  questionText: string;
  answer: string;
  score: number;
  color: 'red' | 'orange' | 'green';
  comment?: string;
  // CSV fallback columns removed - now using score_examples array
  // Scoring guidance from Edit Questions
  score_examples?: Array<{
    score_level: 'low' | 'medium' | 'high';
    reason_text: string;
    report_action?: string | null;
  }>;
}

export interface ServiceRecommendation {
  lowScoringArea: string;
  suggestedService: string;
  tier?: string;
}

export interface ReportData {
  // Header info
  propertyAddress: string;
  auditStartDate: Date;
  auditEndDate: Date;
  landlordName: string;
  auditorName: string;
  
  // Overall scores
  overallScore: number;
  riskTier: 'tier_0' | 'tier_1' | 'tier_2' | 'tier_3' | 'tier_4';
  
  // Category scores (3 main categories)
  categoryScores: {
    documentation: CategoryScore;
    communication: CategoryScore;
    evidenceGathering: CategoryScore;
  };
  
  // Subcategory breakdown
  subcategoryScores: SubcategoryScore[];
  
  // Recommendations (grouped by category)
  recommendationsByCategory: {
    documentation: Recommendation[];
    communication: Recommendation[];
    evidenceGathering: Recommendation[];
  };
  
  // Question responses (sorted by score)
  questionResponses: {
    red: QuestionResponseData[];      // Score 1-3
    orange: QuestionResponseData[];   // Score 4-6
    green: QuestionResponseData[];    // Score 7-10
  };
  
  // Follow-on services
  suggestedServices: ServiceRecommendation[];
}

/**
 * Transform audit data into report format
 */
export function transformAuditToReportData(
  audit: Audit,
  responses: FormResponse[],
  questions: Question[],
  scores: {
    categoryScores: CategoryScore[];
    overallScore: OverallScore;
    recommendedActions: RecommendedAction[];
  }
): ReportData {
  // 1. Calculate subcategory scores
  const subcategoryScores = calculateSubcategoryScores(responses, questions);
  
  // 2. Generate recommendations grouped by category
  const recommendationsByCategory = generateRecommendationsByCategory(
    scores.recommendedActions,
    subcategoryScores,
    questions
  );
  
  // 3. Sort question responses by score (red, orange, green)
  // Comments are now part of form_responses, not from notes table
  const questionResponses = sortQuestionResponses(responses, questions);
  
  // 4. Suggest follow-on services for low-scoring areas
  const suggestedServices = generateServiceRecommendations(subcategoryScores);
  
  // 5. Map category scores to named categories
  const categoryScoresMap = {
    documentation: scores.categoryScores.find(c => c.category === 'Documentation') || 
      { category: 'Documentation', score: 0, maxScore: 10, percentage: 0, riskLevel: 'high' as const, color: 'red' },
    communication: scores.categoryScores.find(c => c.category === 'Landlord-Tenant Communication') || 
      { category: 'Landlord-Tenant Communication', score: 0, maxScore: 10, percentage: 0, riskLevel: 'high' as const, color: 'red' },
    evidenceGathering: scores.categoryScores.find(c => c.category === 'Evidence Gathering Systems and Procedures') || 
      { category: 'Evidence Gathering Systems and Procedures', score: 0, maxScore: 10, percentage: 0, riskLevel: 'high' as const, color: 'red' },
  };
  
  return {
    // Header
    propertyAddress: audit.property_address,
    auditStartDate: new Date(audit.submitted_at || audit.created_at), // When landlord submitted
    auditEndDate: new Date(), // When report is generated (NOW)
    landlordName: audit.client_name,
    auditorName: audit.conducted_by,
    
    // Overall scores
    overallScore: scores.overallScore.score,
    riskTier: audit.risk_audit_tier,
    
    // Category scores
    categoryScores: categoryScoresMap,
    
    // Subcategory scores
    subcategoryScores,
    
    // Recommendations
    recommendationsByCategory,
    
    // Question responses
    questionResponses,
    
    // Services
    suggestedServices,
  };
}

/**
 * Calculate subcategory scores
 */
function calculateSubcategoryScores(
  responses: FormResponse[],
  questions: Question[]
): SubcategoryScore[] {
  const subcategoryMap = new Map<string, {
    category: string;
    scores: number[];
  }>();
  
  // Group responses by subcategory
  responses.forEach((response) => {
    const question = questions.find(q => q.id === response.question_id);
    if (!question) return;
    
    const key = `${question.category}|${question.section}`;
    if (!subcategoryMap.has(key)) {
      subcategoryMap.set(key, {
        category: question.category,
        scores: [],
      });
    }
    
    subcategoryMap.get(key)!.scores.push(response.answer_value);
  });
  
  // Calculate averages
  const subcategoryScores: SubcategoryScore[] = [];
  subcategoryMap.forEach((data, key) => {
    const [category, subcategory] = key.split('|');
    const avgScore = data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length;
    
    subcategoryScores.push({
      name: subcategory,
      category,
      score: Number(avgScore.toFixed(1)),
      color: getTrafficLightColor(avgScore),
      questionsCount: data.scores.length,
    });
  });
  
  // Sort by category then by score (lowest first)
  subcategoryScores.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.score - b.score;
  });
  
  return subcategoryScores;
}

/**
 * Generate recommendations grouped by category
 */
function generateRecommendationsByCategory(
  recommendedActions: RecommendedAction[],
  subcategoryScores: SubcategoryScore[],
  questions: Question[]
): {
  documentation: Recommendation[];
  communication: Recommendation[];
  evidenceGathering: Recommendation[];
} {
  const recommendations: {
    documentation: Recommendation[];
    communication: Recommendation[];
    evidenceGathering: Recommendation[];
  } = {
    documentation: [],
    communication: [],
    evidenceGathering: [],
  };
  
  // Group by category and subcategory
  const subcategoryActionsMap = new Map<string, RecommendedAction[]>();
  
  recommendedActions.forEach(action => {
    const question = questions.find(q => q.id === action.questionId);
    if (!question) return;
    
    const key = `${question.category}|${question.section}`;
    if (!subcategoryActionsMap.has(key)) {
      subcategoryActionsMap.set(key, []);
    }
    subcategoryActionsMap.get(key)!.push(action);
  });
  
  // Create recommendations with priority
  subcategoryActionsMap.forEach((actions, key) => {
    const [category, subcategory] = key.split('|');
    const subcatScore = subcategoryScores.find(
      s => s.category === category && s.name === subcategory
    );
    
    const score = subcatScore?.score || 0;
    
    // Determine priority based on score and action priority
    let priority: 1 | 2 | 3 | 4 = 3;
    let impact: 'Legal Exposure' | 'Tribunal Risk' | 'Best Practice' | 'Optimization' = 'Best Practice';
    
    if (actions.some(a => a.priority === 'critical')) {
      priority = 1;
      impact = 'Legal Exposure';
    } else if (score <= 3) {
      priority = 1;
      impact = 'Legal Exposure';
    } else if (actions.some(a => a.priority === 'high') || score <= 5) {
      priority = 2;
      impact = 'Tribunal Risk';
    } else if (score <= 7) {
      priority = 3;
      impact = 'Best Practice';
    } else {
      priority = 4;
      impact = 'Optimization';
    }
    
    const rec: Recommendation = {
      subcategory,
      score: subcatScore?.score || 0,
      suggestions: actions.map(a => a.recommendation),
      priority,
      impact,
    };
    
    // Map to correct category key
    if (category === 'Documentation') {
      recommendations.documentation.push(rec);
    } else if (category === 'Landlord-Tenant Communication') {
      recommendations.communication.push(rec);
    } else if (category === 'Evidence Gathering Systems and Procedures') {
      recommendations.evidenceGathering.push(rec);
    }
  });
  
  return recommendations;
}

/**
 * Sort question responses by score color
 */
function sortQuestionResponses(
  responses: FormResponse[],
  questions: Question[]
): {
  red: QuestionResponseData[];
  orange: QuestionResponseData[];
  green: QuestionResponseData[];
} {
  const sorted: {
    red: QuestionResponseData[];
    orange: QuestionResponseData[];
    green: QuestionResponseData[];
  } = {
    red: [],
    orange: [],
    green: [],
  };
  
  responses.forEach(response => {
    const question = questions.find(q => q.id === response.question_id);
    if (!question) {
      console.warn(`[Formatters] Question not found for response: ${response.question_id}`);
      return;
    }
    
    // Validate question has options array
    if (!question.options || !Array.isArray(question.options)) {
      console.error(`[Formatters] Question ${question.id} has no options array:`, question);
      return;
    }
    
    // Get comment directly from the form response
    const comment = response.comment || undefined;
    
    const option = question.options.find(opt => opt.value === response.answer_value);
    if (!option) {
      console.warn(`[Formatters] Option not found for question ${question.id}, value: ${response.answer_value}`);
      console.warn(`[Formatters] Available options:`, question.options);
      // Use fallback with generic text
      const fallbackAnswer = `Score: ${response.answer_value}`;
      const color = getTrafficLightColor(response.answer_value);
      
    const questionData: QuestionResponseData = {
      number: question.id,
      category: question.category || 'Unknown',
      subcategory: question.section || 'Unknown',
      questionText: question.text || 'Question text not available',
      answer: fallbackAnswer,
      score: response.answer_value,
      color,
      comment,
      score_examples: question.score_examples,
    };
      
      sorted[color].push(questionData);
      return;
    }
    
    const color = getTrafficLightColor(response.answer_value);
    
    const questionData: QuestionResponseData = {
      number: question.id,
      category: question.category || 'Unknown',
      subcategory: question.section || 'Unknown',
      questionText: question.text || 'Question text not available',
      answer: option.label || 'No answer text',
      score: response.answer_value,
      color,
      comment,
      score_examples: question.score_examples,
    };
    
    sorted[color].push(questionData);
  });
  
  // Sort each array by question number
  const sortByNumber = (a: QuestionResponseData, b: QuestionResponseData) => {
    const [aMajor, aMinor] = a.number.split('.').map(Number);
    const [bMajor, bMinor] = b.number.split('.').map(Number);
    if (aMajor !== bMajor) return aMajor - bMajor;
    return aMinor - bMinor;
  };
  
  sorted.red.sort(sortByNumber);
  sorted.orange.sort(sortByNumber);
  sorted.green.sort(sortByNumber);
  
  return sorted;
}

/**
 * Generate service recommendations for low-scoring areas
 */
function generateServiceRecommendations(
  subcategoryScores: SubcategoryScore[]
): ServiceRecommendation[] {
  const services: ServiceRecommendation[] = [];
  
  // Service mapping for low scores (≤ 4)
  const serviceMap: Record<string, { service: string; tier: string }> = {
    // Documentation
    'Certificates': { service: 'Certificate Management Service', tier: 'Tier 1' },
    'Tenant Manuals & Documents': { service: 'Documentation Package', tier: 'Tier 2' },
    'Council Required Documents': { service: 'Compliance Review', tier: 'Tier 3' },
    'Tenant Responsibilities': { service: 'Tenancy Agreement Review', tier: 'Tier 2' },
    'Tenant Critical Information': { service: 'Safety Information Package', tier: 'Tier 2' },
    'Fire Safety Documentation': { service: 'Fire Safety Compliance Review', tier: 'Tier 1' },
    'Landlord Alert/Reminder System': { service: 'Compliance Monitoring System', tier: 'Tier 2' },
    'Tenant Information': { service: 'Data Protection Review', tier: 'Tier 2' },
    // Communication
    'Day-to-day Communication System': { service: 'Communication Tracking System', tier: 'Tier 2' },
    'Behaviour Reporting Procedure/System': { service: 'Dispute Management Framework', tier: 'Tier 3' },
    'Cleanliness': { service: 'HMO Management Framework', tier: 'Tier 3' },
    'Product Buying': { service: 'HMO Management Framework', tier: 'Tier 3' },
    'Rotas': { service: 'HMO Management Framework', tier: 'Tier 3' },
    // Evidence Gathering
    'Room Inspections Log': { service: 'Inspection Protocol Service', tier: 'Tier 3' },
    'Room Inventory': { service: 'Inventory Management Service', tier: 'Tier 2' },
    "Tenant's Property Repair Logging System": { service: 'Maintenance System Setup', tier: 'Tier 3' },
    'Property Maintenance Log': { service: 'Maintenance System Setup', tier: 'Tier 3' },
    'Shared Spaces Inspection Log': { service: 'Inspection Protocol Service', tier: 'Tier 3' },
    'External Property Inspection Log': { service: 'Onsite Survey', tier: 'Tier 4' },
    'Tenant Behaviour Log': { service: 'Dispute Management Framework', tier: 'Tier 3' },
    'Fire and Accident Log & Safety Action List': { service: 'Fire Safety Compliance Review', tier: 'Tier 1' },
    'Condensation Prevention Procedures': { service: 'Property Maintenance Advisory', tier: 'Tier 3' },
    // Legacy keys (backward compatibility)
    'Rent & Financial Tracking': { service: 'Financial Management System', tier: 'Tier 2' },
    'Complaint & Repair Systems': { service: 'Maintenance System Setup', tier: 'Tier 3' },
    'Written Records': { service: 'Record-Keeping System', tier: 'Tier 2' },
    'Contact Logs': { service: 'Communication Tracking System', tier: 'Tier 2' },
    'Inspection Process': { service: 'Onsite Survey', tier: 'Tier 4' },
    'Evidence Archives': { service: 'Digital Archive System', tier: 'Tier 3' },
  };
  
  subcategoryScores.forEach(subcat => {
    if (subcat.score <= 4 && serviceMap[subcat.name]) {
      services.push({
        lowScoringArea: `${subcat.category}/${subcat.name}`,
        suggestedService: serviceMap[subcat.name].service,
        tier: serviceMap[subcat.name].tier,
      });
    }
  });
  
  return services;
}

/**
 * Format date for report
 */
export function formatReportDate(date: Date): string {
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Sanitize address for filename
 */
export function sanitizeAddressForFilename(address: string): string {
  return address
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50)
    .toLowerCase();
}

