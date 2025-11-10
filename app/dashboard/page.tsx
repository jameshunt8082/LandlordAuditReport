"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NewAuditForm } from "@/components/new-audit-form";
import { AuditList } from "@/components/audit-list";
import { Audit } from "@/types/database";
import { useSession } from "next-auth/react";

interface AuditsData {
  audits: Audit[];
  stats: {
    total: number;
    pending: number;
    completed: number;
  };
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [auditsData, setAuditsData] = useState<AuditsData | null>(null);
  const [showNewAuditForm, setShowNewAuditForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAudits = async () => {
    try {
      const response = await fetch("/api/audits");
      if (response.ok) {
        const data = await response.json();
        setAuditsData(data);
      }
    } catch (error) {
      console.error("Failed to fetch audits:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  const handleAuditCreated = () => {
    setShowNewAuditForm(false);
    fetchAudits();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Auditor Dashboard</h2>
          <p className="text-gray-600 mt-2">
            Manage your landlord audits and review submissions
          </p>
        </div>
        <Button onClick={() => setShowNewAuditForm(!showNewAuditForm)}>
          {showNewAuditForm ? "Cancel" : "+ New Audit"}
        </Button>
      </div>

      {showNewAuditForm && (
        <NewAuditForm
          onSuccess={handleAuditCreated}
          defaultConductedBy={session?.user?.name || ""}
        />
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Audits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {auditsData?.stats.total || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              New Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-3xl font-bold">
                {auditsData?.stats.pending || 0}
              </div>
              {auditsData && auditsData.stats.pending > 0 && (
                <Badge className="bg-blue-500">New</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {auditsData?.stats.completed || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Recent Audits</h3>
        {auditsData && <AuditList audits={auditsData.audits} />}
      </div>
    </div>
  );
}

