"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Audit } from "@/types/database";
import { questions, getQuestionsByTier, groupQuestionsByCategory, Question } from "@/lib/questions";

// Create dynamic schema based on questions
const createFormSchema = (questionsToValidate: Question[]) => {
  const schema: Record<string, z.ZodTypeAny> = {};
  questionsToValidate.forEach((q) => {
    schema[q.id] = z.union([z.literal(1), z.literal(5), z.literal(10)], {
      message: "Please select an answer",
    });
  });
  return z.object(schema);
};

export default function AuditFormPage() {
  const params = useParams();
  const router = useRouter();
  const [audit, setAudit] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(0);

  const token = params?.token as string;

  // Fetch audit data
  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const response = await fetch(`/api/audits/${token}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Failed to load audit");
          return;
        }

        setAudit(data.audit);
      } catch (error) {
        setError("An error occurred while loading the audit");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchAudit();
    }
  }, [token]);

  // Get questions for this tier
  const relevantQuestions = audit ? getQuestionsByTier(audit.risk_audit_tier) : [];
  const groupedQuestions = groupQuestionsByCategory(relevantQuestions);
  const categories = Object.keys(groupedQuestions);
  const currentCategoryName = categories[currentCategory];
  const currentQuestions = groupedQuestions[currentCategoryName] || [];

  // Form setup
  const formSchema = createFormSchema(relevantQuestions);
  type FormData = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  // Calculate progress
  const allValues = watch();
  const answeredCount = relevantQuestions.filter((q) => {
    const value = allValues[q.id as keyof FormData];
    return value === 1 || value === 5 || value === 10;
  }).length;
  const totalQuestions = relevantQuestions.length;
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  // Submit handler
  const onSubmit = async (data: FormData) => {
    setError("");
    setSubmitting(true);

    try {
      const responses = Object.entries(data).map(([question_id, answer_value]) => ({
        question_id,
        answer_value: answer_value as 1 | 5 | 10,
      }));

      const response = await fetch(`/api/audits/${token}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to submit audit");
        return;
      }

      setSubmitted(true);
    } catch (error) {
      setError("An error occurred while submitting the audit");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading audit...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-green-600">✓ Submission Complete</CardTitle>
            <CardDescription>
              Thank you for completing the Landlord Risk Audit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Your responses have been submitted successfully. The auditor will review your
              submission and generate a compliance report with recommendations.
            </p>
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-blue-900">
                <strong>Audit ID:</strong> {audit?.id}
              </p>
              <p className="text-sm text-blue-900 mt-1">
                <strong>Property:</strong> {audit?.property_address}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Landlord Risk Audit Questionnaire</CardTitle>
            <CardDescription className="text-base leading-relaxed mt-4">
              The Landlord Risk Audit will safeguard you from tenants suing you, going to a
              rental tribunal, trying to halt eviction or complaining to the local Housing
              Officer in order to try to get their rent reduced. The Audit comprises this
              questionnaire and a scored report based on your answers, with recommended actions.
            </CardDescription>
            <CardDescription className="text-base leading-relaxed mt-3">
              Acting on the report will help you set up systems that will continue to safeguard
              you in the future and will also enable you to pass your next Council HMO Licensing
              Inspection.
            </CardDescription>
            <CardDescription className="text-base leading-relaxed mt-3">
              A simple traffic light system is employed in the report to help you quickly
              identify those areas that need the most urgent attention.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm text-gray-600">Client Name:</span>
              <p className="font-medium">{audit?.client_name}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Property Address:</span>
              <p className="font-medium">{audit?.property_address}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Risk Audit Tier:</span>
              <p className="font-medium">{audit?.risk_audit_tier.replace("_", " ").toUpperCase()}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Conducted By:</span>
              <p className="font-medium">{audit?.conducted_by}</p>
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  Progress: {answeredCount} of {totalQuestions} questions answered
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Category Navigation */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-2 flex-wrap">
                {categories.map((category, index) => (
                  <Button
                    key={category}
                    type="button"
                    variant={currentCategory === index ? "default" : "outline"}
                    onClick={() => setCurrentCategory(index)}
                    size="sm"
                  >
                    {index + 1}. {category.split(" ")[0]}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold">
              {currentCategory + 1}. {currentCategoryName}
            </h2>

            {currentQuestions.map((question, index) => (
              <Card key={question.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-base font-medium leading-relaxed">
                      Q{question.id}: {question.text}
                    </CardTitle>
                    {question.critical && (
                      <Badge variant="destructive" className="shrink-0">
                        CRITICAL
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <RadioGroup>
                    {question.options.map((option) => (
                      <div key={option.value} className="flex items-start space-x-2 mb-3">
                        <input
                          type="radio"
                          id={`${question.id}-${option.value}`}
                          value={option.value}
                          {...register(question.id as any)}
                          className="mt-1"
                        />
                        <Label
                          htmlFor={`${question.id}-${option.value}`}
                          className="font-normal cursor-pointer leading-relaxed"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {errors[question.id as keyof typeof errors] && (
                    <p className="text-sm text-red-600 mt-2">
                      {errors[question.id as keyof typeof errors]?.message as string}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Navigation */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentCategory(Math.max(0, currentCategory - 1))}
                  disabled={currentCategory === 0}
                >
                  Previous Section
                </Button>

                {currentCategory < categories.length - 1 ? (
                  <Button
                    type="button"
                    onClick={() => setCurrentCategory(currentCategory + 1)}
                  >
                    Next Section
                  </Button>
                ) : (
                  <Button type="submit" disabled={submitting || progress < 100}>
                    {submitting ? "Submitting..." : "Submit Audit"}
                  </Button>
                )}
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded mt-4 text-sm">
                  {error}
                </div>
              )}

              {progress < 100 && currentCategory === categories.length - 1 && (
                <div className="bg-yellow-50 text-yellow-800 p-3 rounded mt-4 text-sm">
                  Please answer all questions before submitting.
                </div>
              )}
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}

