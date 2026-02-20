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
    }
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
                <div className="max-w-md mx-auto">
                    <ServiceCard
                        title={SERVICES.online.title}
                        price={SERVICES.online.price}
                        discountPrice={0}
                        description={SERVICES.online.description}
                        features={SERVICES.online.features}
                        isPopular={true}
                        isBeta={true}
                        buttonText="Take the questionnaire"
                        onSelect={() => handleSelectService("online")}
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
