"use client";

import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-bg-warm">
      <Navbar />

      <main className="flex-1 py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto bg-white rounded-xl p-8 shadow-lg border border-brand-border">
            <h1 className="text-2xl md:text-3xl font-headline font-extrabold text-brand-text-primary mb-4">
              Privacy Policy
            </h1>

            <p className="text-brand-text-secondary mb-4">
              This Privacy Policy explains how Hostlio collects, uses, and
              discloses your personal information when you use our services.
            </p>

            <h3 className="text-lg font-semibold text-brand-text-primary mt-6">
              Information We Collect
            </h3>
            <p className="text-brand-text-secondary mb-4">
              We collect information you provide directly (account info,
              messages, photos) and data gathered automatically (device
              identifiers, usage). We only store what's necessary to provide
              services.
            </p>

            <h3 className="text-lg font-semibold text-brand-text-primary mt-6">
              How We Use Information
            </h3>
            <p className="text-brand-text-secondary mb-4">
              We use data to operate and improve our services, verify listings,
              communicate with users, and comply with legal obligations.
            </p>

            <h3 className="text-lg font-semibold text-brand-text-primary mt-6">
              Sharing
            </h3>
            <p className="text-brand-text-secondary mb-4">
              We share information with service providers (hosting, analytics)
              and as required by law. We do not sell personal data.
            </p>

            <h3 className="text-lg font-semibold text-brand-text-primary mt-6">
              Contact
            </h3>
            <p className="text-brand-text-secondary">
              Questions about this policy can be sent to{" "}
              <a
                href="mailto:privacy@hostlio.in"
                className="text-brand-teal font-medium"
              >
                privacy@hostlio.in
              </a>
              .
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
