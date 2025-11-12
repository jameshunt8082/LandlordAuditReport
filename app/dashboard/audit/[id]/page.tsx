"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Audit, FormResponse, Note } from "@/types/database";
import { questions } from "@/lib/questions";
import { CategoryScore, OverallScore, RecommendedAction } from "@/lib/scoring";
import { FileText } from "lucide-react";

interface ReviewData {
  audit: Audit;
  responses: FormResponse[];
  scores: {
    categoryScores: CategoryScore[];
    overallScore: OverallScore;
    recommendedActions: RecommendedAction[];
  } | null;
  notes: Note[];
}

export default function AuditReviewPage() {
  const params = useParams();
  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const auditId = params?.id as string;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/audits/review/${auditId}`);
        const result = await response.json();

        if (!response.ok) {
          setError(result.error || "Failed to load audit");
          return;
        }

        setData(result);
      } catch (error) {
        setError("An error occurred while loading the audit");
      } finally {
        setLoading(false);
      }
    };

    if (auditId) {
      fetchData();
    }
  }, [auditId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error || "Failed to load audit"}</p>
        </CardContent>
      </Card>
    );
  }

  const { audit, responses, scores } = data;

  const getRiskBadge = (riskLevel: string) => {
    const colors = {
      low: "bg-green-100 text-green-700 border-green-300",
      medium: "bg-yellow-100 text-yellow-700 border-yellow-300",
      high: "bg-red-100 text-red-700 border-red-300",
    };
    return colors[riskLevel as keyof typeof colors] || "";
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      critical: "bg-red-600 text-white",
      high: "bg-orange-500 text-white",
      medium: "bg-yellow-500 text-white",
      low: "bg-blue-500 text-white",
    };
    return colors[priority as keyof typeof colors] || "";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">{audit.client_name}</h1>
          <p className="text-gray-600 mt-1">{audit.property_address}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard">
            <Button variant="outline">← Back to Dashboard</Button>
          </Link>
          <Link href={`/dashboard/audit/${auditId}/report`}>
            <Button className="bg-green-600 hover:bg-green-700">
              <FileText className="mr-2 h-4 w-4" />
              Generate PDF Report
            </Button>
          </Link>
        </div>
      </div>

      {/* Overall Score */}
      {scores && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Overall Compliance Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="text-6xl font-bold">{scores.overallScore.score}</div>
              <div className="flex-1">
                <Progress
                  value={(scores.overallScore.score / 10) * 100}
                  className="h-4 mb-2"
                />
                <Badge className={`${getRiskBadge(scores.overallScore.riskLevel)} text-lg px-4 py-1`}>
                  {scores.overallScore.riskLevel.toUpperCase()} RISK
                </Badge>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Score Range: 1-10 | 
              🟢 Green (7.5-10) = Low Risk | 
              🟡 Yellow (4.0-7.4) = Medium Risk | 
              🔴 Red (1.0-3.9) = High Risk
            </p>
          </CardContent>
        </Card>
      )}

      {/* Category Scores */}
      {scores && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Category Breakdown</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {scores.categoryScores.map((category) => (
              <Card key={category.category}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold">{category.score}</div>
                    <Progress value={category.percentage} className="h-2" />
                    <Badge className={getRiskBadge(category.riskLevel)}>
                      {category.riskLevel.toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Actions */}
      {scores && scores.recommendedActions.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Recommended Actions</h2>
          <div className="space-y-4">
            {scores.recommendedActions.map((action, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getPriorityBadge(action.priority)}>
                          {action.priority.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          Q{action.questionId}
                        </span>
                      </div>
                      <CardTitle className="text-base">
                        {action.questionText}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Current Status:
                    </span>
                    <p className="text-sm mt-1">{action.currentAnswer}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Recommendation:
                    </span>
                    <p className="text-sm mt-1">{action.recommendation}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded">
                    <span className="text-sm font-medium text-blue-900">
                      ⏱ Timeframe: {action.timeframe}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Responses */}
      <div>
        <h2 className="text-2xl font-bold mb-4">All Responses</h2>
        <div className="space-y-3">
          {responses.map((response) => {
            const question = questions.find((q) => q.id === response.question_id);
            if (!question) return null;

            const selectedOption = question.options.find(
              (opt) => opt.value === response.answer_value
            );

            return (
              <Card key={response.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-sm font-medium">
                      Q{question.id}: {question.text}
                    </CardTitle>
                    <div className="flex gap-2 shrink-0">
                      {question.critical && (
                        <Badge variant="destructive" className="text-xs">
                          CRITICAL
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {response.answer_value}/10
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">
                    {selectedOption?.label || "No answer"}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Audit Info */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <span className="text-sm text-gray-600">Audit ID:</span>
            <p className="font-medium">{audit.id}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Status:</span>
            <p className="font-medium capitalize">{audit.status}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Risk Tier:</span>
            <p className="font-medium">{audit.risk_audit_tier.replace("_", " ").toUpperCase()}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Conducted By:</span>
            <p className="font-medium">{audit.conducted_by}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Created:</span>
            <p className="font-medium">
              {new Date(audit.created_at).toLocaleDateString("en-GB")}
            </p>
          </div>
          {audit.submitted_at && (
            <div>
              <span className="text-sm text-gray-600">Submitted:</span>
              <p className="font-medium">
                {new Date(audit.submitted_at).toLocaleDateString("en-GB")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

