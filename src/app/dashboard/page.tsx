"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Check,
  X,
  Eye,
  MapPin,
  Clock,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading, isAuthenticated } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (hasCheckedAuth) {
      return;
    }

    setHasCheckedAuth(true);

    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }

    const userRole = user?.role;

    if (userRole === "admin") {
      setIsAuthorized(true);
      fetchPending(user._id || user.id);
    } else {
      setIsAuthorized(false);
      router.push("/");
    }
  }, [loading, hasCheckedAuth, isAuthenticated, user, router]);

  async function fetchPending(userId: string) {
    setPageLoading(true);
    try {
      const res = await fetch("/api/admin/listings", {
        method: "GET",
        headers: {
          "x-user-id": userId,
          "x-user-role": "admin",
        },
        credentials: "include",
      });
      const data = await res.json();
      if (data.properties && Array.isArray(data.properties)) {
        setListings(data.properties);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setPageLoading(false);
    }
  }

  async function handleAction(id: string, status: "live" | "rejected", note?: string) {
    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/listings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?._id || user?.id || "",
          "x-user-role": "admin",
        },
        credentials: "include",
        body: JSON.stringify({ 
          propertyId: id, 
          newStatus: status,
          adminNote: note || ""
        }),
      });

      if (res.ok) {
        toast({
          title: status === "live" ? "Listing Approved" : "Listing Rejected",
          description: `Property status has been updated successfully.`,
        });
        setDialogOpen(false);
        setAdminNote("");
        setSelectedProperty(null);
        fetchPending(user?._id || user?.id || "");
      } else {
        const error = await res.json();
        throw new Error(error.error || "Failed to update listing");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update listing status.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function openPropertyDialog(property: any) {
    setSelectedProperty(property);
    setAdminNote("");
    setDialogOpen(true);
  }

  if (loading || !hasCheckedAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-bg-warm gap-4">
        <Loader2 className="w-8 h-8 text-brand-teal animate-spin" />
        <p className="text-brand-text-secondary">Verifying admin access...</p>
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-brand-bg-warm flex flex-col items-center justify-center p-4 text-center">
        <ShieldAlert className="w-16 h-16 text-brand-error mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-brand-text-secondary mb-6">
          Only administrators can access this panel.
        </p>
        <Button onClick={() => router.push('/')}>Go Back Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg-warm">
      <Navbar />

      <main className="max-w-7xl mx-auto py-12 px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <h1 className="text-3xl font-headline font-bold text-brand-text-primary">
              Admin Review Panel
            </h1>
            <p className="text-brand-text-secondary">
              Manage and approve incoming property listings from India.
            </p>
          </div>
          <div className="flex gap-4">
            <StatBox
              label="Pending Review"
              value={listings.length.toString()}
            />
            <StatBox label="System Health" value="Active" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-brand-border overflow-hidden shadow-sm">
          <div className="p-6 border-b border-brand-border flex items-center justify-between bg-white">
            <h2 className="font-headline font-bold text-lg">Approval Queue</h2>
            <div className="flex gap-2">
              <Badge variant="outline" className="rounded-pill px-3">
                Bihar (All 38 Districts)
              </Badge>
            </div>
          </div>

          {pageLoading ? (
            <div className="p-20 flex justify-center">
              <Loader2 className="w-8 h-8 text-brand-teal animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-brand-bg-warm">
                <TableRow className="border-brand-border">
                  <TableHead className="font-bold text-[10px] uppercase tracking-wider text-brand-text-secondary">
                    Property Detail
                  </TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-wider text-brand-text-secondary">
                    Location
                  </TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-wider text-brand-text-secondary">
                    Submitted
                  </TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-wider text-brand-text-secondary">
                    Rent (₹)
                  </TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-wider text-brand-text-secondary text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.map((item) => (
                  <TableRow
                    key={item._id}
                    className="border-brand-border hover:bg-brand-teal-light/20"
                  >
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-bold text-brand-text-primary">
                          {item.title}
                        </p>
                        <p className="text-[10px] text-brand-text-secondary uppercase font-medium">
                          {item.type}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs font-medium text-brand-text-secondary">
                        <MapPin className="w-3 h-3 text-brand-teal" />
                        {item.city}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs font-medium text-brand-text-secondary">
                        <Clock className="w-3 h-3" />
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-brand-text-primary">
                      ₹{item.rent.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-brand-text-secondary hover:text-brand-teal"
                          onClick={() => openPropertyDialog(item)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {listings.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-32 text-center text-brand-text-secondary font-medium"
                    >
                      No pending reviews. Great job!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline font-bold">
              Property Details Review
            </DialogTitle>
            <DialogDescription>
              Review all property information before approval
            </DialogDescription>
          </DialogHeader>

          {selectedProperty && (
            <div className="space-y-6">
              {/* Property Images */}
              {selectedProperty.photos && selectedProperty.photos.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-bold text-brand-text-primary">Photos</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedProperty.photos.slice(0, 6).map((photo: string, idx: number) => (
                      <img
                        key={idx}
                        src={photo}
                        alt={`Property ${idx + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-brand-border"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-brand-text-secondary uppercase mb-1">
                    Title
                  </p>
                  <p className="font-semibold text-brand-text-primary">
                    {selectedProperty.title}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-text-secondary uppercase mb-1">
                    Type
                  </p>
                  <p className="font-semibold text-brand-text-primary">
                    {selectedProperty.type}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-text-secondary uppercase mb-1">
                    Furnishing
                  </p>
                  <p className="font-semibold text-brand-text-primary">
                    {selectedProperty.furnishing}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-text-secondary uppercase mb-1">
                    City
                  </p>
                  <p className="font-semibold text-brand-text-primary">
                    {selectedProperty.city}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div>
                <p className="text-xs font-bold text-brand-text-secondary uppercase mb-1">
                  Address
                </p>
                <p className="text-sm text-brand-text-primary">
                  {selectedProperty.address}
                </p>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-brand-text-secondary uppercase mb-1">
                    Monthly Rent
                  </p>
                  <p className="text-lg font-bold text-brand-teal">
                    ₹{selectedProperty.rent?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-text-secondary uppercase mb-1">
                    Security Deposit
                  </p>
                  <p className="text-lg font-bold text-brand-text-primary">
                    ₹{selectedProperty.deposit?.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs font-bold text-brand-text-secondary uppercase mb-2">
                  Description
                </p>
                <p className="text-sm text-brand-text-secondary whitespace-pre-wrap bg-brand-bg-warm p-3 rounded-lg">
                  {selectedProperty.description}
                </p>
              </div>

              {/* Amenities */}
              {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-brand-text-secondary uppercase mb-2">
                    Amenities
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProperty.amenities.map((amenity: string, idx: number) => (
                      <Badge key={idx} variant="outline">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Preferred Tenants */}
              <div>
                <p className="text-xs font-bold text-brand-text-secondary uppercase mb-1">
                  Preferred Tenants
                </p>
                <p className="text-sm text-brand-text-primary">
                  {selectedProperty.preferred_tenants}
                </p>
              </div>

              {/* Admin Note Field */}
              <div>
                <p className="text-xs font-bold text-brand-text-secondary uppercase mb-2">
                  Admin Review Notes
                </p>
                <Textarea
                  placeholder="Add any notes or feedback about this property..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="border-brand-border focus-visible:ring-brand-teal"
                  rows={4}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-brand-border">
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={submitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-brand-error text-brand-error hover:bg-brand-error/10"
                  onClick={() => handleAction(selectedProperty._id, "rejected", adminNote)}
                  disabled={submitting}
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  className="flex-1 bg-brand-teal hover:bg-brand-teal-mid text-white"
                  onClick={() => handleAction(selectedProperty._id, "live", adminNote)}
                  disabled={submitting}
                >
                  <Check className="w-4 h-4 mr-2" />
                  {submitting ? "Approving..." : "Approve"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatBox({ label, value }: any) {
  return (
    <div className="bg-white border border-brand-border p-4 rounded-lg shadow-sm min-w-[140px]">
      <p className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-wider mb-1">
        {label}
      </p>
      <p
        className={`text-2xl font-headline font-extrabold text-brand-text-primary`}
      >
        {value}
      </p>
    </div>
  );
}
