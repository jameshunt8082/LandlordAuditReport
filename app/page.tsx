import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { PricingSection } from "@/components/payment/PricingSection";

export default async function HomePage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-center">
          <Link href="/" className="text-xl font-bold">
            Landlord Audit
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            ✨ Built on 20 years of landlord experience
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground">
            Eliminate Hidden Landlord Risks
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Receive a clear, prioritised roadmap of actions to safeguard your
            property, strengthen compliance, and prevent costly disputes.
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Landlord Safeguarding Ltd - All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
