"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, CreditCard, User, FileText, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// --- NEW IMPORTS ---
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { CheckoutForm } from "./CheckoutForm"; // Import the file we created above

// Initialize Stripe outside the component for performance
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Service {
  id: string;
  title: string;
  price: number;
  description: string;
  features: readonly string[];
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service;
}

const STEPS = [
  { id: 1, title: "Confirm", icon: FileText },
  { id: 2, title: "Details", icon: User },
  { id: 3, title: "Payment", icon: CreditCard },
];

export function PaymentModal({ isOpen, onClose, service }: PaymentModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    propertyAddress: "",
  });

  // New states for Stripe
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoadingSecret, setIsLoadingSecret] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Main transition logic
  const handleNext = async () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // If moving to step 3, we need to generate the payment
      setIsLoadingSecret(true);
      try {
        const res = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            serviceId: service.id,
            email: formData.email,
            name: formData.name,
            address: formData.propertyAddress
          }),
        });

        const data = await res.json();

        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
          setCurrentStep(3); // Only change step if secret is present
        } else {
          alert(data.error || "Error initiating payment. Please try again.");
        }
      } catch (error) {
        console.error(error);
        alert("Connection error.");
      } finally {
        setIsLoadingSecret(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData({ name: "", email: "", propertyAddress: "" });
    setClientSecret(null); // Clear the secret on close
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        {/* Steps Header (Kept same as original) */}
        <div className="bg-muted/50 px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted ? "bg-green-600 text-white" : isActive ? "bg-primary text-primary-foreground ring-4 ring-primary/20" : "bg-muted text-muted-foreground"}`}>
                      {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span className={`text-xs mt-1 font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{step.title}</span>
                  </div>
                  {index < STEPS.length - 1 && <div className={`w-16 h-0.5 mx-2 transition-colors duration-300 ${isCompleted ? "bg-green-600" : "bg-muted"}`} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Confirm (Kept) */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle>Confirm Your Selection</DialogTitle>
                <DialogDescription>Review your chosen audit package.</DialogDescription>
              </DialogHeader>
              <div className="bg-muted/50 rounded-xl p-6">
                <h3 className="font-semibold text-lg">{service.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                <span className="text-3xl font-bold">£{service.price}</span>
              </div>
            </div>
          )}

          {/* Step 2: Details (Kept) */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle>Your Details</DialogTitle>
                <DialogDescription>We&apos;ll use this for the receipt.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input name="name" value={formData.name} onChange={handleInputChange} placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input name="email" value={formData.email} onChange={handleInputChange} placeholder="john@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input name="propertyAddress" value={formData.propertyAddress} onChange={handleInputChange} placeholder="123 Street" />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Payment (NOW WITH STRIPE) */}
          {currentStep === 3 && clientSecret && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle>Secure Payment</DialogTitle>
                <DialogDescription>Powered by Stripe SSL.</DialogDescription>
              </DialogHeader>

              {/* The Provider wraps ONLY the form */}
              <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                <CheckoutForm price={service.price} />
              </Elements>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {/* We only show the Footer in steps 1 and 2. In step 3, the pay button is INSIDE CheckoutForm */}
        {currentStep < 3 && (
          <div className="px-6 py-4 border-t bg-muted/30 flex justify-between">
            <Button variant="ghost" onClick={handleBack} disabled={currentStep === 1}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <Button onClick={handleNext} disabled={isLoadingSecret}>
              {isLoadingSecret ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Preparing...</>
              ) : (
                <>Continue <ArrowRight className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          </div>
        )}

        {/* Simple back button for step 3, in case the user wants to cancel */}
        {currentStep === 3 && (
          <div className="px-6 py-2 border-t bg-muted/10">
            <Button variant="ghost" onClick={handleBack} size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" /> Change Details
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
