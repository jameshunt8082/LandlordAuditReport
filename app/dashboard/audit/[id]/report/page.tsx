"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileDown, ArrowLeft, Loader2 } from "lucide-react";

export default function ReportPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [auditInfo, setAuditInfo] = useState<{
    propertyAddress: string;
    clientName: string;
    overallScore?: number;
  } | null>(null);

  const auditId = params?.id as string;

  useEffect(() => {
    const loadAuditInfo = async () => {
      try {
        // Fetch audit details first
        const response = await fetch(`/api/audits/review/${auditId}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Failed to load audit");
          setLoading(false);
          return;
        }

        setAuditInfo({
          propertyAddress: data.audit.property_address,
          clientName: data.audit.client_name,
          overallScore: data.scores?.overallScore?.score,
        });
        
        setLoading(false);
      } catch (error) {
        setError("An error occurred while loading the audit");
        setLoading(false);
      }
    };

    if (auditId) {
      loadAuditInfo();
    }
  }, [auditId]);

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      setError("");

      // Try SERVER-side first (will likely fail)
      console.log('[PDF] Attempting server-side generation...');
      const response = await fetch(`/api/reports/${auditId}`);

      if (response.ok) {
        // Server worked!
        const contentDisposition = response.headers.get("Content-Disposition");
        const filename = contentDisposition
          ? contentDisposition.split("filename=")[1]?.replace(/"/g, "")
          : `audit-report-${auditId}.pdf`;

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setPdfUrl(url);
        console.log('[PDF] ✅ Server-side generation worked!');
      } else {
        // Server failed, fallback to CLIENT-SIDE with complete jsPDF generator
        console.log('[PDF] Server failed, using client-side jsPDF...');
        
        console.log('[PDF] Fetching complete audit data...');
        
        // Fetch complete audit data
        const auditResponse = await fetch(`/api/audits/review/${auditId}`);
        if (!auditResponse.ok) {
          throw new Error('Failed to fetch audit data');
        }
        
        const auditData = await auditResponse.json();
        console.log('[PDF] Audit data fetched:', {
          audit: auditData.audit?.id,
          responses: auditData.responses?.length,
          questions: auditData.questions?.length,
          scores: auditData.scores ? 'present' : 'missing',
        });
        
        // Validate required data exists
        if (!auditData.audit) {
          throw new Error('Audit data missing');
        }
        if (!auditData.responses || auditData.responses.length === 0) {
          throw new Error('No responses found');
        }
        if (!auditData.questions || auditData.questions.length === 0) {
          throw new Error('No questions found');
        }
        if (!auditData.scores) {
          throw new Error('Scores data missing');
        }
        
        console.log('[PDF] Data validation passed');
        
        // Import complete generator and data transformer
        const { generateCompletePDF } = await import('@/lib/pdf-client/generator');
        const { transformAuditToReportData } = await import('@/lib/pdf/formatters');
        
        console.log('[PDF] Transforming audit data to report format...');
        
        // Transform to ReportData format
        const reportData = transformAuditToReportData(
          auditData.audit,
          auditData.responses,
          auditData.questions,
          auditData.scores
        );
        
        console.log('[PDF] Generating complete PDF...');
        
        // Generate complete PDF
        const doc = await generateCompletePDF(reportData);
        
        console.log('[PDF] Saving PDF...');
        doc.save(`landlord-audit-report-${auditId}.pdf`);
        
        console.log('[PDF] ✅ Complete client-side PDF generation succeeded!');
      }
    } catch (error) {
      console.error("Download error:", error);
      setError((error as Error).message);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading audit information...</p>
        </div>
      </div>
    );
  }

  if (error && !auditInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{error}</p>
          <Link href={`/dashboard/audit/${auditId}`}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Review
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">PDF Report</h1>
          {auditInfo && (
            <>
              <p className="text-gray-600 mt-1">{auditInfo.clientName}</p>
              <p className="text-sm text-gray-500">{auditInfo.propertyAddress}</p>
            </>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/audit/${auditId}`}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Review
            </Button>
          </Link>
          <Button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="bg-green-600 hover:bg-green-700"
          >
            {downloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Metadata Card */}
      {auditInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Report Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Property</p>
                <p className="font-semibold">{auditInfo.propertyAddress}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Client</p>
                <p className="font-semibold">{auditInfo.clientName}</p>
              </div>
              {auditInfo.overallScore !== undefined && (
                <div>
                  <p className="text-sm text-gray-600">Overall Score</p>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-2xl">{auditInfo.overallScore.toFixed(1)}</p>
                    <Badge
                      className={
                        auditInfo.overallScore >= 7.5
                          ? "bg-green-100 text-green-700 border-green-300"
                          : auditInfo.overallScore >= 4.0
                          ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                          : "bg-red-100 text-red-700 border-red-300"
                      }
                    >
                      {auditInfo.overallScore >= 7.5
                        ? "LOW RISK"
                        : auditInfo.overallScore >= 4.0
                        ? "MEDIUM RISK"
                        : "HIGH RISK"}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle>About the PDF Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            This comprehensive PDF report transforms audit data into actionable insights that protect your business and demonstrate compliance:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Identify legal risks instantly</strong> - See your overall compliance score and risk tier at a glance to understand exposure to prosecution, fines, or prohibition orders</li>
            <li><strong>Know exactly what to fix first</strong> - Prioritized action plan tells you which issues require immediate attention (0-7 days) vs. medium-term improvements (30-90 days)</li>
            <li><strong>Protect against prosecution</strong> - Clear documentation of statutory compliance status shows you&apos;re meeting legal obligations and acting on identified gaps</li>
            <li><strong>Avoid tribunal disputes</strong> - Systematic evidence tracking demonstrates due diligence in property management and tenant communications</li>
            <li><strong>Understand your scoring</strong> - Traffic light system (Red/Orange/Green) makes it easy to see which areas are critical vs. performing well</li>
            <li><strong>Get specific recommendations</strong> - Each low-scoring area includes targeted actions and suggested improvements, not just problems</li>
            <li><strong>Track improvements over time</strong> - Detailed question-by-question breakdown serves as a baseline for future audits and demonstrates progress</li>
            <li><strong>Professional documentation</strong> - Court-ready report suitable for presenting to solicitors, insurers, or council inspectors if needed</li>
          </ul>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> First generation takes 3-5 seconds. After that, downloads are instant for 24 hours. 
              Share this report with your legal advisor or use it to demonstrate compliance to your insurer.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

