"use client";

import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-bg-warm">
      <Navbar />

      <main className="flex-1 py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto bg-white rounded-xl p-8 shadow-lg border border-brand-border">
            <h1 className="text-2xl md:text-3xl font-headline font-extrabold text-brand-text-primary mb-4">
              About Hostlio
            </h1>

            <p className="text-brand-text-secondary mb-4">
              Hostlio is India's student-first rentals platform. We connect
              students, professionals and owners with verified listings—no
              brokers, no commission. Our mission is to make finding a place
              simple, safe and transparent.
            </p>

            <h3 className="text-lg font-semibold text-brand-text-primary mt-6">
              Our Mission
            </h3>
            <p className="text-brand-text-secondary mb-4">
              To reduce friction in the rentals market by offering verified
              owner listings, clear pricing and intuitive search tools that work
              for students and young professionals across India.
            </p>

            <h3 className="text-lg font-semibold text-brand-text-primary mt-6">
              What We Value
            </h3>
            <ul className="list-disc list-inside text-brand-text-secondary mb-4">
              <li>Trust: every listing is manually verified.</li>
              <li>Transparency: owner-first contact and no hidden fees.</li>
              <li>Speed: fast search and relevant matches.</li>
            </ul>

            <h3 className="text-lg font-semibold text-brand-text-primary mt-6">
              Contact
            </h3>
            <p className="text-brand-text-secondary">
              For press, partnerships or support please visit the Contact page
              or email us at{" "}
              <a
                href="mailto:support@hostlio.in"
                className="text-brand-teal font-medium"
              >
                support@hostlio.in
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
