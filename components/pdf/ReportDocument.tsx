// Main PDF Report Document
import { Document } from '@react-pdf/renderer';
import { CoverPage } from './pages/CoverPage';
import { ExecutiveSummary } from './pages/ExecutiveSummary';
import { CriticalFindingsPage } from './pages/CriticalFindingsPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { RiskRatingPage } from './pages/RiskRatingPage';
import { ComplianceStatusPage } from './pages/ComplianceStatusPage';
import { EvidenceSummaryPage } from './pages/EvidenceSummaryPage';
import { IntroductionPage } from './pages/IntroductionPage';
import { ResultsPage } from './pages/ResultsPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { ActionPlanPage } from './pages/ActionPlanPage';
import { DetailedResultsPage } from './pages/DetailedResultsPage';
import { ReportData, sanitizeAddressForFilename, formatReportDate } from '@/lib/pdf/formatters';

interface ReportDocumentProps {
  data: ReportData;
}

const ReportDocument = ({ 
  data
}: ReportDocumentProps) => {
  // Validate required data exists
  if (!data) {
    console.error('[ReportDocument] No data provided');
    throw new Error('Report data is required');
  }
  
  if (!data.propertyAddress) {
    console.error('[ReportDocument] Missing propertyAddress');
    throw new Error('Property address is required');
  }
  
  if (!data.landlordName) {
    console.error('[ReportDocument] Missing landlordName');
    throw new Error('Landlord name is required');
  }
  
  // Generate reproducible report ID based on property address hash
  const addressHash = data.propertyAddress
    .split('')
    .reduce((hash, char) => ((hash << 5) - hash) + char.charCodeAt(0), 0)
    .toString(36)
    .substring(0, 6)
    .toUpperCase();
  const reportId = `LRA-${data.auditEndDate.getFullYear()}-${String(data.auditEndDate.getMonth() + 1).padStart(2, '0')}-${addressHash}`;
  
  // Extract critical findings (red questions)
  const criticalFindings = data.questionResponses.red.map(q => 
    `${q.subcategory}: ${q.questionText.substring(0, 120)}${q.questionText.length > 120 ? '...' : ''}`
  );
  
  // Audit scope (for methodology page)
  const auditScope = {
    documentationReviewed: true,
    siteInspection: false, // Documentation review only
    tenantInterviews: false,
    recordsExamined: true,
  };
  
  // No manual page calculation needed - React-PDF handles pagination dynamically
  
  return (
    <Document
      title={`Landlord Risk Audit Report - ${data.propertyAddress}`}
      author="Landlord Safeguarding Ltd"
      subject="Risk Assessment Report"
      keywords="landlord, audit, risk assessment, compliance, property management"
      creator="Landlord Safeguarding Audit System"
      producer="Landlord Safeguarding Ltd"
    >
      {/* Cover Page - Clean and professional (no charts) */}
      <CoverPage
        propertyAddress={String(data.propertyAddress)}
        startDate={formatReportDate(data.auditStartDate)}
        endDate={formatReportDate(data.auditEndDate)}
        reportId={String(reportId)}
        landlordName={String(data.landlordName)}
        auditorName={String(data.auditorName)}
        overallScore={Number(data.overallScore)}
        riskTier={String(data.riskTier)}
      />
      
      {/* Executive Summary */}
      <ExecutiveSummary
        data={data}
        reportId={reportId}
        criticalFindings={criticalFindings}
      />
      
      {/* Critical Findings Summary (if critical items exist) */}
      {data.questionResponses.red.length > 0 ? (
        <CriticalFindingsPage criticalQuestions={data.questionResponses.red} />
      ) : null}
      
      {/* Methodology & Scope */}
      <MethodologyPage data={data} auditScope={auditScope} />
      
      {/* Risk Rating Definition */}
      <RiskRatingPage />
      
      {/* Legal Compliance Status */}
      <ComplianceStatusPage data={data} />
      
      {/* Evidence Summary */}
      <EvidenceSummaryPage data={data} />
      
      {/* Introduction Pages */}
      <IntroductionPage />
      
      {/* Results Pages */}
      <ResultsPage data={data} />
      
      {/* Recommendations Pages */}
      <RecommendationsPage data={data} />
      
      {/* Action Plan with Timeline */}
      <ActionPlanPage data={data} />
      
      {/* Detailed Results Pages */}
      <DetailedResultsPage
        redQuestions={data.questionResponses.red}
        orangeQuestions={data.questionResponses.orange}
        greenQuestions={data.questionResponses.green}
      />
    </Document>
  );
};

// Export as default for better Vercel compatibility
export default ReportDocument;

/**
 * Generate filename for PDF report
 */
export function generateReportFilename(data: ReportData): string {
  const sanitizedAddress = sanitizeAddressForFilename(data.propertyAddress);
  const date = data.auditEndDate.toISOString().split('T')[0];
  return `landlord-audit-report-${sanitizedAddress}-${date}.pdf`;
}

// Also export as named export for backwards compatibility
export { ReportDocument };

