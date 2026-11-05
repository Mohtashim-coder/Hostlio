"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  MapPin,
  ShieldCheck,
  Zap,
  Users,
  Home,
  Star,
  Shield,
  Clock,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

const ROTATING_SENTENCES = [
  "No broker, No BS.",
  "150+ Daily new listings added.",
  "Over 2,000+ happy flatmates matched.",
  "Over 2,500+ happy customers",
  "Joined by 12000+ students this month",
];

export default function HomePage() {
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % ROTATING_SENTENCES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar showSearchOnScroll />

      <section className="relative pt-12 pb-20 px-4 md:pt-24 md:pb-28 overflow-hidden bg-brand-teal-light">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="z-10 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-3 py-1 rounded-pill bg-brand-teal text-white text-xs font-bold uppercase tracking-wider">
                India's #1 Rental Platform
              </div>
              <h1 className="text-4xl md:text-6xl font-headline font-extrabold text-brand-text-primary leading-tight">
                Ghar dhundo. <br />
                <span className="text-brand-teal-dark">Broker nahi.</span>
              </h1>
              <div className="h-8 overflow-hidden">
                <p
                  className="text-xl text-brand-text-secondary font-medium animate-in slide-in-from-bottom-2 duration-500"
                  key={textIndex}
                >
                  {ROTATING_SENTENCES[textIndex]}
                </p>
              </div>
            </div>

            <div
              id="hero-search"
              className="bg-white p-2 rounded-lg shadow-lg flex flex-col md:flex-row gap-2 max-w-xl border border-brand-border"
            >
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary w-5 h-5" />
                <Input
                  placeholder="Enter area or city e.g. Boring Road"
                  className="pl-10 border-none shadow-none focus-visible:ring-0 text-brand-text-primary bg-transparent h-12"
                />
              </div>
              <Link href="/search">
                <Button className="w-full md:w-auto bg-brand-teal hover:bg-brand-teal-mid text-white rounded-md px-8 h-12 font-bold transition-all shadow-teal">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-brand-warning fill-brand-warning" />
                <span className="text-sm font-bold text-brand-text-primary">
                  4.8 Rating
                </span>
              </div>
              <div className="h-4 w-px bg-brand-border hidden md:block"></div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-brand-success" />
                <span className="text-sm font-bold text-brand-text-primary">
                  100% Safe
                </span>
              </div>
              <div className="h-4 w-px bg-brand-border hidden md:block"></div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-teal" />
                <span className="text-sm font-bold text-brand-text-primary">
                  24/7 Available
                </span>
              </div>
            </div>

            {/* Milestone Stats */}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-4 border-t border-brand-teal/20">
              <div className="space-y-1">
                <p className="text-2xl font-headline font-extrabold text-brand-text-primary">
                  2,500+
                </p>
                <p className="text-[10px] uppercase font-bold tracking-wider text-brand-text-secondary">
                  Happy Customers
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-headline font-extrabold text-brand-text-primary">
                  3,000+
                </p>
                <p className="text-[10px] uppercase font-bold tracking-wider text-brand-text-secondary">
                  Room Owners Listed
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-headline font-extrabold text-brand-text-primary">
                  50+
                </p>
                <p className="text-[10px] uppercase font-bold tracking-wider text-brand-text-secondary">
                  Cities in India
                </p>
              </div>
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="absolute -inset-4 bg-brand-teal rounded-xl rotate-3 opacity-10"></div>
            <div className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-white bg-white h-[450px]">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdLrh8oN1GUzhEkcRh7ak8_a-ni6DFYX6NisbGAqJlAs5oEqlwaye5y-ql&s=10"
                alt="India Rentals"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-lg border border-brand-border shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-success/20 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-brand-success" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-brand-text-primary">
                      Verified listings across Patna
                    </p>
                    <p className="text-[11px] text-brand-text-secondary">
                      Direct owner contacts verified today
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-brand-bg-warm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <h2 className="text-3xl font-headline font-bold text-brand-text-primary">
                Popular in India
              </h2>
              <p className="text-brand-text-secondary">
                Find your next home in these major cities.
              </p>
            </div>
            <Button
              variant="outline"
              className="w-fit rounded-pill border-brand-teal text-brand-teal font-bold"
            >
              View All 38 Districts
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              {
                name: "Patna",
                img: "https://yometro.com/images/places/golghar.jpg",
              },
              {
                name: "Muzaffarpur",
                img: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/02/f4/b5/ff/garib-sthan-temple.jpg?w=400&h=-1&s=1",
              },
              {
                name: "Darbhanga",
                img: "https://www.goindigo.in/content/dam/s6web/in/en/assets/Destinations/destinations/darbhanga/Shyama%20Kali%20Temple%20Large%20Large.jpeg",
              },
              {
                name: "Gaya",
                img: "https://www.holidify.com/images/cmsuploads/compressed/shutterstock_402506581_20191024172033_20191024172055.jpg",
              },
            ].map((city) => (
              <Link
                key={city.name}
                href={`/search?city=${city.name}`}
                className="group block"
              >
                <div className="relative rounded-lg overflow-hidden aspect-[4/5] shadow-md hover:shadow-xl transition-all bg-brand-teal">
                  <img
                    src={city.img}
                    alt={city.name}
                    className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                    <div>
                      <p className="text-white font-headline font-bold text-2xl">
                        {city.name}
                      </p>
                      <p className="text-white text-opacity-80 text-sm font-medium">
                        Explore Properties
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-brand-text-primary">
              Why India chooses Hostlio
            </h2>
            <p className="text-brand-text-secondary max-w-2xl mx-auto">
              We have redesigned the rental experience specifically for the
              needs of students and professionals in India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<ShieldCheck className="w-6 h-6 text-brand-teal" />}
              title="Verified Owners Only"
              description="Every property undergoes geo-tagging and manual verification to prevent fraud and ensure you speak to real owners."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-brand-teal" />}
              title="Direct Connection"
              description="No brokers, no commission. Unlock owner WhatsApp details for a small one-time fee and talk directly."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6 text-brand-teal" />}
              title="Student First"
              description="Tailored filters for PGs, hostels, and shared rooms near major coaching hubs and universities."
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-8 rounded-xl border border-brand-border bg-white hover:shadow-lg transition-all space-y-4">
      <div className="w-12 h-12 rounded-lg bg-brand-teal-light flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-headline font-bold text-brand-text-primary">
        {title}
      </h3>
      <p className="text-brand-text-secondary text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}
