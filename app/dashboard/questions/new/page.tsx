"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

export default function NewQuestionPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<{category: string; sub_categories: string[]}[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      question_type: "multiple_choice",
      weight: 1.0,
      is_critical: false,
      applicable_tiers: ["tier_0"],
      answer_options: [
        { option_text: "", score_value: 10, is_example: false },
        { option_text: "", score_value: 5, is_example: false },
        { option_text: "", score_value: 1, is_example: false },
      ],
    },
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
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSubmit(onSubmit)();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch categories
  useEffect(() => {
    fetch("/api/questions/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(console.error);
  }, []);

  // Auto-set answer options when type changes
  useEffect(() => {
    if (questionType === "yes_no") {
      replace([
        { option_text: "Yes", score_value: 10, is_example: false },
        { option_text: "No", score_value: 1, is_example: false },
      ]);
    }
  }, [questionType, replace]);

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

      const response = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to create question");
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

  const currentCategory = categories.find((c) => c.category === selectedCategory);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-gray-600 mb-4">
        <Link href="/dashboard/questions" className="hover:text-gray-900">
          Questions
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-gray-900 font-medium">Add New</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Add New Question</h1>
        <p className="text-gray-600">
          Create a new audit question with answer options and scoring
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
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 flex justify-end items-center gap-4">
          {hasUnsavedChanges && (
            <span className="text-sm text-orange-600 flex items-center gap-1 mr-auto">
              <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></div>
              Unsaved changes
            </span>
          )}

          <Link href="/dashboard/questions">
            <Button type="button" variant="outline" disabled={submitting}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={submitting} className="min-w-32">
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating...
              </>
            ) : (
              "Create Question"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
