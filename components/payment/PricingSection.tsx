"use client";

import { useState } from "react";
import { ServiceCard } from "./ServiceCard";
import { PaymentModal } from "./PaymentModal";

const SERVICES = {
    online: {
        id: "online",
        title: "Online Audit",
        price: 50,
        description: "Self-guided questionnaire with automated report",
        features: [
            "Comprehensive online questionnaire",
            "Automated risk scoring",
            "Instant PDF report download",
            "Traffic light compliance indicators",
            "Actionable recommendations",
        ],
    },
    onsite: {
        id: "onsite",
        title: "Onsite Audit",
        price: 500,
        description: "In-person inspection by a qualified auditor",
        features: [
            "Everything in Online Audit",
            "Physical property inspection",
            "Face-to-face consultation",
            "Priority support",
            "Detailed photographic evidence",
            "Travel to London, Bristol, Cheltenham, Newquay included",
        ],
    },
} as const;

type ServiceId = keyof typeof SERVICES;

export function PricingSection() {
    const [selectedService, setSelectedService] = useState<ServiceId | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSelectService = (serviceId: ServiceId) => {
        setSelectedService(serviceId);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedService(null);
    };

    return (
        <section className="py-20 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <ServiceCard
                        title={SERVICES.online.title}
                        price={SERVICES.online.price}
                        description={SERVICES.online.description}
                        features={SERVICES.online.features}
                        isPopular={true}
                        buttonText="Take the questionnaire"
                        onSelect={() => handleSelectService("online")}
                    />
                    <ServiceCard
                        title={SERVICES.onsite.title}
                        price={SERVICES.onsite.price}
                        description={SERVICES.onsite.description}
                        features={SERVICES.onsite.features}
                        isPopular={false}
                        buttonText="Book now"
                        onSelect={() => handleSelectService("onsite")}
                    />
                </div>
            </div>

            {/* Payment Modal */}
            {selectedService && (
                <PaymentModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    service={SERVICES[selectedService]}
                />
            )}
        </section>
    );
}
