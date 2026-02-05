"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  User,
  Loader2,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

export function PaymentModal({ isOpen, onClose, service }: PaymentModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    propertyAddress: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null); // Clear error on input change
  };

  const isFormValid = formData.name && formData.email && formData.propertyAddress;

  // Redirect to Stripe Checkout
  const handleCheckout = async () => {
    if (!isFormValid) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          email: formData.email,
          name: formData.name,
          address: formData.propertyAddress,
        }),
      });

      const data = await res.json();

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        setError(data.error || "Error initiating payment. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: "", email: "", propertyAddress: "" });
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-muted/50 px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">Your Details</p>
              <p className="text-xs text-muted-foreground">Step 1 of 2 • Payment via Stripe</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <DialogHeader className="mb-4">
            <DialogTitle>Enter Your Information</DialogTitle>
            <DialogDescription>
              We need this for your property details and receipt. You&apos;ll be redirected to Stripe for secure payment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Property Address</Label>
              <Input
                name="propertyAddress"
                value={formData.propertyAddress}
                onChange={handleInputChange}
                placeholder="123 Main Street, London"
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            {/* Price Summary */}
            <div className="bg-muted/50 rounded-lg p-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium">{service.title}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold text-lg">£{service.price}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-muted/30 flex justify-between">
          <Button variant="ghost" onClick={handleClose}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Cancel
          </Button>
          <Button 
            onClick={handleCheckout} 
            disabled={isLoading || !isFormValid}
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Redirecting...
              </>
            ) : (
              <>
                Continue to Payment <ExternalLink className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
