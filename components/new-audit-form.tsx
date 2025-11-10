"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskAuditTier } from "@/types/database";

const formSchema = z.object({
  client_name: z.string().min(1, "Client name is required"),
  landlord_email: z.string().email("Invalid email").optional().or(z.literal("")),
  property_address: z.string().min(1, "Property address is required"),
  risk_audit_tier: z.enum(["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"]),
  conducted_by: z.string().min(1, "Conducted by is required"),
});

type FormData = z.infer<typeof formSchema>;

interface NewAuditFormProps {
  onSuccess: () => void;
  defaultConductedBy?: string;
}

export function NewAuditForm({ onSuccess, defaultConductedBy }: NewAuditFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      conducted_by: defaultConductedBy || "",
      risk_audit_tier: "tier_0",
    },
  });

  const onSubmit = async (data: FormData) => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/audits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to create audit");
        return;
      }

      onSuccess();
      router.refresh();
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Audit</CardTitle>
        <CardDescription>
          Fill in the client information to generate a new audit form
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="client_name">Client Name *</Label>
            <Input
              id="client_name"
              {...register("client_name")}
              placeholder="John Smith"
              disabled={loading}
            />
            {errors.client_name && (
              <p className="text-sm text-red-600">{errors.client_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="property_address">Property Address *</Label>
            <Input
              id="property_address"
              {...register("property_address")}
              placeholder="123 Main St, London, UK"
              disabled={loading}
            />
            {errors.property_address && (
              <p className="text-sm text-red-600">{errors.property_address.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="landlord_email">Landlord Email (Optional)</Label>
            <Input
              id="landlord_email"
              type="email"
              {...register("landlord_email")}
              placeholder="landlord@example.com"
              disabled={loading}
            />
            {errors.landlord_email && (
              <p className="text-sm text-red-600">{errors.landlord_email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="risk_audit_tier">Risk Audit Tier *</Label>
            <select
              id="risk_audit_tier"
              {...register("risk_audit_tier")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={loading}
            >
              <option value="tier_0">Tier 0</option>
              <option value="tier_1">Tier 1</option>
              <option value="tier_2">Tier 2</option>
              <option value="tier_3">Tier 3</option>
              <option value="tier_4">Tier 4</option>
            </select>
            {errors.risk_audit_tier && (
              <p className="text-sm text-red-600">{errors.risk_audit_tier.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="conducted_by">Conducted By *</Label>
            <Input
              id="conducted_by"
              {...register("conducted_by")}
              placeholder="Your name"
              disabled={loading}
            />
            {errors.conducted_by && (
              <p className="text-sm text-red-600">{errors.conducted_by.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Audit"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

