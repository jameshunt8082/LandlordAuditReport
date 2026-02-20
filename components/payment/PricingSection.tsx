"use client";

import { useState, useEffect } from "react";
import { ServiceCard } from "./ServiceCard";
import { PaymentModal } from "./PaymentModal";
import { getProductDisplayConfig } from "@/lib/product-config";
import { Loader2 } from "lucide-react";

interface StripePrice {
    id: string;
    unit_amount: number | null;
    currency: string;
    type: string;
}

interface StripeProduct {
    id: string;
    name: string;
    description: string | null;
    defaultPrice: StripePrice | null;
}

interface Service {
    id: string;
    title: string;
    price: number;
    priceId: string;
    description: string;
    features: string[];
    isPopular?: boolean;
    isBeta?: boolean;
    isComingSoon?: boolean;
    buttonText?: string;
}

export function PricingSection() {
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch products from Stripe on mount
    useEffect(() => {
        async function fetchProducts() {
            try {
                const res = await fetch("/api/stripe/products");
                if (!res.ok) throw new Error("Failed to fetch products");
                
                const data = await res.json();
                
                const mapped: Service[] = data.products
                    .filter((p: StripeProduct) => p.defaultPrice)
                    .map((product: StripeProduct) => {
                        const config = getProductDisplayConfig(product.id);
                        const priceInPounds = (product.defaultPrice!.unit_amount || 0) / 100;

                        return {
                            id: product.id,
                            title: product.name,
                            price: priceInPounds,
                            priceId: product.defaultPrice!.id,
                            description: config.description,
                            features: config.features,
                            isPopular: config.isPopular,
                            isBeta: config.isBeta,
                            isComingSoon: config.isComingSoon,
                            buttonText: config.buttonText,
                            _order: config.order ?? 99,
                        };
                    })
                    .sort((a: Service & { _order: number }, b: Service & { _order: number }) => a._order - b._order);

                setServices(mapped);
            } catch (err) {
                console.error("Error fetching products:", err);
                setError("Unable to load pricing. Please refresh the page.");
            } finally {
                setIsLoading(false);
            }
        }
        fetchProducts();
    }, []);

    const handleSelectService = (service: Service) => {
        setSelectedService(service);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedService(null);
    };

    if (isLoading) {
        return (
            <section className="py-20 px-4">
                <div className="max-w-5xl mx-auto flex justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="py-20 px-4">
                <div className="max-w-5xl mx-auto text-center">
                    <p className="text-red-500">{error}</p>
                </div>
            </section>
        );
    }

    return (
        <section className="py-20 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Pricing Cards */}
                <div className={services.length === 1 ? "max-w-md mx-auto" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"}>
                    {services.map((service) => (
                        <ServiceCard
                            key={service.id}
                            title={service.title}
                            price={service.price}
                            description={service.description}
                            features={service.features}
                            isPopular={service.isPopular}
                            isBeta={service.isBeta}
                            isComingSoon={service.isComingSoon}
                            buttonText={service.buttonText}
                            onSelect={() => handleSelectService(service)}
                        />
                    ))}
                </div>
            </div>

            {/* Payment Modal */}
            {selectedService && (
                <PaymentModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    service={selectedService}
                />
            )}
        </section>
    );
}
