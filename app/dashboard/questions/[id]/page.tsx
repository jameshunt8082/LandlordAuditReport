"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const questionFormSchema = z.object({
  category: z.string().min(1, "Category is required"),
  sub_category: z.string().min(1, "Sub-category is required"),
  question_text: z.string().min(10, "Question must be at least 10 characters"),
  question_type: z.enum(["yes_no", "multiple_choice"]),
  applicable_tiers: z.array(z.string()).min(1, "Select at least one tier"),
  weight: z.number().min(0.5).max(2.0),
  is_critical: z.boolean(),
  motivation_learning_point: z.string().optional(),
  answer_options: z.array(
    z.object({
      option_text: z.string().min(1, "Option text required"),
      score_value: z.number().min(1).max(10),
      is_example: z.boolean(),
    })
  ).min(2),
  score_examples: z.object({
    low_reason: z.string().optional(),
    low_action: z.string().optional(),
    medium_reason: z.string().optional(),
    medium_action: z.string().optional(),
    high_reason: z.string().optional(),
    high_action: z.string().optional(),
  }),
});

type FormData = z.infer<typeof questionFormSchema>;

export default function EditQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const questionId = params?.id as string;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<{category: string; sub_categories: string[]}[]>([]);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(questionFormSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "answer_options",
  });

  const questionType = watch("question_type");
  const selectedCategory = watch("category");

  // Fetch categories
  useEffect(() => {
    fetch("/api/questions/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(console.error);
  }, []);

  // Fetch question data
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await fetch(`/api/admin/questions/${questionId}`);
        if (!response.ok) {
          setError("Failed to load question");
          setLoading(false);
          return;
        }

        const data = await response.json();
        const question = data.question;

        // Convert PostgreSQL array to JavaScript array
        let tiersArray = [];
        if (Array.isArray(question.applicable_tiers)) {
          tiersArray = question.applicable_tiers;
        } else if (typeof question.applicable_tiers === 'string') {
          // Handle {tier_0,tier_1} format
          tiersArray = question.applicable_tiers
            .replace(/[{}]/g, '')
            .split(',')
            .filter(Boolean);
        }

        // Parse score_examples
        const scoreExamples = question.score_examples || [];
        const lowExample = scoreExamples.find((ex: any) => ex.score_level === 'low');
        const mediumExample = scoreExamples.find((ex: any) => ex.score_level === 'medium');
        const highExample = scoreExamples.find((ex: any) => ex.score_level === 'high');

        // Reset form with question data
        reset({
          category: question.category,
          sub_category: question.sub_category,
          question_text: question.question_text,
          question_type: question.question_type,
          applicable_tiers: tiersArray,
          weight: parseFloat(question.weight),
          is_critical: question.is_critical,
          motivation_learning_point: question.motivation_learning_point || "",
          answer_options: (question.answer_options || []).map((opt: any) => ({
            option_text: opt.option_text,
            score_value: opt.score_value,
            is_example: opt.is_example || false,
          })),
          score_examples: {
            low_reason: lowExample?.reason_text || "",
            low_action: lowExample?.report_action || "",
            medium_reason: mediumExample?.reason_text || "",
            medium_action: mediumExample?.report_action || "",
            high_reason: highExample?.reason_text || "",
            high_action: highExample?.report_action || "",
          },
        });

        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch question:", error);
        setError("An error occurred while loading the question");
        setLoading(false);
      }
    };

    if (questionId) {
      fetchQuestion();
    }
  }, [questionId, reset]);

  // Auto-set answer options when type changes
  useEffect(() => {
    if (questionType === "yes_no" && fields.length !== 2) {
      setValue("answer_options", [
        { option_text: "Yes", score_value: 10, is_example: false },
        { option_text: "No", score_value: 1, is_example: false },
      ]);
    }
  }, [questionType, fields.length, setValue]);

  const onSubmit = async (data: FormData) => {
    setError("");
    setSubmitting(true);

    try {
      // Transform score_examples from flat object to array
      const score_examples = [];
      if (data.score_examples.low_reason) {
        score_examples.push({
          score_level: "low" as const,
          reason_text: data.score_examples.low_reason,
          report_action: data.score_examples.low_action || "",
        });
      }
      if (data.score_examples.medium_reason) {
        score_examples.push({
          score_level: "medium" as const,
          reason_text: data.score_examples.medium_reason,
          report_action: data.score_examples.medium_action || "",
        });
      }
      if (data.score_examples.high_reason) {
        score_examples.push({
          score_level: "high" as const,
          reason_text: data.score_examples.high_reason,
          report_action: data.score_examples.high_action || "",
        });
      }

      const payload = {
        ...data,
        score_examples,
      };

      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to update question");
        return;
      }

      router.push("/dashboard/questions");
      router.refresh();
    } catch (error) {
      setError("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    setDeactivating(true);
    try {
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        setError(result.error || "Failed to deactivate question");
        return;
      }

      router.push("/dashboard/questions");
      router.refresh();
    } catch (error) {
      setError("An error occurred");
    } finally {
      setDeactivating(false);
      setShowDeactivateConfirm(false);
    }
  };

  const currentCategory = categories.find((c) => c.category === selectedCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Loading question...</p>
      </div>
    );
  }

  if (error && !submitting) {
    return (
      <div className="max-w-4xl space-y-6">
        <div className="bg-red-50 text-red-600 p-4 rounded">
          {error}
        </div>
        <Link href="/dashboard/questions">
          <Button variant="outline">← Back to Questions</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Edit Question</h2>
          <p className="text-gray-600 mt-2">
            Update question details, answer options, and scoring
          </p>
        </div>
        <Link href="/dashboard/questions">
          <Button variant="outline">← Back</Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  {...register("category")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.category} value={cat.category}>
                      {cat.category}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sub_category">Sub-Category *</Label>
                <select
                  id="sub_category"
                  {...register("sub_category")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  disabled={!selectedCategory}
                >
                  <option value="">Select sub-category</option>
                  {currentCategory?.sub_categories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
                {errors.sub_category && (
                  <p className="text-sm text-red-600">{errors.sub_category.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="question_text">Question Text *</Label>
              <Textarea
                id="question_text"
                {...register("question_text")}
                placeholder="Enter the audit question..."
                rows={3}
              />
              {errors.question_text && (
                <p className="text-sm text-red-600">{errors.question_text.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_critical"
                {...register("is_critical")}
                className="h-4 w-4 cursor-pointer"
              />
              <Label htmlFor="is_critical" className="cursor-pointer">
                Mark as <Badge variant="destructive" className="ml-1">CRITICAL</Badge> question
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Question Type & Answers */}
        <Card>
          <CardHeader>
            <CardTitle>Answer Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Question Type *</Label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    value="multiple_choice"
                    {...register("question_type")}
                    className="h-4 w-4"
                  />
                  <span>Multiple Choice</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    value="yes_no"
                    {...register("question_type")}
                    className="h-4 w-4"
                  />
                  <span>Yes/No</span>
                </label>
              </div>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-start">
                  <div className="flex-1 space-y-2">
                    <Input
                      {...register(`answer_options.${index}.option_text`)}
                      placeholder="Answer option text"
                      disabled={questionType === "yes_no"}
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      {...register(`answer_options.${index}.score_value`, {
                        valueAsNumber: true,
                      })}
                      placeholder="Score"
                      min={1}
                      max={10}
                    />
                  </div>
                  {questionType === "multiple_choice" && fields.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      ✕
                    </Button>
                  )}
                </div>
              ))}
              {errors.answer_options && (
                <p className="text-sm text-red-600">
                  {errors.answer_options.message || "Check answer options"}
                </p>
              )}
            </div>

            {questionType === "multiple_choice" && fields.length < 5 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ option_text: "", score_value: 5, is_example: false })
                }
              >
                + Add Option
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Tiers & Weight */}
        <Card>
          <CardHeader>
            <CardTitle>Tiers & Weighting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Applicable Tiers *</Label>
              <div className="flex gap-3 flex-wrap">
                {["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"].map((tier) => (
                  <label key={tier} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      value={tier}
                      {...register("applicable_tiers")}
                      className="h-4 w-4"
                    />
                    <span>{tier.replace("_", " ").toUpperCase()}</span>
                  </label>
                ))}
              </div>
              {errors.applicable_tiers && (
                <p className="text-sm text-red-600">{errors.applicable_tiers.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weighting Factor * (0.5 - 2.0)</Label>
              <Input
                id="weight"
                type="number"
                step="0.5"
                min="0.5"
                max="2.0"
                {...register("weight", { valueAsNumber: true })}
              />
              <p className="text-xs text-gray-500">
                Higher weight = more impact on overall score. Standard = 1.0, Critical = 2.0
              </p>
              {errors.weight && (
                <p className="text-sm text-red-600">{errors.weight.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Scoring Guidance */}
        <Card>
          <CardHeader>
            <CardTitle>Scoring Guidance</CardTitle>
            <CardDescription>
              Provide context for each score level to guide recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="motivation">Motivation/Learning Point</Label>
              <Textarea
                id="motivation"
                {...register("motivation_learning_point")}
                placeholder="Why is this question important? What should landlords learn?"
                rows={2}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-red-600">Low Score (1-3)</Label>
                <Textarea
                  {...register("score_examples.low_reason")}
                  placeholder="Reason for low score"
                  rows={2}
                />
                <Textarea
                  {...register("score_examples.low_action")}
                  placeholder="Recommended action"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-yellow-600">Medium Score (4-7)</Label>
                <Textarea
                  {...register("score_examples.medium_reason")}
                  placeholder="Reason for medium score"
                  rows={2}
                />
                <Textarea
                  {...register("score_examples.medium_action")}
                  placeholder="Recommended action"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-green-600">High Score (8-10)</Label>
                <Textarea
                  {...register("score_examples.high_reason")}
                  placeholder="Reason for high score"
                  rows={2}
                />
                <Textarea
                  {...register("score_examples.high_action")}
                  placeholder="Recommended action"
                  rows={2}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit & Deactivate */}
        <div className="flex justify-between items-center">
          <Button
            type="button"
            variant="destructive"
            onClick={() => setShowDeactivateConfirm(true)}
            disabled={deactivating}
          >
            {deactivating ? "Deactivating..." : "Deactivate Question"}
          </Button>

          <div className="flex gap-3">
            <Link href="/dashboard/questions">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>

      {/* Deactivate Confirmation Dialog */}
      {showDeactivateConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Deactivate Question?</CardTitle>
              <CardDescription>
                Are you sure you want to deactivate this question? It will no longer appear in new audits, but existing audit data will be preserved.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeactivateConfirm(false)}
                disabled={deactivating}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeactivate}
                disabled={deactivating}
              >
                {deactivating ? "Deactivating..." : "Yes, Deactivate"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

