"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AuditLookupResponse {
  found: boolean;
  token?: string;
  clientName?: string;
  propertyAddress?: string;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentIntent = searchParams.get("payment_intent");
  const redirectStatus = searchParams.get("redirect_status");

  const [pollCount, setPollCount] = useState(0);
  const [isPolling, setIsPolling] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [auditToken, setAuditToken] = useState<string | null>(null);

  // Max polling attempts (10 attempts * 2 seconds = 20 seconds max wait)
  const MAX_POLL_ATTEMPTS = 10;
  const POLL_INTERVAL_MS = 2000;

  // Derive initial status from URL params
  const status = useMemo(() => {
    if (redirectStatus === "succeeded") {
      return "success";
    } else if (redirectStatus === "failed" || redirectStatus === "canceled") {
      return "error";
    } else {
      return paymentIntent ? "success" : "error";
    }
  }, [paymentIntent, redirectStatus]);

  // Poll for audit creation
  const pollForAudit = useCallback(async () => {
    if (!paymentIntent || timedOut || auditToken) return;

    try {
      const response = await fetch(`/api/audits/by-payment/${paymentIntent}`);
      const data: AuditLookupResponse = await response.json();

      if (data.found && data.token) {
        setAuditToken(data.token);
        // Redirect to questionnaire
        router.push(`/audit/${data.token}`);
        return;
      }

      // Audit not found yet, increment poll count
      setPollCount((prev) => prev + 1);
    } catch (error) {
      console.error("Error polling for audit:", error);
      setPollCount((prev) => prev + 1);
    }
  }, [paymentIntent, timedOut, auditToken, router]);

  // Start polling effect
  useEffect(() => {
    if (status !== "success" || !paymentIntent) return;

    // Initial poll
    setIsPolling(true);
    pollForAudit();

    // Set up polling interval
    const intervalId = setInterval(() => {
      if (pollCount >= MAX_POLL_ATTEMPTS) {
        setTimedOut(true);
        setIsPolling(false);
        clearInterval(intervalId);
        return;
      }
      pollForAudit();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [status, paymentIntent, pollCount, pollForAudit]);

  // Error state
  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Payment Failed</CardTitle>
            <CardDescription>
              There was an issue processing your payment. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/">
              <Button className="w-full">Return to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Polling / Loading state
  if (isPolling && !timedOut && !auditToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <CardDescription>
              Preparing your questionnaire...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground text-center">
                You&apos;ll be redirected to your audit questionnaire in a moment.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Timed out - show fallback with manual instructions
  if (timedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <CardDescription>
              Thank you for your purchase. Your audit is being prepared.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
              <p className="text-amber-800 font-medium">
                Your questionnaire is taking a moment to prepare.
              </p>
              <p className="text-amber-700 mt-2">
                You&apos;ll receive a confirmation email shortly with a link to complete your audit questionnaire.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button 
                onClick={() => {
                  setTimedOut(false);
                  setPollCount(0);
                  setIsPolling(true);
                }}
                variant="outline"
                className="w-full"
              >
                Try Again
              </Button>
              <Link href="/">
                <Button className="w-full">Return to Home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default success state (shouldn't typically be shown)
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Thank you for your purchase. Your audit has been created.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 text-sm">
            <p className="text-muted-foreground">
              <strong>What happens next?</strong>
            </p>
            <ul className="mt-2 space-y-2 text-muted-foreground">
              <li>• You&apos;ll receive a confirmation email shortly</li>
              <li>
                • The email will contain a link to complete your audit
                questionnaire
              </li>
              <li>
                • Complete the questionnaire to receive your detailed report
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <Link href="/">
              <Button className="w-full">Return to Home</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
