"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Search as SearchIcon,
  SlidersHorizontal,
  Map as MapIcon,
  List,
  Verified,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function SearchPage() {
  const [view, setView] = useState<"grid" | "map">("grid");
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [cityQuery, setCityQuery] = useState("");

  useEffect(() => {
    // Read city from URL params on mount
    const params = new URLSearchParams(window.location.search);
    const city = params.get("city") || "";
    setCityQuery(city);
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [filter, cityQuery]);

  async function fetchProperties() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "All") params.set("type", filter);
      if (cityQuery) params.set("city", cityQuery);
      const url = `/api/properties${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.properties && Array.isArray(data.properties)) {
        setProperties(data.properties);
      } else if (Array.isArray(data)) {
        setProperties(data);
      }
    } catch (error) {
      console.error("Failed to fetch properties:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg-warm">
      <header className="sticky z-40 bg-white border-b border-brand-border py-4 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-row gap-2 items-center">
          <div className="flex-1 min-w-0 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary w-4 h-4" />
            <Input
              placeholder="Search area, city or property..."
              className="pl-10 h-11 bg-brand-bg-warm border-transparent focus:bg-white"
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              className="h-11 rounded-md border-brand-border px-3 flex items-center justify-center"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Filters</span>
            </Button>
            <div className="hidden md:flex border border-brand-border rounded-md p-1 bg-brand-bg-warm">
              <Button
                variant={view === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("grid")}
                className={
                  view === "grid"
                    ? "bg-white text-brand-text-primary shadow-sm hover:bg-white"
                    : ""
                }
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={view === "map" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("map")}
                className={
                  view === "map"
                    ? "bg-white text-brand-text-primary shadow-sm hover:bg-white"
                    : ""
                }
              >
                <MapIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <p className="text-brand-text-secondary font-medium order-2 md:order-1">
            Showing{" "}
            <span className="text-brand-text-primary font-bold">
              {properties.length} properties
            </span>{" "}
            in India
          </p>
          <div className="flex flex-wrap gap-2 order-1 md:order-2 justify-center">
            {["All", "Flat", "PG", "Room", "Hostel"].map((type) => (
              <Badge
                key={type}
                variant={type === filter ? "default" : "outline"}
                onClick={() => setFilter(type)}
                className={`rounded-pill px-4 py-1 cursor-pointer transition-all ${type === filter ? "bg-brand-teal hover:bg-brand-teal" : "hover:border-brand-teal"}`}
              >
                {type}
              </Badge>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-brand-teal animate-spin" />
            <p className="text-brand-text-secondary font-medium">
              Finding verified rooms for you...
            </p>
          </div>
        ) : (
          view === "map" ? (
            <MapView />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {properties.map((prop) => (
                <PropertyCard key={prop._id} property={prop} />
              ))}
              {properties.length === 0 && (
                <div className="col-span-full py-20 text-center space-y-4 bg-white rounded-xl border border-brand-border">
                  <p className="text-brand-text-primary font-bold text-xl">
                    No properties found
                  </p>
                  <p className="text-brand-text-secondary">
                    Try changing your filters or searching a different area.
                  </p>
                </div>
              )}
            </div>
          )
        )}
      </main>

      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <Button onClick={() => setView("map")} className="rounded-pill bg-brand-text-primary text-white shadow-xl px-8 h-12 font-bold flex items-center gap-2">
          <MapIcon className="w-4 h-4" />
          Map View
        </Button>
      </div>
    </div>
  );
}

function PropertyCard({ property }: { property: any }) {
  return (
    <Link
      href={`/property/${property._id}`}
      className="group bg-white rounded-lg border border-brand-border overflow-hidden hover:shadow-xl transition-all flex flex-col h-full"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={
            property.photos?.[0] ||
            `https://picsum.photos/seed/${property._id}/600/400`
          }
          alt={property.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <div className="bg-brand-teal text-white text-[10px] font-bold px-2 py-1 rounded-sm flex items-center gap-1 shadow-sm uppercase tracking-wider">
            <Verified className="w-3 h-3" />
            Verified
          </div>
        </div>
        <div className="absolute bottom-3 right-3">
          <div className="bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-md">
            ₹{property.rent.toLocaleString()}/mo
          </div>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col space-y-3">
        <div>
          <h3 className="font-headline font-bold text-lg text-brand-text-primary leading-snug line-clamp-1">
            {property.title}
          </h3>
          <div className="flex items-center gap-1 text-brand-text-secondary text-xs mt-1">
            <MapPin className="w-3 h-3" />
            <span className="truncate">
              {property.address}, {property.city}, {property.pincode}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-auto">
          <Badge
            variant="secondary"
            className="bg-brand-bg-warm text-brand-text-secondary font-medium text-[10px] uppercase tracking-wide px-2 py-0.5 border-none"
          >
            {property.type}
          </Badge>
          <Badge
            variant="secondary"
            className="bg-brand-bg-warm text-brand-text-secondary font-medium text-[10px] uppercase tracking-wide px-2 py-0.5 border-none"
          >
            {property.furnishing}
          </Badge>
          <Badge
            variant="secondary"
            className="bg-brand-bg-warm text-brand-text-secondary font-medium text-[10px] uppercase tracking-wide px-2 py-0.5 border-none"
          >
            {property.preferred_tenants}
          </Badge>
        </div>
      </div>
    </Link>
  );
}
