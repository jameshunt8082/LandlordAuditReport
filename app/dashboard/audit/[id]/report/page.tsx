"use client";

import { useEffect, useState } from "react";
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

      const response = await fetch(`/api/reports/${auditId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate report");
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1]?.replace(/"/g, "")
        : `audit-report-${auditId}.pdf`;

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Also set for preview
      setPdfUrl(url);
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
          <p>
            The PDF report includes a comprehensive analysis of the landlord audit results, including:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Professional cover page with audit metadata and date range</li>
            <li>Executive Summary with overall compliance score, risk classification, and compliance overview table</li>
            <li>Introduction and methodology with traffic light scoring system explanation</li>
            <li>Risk Rating page with tier classifications (Tier 0-4)</li>
            <li>Results page with category and subcategory score breakdowns</li>
            <li>Recommendations page with prioritized actions by impact level (Legal Exposure, Tribunal Risk, Best Practice)</li>
            <li>Legal Compliance Status with statutory requirements assessment</li>
            <li>Evidence Summary documenting compliance across all areas</li>
            <li>Action Plan with prioritized timeline (0-7 days, 30 days, 90 days)</li>
            <li>Detailed Results with complete question-by-question breakdown, answers, and comments organized by score level (Red/Orange/Green)</li>
          </ul>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> The first generation may take 3-5 seconds. Subsequent downloads 
              will be instant thanks to caching. The report is cached for 24 hours after generation.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

