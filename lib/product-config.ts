/**
 * Local product configuration for frontend display.
 * 
 * Features and descriptions stay in the frontend (per user preference).
 * Products are matched by Stripe product ID.
 * Prices and names are fetched dynamically from Stripe.
 * 
 * To add a new product:
 * 1. Create the product + price in Stripe Dashboard
 * 2. Add an entry here with the product ID and its features
 */

export interface ProductDisplayConfig {
  /** Short description for the pricing card */
  description: string;
  /** Feature list for the pricing card bullets */
  features: string[];
  /** Whether this card shows the "Most Popular" or "Beta" badge */
  isPopular?: boolean;
  isBeta?: boolean;
  isComingSoon?: boolean;
  /** Custom CTA button text */
  buttonText?: string;
  /** Display order (lower = first) */
  order?: number;
}

/**
 * Map of Stripe Product ID -> local display config.
 * 
 * Add new products here as they are created in Stripe.
 */
export const PRODUCT_DISPLAY_CONFIG: Record<string, ProductDisplayConfig> = {
  // Online Landlord Audit - prod_U13vi0ztrYzs3I
  "prod_U13vi0ztrYzs3I": {
    description: "Self-guided questionnaire with automated report",
    features: [
      "Comprehensive online questionnaire",
      "Automated risk scoring",
      "Instant PDF report download",
      "Traffic light compliance indicators",
      "Actionable recommendations",
    ],
    isPopular: true,
    buttonText: "Take the questionnaire",
    order: 1,
  },
};

/**
 * Get display config for a product, with sensible fallbacks.
 */
export function getProductDisplayConfig(productId: string): ProductDisplayConfig {
  return PRODUCT_DISPLAY_CONFIG[productId] || {
    description: "Professional audit service",
    features: ["Comprehensive assessment", "Detailed report"],
    buttonText: "Get Started",
    order: 99,
  };
}
