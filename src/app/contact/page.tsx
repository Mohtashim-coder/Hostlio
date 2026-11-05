"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Contact from ${name || "Visitor"}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\n${message}`,
    );
    window.location.href = `mailto:support@hostlio.in?subject=${subject}&body=${body}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg-warm">
      <Navbar />

      <main className="flex-1 py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-brand-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col justify-center p-4">
                <h1 className="text-2xl font-headline font-bold text-brand-text-primary mb-2">
                  Contact Us
                </h1>
                <p className="text-brand-text-secondary mb-4">
                  We'd love to hear from you. Whether you need support, want to
                  partner, or have feedback — drop us a message and we'll get
                  back shortly.
                </p>

                <div className="space-y-3 text-sm text-brand-text-secondary">
                  <div>
                    <strong className="block text-brand-text-primary">
                      Email
                    </strong>
                    <a
                      href="mailto:support@hostlio.in"
                      className="text-brand-teal"
                    >
                      support@hostlio.in
                    </a>
                  </div>
                  <div>
                    <strong className="block text-brand-text-primary">
                      Phone
                    </strong>
                    <span className="text-brand-text-secondary">
                      +91 80024 76008
                    </span>
                  </div>
                  <div>
                    <strong className="block text-brand-text-primary">
                      Office
                    </strong>
                    <span className="text-brand-text-secondary">
                      Patna, Bihar, India
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-text-secondary">
                      Name
                    </label>
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 block w-full border border-brand-border rounded-md p-2"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-text-secondary">
                      Email
                    </label>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 block w-full border border-brand-border rounded-md p-2"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-text-secondary">
                      Message
                    </label>
                    <textarea
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="mt-1 block w-full border border-brand-border rounded-md p-2 h-32"
                      placeholder="How can we help?"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-brand-teal text-white px-6 py-2 rounded-md font-bold"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
