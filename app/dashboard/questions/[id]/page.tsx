"use client";

import { useState, useEffect, useCallback } from "react";
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
import { ChevronRight, AlertCircle, Info } from "lucide-react";

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
  const [questionNumber, setQuestionNumber] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(questionFormSchema),
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "answer_options",
  });

  const questionType = watch("question_type");
  const selectedCategory = watch("category");

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(isDirty);
  }, [isDirty]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + S to save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSubmit(onSubmit)();
      }
      // Esc to close modal
      if (e.key === 'Escape' && showDeactivateConfirm) {
        setShowDeactivateConfirm(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDeactivateConfirm]);

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

        setQuestionNumber(question.question_number);

        // Convert PostgreSQL array to JavaScript array
        let tiersArray = [];
        if (Array.isArray(question.applicable_tiers)) {
          tiersArray = question.applicable_tiers;
        } else if (typeof question.applicable_tiers === 'string') {
          tiersArray = question.applicable_tiers
            .replace(/[{}]/g, '')
            .split(',')
            .filter(Boolean);
        }

        // Parse score_examples (handle both array and null)
        const scoreExamples = Array.isArray(question.score_examples) ? question.score_examples : [];
        const lowExample = scoreExamples.find((ex: any) => ex.score_level === 'low');
        const mediumExample = scoreExamples.find((ex: any) => ex.score_level === 'medium');
        const highExample = scoreExamples.find((ex: any) => ex.score_level === 'high');

        // Parse answer_options (handle both array and JSON string)
        let answerOptions = [];
        if (Array.isArray(question.answer_options)) {
          answerOptions = question.answer_options;
        } else if (typeof question.answer_options === 'string') {
          try {
            answerOptions = JSON.parse(question.answer_options);
          } catch (e) {
            answerOptions = [];
          }
        }

        // Map answer options correctly
        const mappedOptions = answerOptions
          .filter((opt: any) => opt && opt.option_text) // Filter out null/invalid entries
          .map((opt: any) => ({
            option_text: String(opt.option_text || ""),
            score_value: Number(opt.score_value || 5),
            is_example: Boolean(opt.is_example),
          }));

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
          answer_options: mappedOptions.length > 0 ? mappedOptions : [
            { option_text: "", score_value: 10, is_example: false },
            { option_text: "", score_value: 1, is_example: false },
          ],
          score_examples: {
            low_reason: lowExample?.reason_text || "",
            low_action: lowExample?.report_action || "",
            medium_reason: mediumExample?.reason_text || "",
            medium_action: mediumExample?.report_action || "",
            high_reason: highExample?.reason_text || "",
            high_action: highExample?.report_action || "",
          },
        });

        // Update field array
        const fieldsToSet = mappedOptions.length > 0 ? mappedOptions : [
          { option_text: "", score_value: 10, is_example: false },
          { option_text: "", score_value: 1, is_example: false },
        ];
        
        replace(fieldsToSet);
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
  }, [questionId, reset, replace]);

  // Auto-set answer options when type changes
  useEffect(() => {
    if (questionType === "yes_no" && fields.length !== 2) {
      replace([
        { option_text: "Yes", score_value: 10, is_example: false },
        { option_text: "No", score_value: 1, is_example: false },
      ]);
    }
  }, [questionType, fields.length, replace]);

  const onSubmit = async (data: FormData) => {
    setError("");
    setSubmitting(true);

    try {
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Skeleton loader */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg p-6 mb-4">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && !submitting) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Error Loading Question</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
        <Link href="/dashboard/questions">
          <Button variant="outline">← Back to Questions</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-gray-600 mb-4">
        <Link href="/dashboard/questions" className="hover:text-gray-900">
          Questions
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-gray-900 font-medium">Edit</span>
        {questionNumber && (
          <>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-gray-900 font-medium">Q{questionNumber}</span>
          </>
        )}
      </nav>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">Edit Question</h1>
          {questionNumber && (
            <Badge variant="outline" className="text-lg px-3 py-1">
              Q{questionNumber}
            </Badge>
          )}
        </div>
        <p className="text-gray-600">
          Update question details, answer options, and scoring
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
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
                <Label htmlFor="category">
                  Category <span className="text-red-500">*</span>
                </Label>
                <select
                  id="category"
                  {...register("category")}
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.category} value={cat.category}>
                      {cat.category}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.category.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sub_category">
                  Sub-Category <span className="text-red-500">*</span>
                </Label>
                <select
                  id="sub_category"
                  {...register("sub_category")}
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.sub_category.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="question_text">
                Question Text <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="question_text"
                {...register("question_text")}
                placeholder="Enter the audit question..."
                rows={3}
                className="resize-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              {errors.question_text && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.question_text.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="motivation_learning_point" className="flex items-center gap-2">
                Motivation / Learning Point
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600"
                  title="Expert explanation shown to landlords. Direct, professional tone explaining legal consequences and risks."
                >
                  <Info className="w-4 h-4" />
                </button>
              </Label>
              <Textarea
                id="motivation_learning_point"
                {...register("motivation_learning_point")}
                placeholder="Why this question matters: explain legal consequences, fines, tribunal risks..."
                rows={3}
                className="resize-none focus-visible:ring-2 focus-visible:ring-ring text-sm italic text-gray-600"
              />
              <p className="text-xs text-gray-500">
                Shown in italic below the question. Be direct and explain real consequences (fines, legal action, tribunal losses).
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_critical"
                {...register("is_critical")}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-ring cursor-pointer"
              />
              <Label htmlFor="is_critical" className="cursor-pointer flex items-center gap-2">
                Mark as <Badge variant="destructive">CRITICAL</Badge> question
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Answer Options */}
        <Card>
          <CardHeader>
            <CardTitle>Answer Options</CardTitle>
            <CardDescription>
              Configure how landlords can respond to this question
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Question Type <span className="text-red-500">*</span></Label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    value="multiple_choice"
                    {...register("question_type")}
                    className="h-4 w-4 cursor-pointer"
                  />
                  <span>Multiple Choice</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    value="yes_no"
                    {...register("question_type")}
                    className="h-4 w-4 cursor-pointer"
                  />
                  <span>Yes/No</span>
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <span className="font-medium">Answer Option</span>
                <span className="flex-1"></span>
                <span className="font-medium w-20 text-center">Score (1-10)</span>
                <span className="w-10"></span>
              </div>
              
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-start">
                  <div className="flex-1 space-y-2">
                    <Input
                      {...register(`answer_options.${index}.option_text`)}
                      placeholder="Answer option text"
                      disabled={questionType === "yes_no"}
                      className="h-11 focus-visible:ring-2"
                    />
                  </div>
                  <div className="w-20">
                    <Input
                      type="number"
                      {...register(`answer_options.${index}.score_value`, {
                        valueAsNumber: true,
                      })}
                      placeholder="Score"
                      min={1}
                      max={10}
                      className="h-11 text-center focus-visible:ring-2"
                    />
                  </div>
                  {questionType === "multiple_choice" && fields.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-11 w-10 flex-shrink-0"
                      onClick={() => remove(index)}
                    >
                      ✕
                    </Button>
                  )}
                  {questionType === "multiple_choice" && fields.length === 2 && (
                    <div className="w-10"></div>
                  )}
                </div>
              ))}
              {errors.answer_options && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
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
            <CardDescription>
              Configure which tiers this question applies to and its scoring weight
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Applicable Tiers <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 font-normal">(Select at least one)</span>
              </Label>
              <div className="flex gap-2 flex-wrap">
                {["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"].map((tier) => {
                  const isSelected = watch("applicable_tiers")?.includes(tier);
                  return (
                    <label
                      key={tier}
                      className="cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        value={tier}
                        {...register("applicable_tiers")}
                        className="sr-only"
                      />
                      <div className={`
                        px-4 py-2 rounded-md border-2 transition-all text-sm font-medium
                        ${isSelected 
                          ? 'bg-primary text-primary-foreground border-primary' 
                          : 'bg-background border-input hover:border-primary/50'
                        }
                      `}>
                        {tier.replace("_", " ").toUpperCase()}
                      </div>
                    </label>
                  );
                })}
              </div>
              {errors.applicable_tiers && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.applicable_tiers.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight" className="flex items-center gap-2">
                Weighting Factor <span className="text-red-500">*</span>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600"
                  title="Higher weight = more impact on overall score. Standard = 1.0, Critical questions typically use 2.0"
                >
                  <Info className="w-4 h-4" />
                </button>
              </Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="0.5"
                max="2.0"
                {...register("weight", { valueAsNumber: true })}
                className="max-w-xs focus-visible:ring-2"
              />
              <p className="text-xs text-gray-500">
                Range: 0.5 - 2.0 (Standard = 1.0, Critical = 2.0)
              </p>
              {errors.weight && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.weight.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Scoring Guidance */}
        <Card>
          <CardHeader>
            <CardTitle>Scoring Guidance</CardTitle>
            <CardDescription>
              Provide context for each score level to guide audit recommendations
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
                className="resize-none"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-red-600 flex items-center gap-2">
                  Low Score (1-3)
                  <span className="text-xs text-gray-500 font-normal">(Optional)</span>
                </Label>
                <Textarea
                  {...register("score_examples.low_reason")}
                  placeholder="Reason for low score"
                  rows={2}
                  className="text-sm resize-none"
                />
                <Textarea
                  {...register("score_examples.low_action")}
                  placeholder="Recommended action"
                  rows={2}
                  className="text-sm resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-yellow-600 flex items-center gap-2">
                  Medium Score (4-7)
                  <span className="text-xs text-gray-500 font-normal">(Optional)</span>
                </Label>
                <Textarea
                  {...register("score_examples.medium_reason")}
                  placeholder="Reason for medium score"
                  rows={2}
                  className="text-sm resize-none"
                />
                <Textarea
                  {...register("score_examples.medium_action")}
                  placeholder="Recommended action"
                  rows={2}
                  className="text-sm resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-green-600 flex items-center gap-2">
                  High Score (8-10)
                  <span className="text-xs text-gray-500 font-normal">(Optional)</span>
                </Label>
                <Textarea
                  {...register("score_examples.high_reason")}
                  placeholder="Reason for high score"
                  rows={2}
                  className="text-sm resize-none"
                />
                <Textarea
                  {...register("score_examples.high_action")}
                  placeholder="Recommended action"
                  rows={2}
                  className="text-sm resize-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sticky Action Bar */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="destructive"
              onClick={() => setShowDeactivateConfirm(true)}
              disabled={deactivating || submitting}
            >
              {deactivating ? "Deactivating..." : "Deactivate Question"}
            </Button>
            {hasUnsavedChanges && (
              <span className="text-sm text-orange-600 flex items-center gap-1">
                <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></div>
                Unsaved changes
              </span>
            )}
          </div>

          <div className="flex gap-3">
            <Link href="/dashboard/questions">
              <Button type="button" variant="outline" disabled={submitting}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={submitting} className="min-w-32">
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Deactivate Confirmation Modal */}
      {showDeactivateConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                Deactivate Question?
              </CardTitle>
              <CardDescription>
                This question will no longer appear in new audits. Existing audit data will be preserved. This action cannot be undone.
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
