"use client";

import Link from "next/link";
import { Home, User, Search, Search as SearchIcon } from "lucide-react";
import { useState, useEffect } from "react";
import NavbarActions from "@/components/NavbarActions";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Logo from "@/components/logo";

export default function Navbar({
  showSearchOnScroll = false,
}: {
  showSearchOnScroll?: boolean;
}) {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!showSearchOnScroll) return;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [showSearchOnScroll]);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-brand-border h-16 flex items-center px-4 md:px-8 shadow-sm">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto gap-4">
        <Logo />

        {/* Sticky Search Bar - Only shows on scroll if requested */}
        {showSearchOnScroll && (
          <div
            className={`flex-1 max-w-xl transition-all duration-300 transform ${isScrolled ? "opacity-100 translate-y-0 visible" : "opacity-0 -translate-y-4 invisible absolute"}`}
          >
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary w-4 h-4" />
              <Input
                placeholder="Search rooms directly..."
                className="pl-10 h-10 bg-brand-bg-warm border-transparent focus:bg-white focus:ring-1 focus:ring-brand-teal w-full text-sm rounded-md"
              />
            </div>
          </div>
        )}

        <div
          className={`hidden md:flex items-center gap-8 ${isScrolled ? "hidden" : "flex"}`}
        >
          <Link
            href="/search"
            className="text-sm font-bold text-brand-text-secondary hover:text-brand-teal transition-colors"
          >
            Find a Room
          </Link>
          {user?.role === "owner" && (
            <Link
              href="/owner"
              className="text-sm font-bold text-brand-text-secondary hover:text-brand-teal transition-colors"
            >
              Owner Panel
            </Link>
          )}
          {user?.role === "admin" && (
            <Link
              href="/dashboard"
              className="text-sm font-bold text-brand-text-secondary hover:text-brand-teal transition-colors"
            >
              Admin Dashboard
            </Link>
          )}
        </div>

        <NavbarActions user={user} />
      </div>
    </nav>
  );
}
