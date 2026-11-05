"use client";

import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  LogOut,
  Settings,
  Heart,
  Shield,
  LayoutDashboard,
  Loader2,
  ChevronRight,
  Wallet,
  History,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, isAuthenticated, logout, refetch } = useAuth();
  const [isRefetching, setIsRefetching] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      setIsRefetching(true);
      refetch().finally(() => setIsRefetching(false));
    }
  }, []);

  async function handleLogout() {
    await logout();
  }

  if (loading || isRefetching) {
    return (
      <div className="min-h-screen bg-brand-bg-warm">
        <Navbar />
        <main className="max-w-2xl mx-auto py-8 px-4 pb-24">
          {/* Profile Header Skeleton */}
          <div className="bg-white rounded-xl border border-brand-border p-6 shadow-sm mb-6 flex items-center gap-5">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-60" />
              <div className="flex items-center gap-2 mt-2">
                <Skeleton className="h-5 w-16 rounded" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>

          {/* Menu Items Skeleton */}
          <div className="grid grid-cols-1 gap-3">
            {/* Management Section */}
            <div className="space-y-1">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
            </div>

            {/* Account Settings Section */}
            <div className="space-y-1 mt-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
            </div>

            {/* Sign Out Button Skeleton */}
            <div className="mt-8">
              <Skeleton className="h-14 w-full rounded-lg" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-brand-bg-warm">
        <Navbar />
        <main className="max-w-md mx-auto py-12 px-4">
          <Card className="border-brand-border text-center py-12">
            <CardContent className="space-y-6">
              <div className="w-20 h-20 bg-brand-teal-light rounded-full flex items-center justify-center mx-auto text-brand-teal">
                <User className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-headline font-bold">
                  Account Profile
                </h1>
                <p className="text-brand-text-secondary">
                  Sign in to manage your listings, saved rooms, and account
                  settings.
                </p>
              </div>
              <Button
                asChild
                className="w-full bg-brand-teal hover:bg-brand-teal-mid font-bold h-12 shadow-teal"
              >
                <Link href="/login">Login or Sign Up</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg-warm">
      <Navbar />
      <main className="max-w-2xl mx-auto py-8 px-4 pb-24">
        <div className="bg-white rounded-xl border border-brand-border p-6 shadow-sm mb-6 flex items-center gap-5">
          <div className="w-16 h-16 bg-brand-teal rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-teal">
            {user?.full_name?.[0] || "U"}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-headline font-bold text-brand-text-primary leading-tight">
              {user?.full_name}
            </h1>
            <p className="text-sm text-brand-text-secondary">
              {user?.email}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-brand-teal-light text-brand-teal border-none text-[10px] uppercase font-bold tracking-wider px-2">
                {user?.role}
              </Badge>
              <div className="flex items-center gap-1 text-[11px] font-bold text-brand-text-secondary">
                <Wallet className="w-3 h-3" />
                {user?.credits || 0} Credits
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-text-secondary px-2 mb-2">
              Management
            </p>
            {user?.role !== "tenant" && (
              <ProfileLink
                icon={LayoutDashboard}
                label={user?.role === "admin" ? "Admin Panel" : "Manage your Listings"}
                href={user?.role === "admin" ? "/dashboard" : "/owner"}
              />
            )}
            <ProfileLink icon={Heart} label="Saved Properties" href="/saved" />
          </div>

          <div className="space-y-1 mt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-text-secondary px-2 mb-2">
              Account Settings
            </p>
            <ProfileLink icon={Shield} label="Privacy & Security" href="#" />
            <ProfileLink icon={Settings} label="User Preferences" href="#" />
            <ProfileLink icon={History} label="Transaction History" href="#" />
          </div>

          <div className="space-y-1 mt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-text-secondary px-2 mb-2">
              Settings
            </p>
            <ProfileLink icon={LogOut} label="Sign Out" onClick={handleLogout} />
          </div>

        </div>
      </main>
    </div>
  );
}

function ProfileLink({
  icon: Icon,
  label,
  href,
  onClick,
  isDestructive = false,
}: {
  icon: any;
  label: string;
  href?: string;
  onClick?: () => void;
  isDestructive?: boolean;
}) {
  return (
    <Link
      href={href || "#"}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      className="flex items-center justify-between p-4 bg-white border border-brand-border rounded-lg hover:bg-brand-bg-warm transition-colors group h-14 shadow-sm"
    >
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-md bg-brand-bg-warm flex items-center justify-center mr-3 group-hover:bg-brand-teal-light transition-colors">
          <Icon className="w-4 h-4 text-brand-text-secondary group-hover:text-brand-teal" />
        </div>
        <span className="font-bold text-brand-text-primary text-sm">
          {label}
        </span>
      </div>
      <ChevronRight className="w-4 h-4 text-brand-text-secondary opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
    </Link>
  );
}
