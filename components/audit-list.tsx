"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Audit } from "@/types/database";

interface AuditListProps {
  audits: Audit[];
}

export function AuditList({ audits }: AuditListProps) {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const copyToClipboard = async (token: string, id: number) => {
    const url = `${window.location.origin}/audit/${token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gray-200 text-gray-700";
      case "submitted":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (audits.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-gray-500">
            No audits yet. Create your first audit to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {audits.map((audit) => (
        <Card key={audit.id}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{audit.client_name}</h3>
                  <Badge className={getStatusColor(audit.status)}>
                    {audit.status}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600">{audit.property_address}</p>
                
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                  <span>Tier: {audit.risk_audit_tier.replace("_", " ")}</span>
                  <span>•</span>
                  <span>Created: {formatDate(audit.created_at)}</span>
                  {audit.submitted_at && (
                    <>
                      <span>•</span>
                      <span>Submitted: {formatDate(audit.submitted_at)}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {audit.status === "pending" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(audit.token, audit.id)}
                  >
                    {copiedId === audit.id ? "✓ Copied!" : "Copy Link"}
                  </Button>
                )}
                
                {audit.status === "submitted" && (
                  <Link href={`/dashboard/audit/${audit.id}`}>
                    <Button size="sm">Review</Button>
                  </Link>
                )}
                
                {audit.status === "completed" && (
                  <Link href={`/dashboard/audit/${audit.id}`}>
                    <Button size="sm" variant="outline">View Report</Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

