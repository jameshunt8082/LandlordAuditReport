"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ServiceCardProps {
    title: string;
    price: number;
    description: string;
    features: readonly string[];
    isPopular?: boolean;
    buttonText?: string;
    onSelect: () => void;
}

export function ServiceCard({
    title,
    price,
    description,
    features,
    isPopular = false,
    buttonText = "Get Started",
    onSelect,
}: ServiceCardProps) {
    return (
        <div
            className={`
        relative flex flex-col p-8 rounded-2xl border transition-all duration-300 ease-out
        hover:scale-[1.02] hover:shadow-2xl
        ${isPopular
                    ? "bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-transparent border-blue-500/30 shadow-xl shadow-blue-500/10"
                    : "bg-card border-border hover:border-primary/30"
                }
      `}
        >
            {/* Popular Badge */}
            {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
                        ✨ Most Popular
                    </span>
                </div>
            )}

            {/* Header */}
            <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>

            {/* Price */}
            <div className="text-center mb-8">
                <div className="flex items-baseline justify-center gap-1">
                    <span className="text-lg text-muted-foreground">£</span>
                    <span
                        className={`text-5xl font-extrabold tracking-tight ${isPopular
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                            : "text-foreground"
                            }`}
                    >
                        {price}
                    </span>
                </div>
                <span className="text-sm text-muted-foreground">one-time payment</span>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-8 flex-grow">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                        <div
                            className={`
                flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5
                ${isPopular ? "bg-blue-600/20 text-blue-600" : "bg-primary/10 text-primary"}
              `}
                        >
                            <Check className="w-3 h-3" />
                        </div>
                        <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                ))}
            </ul>

            {/* CTA Button */}
            <Button
                onClick={onSelect}
                size="lg"
                className={`
          w-full font-semibold transition-all duration-300
          ${isPopular
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
                        : "bg-primary hover:bg-primary/90"
                    }
        `}
            >
                {buttonText}
            </Button>
        </div>
    );
}
