"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Building, MapPin, Loader2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";


export default function OwnerDashboard() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState("verified");

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }

    if (user.role !== "owner" && user.role !== "admin") {
      setIsAuthorized(false);
      setTimeout(() => router.push("/"), 3000);
      return;
    }

    setIsAuthorized(true);
    fetchMyListings();
  }, [loading, isAuthenticated, user, router]);

  async function fetchMyListings() {
    try {
      const res = await fetch("/api/owner/listings", {
        method: "GET",
        headers: {
          "x-user-id": user?._id || user?.id || "",
        },
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch listings");
      }

      const data = await res.json();
      setListings(data.properties || []);
    } catch (error) {
      console.error(error);
    } finally {
      setPageLoading(false);
    }
  }

  if (loading || isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-teal animate-spin" />
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-brand-bg-warm flex flex-col items-center justify-center p-4 text-center">
        <ShieldAlert className="w-16 h-16 text-brand-error mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-brand-text-secondary">
          Only owners can access this panel. Redirecting you home...
        </p>
      </div>
    );
  }

  const verifiedListings = listings.filter((p) => p.status === "live");
  const pendingListings = listings.filter((p) => p.status === "pending");
  const hasAnyListings = listings.length > 0;

  return (
    <div className="min-h-screen bg-brand-bg-warm">
      <Navbar />

      <main className="max-w-7xl mx-auto py-12 px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-3xl font-headline font-bold text-brand-text-primary">
              Owner Dashboard
            </h1>
            <p className="text-brand-text-secondary">
              Manage your property listings and monitor their status.
            </p>
          </div>
          <Link href="/owner/new">
            <Button className="bg-brand-teal hover:bg-brand-teal-mid text-white font-bold h-12 px-8">
              <Plus className="w-5 h-5 mr-2" />
              Post New Property
            </Button>
          </Link>
        </div>

        {pageLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-brand-teal animate-spin" />
          </div>
        ) : !hasAnyListings ? (
          <Card className="border-brand-border py-20 text-center">
            <CardContent className="space-y-4">
              <Building className="w-16 h-16 text-brand-border mx-auto" />
              <div className="space-y-2">
                <p className="text-xl font-bold">No properties listed yet</p>
                <p className="text-brand-text-secondary">
                  Start listing your rooms to find verified tenants.
                </p>
              </div>
              <Link href="/owner/new">
                <Button
                  variant="outline"
                  className="border-brand-teal text-brand-teal"
                >
                  Post Your First Ad
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="verified" className="font-bold">
                Verified ({verifiedListings.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="font-bold">
                Pending ({pendingListings.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="verified">
              {verifiedListings.length === 0 ? (
                <Card className="border-brand-border py-12 text-center">
                  <CardContent className="space-y-4">
                    <Building className="w-12 h-12 text-brand-border mx-auto" />
                    <p className="text-brand-text-secondary">
                      No verified properties yet. Approved listings will appear here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="max-h-[600px] overflow-y-auto pr-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {verifiedListings.map((prop) => (
                    <Card
                      key={prop._id}
                      className="border-brand-border overflow-hidden hover:shadow-md transition-all"
                    >
                      <div className="aspect-video relative bg-brand-bg-warm">
                        {prop.photos?.[0] ? (
                          <img
                            src={prop.photos[0]}
                            className="w-full h-full object-cover"
                            alt={prop.title}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-brand-text-secondary">
                            <Building className="w-10 h-10 opacity-20" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-brand-success text-white">
                            LIVE
                          </Badge>
                        </div>
                      </div>
                      <CardHeader className="p-5">
                        <CardTitle className="font-headline font-bold text-lg line-clamp-1">
                          {prop.title}
                        </CardTitle>
                        <div className="flex items-center gap-1 text-xs text-brand-text-secondary">
                          <MapPin className="w-3 h-3" /> {prop.city}
                        </div>
                      </CardHeader>
                      <CardContent className="px-5 pb-5 pt-0 flex items-center justify-between border-t border-brand-border mt-auto pt-4">
                        <span className="font-bold text-lg text-brand-text-primary">
                          ₹{prop.rent.toLocaleString()}
                        </span>
                        <Link href={`/property/${prop._id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-brand-teal"
                          >
                            View Details
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="pending">
              {pendingListings.length === 0 ? (
                <Card className="border-brand-border py-12 text-center">
                  <CardContent className="space-y-4">
                    <Building className="w-12 h-12 text-brand-border mx-auto" />
                    <p className="text-brand-text-secondary">
                      No pending properties. All your listings have been reviewed!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="max-h-[600px] overflow-y-auto pr-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingListings.map((prop) => (
                    <Card
                      key={prop._id}
                      className="border-brand-border overflow-hidden hover:shadow-md transition-all"
                    >
                      <div className="aspect-video relative bg-brand-bg-warm">
                        {prop.photos?.[0] ? (
                          <img
                            src={prop.photos[0]}
                            className="w-full h-full object-cover"
                            alt={prop.title}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-brand-text-secondary">
                            <Building className="w-10 h-10 opacity-20" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-brand-warning text-white">
                            PENDING
                          </Badge>
                        </div>
                      </div>
                      <CardHeader className="p-5">
                        <CardTitle className="font-headline font-bold text-lg line-clamp-1">
                          {prop.title}
                        </CardTitle>
                        <div className="flex items-center gap-1 text-xs text-brand-text-secondary">
                          <MapPin className="w-3 h-3" /> {prop.city}
                        </div>
                      </CardHeader>
                      <CardContent className="px-5 pb-5 pt-0 flex items-center justify-between border-t border-brand-border mt-auto pt-4">
                        <span className="font-bold text-lg text-brand-text-primary">
                          ₹{prop.rent.toLocaleString()}
                        </span>
                        <Link href={`/property/${prop._id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-brand-teal"
                          >
                            View Details
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
