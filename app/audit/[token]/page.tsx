"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
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
  const [dynamicQuestions, setDynamicQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(0);

  const token = params?.token as string;

  // Fetch audit data and questions
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch audit
        const auditResponse = await fetch(`/api/audits/${token}`);
        const auditData = await auditResponse.json();

        if (!auditResponse.ok) {
          setError(auditData.error || "Failed to load audit");
          return;
        }

        setAudit(auditData.audit);

        // Fetch questions for this tier from database
        const questionsResponse = await fetch(
          `/api/questions/for-tier/${auditData.audit.risk_audit_tier}`
        );
        const questionsData = await questionsResponse.json();

        if (questionsResponse.ok && questionsData.questions) {
          setDynamicQuestions(questionsData.questions);
        } else {
          // Fallback to static questions if API fails
          setDynamicQuestions(getQuestionsByTier(auditData.audit.risk_audit_tier));
        }
      } catch (error) {
        setError("An error occurred while loading the audit");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  // Don't initialize form until audit is loaded
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

  if (!audit || dynamicQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">
          {!audit ? "Audit not found" : "Loading questions..."}
        </p>
      </div>
    );
  }

  return <AuditFormContent audit={audit} token={token} questions={dynamicQuestions} />;
}

// Separate component that only renders when audit and questions exist
function AuditFormContent({ 
  audit, 
  token, 
  questions 
}: { 
  audit: Audit; 
  token: string;
  questions: Question[];
}) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [currentCategory, setCurrentCategory] = useState(0);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [questionComments, setQuestionComments] = useState<Record<string, string>>({});
  const [showSavedToast, setShowSavedToast] = useState(false);
  const lastSavedRef = useRef<number>(0);
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const shouldScrollRef = useRef<boolean>(false);

  // Use questions from database (passed as props)
  const relevantQuestions = questions;
  const groupedQuestions = groupQuestionsByCategory(relevantQuestions);
  const categories = Object.keys(groupedQuestions);
  const currentCategoryName = categories[currentCategory];
  const currentQuestions = groupedQuestions[currentCategoryName] || [];

  // CRITICAL: Replace dots with underscores to avoid React Hook Form dot notation parsing
  // RHF treats "1.1" as nested path { 1: { 1: value } }, causing form state corruption
  const prefixedSchema: Record<string, z.ZodTypeAny> = {};
  relevantQuestions.forEach((q) => {
    const safeKey = `q_${q.id.replace(/\./g, '_')}`;
    prefixedSchema[safeKey] = z.union([z.literal(1), z.literal(5), z.literal(10)], {
      message: "Please select an answer",
    });
  });
  const actualFormSchema = z.object(prefixedSchema);
  type ActualFormData = z.infer<typeof actualFormSchema>;

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<ActualFormData>({
    resolver: zodResolver(actualFormSchema),
    mode: 'onChange',
    defaultValues: Object.fromEntries(
      relevantQuestions.map(q => [`q_${q.id.replace(/\./g, '_')}`, undefined])
    ) as any,
  });

  // Form state persistence with localStorage
  useEffect(() => {
    const storageKey = `audit-form-${audit.token}`;
    const savedData = localStorage.getItem(storageKey);
    
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        const validQuestionIds = relevantQuestions.map(q => q.id);
        const validData: Partial<ActualFormData> = {};
        const restoredAnswers: Record<string, number> = {};
        const restoredComments: Record<string, string> = {};
        
        // Build clean data object with ONLY valid keys
        Object.entries(parsed).forEach(([key, value]) => {
          // Handle comments (stored as comment_1_1 format)
          if (key.startsWith('comment_')) {
            const questionId = key.replace('comment_', '').replace(/_/g, '.');
            if (validQuestionIds.includes(questionId) && typeof value === 'string') {
              restoredComments[questionId] = value;
            }
            return;
          }
          
          // Normalize key: handle "1.1", "q_1.1", or "q_1_1" formats
          let cleanKey = key;
          if (key.startsWith('q_')) {
            cleanKey = key.replace('q_', '').replace(/_/g, '.');
          }
          
          if (validQuestionIds.includes(cleanKey) && (value === 1 || value === 5 || value === 10)) {
            const safeKey = `q_${cleanKey.replace(/\./g, '_')}`;
            validData[safeKey as keyof ActualFormData] = value as any;
            restoredAnswers[cleanKey] = value as number;
          }
        });
        
        // Restore saved values using reset() for reliability
        if (Object.keys(validData).length > 0) {
          const defaultValues = Object.fromEntries(
            relevantQuestions.map(q => [`q_${q.id.replace(/\./g, '_')}`, validData[`q_${q.id.replace(/\./g, '_')}` as keyof ActualFormData] || undefined])
          );
          reset(defaultValues as any, { keepDirty: false });
          setSelectedAnswers(restoredAnswers);
        }
        
        // Restore comments
        if (Object.keys(restoredComments).length > 0) {
          setQuestionComments(restoredComments);
        }
      } catch (error) {
        console.error("Failed to restore form data:", error);
        localStorage.removeItem(storageKey);
      }
    }
  }, [audit.token, relevantQuestions, reset]);

  // Helper function to save all form data to localStorage
  const saveToLocalStorage = (formValues: Record<string, any>, comments: Record<string, string>) => {
    const storageKey = `audit-form-${audit.token}`;
    
    // Save only answered questions (clean data)
    const cleanData: Record<string, any> = Object.fromEntries(
      Object.entries(formValues).filter(([_, v]) => v === 1 || v === 5 || v === 10)
    );
    
    // Also save comments (stored as comment_1_1 format)
    Object.entries(comments).forEach(([questionId, comment]) => {
      if (comment && comment.trim()) {
        const safeKey = `comment_${questionId.replace(/\./g, '_')}`;
        cleanData[safeKey] = comment;
      }
    });
    
    localStorage.setItem(storageKey, JSON.stringify(cleanData));
    
    // Show "Saved" toast with debounce (only show once every 1.5s)
    const now = Date.now();
    if (now - lastSavedRef.current > 1500) {
      setShowSavedToast(true);
      lastSavedRef.current = now;
      setTimeout(() => setShowSavedToast(false), 2000);
    }
  };

  // Auto-save form data to localStorage with toast notification
  useEffect(() => {
    const subscription = watch((value) => {
      saveToLocalStorage(value, questionComments);
    });
    
    return () => subscription.unsubscribe();
  }, [audit.token, watch, questionComments]);
  
  // Also save when comments change
  useEffect(() => {
    const currentValues = watch();
    saveToLocalStorage(currentValues, questionComments);
  }, [questionComments]);

  // Calculate progress
  const allValues = watch();
  const { answeredCount, progress } = useMemo(() => {
    const answered = relevantQuestions.filter((q) => {
      const safeKey = `q_${q.id.replace(/\./g, '_')}`;
      const value = allValues[safeKey as keyof ActualFormData];
      return value === 1 || value === 5 || value === 10;
    }).length;
    const total = relevantQuestions.length;
    const prog = total > 0 ? (answered / total) * 100 : 0;
    return { answeredCount: answered, progress: prog };
  }, [allValues, relevantQuestions]);

  // Helper function to scroll to first unanswered question in a category
  // If all questions are answered, scrolls to navigation section (Next/Submit buttons)
  const scrollToFirstUnanswered = (categoryQuestions: Question[], allValues: ActualFormData) => {
    // Find first unanswered question (from top to bottom)
    const firstUnanswered = categoryQuestions.find((q) => {
      const safeKey = `q_${q.id.replace(/\./g, '_')}`;
      const value = allValues[safeKey as keyof ActualFormData];
      return value !== 1 && value !== 5 && value !== 10;
    });
    
    if (firstUnanswered) {
      // Scroll to first unanswered question
      const element = document.getElementById(`question-${firstUnanswered.id}`);
      if (element) {
        const yOffset = -120; // Offset for sticky header
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
        
        // Focus first radio button for accessibility
        setTimeout(() => {
          const firstRadio = element.querySelector('input[type="radio"]') as HTMLInputElement;
          if (firstRadio) {
            firstRadio.focus();
          }
        }, 500);
      }
    } else {
      // All questions answered - scroll to navigation section
      const navElement = document.getElementById('section-navigation');
      if (navElement) {
        const yOffset = -120; // Offset for sticky header
        const y = navElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }
  };

  // Scroll to first unanswered question when section changes (only when category actually changes)
  useEffect(() => {
    if (shouldScrollRef.current && currentQuestions.length > 0 && allValues) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        scrollToFirstUnanswered(currentQuestions, allValues);
      }, 100);
      // Reset the flag after scrolling
      shouldScrollRef.current = false;
    }
  }, [currentCategory, currentQuestions, allValues]);

  // Scroll spy: detect which question is currently in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const questionId = entry.target.getAttribute('id')?.replace('question-', '') || null;
            if (questionId) {
              setActiveQuestionId(questionId);
            }
          }
        });
      },
      {
        rootMargin: '-100px 0px -50% 0px',
        threshold: [0.5],
      }
    );

    // Observe all question cards
    Object.values(questionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      Object.values(questionRefs.current).forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [currentQuestions]);
  
  const totalQuestions = relevantQuestions.length;

  // Calculate answered questions per category for visual feedback
  const categoryProgress = useMemo(() => {
    const progress: Record<string, { answered: number; total: number }> = {};
    
    Object.entries(groupedQuestions).forEach(([category, catQuestions]) => {
      const answered = catQuestions.filter((q) => {
        const safeKey = `q_${q.id.replace(/\./g, '_')}`;
        const value = allValues[safeKey as keyof ActualFormData];
        return value === 1 || value === 5 || value === 10;
      }).length;
      
      progress[category] = {
        answered,
        total: catQuestions.length,
      };
    });
    
    return progress;
  }, [allValues, groupedQuestions]);

  // Calculate unanswered questions for warning message
  const unansweredQuestions = useMemo(() => {
    return relevantQuestions.filter((q) => {
      const safeKey = `q_${q.id.replace(/\./g, '_')}`;
      const value = allValues[safeKey as keyof ActualFormData];
      return value !== 1 && value !== 5 && value !== 10;
    });
  }, [allValues, relevantQuestions]);

  // Helper function to generate detailed error message by section
  const getMissingQuestionsMessage = (unansweredQuestions: Question[]): string => {
    if (unansweredQuestions.length === 0) {
      return "";
    }

    // Group unanswered questions by category
    const unansweredByCategory: Record<string, Question[]> = {};
    unansweredQuestions.forEach((q) => {
      if (!unansweredByCategory[q.category]) {
        unansweredByCategory[q.category] = [];
      }
      unansweredByCategory[q.category].push(q);
    });

    // Get section numbers (1-based index)
    const categoryToSectionNumber: Record<string, number> = {};
    categories.forEach((cat, index) => {
      categoryToSectionNumber[cat] = index + 1;
    });

    // Build message parts
    const messageParts: string[] = [];
    Object.entries(unansweredByCategory).forEach(([category, questions]) => {
      const sectionNumber = categoryToSectionNumber[category];
      const count = questions.length;
      const questionText = count === 1 ? "question remaining" : "questions remaining";
      messageParts.push(`${count} ${questionText} in Section ${sectionNumber}`);
    });

    const baseMessage = `Please answer all ${totalQuestions} questions before submitting.`;
    
    if (messageParts.length === 1) {
      return `${baseMessage} (${messageParts[0]})`;
    } else {
      // Join with " & " for all but the last one, then add " & " before the last
      const allButLast = messageParts.slice(0, -1).join(", ");
      const last = messageParts[messageParts.length - 1];
      return `${baseMessage} (${allButLast} & ${last})`;
    }
  };

  // Handle cancel and start again
  const handleCancelAndStartAgain = () => {
    if (window.confirm("Are you sure you want to cancel and start again? All your answers will be cleared.")) {
      // Clear form
      const defaultValues = Object.fromEntries(
        relevantQuestions.map(q => [`q_${q.id.replace(/\./g, '_')}`, undefined])
      );
      reset(defaultValues as any, { keepDirty: false });
      
      // Clear localStorage
      const storageKey = `audit-form-${audit.token}`;
      localStorage.removeItem(storageKey);
      
      // Clear error
      setError("");
      
      // Reset to first section
      setCurrentCategory(0);
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Submit handler with enhanced validation
  const onSubmit = async (data: ActualFormData) => {
    setError("");
    setSubmitting(true);

    try {
      // Client-side validation: ensure all questions answered
      const unansweredQuestions = relevantQuestions.filter((q) => {
        const safeKey = `q_${q.id.replace(/\./g, '_')}`;
        const value = data[safeKey as keyof ActualFormData];
        return value !== 1 && value !== 5 && value !== 10;
      });

      if (unansweredQuestions.length > 0) {
        const errorMessage = getMissingQuestionsMessage(unansweredQuestions);
        setError(errorMessage);
        
        // Scroll to first unanswered question
        const firstUnanswered = unansweredQuestions[0];
        const element = document.getElementById(`question-${firstUnanswered.id}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        
        setSubmitting(false);
        return;
      }

      // Convert safe keys back to original question IDs for API
      const responses = Object.entries(data)
        .filter(([key, value]) => key.startsWith('q_') && (value === 1 || value === 5 || value === 10))
        .map(([safeKey, answer_value]) => {
          const question_id = safeKey.replace('q_', '').replace(/_/g, '.'); // q_1_1 → 1.1
          return {
            question_id,
            answer_value: answer_value as 1 | 5 | 10,
            comment: questionComments[question_id] || null, // Include comment if any
          };
        });

      const response = await fetch(`/api/audits/${token}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to submit audit");
        
        // Scroll to top to show error message
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // Clear localStorage on successful submit
      if (audit) {
        localStorage.removeItem(`audit-form-${audit.token}`);
      }

      setSubmitted(true);
    } catch (error) {
      setError("An error occurred while submitting the audit");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

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
                <strong>Audit ID:</strong> {audit.id}
              </p>
              <p className="text-sm text-blue-900 mt-1">
                <strong>Property:</strong> {audit.property_address}
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
        {/* Global Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-800 p-4 rounded-lg">
            <p className="font-semibold">⚠️ Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

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
              <p className="font-medium">{audit.client_name}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Property Address:</span>
              <p className="font-medium">{audit.property_address}</p>
            </div>
          </CardContent>
        </Card>

        {/* Sticky Progress Bar */}
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b shadow-sm mb-6 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4">
          <Card className="border-0 shadow-none bg-transparent">
            <CardContent className="pt-0 pb-0 px-0">
              <div className="space-y-2">
                <div className="flex justify-between text-sm" aria-live="polite" aria-atomic="true">
                  <span className="font-medium">
                    Progress: {answeredCount} of {totalQuestions} questions answered
                  </span>
                  <span className="font-semibold text-blue-600">{Math.round(progress)}%</span>
                </div>
                <Progress 
                  value={progress} 
                  aria-label={`Form completion progress: ${Math.round(progress)}%`}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Category Navigation */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-2 flex-wrap">
                {categories.map((category, index) => {
                  const catProgress = categoryProgress[category];
                  const isComplete = catProgress && catProgress.answered === catProgress.total;
                  
                  return (
                    <Button
                      key={category}
                      type="button"
                      variant={currentCategory === index ? "default" : "outline"}
                      onClick={() => {
                        shouldScrollRef.current = true;
                        setCurrentCategory(index);
                      }}
                      size="sm"
                      className="relative"
                    >
                      {isComplete && (
                        <span className="absolute -top-1 -right-1 text-green-500 text-lg">✓</span>
                      )}
                      {index + 1}. {category.split(" ")[0]}
                      {catProgress && (
                        <span className="ml-1 text-xs opacity-70">
                          ({catProgress.answered}/{catProgress.total})
                        </span>
                      )}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold">
              {currentCategory + 1}. {currentCategoryName}
            </h2>

            {currentQuestions.map((question, index) => {
              const safeKey = `q_${question.id.replace(/\./g, '_')}`;
              const isActive = activeQuestionId === question.id;
              const answerValue = allValues[safeKey as keyof ActualFormData];
              const isAnswered = answerValue === 1 || answerValue === 5 || answerValue === 10;
              
              return (
                <Card 
                  key={question.id} 
                  id={`question-${question.id}`}
                  ref={(el) => {
                    questionRefs.current[question.id] = el;
                  }}
                  className={`transition-all duration-300 ${
                    isActive 
                      ? 'ring-2 ring-blue-500 ring-opacity-50 shadow-lg' 
                      : ''
                  } ${isAnswered ? 'border-green-200' : ''}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <CardTitle className="text-base font-medium leading-relaxed">
                        Q{question.id}: {question.text}
                      </CardTitle>
                      {isAnswered && (
                        <div className="shrink-0 animate-in fade-in zoom-in duration-300">
                          <svg
                            className="w-5 h-5 text-green-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    {question.motivation_learning_point && (
                      <CardDescription className="mt-3 italic text-gray-600 leading-relaxed">
                        <span className="font-semibold text-gray-900 not-italic block mb-1">Why it matters:</span>
                        {question.motivation_learning_point}
                      </CardDescription>
                    )}
                    {question.comment && (
                      <div className="mt-3">
                        <p className="text-sm text-blue-700 font-medium">
                          {question.comment}
                        </p>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Controller
                      name={`q_${question.id.replace(/\./g, '_')}` as any}
                      control={control}
                      render={({ field }) => (
                        <div role="radiogroup" aria-label={question.text} aria-required="true">
                          {question.options.map((option) => {
                            const isSelected = field.value === option.value;
                            return (
                              <div 
                                key={option.value} 
                                className={`flex items-start space-x-3 mb-4 p-3 rounded-lg transition-all duration-200 ${
                                  isSelected 
                                    ? 'bg-blue-50 border-2 border-blue-300 scale-[1.02]' 
                                    : 'hover:bg-gray-50 border-2 border-transparent'
                                }`}
                              >
                                <div className="relative mt-0.5">
                                  <input
                                    type="radio"
                                    id={`${question.id}-${option.value}`}
                                    value={option.value}
                                    checked={isSelected}
                                    onChange={(e) => {
                                      const value = parseInt(e.target.value, 10);
                                      field.onChange(value);
                                      setSelectedAnswers((prev) => ({
                                        ...prev,
                                        [question.id]: value,
                                      }));
                                    }}
                                    className="h-4 w-4 cursor-pointer accent-blue-600"
                                    aria-label={`Score ${option.value}: ${option.label}`}
                                  />
                                  {isSelected && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-in zoom-in duration-200">
                                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                    </div>
                                  )}
                                </div>
                                <Label
                                  htmlFor={`${question.id}-${option.value}`}
                                  className={`font-normal cursor-pointer leading-relaxed flex-1 text-sm transition-colors ${
                                    isSelected ? 'text-blue-900 font-medium' : ''
                                  }`}
                                >
                                  {option.label}
                                </Label>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    />
                    {errors[`q_${question.id.replace(/\./g, '_')}` as keyof typeof errors] && (
                      <p className="text-sm text-red-600 mt-2" role="alert" aria-live="polite">
                        {errors[`q_${question.id.replace(/\./g, '_')}` as keyof typeof errors]?.message as string}
                      </p>
                    )}
                    
                    {/* Comment textarea */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-1.5 mb-2">
                        <label 
                          htmlFor={`comment-${question.id}`}
                          className="block text-sm font-medium text-gray-700"
                        >
                          Supporting Notes
                        </label>
                        <div className="relative group">
                          <Info 
                            className="w-4 h-4 text-gray-400 cursor-help hover:text-gray-600 transition-colors" 
                          />
                          <div className="absolute left-0 top-6 hidden group-hover:block z-50 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl border border-gray-700 pointer-events-none">
                            Add details here to help the viewer understand your response.
                          </div>
                        </div>
                      </div>
                      <textarea
                        id={`comment-${question.id}`}
                        placeholder="Add any additional notes or context for this question..."
                        value={questionComments[question.id] || ''}
                        onChange={(e) => {
                          setQuestionComments((prev) => ({
                            ...prev,
                            [question.id]: e.target.value,
                          }));
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Navigation */}
          <Card id="section-navigation">
            <CardContent className="pt-6">
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const prevCategory = Math.max(0, currentCategory - 1);
                    shouldScrollRef.current = true;
                    setCurrentCategory(prevCategory);
                    // Scroll to first unanswered question in previous section
                    setTimeout(() => {
                      const prevCategoryName = categories[prevCategory];
                      const prevQuestions = groupedQuestions[prevCategoryName] || [];
                      scrollToFirstUnanswered(prevQuestions, allValues);
                    }, 200);
                  }}
                  disabled={currentCategory === 0}
                >
                  Previous Section
                </Button>

                {currentCategory < categories.length - 1 ? (
                  <Button
                    type="button"
                    onClick={() => {
                      shouldScrollRef.current = true;
                      setCurrentCategory(currentCategory + 1);
                    }}
                  >
                    Next Section
                  </Button>
                ) : (
                  <Button type="submit" disabled={submitting || progress < 100}>
                    {submitting ? "Submitting..." : "Submit Audit"}
                  </Button>
                )}
              </div>

              {/* Cancel & Start Again Button */}
              <div className="mt-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelAndStartAgain}
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  disabled={submitting}
                >
                  Cancel & Start Again
                </Button>
              </div>

              {progress < 100 && currentCategory === categories.length - 1 && (
                <div className="bg-yellow-50 text-yellow-800 p-3 rounded mt-4 text-sm">
                  ⚠️ {getMissingQuestionsMessage(unansweredQuestions) || `Please answer all ${totalQuestions} questions before submitting.`}
                </div>
              )}
            </CardContent>
          </Card>
        </form>

        {/* Saved Toast Notification */}
        {showSavedToast && (
          <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
              <svg
                className="w-5 h-5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="font-medium">Saved</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

