"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, CreditCard, User, FileText } from "lucide-react";
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleNext = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = () => {
        try {
            // Placeholder for Stripe integration
            // Implement secure payment processing here without logging sensitive user data.
        } catch (error) {
            // TODO: Provide user-friendly error feedback within the UI without exposing PII in logs.
        } finally {
            onClose();
        }
    };

    const handleClose = () => {
        setCurrentStep(1);
        setFormData({ name: "", email: "", propertyAddress: "" });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
                {/* Progress Steps */}
                <div className="bg-muted/50 px-6 py-4 border-b">
                    <div className="flex items-center justify-between">
                        {STEPS.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = currentStep === step.id;
                            const isCompleted = currentStep > step.id;

                            return (
                                <div key={step.id} className="flex items-center">
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`
                        w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                        ${isCompleted
                                                    ? "bg-green-600 text-white"
                                                    : isActive
                                                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                                                        : "bg-muted text-muted-foreground"
                                                }
                      `}
                                        >
                                            {isCompleted ? (
                                                <Check className="w-5 h-5" />
                                            ) : (
                                                <Icon className="w-5 h-5" />
                                            )}
                                        </div>
                                        <span
                                            className={`text-xs mt-1 font-medium ${isActive ? "text-foreground" : "text-muted-foreground"
                                                }`}
                                        >
                                            {step.title}
                                        </span>
                                    </div>
                                    {index < STEPS.length - 1 && (
                                        <div
                                            className={`w-16 h-0.5 mx-2 transition-colors duration-300 ${isCompleted ? "bg-green-600" : "bg-muted"
                                                }`}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Step 1: Confirm Service */}
                    {currentStep === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <DialogHeader>
                                <DialogTitle className="text-xl">Confirm Your Selection</DialogTitle>
                                <DialogDescription>
                                    Review your chosen audit package before proceeding.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="bg-muted/50 rounded-xl p-6 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-lg">{service.title}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {service.description}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-3xl font-bold">${service.price}</span>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <p className="text-sm font-medium mb-2">Included:</p>
                                    <ul className="space-y-1">
                                        {service.features.slice(0, 3).map((feature, i) => (
                                            <li
                                                key={i}
                                                className="flex items-center gap-2 text-sm text-muted-foreground"
                                            >
                                                <Check className="w-4 h-4 text-green-600" />
                                                {feature}
                                            </li>
                                        ))}
                                        {service.features.length > 3 && (
                                            <li className="text-sm text-muted-foreground pl-6">
                                                +{service.features.length - 3} more features
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Contact Details */}
                    {currentStep === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <DialogHeader>
                                <DialogTitle className="text-xl">Your Details</DialogTitle>
                                <DialogDescription>
                                    We'll use this information to send your audit report.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="John Smith"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="propertyAddress">Property Address</Label>
                                    <Input
                                        id="propertyAddress"
                                        name="propertyAddress"
                                        placeholder="123 Main Street, London"
                                        value={formData.propertyAddress}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Payment */}
                    {currentStep === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <DialogHeader>
                                <DialogTitle className="text-xl">Payment</DialogTitle>
                                <DialogDescription>
                                    Complete your purchase securely with Stripe.
                                </DialogDescription>
                            </DialogHeader>

                            {/* Stripe Placeholder */}
                            <div className="bg-muted/50 rounded-xl p-6 border-2 border-dashed border-muted-foreground/20">
                                <div className="text-center space-y-4">
                                    <CreditCard className="w-12 h-12 mx-auto text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Stripe Payment Form</p>
                                        <p className="text-sm text-muted-foreground">
                                            Card details will appear here after backend integration.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{service.title}</span>
                                    <span>${service.price}.00</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between font-semibold">
                                    <span>Total</span>
                                    <span>${service.price}.00</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t bg-muted/30 flex justify-between">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={currentStep === 1}
                        className="gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>

                    {currentStep < 3 ? (
                        <Button onClick={handleNext} className="gap-2">
                            Continue
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                            <CreditCard className="w-4 h-4" />
                            Pay ${service.price}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
