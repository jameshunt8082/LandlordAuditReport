// Main PDF Report Document
import { Document } from '@react-pdf/renderer';
import { CoverPage } from './pages/CoverPage';
import { ExecutiveSummary } from './pages/ExecutiveSummary';
import { CriticalFindingsPage } from './pages/CriticalFindingsPage';
import { TableOfContents } from './pages/TableOfContents';
import { MethodologyPage } from './pages/MethodologyPage';
import { RiskRatingPage } from './pages/RiskRatingPage';
import { ComplianceStatusPage } from './pages/ComplianceStatusPage';
import { EvidenceSummaryPage } from './pages/EvidenceSummaryPage';
import { IntroductionPage } from './pages/IntroductionPage';
import { ResultsPage } from './pages/ResultsPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { ActionPlanPage } from './pages/ActionPlanPage';
import { DetailedResultsPage } from './pages/DetailedResultsPage';
import { ReportData, sanitizeAddressForFilename } from '@/lib/pdf/formatters';

interface ReportDocumentProps {
  data: ReportData;
  pillarsChartUrl: string;
  subcategoryChartUrl: string;
}

export const ReportDocument = ({ 
  data, 
  pillarsChartUrl, 
  subcategoryChartUrl 
}: ReportDocumentProps) => {
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
      author="Landlord Safeguarding"
      subject="Risk Assessment Report"
      keywords="landlord, audit, risk assessment, compliance, property management"
      creator="Landlord Safeguarding Audit System"
      producer="Landlord Safeguarding"
    >
      {/* Cover Page - Enhanced with metadata */}
      <CoverPage
        propertyAddress={data.propertyAddress}
        startDate={data.auditStartDate}
        endDate={data.auditEndDate}
        pillarsChartUrl={pillarsChartUrl}
        reportId={reportId}
        landlordName={data.landlordName}
        auditorName={data.auditorName}
        overallScore={data.overallScore}
        riskTier={data.riskTier}
      />
      
      {/* Executive Summary */}
      <ExecutiveSummary
        data={data}
        reportId={reportId}
        criticalFindings={criticalFindings}
      />
      
      {/* Critical Findings Summary - FASE 2 (if critical items exist) */}
      {data.questionResponses.red.length > 0 && (
        <CriticalFindingsPage criticalQuestions={data.questionResponses.red} />
      )}
      
      {/* Table of Contents - REMOVED: Hardcoded page numbers don't match dynamic structure */}
      {/* TODO: Re-implement with dynamic page calculation or remove permanently */}
      
      {/* Methodology & Scope - FASE 2 */}
      <MethodologyPage data={data} auditScope={auditScope} />
      
      {/* Risk Rating Definition */}
      <RiskRatingPage />
      
      {/* Legal Compliance Status */}
      <ComplianceStatusPage data={data} />
      
      {/* Evidence Summary - FASE 2 */}
      <EvidenceSummaryPage data={data} />
      
      {/* Introduction Pages (3 pages) */}
      <IntroductionPage />
      
      {/* Results Pages (2 pages) */}
      <ResultsPage 
        data={data}
        subcategoryChartUrl={subcategoryChartUrl}
      />
      
      {/* Recommendations Pages (3 pages) */}
      <RecommendationsPage data={data} />
      
      {/* Action Plan with Timeline - NEW */}
      <ActionPlanPage data={data} />
      
      {/* Detailed Results Pages (variable) */}
      <DetailedResultsPage
        redQuestions={data.questionResponses.red}
        orangeQuestions={data.questionResponses.orange}
        greenQuestions={data.questionResponses.green}
      />
    </Document>
  );
};

/**
 * Generate filename for PDF report
 */
export function generateReportFilename(data: ReportData): string {
  const sanitizedAddress = sanitizeAddressForFilename(data.propertyAddress);
  const date = data.auditEndDate.toISOString().split('T')[0];
  return `landlord-audit-report-${sanitizedAddress}-${date}.pdf`;
}

