
"use client"

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Share2, 
  Heart, 
  ChevronRight, 
  Lock, 
  CheckCircle2, 
  Wifi, 
  AirVent, 
  Car, 
  UtilityPole, 
  Cctv,
  ArrowRight,
  Loader2,
  Zap,
  ArrowLeft
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function PropertyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    fetchProperty();
  }, [resolvedParams.id]);

  async function fetchProperty() {
    try {
      const res = await fetch(`/api/properties/${resolvedParams.id}`);
      const data = await res.json();
      if (!res.ok) {
        setProperty(null);
      } else {
        setProperty(data);
      }
    } catch (error) {
      console.error(error);
      setProperty(null);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="w-8 h-8 text-brand-teal animate-spin" />
          <p className="text-brand-text-secondary font-medium">Loading property details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="text-center py-40 space-y-4">
          <h1 className="text-2xl font-bold">Property not found</h1>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto md:py-8 px-4 pb-8 w-full">
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-brand-teal hover:text-brand-teal-mid transition-colors mb-4 font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Go Back
        </button>

        <div className="hidden md:flex items-center gap-2 text-xs text-brand-text-secondary mb-6">
          <span>Home</span> <ChevronRight className="w-3 h-3" />
          <span>{property.city}</span> <ChevronRight className="w-3 h-3" />
          <span className="text-brand-text-primary font-bold">{property.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 rounded-xl overflow-hidden shadow-sm">
              <div className="md:col-span-2 aspect-[16/9] relative">
                <Image src={property.photos?.[0] || `https://picsum.photos/seed/${property.id}/800/600`} alt="Main" fill className="object-cover" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                <div className="relative aspect-square md:aspect-auto h-full">
                  <Image src={property.photos?.[1] || `https://picsum.photos/seed/${property.id}1/400/300`} alt="Sub 1" fill className="object-cover" />
                </div>
                <div className="relative aspect-square md:aspect-auto h-full">
                  <Image src={property.photos?.[2] || `https://picsum.photos/seed/${property.id}2/400/300`} alt="Sub 2" fill className="object-cover" />
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-brand-border pb-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {property.status === "live" && (
                    <Badge className="bg-brand-teal text-white rounded-sm font-bold uppercase text-[10px]">Verified Listing</Badge>
                  )}
                  <Badge variant="outline" className="border-brand-border text-brand-text-secondary rounded-sm font-bold uppercase text-[10px]">{property.type}</Badge>
                </div>
                <h1 className="text-2xl md:text-3xl font-headline font-extrabold text-brand-text-primary">{property.title}</h1>
                <div className="flex items-center gap-1 text-brand-text-secondary">
                  <MapPin className="w-4 h-4 text-brand-teal" />
                  <span className="text-sm font-medium">{property.address}, {property.city}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="rounded-md border-brand-border"><Share2 className="w-4 h-4" /></Button>
                <Button variant="outline" size="icon" className="rounded-md border-brand-border"><Heart className="w-4 h-4" /></Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SpecItem label="Monthly Rent" value={`₹${property.rent.toLocaleString()}`} sub="Non-negotiable" />
              <SpecItem label="Security Deposit" value={`₹${property.deposit.toLocaleString()}`} sub="Standard" />
              <SpecItem label="Property Type" value={property.type} sub={property.furnishing} />
              <SpecItem label="Preferred" value={property.preferred_tenants} sub="Verified only" />
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-headline font-bold text-brand-text-primary">Property Description</h2>
              <p className="text-brand-text-secondary font-body leading-relaxed text-base whitespace-pre-line">
                {property.description}
              </p>
            </div>

            <div className="space-y-4 pt-4">
              <h2 className="text-xl font-headline font-bold text-brand-text-primary">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {(property.amenities || ['WiFi', 'AC', 'CCTV']).map((amenity: string) => (
                  <Amenity key={amenity} label={amenity} />
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white border-2 border-brand-teal rounded-xl p-6 shadow-xl space-y-6">
                <div className="text-center space-y-1">
                  <h3 className="text-2xl font-headline font-extrabold text-brand-text-primary">Contact Owner</h3>
                  <p className="text-xs text-brand-text-secondary font-medium">Direct connection. No brokers.</p>
                </div>

                {!isUnlocked ? (
                  <div className="space-y-4">
                    <div className="bg-brand-teal-light p-4 rounded-lg flex items-start gap-3">
                      <Lock className="w-5 h-5 text-brand-teal mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-brand-text-primary leading-tight">Owner details are locked</p>
                        <p className="text-[11px] text-brand-text-secondary mt-1">Unlock WhatsApp number to chat directly with the verified owner.</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-xs font-bold text-brand-text-primary uppercase tracking-wider text-center">Unlock for as low as ₹3.96</p>
                      <div className="grid grid-cols-1 gap-2">
                         <CreditOption 
                          price="₹9" 
                          contacts="1 Contact" 
                          onClick={() => {}} 
                         />
                         <CreditOption 
                          price="₹49" 
                          contacts="10 Contacts" 
                          popular 
                          onClick={() => setIsUnlocked(true)} 
                         />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-brand-success/10 border border-brand-success/30 p-4 rounded-lg text-center">
                      <p className="text-sm font-bold text-brand-success">Contact Unlocked!</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Button className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-md h-12 shadow-md">
                        Chat on WhatsApp
                      </Button>
                      <Button variant="outline" className="w-full border-brand-border text-brand-text-primary font-bold rounded-md h-12">
                        Call Owner
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-brand-bg-warm rounded-xl p-6 border border-brand-border space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-teal flex items-center justify-center text-white">
                    <Zap className="w-4 h-4" />
                  </div>
                  <h4 className="font-headline font-bold text-brand-text-primary">Need Help?</h4>
                </div>
                <p className="text-xs text-brand-text-secondary leading-relaxed">
                  Want someone to visit the property for you? Our managers can help for a small visiting charge.
                </p>
                <Button variant="link" className="text-brand-teal p-0 h-auto font-bold text-sm">
                  Request Manager Help <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function SpecItem({ label, value, sub }: { label: string, value: string, sub: string }) {
  return (
    <div className="p-4 rounded-lg bg-brand-bg-warm border border-brand-border">
      <p className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-wider mb-1">{label}</p>
      <p className="text-lg font-headline font-bold text-brand-text-primary">{value}</p>
      <p className="text-[10px] text-brand-text-secondary mt-1">{sub}</p>
    </div>
  )
}

function Amenity({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-brand-teal-light flex items-center justify-center text-brand-teal">
        <CheckCircle2 className="w-4 h-4" />
      </div>
      <span className="text-sm font-medium text-brand-text-secondary">{label}</span>
    </div>
  )
}

function CreditOption({ price, contacts, popular, onClick }: { price: string, contacts: string, popular?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all group ${popular ? 'border-brand-teal bg-brand-teal-light' : 'border-brand-border hover:border-brand-teal-mid'}`}
    >
      <div className="flex flex-col items-start">
        <span className="text-sm font-bold text-brand-text-primary">{contacts}</span>
        {popular && <span className="text-[9px] font-bold text-brand-teal uppercase mt-0.5">Most Popular</span>}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-lg font-headline font-extrabold text-brand-text-primary">{price}</span>
        <div className="w-5 h-5 rounded-full bg-white border border-brand-border flex items-center justify-center group-hover:border-brand-teal">
          <ChevronRight className="w-3 h-3 text-brand-text-secondary group-hover:text-brand-teal" />
        </div>
      </div>
    </button>
  )
}
