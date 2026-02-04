"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ServiceCardProps {
    title: string;
    price: number;
    discountPrice?: number;
    description: string;
    features: readonly string[];
    isPopular?: boolean;
    isBeta?: boolean;
    isComingSoon?: boolean;
    buttonText?: string;
    onSelect: () => void;
}

export function ServiceCard({
    title,
    price,
    discountPrice,
    description,
    features,
    isPopular = false,
    isBeta = false,
    isComingSoon = false,
    buttonText = "Get Started",
    onSelect,
}: ServiceCardProps) {
    const isFree = discountPrice === 0;
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
            {isPopular && !isBeta && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
                        ✨ Most Popular
                    </span>
                </div>
            )}

            {/* Beta Tester Badge */}
            {isBeta && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-semibold bg-emerald-600 text-white">
                        Beta Access - Free
                    </span>
                </div>
            )}

            {/* Coming Soon Overlay */}
            {isComingSoon && (
                <div className="absolute inset-0 bg-background/90 backdrop-blur-[2px] rounded-2xl flex items-center justify-center z-10">
                    <div className="text-center">
                        <span className="inline-flex items-center px-5 py-2 rounded-full text-sm font-semibold bg-muted text-muted-foreground border">
                            Coming Soon
                        </span>
                        <p className="text-muted-foreground text-xs mt-2">Available after beta</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>

            {/* Price */}
            <div className="text-center mb-8">
                {isFree ? (
                    <>
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <span className="text-xl text-muted-foreground line-through">£{price}</span>
                            <span className="text-4xl font-bold tracking-tight text-emerald-600">
                                FREE
                            </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            Limited beta offer
                        </span>
                    </>
                ) : (
                    <>
                        <div className="flex items-baseline justify-center gap-1">
                            <span className="text-lg text-muted-foreground">£</span>
                            <span
                                className={`text-5xl font-extrabold tracking-tight ${isPopular
                                    ? "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                                    : "text-foreground"
                                    }`}
                            >
                                {discountPrice !== undefined ? discountPrice : price}
                            </span>
                        </div>
                        <span className="text-sm text-muted-foreground">one-time payment</span>
                    </>
                )}
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
                disabled={isComingSoon}
                className={`
          w-full font-semibold transition-all duration-300
          ${isComingSoon
                        ? "opacity-50 cursor-not-allowed"
                        : isPopular || isBeta
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
                            : "bg-primary hover:bg-primary/90"
                    }
        `}
            >
                {isComingSoon ? "Coming Soon" : buttonText}
            </Button>
        </div>
    );
}
