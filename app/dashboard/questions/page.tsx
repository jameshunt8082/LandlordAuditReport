"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { QuestionTemplateWithOptions } from "@/types/questions";

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<QuestionTemplateWithOptions[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const fetchQuestions = async () => {
    try {
      const url = categoryFilter === "all" 
        ? "/api/admin/questions"
        : `/api/admin/questions?category=${encodeURIComponent(categoryFilter)}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [categoryFilter]);

  const filteredQuestions = questions.filter((q) =>
    q.question_text.toLowerCase().includes(filter.toLowerCase()) ||
    q.question_number.includes(filter) ||
    q.sub_category.toLowerCase().includes(filter.toLowerCase())
  );

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "Documentation", label: "Documentation" },
    { value: "Landlord-Tenant Communication", label: "Landlord-Tenant" },
    { value: "Evidence Gathering Systems and Procedures", label: "Evidence" }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Question Management</h2>
          <p className="text-gray-600 mt-2">
            Manage audit questions - Add, edit, or deactivate questions
          </p>
        </div>
        <Link href="/dashboard/questions/new">
          <Button>+ Add Question</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap items-center">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search questions..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <Button
                  key={cat.value}
                  size="sm"
                  variant={categoryFilter === cat.value ? "default" : "outline"}
                  onClick={() => setCategoryFilter(cat.value)}
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{questions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {questions.filter((q) => q.is_active).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Statutory Requirement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {questions.filter((q) => q.is_critical).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {new Set(questions.map((q) => q.category)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-gray-500">
                No questions found. {filter && "Try a different search."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredQuestions.map((question) => (
            <Card key={question.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="font-mono">
                        Q{question.question_number}
                      </Badge>
                      <Badge>{question.category.split(" ")[0]}</Badge>
                      {question.is_critical && (
                        <Badge variant="destructive">STATUTORY REQUIREMENT</Badge>
                      )}
                      {!question.is_active && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                      <span className="text-sm text-gray-500">
                        Weight: {question.weight}
                      </span>
                    </div>

                    <p className="font-medium">{question.question_text}</p>

                    <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                      <span>Sub-category: {question.sub_category}</span>
                      <span>•</span>
                      <span>Type: {question.question_type.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>
                        {question.answer_options?.length || 0} options
                      </span>
                      <span>•</span>
                      <span>
                        Tiers: {Array.isArray(question.applicable_tiers) 
                          ? question.applicable_tiers.join(", ").replace(/tier_/g, '')
                          : String(question.applicable_tiers).replace(/[{}]/g, '').replace(/tier_/g, '')}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/dashboard/questions/${question.id}`}>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

