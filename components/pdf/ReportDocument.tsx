// Main PDF Report Document
import { Document } from '@react-pdf/renderer';
import { CoverPage } from './pages/CoverPage';
import { TableOfContents } from './pages/TableOfContents';
import { IntroductionPage } from './pages/IntroductionPage';
import { ResultsPage } from './pages/ResultsPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
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
  // Calculate total questions per color
  const totalRed = data.questionResponses.red.length;
  const totalOrange = data.questionResponses.orange.length;
  const totalGreen = data.questionResponses.green.length;
  
  // Estimate starting page for detailed results (after all previous pages)
  // Cover (1) + TOC (1) + Intro (3) + Results (2) + Recommendations (3) = 10 pages minimum
  const detailedResultsStartPage = 13;
  
  return (
    <Document
      title={`Landlord Risk Audit Report - ${data.propertyAddress}`}
      author="Landlord Safeguarding"
      subject="Risk Assessment Report"
      keywords="landlord, audit, risk assessment, compliance, property management"
      creator="Landlord Safeguarding Audit System"
      producer="Landlord Safeguarding"
    >
      {/* Cover Page */}
      <CoverPage
        propertyAddress={data.propertyAddress}
        startDate={data.auditStartDate}
        endDate={data.auditEndDate}
        pillarsChartUrl={pillarsChartUrl}
      />
      
      {/* Table of Contents */}
      <TableOfContents />
      
      {/* Introduction Pages (3 pages) */}
      <IntroductionPage />
      
      {/* Results Pages (2 pages) */}
      <ResultsPage 
        data={data}
        subcategoryChartUrl={subcategoryChartUrl}
      />
      
      {/* Recommendations Pages (3 pages) */}
      <RecommendationsPage data={data} />
      
      {/* Detailed Results Pages (variable) */}
      <DetailedResultsPage
        redQuestions={data.questionResponses.red}
        orangeQuestions={data.questionResponses.orange}
        greenQuestions={data.questionResponses.green}
        startPage={detailedResultsStartPage}
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

