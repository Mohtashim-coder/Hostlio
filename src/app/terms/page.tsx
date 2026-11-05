"use client";

import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-bg-warm">
      <Navbar />

      <main className="flex-1 py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto bg-white rounded-xl p-8 shadow-lg border border-brand-border">
            <h1 className="text-2xl md:text-3xl font-headline font-extrabold text-brand-text-primary mb-4">
              Terms &amp; Conditions
            </h1>

            <p className="text-brand-text-secondary mb-4">
              These Terms govern your use of Hostlio's website and services. By
              using Hostlio you agree to these terms.
            </p>

            <h3 className="text-lg font-semibold text-brand-text-primary mt-6">
              Using the Service
            </h3>
            <p className="text-brand-text-secondary mb-4">
              You agree to provide accurate information and not to misuse the
              platform. Listings must be truthful and comply with local laws.
            </p>

            <h3 className="text-lg font-semibold text-brand-text-primary mt-6">
              Limitation of Liability
            </h3>
            <p className="text-brand-text-secondary mb-4">
              Hostlio provides the platform and does not take responsibility for
              interactions between users. Use caution and verify owners before
              transactions.
            </p>

            <h3 className="text-lg font-semibold text-brand-text-primary mt-6">
              Changes
            </h3>
            <p className="text-brand-text-secondary mb-4">
              We may update these terms; we will notify users where required by
              law. Continued use after changes constitutes acceptance.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
