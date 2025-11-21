// Mock data generator for PDF preview/development
import { ReportData } from '@/lib/pdf/formatters';

/**
 * Create mock report data for preview/testing
 */
export function createMockReportData(): ReportData {
  const now = new Date();
  const auditStartDate = new Date(now);
  auditStartDate.setDate(auditStartDate.getDate() - 7); // 7 days ago
  
  return {
    // Header info
    propertyAddress: '123 Sample Street, Auckland 1010',
    auditStartDate,
    auditEndDate: now,
    landlordName: 'John Smith',
    auditorName: 'Jane Doe',
    
    // Overall scores
    overallScore: 6.5,
    riskTier: 'tier_2',
    
    // Category scores
    categoryScores: {
      documentation: {
        category: 'Documentation',
        score: 7.2,
        maxScore: 10,
        percentage: 72,
        riskLevel: 'medium',
        color: 'orange',
      },
      communication: {
        category: 'Landlord-Tenant Communication',
        score: 5.8,
        maxScore: 10,
        percentage: 58,
        riskLevel: 'medium',
        color: 'orange',
      },
      evidenceGathering: {
        category: 'Evidence Gathering Systems and Procedures',
        score: 6.5,
        maxScore: 10,
        percentage: 65,
        riskLevel: 'medium',
        color: 'orange',
      },
    },
    
    // Subcategory scores
    subcategoryScores: [
      {
        name: 'Tenancy Agreements',
        category: 'Documentation',
        score: 8.0,
        color: 'green',
        questionsCount: 5,
      },
      {
        name: 'Property Condition Reports',
        category: 'Documentation',
        score: 6.5,
        color: 'orange',
        questionsCount: 4,
      },
      {
        name: 'Notice Periods',
        category: 'Landlord-Tenant Communication',
        score: 5.0,
        color: 'orange',
        questionsCount: 3,
      },
      {
        name: 'Maintenance Requests',
        category: 'Landlord-Tenant Communication',
        score: 4.5,
        color: 'red',
        questionsCount: 4,
      },
      {
        name: 'Photographic Evidence',
        category: 'Evidence Gathering Systems and Procedures',
        score: 7.5,
        color: 'green',
        questionsCount: 6,
      },
      {
        name: 'Document Storage',
        category: 'Evidence Gathering Systems and Procedures',
        score: 5.5,
        color: 'orange',
        questionsCount: 3,
      },
    ],
    
    // Recommendations
    recommendationsByCategory: {
      documentation: [
        {
          subcategory: 'Property Condition Reports',
          score: 6.5,
          suggestions: [
            'Ensure all property condition reports are completed within 7 days of tenancy start',
            'Include detailed photographs of all rooms and areas',
            'Have tenant sign and date the report',
          ],
          priority: 2,
          impact: 'Tribunal Risk',
        },
      ],
      communication: [
        {
          subcategory: 'Maintenance Requests',
          score: 4.5,
          suggestions: [
            'Respond to maintenance requests within 24 hours',
            'Keep written records of all maintenance communications',
            'Follow up on completed repairs to ensure tenant satisfaction',
          ],
          priority: 1,
          impact: 'Legal Exposure',
        },
        {
          subcategory: 'Notice Periods',
          score: 5.0,
          suggestions: [
            'Ensure all notices comply with Residential Tenancies Act requirements',
            'Use proper notice templates for different notice types',
            'Keep records of notice delivery dates',
          ],
          priority: 2,
          impact: 'Tribunal Risk',
        },
      ],
      evidenceGathering: [
        {
          subcategory: 'Document Storage',
          score: 5.5,
          suggestions: [
            'Implement a centralized document storage system',
            'Ensure all documents are backed up securely',
            'Organize documents by property and tenancy period',
          ],
          priority: 3,
          impact: 'Best Practice',
        },
      ],
    },
    
    // Question responses
    questionResponses: {
      red: [
        {
          number: 'Q3.2',
          category: 'Landlord-Tenant Communication',
          subcategory: 'Maintenance Requests',
          questionText: 'How quickly do you typically respond to maintenance requests?',
          answer: 'Within 1 week',
          score: 2,
          color: 'red',
          comment: 'Response time should be within 24-48 hours for urgent issues',
        },
        {
          number: 'Q4.1',
          category: 'Evidence Gathering Systems and Procedures',
          subcategory: 'Document Storage',
          questionText: 'How are your tenancy documents stored?',
          answer: 'Physical files only',
          score: 3,
          color: 'red',
          comment: 'Digital backup is essential for document security',
        },
      ],
      orange: [
        {
          number: 'Q1.2',
          category: 'Documentation',
          subcategory: 'Property Condition Reports',
          questionText: 'When do you complete property condition reports?',
          answer: 'Within 2 weeks of tenancy start',
          score: 5,
          color: 'orange',
          comment: 'Should be completed within 7 days',
        },
        {
          number: 'Q2.1',
          category: 'Landlord-Tenant Communication',
          subcategory: 'Notice Periods',
          questionText: 'Do you use standard notice templates?',
          answer: 'Sometimes',
          score: 6,
          color: 'orange',
          comment: 'Consistent use of templates ensures compliance',
        },
      ],
      green: [
        {
          number: 'Q1.1',
          category: 'Documentation',
          subcategory: 'Tenancy Agreements',
          questionText: 'Do you use standard tenancy agreement templates?',
          answer: 'Yes, always',
          score: 9,
          color: 'green',
        },
        {
          number: 'Q3.1',
          category: 'Evidence Gathering Systems and Procedures',
          subcategory: 'Photographic Evidence',
          questionText: 'Do you take photos during property inspections?',
          answer: 'Yes, comprehensive photos',
          score: 8,
          color: 'green',
        },
      ],
    },
    
    // Suggested services
    suggestedServices: [
      {
        lowScoringArea: 'Maintenance Request Management',
        suggestedService: 'Property Management Software',
        tier: 'tier_2',
      },
      {
        lowScoringArea: 'Document Storage',
        suggestedService: 'Cloud Document Management',
        tier: 'tier_1',
      },
    ],
  };
}


