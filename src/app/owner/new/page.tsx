"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Camera,
  CheckCircle2,
  Loader2,
  X,
  AlertCircle,
  MapPin,
  Navigation,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

export default function NewListingPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, loading, refetch } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [isConvertingRole, setIsConvertingRole] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    type: "Flat",
    rent: "",
    deposit: "",
    address: "",
    city: "",
    description: "",
    furnishing: "Unfurnished",
    preferred_tenants: "Everyone",
    owner_whatsapp: "",
    pincode: "",
    availability_date: new Date().toISOString().split("T")[0],
  });

  const [locationData, setLocationData] = useState<{
    lat: number;
    lng: number;
    type: string;
    coordinates: number[];
  } | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
    } else {
      setUserId(user._id);
      setUserRole(user.role || "tenant");
    }
  }, [user, loading, router]);

  const convertToOwner = async () => {
    setIsConvertingRole(true);
    try {
      const res = await fetch("/api/auth/user/role", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({ newRole: "owner" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update role");
      }

      localStorage.setItem("hostlio_user_role", "owner");
      setUserRole("owner");

      await refetch();

      toast({
        title: "✅ Role Updated",
        description: "You're now an owner. You can submit properties!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Role Update Failed",
        description: error.message,
      });
    } finally {
      setIsConvertingRole(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();

        const promise = new Promise((resolve, reject) => {
          reader.onload = async () => {
            try {
              const res = await fetch("/api/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: reader.result }),
              });
              const data = await res.json();
              if (data.url) {
                setPhotos((prev) => [...prev, data.url]);
                resolve(data.url);
              } else {
                reject(new Error(data.error || "Upload failed"));
              }
            } catch (err) {
              reject(err);
            }
          };
          reader.onerror = reject;
        });

        reader.readAsDataURL(file);
        await promise;
      }
      toast({
        title: "Upload Successful",
        description: "Images added to your listing.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message,
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (photos.length < 3) {
      toast({
        variant: "destructive",
        title: "More photos required",
        description: `Please upload at least 3 photos. You have ${photos.length}.`,
      });
      return;
    }

    if (!formData.owner_whatsapp || formData.owner_whatsapp.length < 10 || formData.owner_whatsapp.length > 15) {
      toast({
        variant: "destructive",
        title: "Invalid WhatsApp number",
        description: "Please enter a valid 10-15 digit WhatsApp number.",
      });
      return;
    }

    if (!formData.pincode || formData.pincode.length !== 6) {
      toast({
        variant: "destructive",
        title: "Invalid Pincode",
        description: "Please enter a valid 6-digit pincode.",
      });
      return;
    }

    if (!formData.title || formData.title.length < 5) {
      toast({
        variant: "destructive",
        title: "Title too short",
        description: "Property title must be at least 5 characters.",
      });
      return;
    }

    if (!formData.description || formData.description.length < 20) {
      toast({
        variant: "destructive",
        title: "Description too short",
        description: "Property description must be at least 20 characters.",
      });
      return;
    }

    if (!locationData) {
      toast({
        variant: "destructive",
        title: "Location Required",
        description: "Please click 'Get Location' before submitting.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          type: formData.type,
          rent: parseInt(formData.rent),
          deposit: parseInt(formData.deposit),
          address: formData.address,
          city: formData.city,
          pincode: formData.pincode,
          furnishing: formData.furnishing,
          preferred_tenants: formData.preferred_tenants,
          owner_whatsapp: formData.owner_whatsapp,
          availability_date: new Date(formData.availability_date).toISOString(),
          photos: photos,
          status: "pending",
          ...(locationData && {
            location: {
              type: locationData.type,
              coordinates: locationData.coordinates,
            },
          }),
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch (e) {
        throw new Error("Server error. Please try again later.");
      }

      if (!res.ok) {
        let errorMessage = "Failed to submit listing";

        if (data?.details && Array.isArray(data.details)) {
          errorMessage = data.details.join(", ");
        } else if (data?.error) {
          errorMessage = data.error;
        }

        throw new Error(errorMessage);
      }

      toast({
        title: "✅ Listing Submitted Successfully",
        description:
          "Our admin team will review your property within 2-4 hours.",
      });

      router.push("/owner");
    } catch (error: any) {
      
      let errorTitle = "Submission Failed";
      let errorDescription =
        error.message || "Something went wrong. Please try again.";

      const errorMap: {
        [key: string]: { title: string; description: string };
      } = {
        "Only owners can create listings": {
          title: "Permission Denied",
          description:
            "You need to switch to an owner account to create listings.",
        },
        Unauthorized: {
          title: "Session Expired",
          description: "Please log in again and try submitting your listing.",
        },
      };

      for (const [key, value] of Object.entries(errorMap)) {
        if (errorDescription.includes(key)) {
          errorTitle = value.title;
          errorDescription = value.description;
          break;
        }
      }

      toast({
        variant: "destructive",
        title: errorTitle,
        description: errorDescription,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg-warm">
      <Navbar />

      <main className="max-w-3xl mx-auto py-12 px-4 pb-24">
        {userRole !== "owner" && (
          <div className="bg-brand-warning/10 border-2 border-brand-warning rounded-lg p-6 mb-8">
            <h2 className="font-bold text-brand-warning mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Switch to Owner Account
            </h2>
            <p className="text-sm text-brand-text-secondary mb-4">
              You're currently a tenant. To submit property listings, you need
              to switch to an owner account.
            </p>
            <Button
              onClick={convertToOwner}
              disabled={isConvertingRole}
              className="bg-brand-warning text-white hover:bg-brand-warning/90 font-bold"
            >
              {isConvertingRole ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Converting...
                </>
              ) : (
                "Switch to Owner Account"
              )}
            </Button>
          </div>
        )}

        <div className="bg-white rounded-xl border border-brand-border p-8 shadow-sm space-y-10">
          <div className="space-y-2 border-b border-brand-border pb-6">
            <h1 className="text-3xl font-headline font-bold text-brand-text-primary">
              Post Your Property
            </h1>
            <p className="text-brand-text-secondary text-sm">
              Reach thousands of students and professionals in India. Listing is
              100% free.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-lg font-headline font-bold text-brand-text-primary flex items-center gap-2">
                <div className="w-1.5 h-6 bg-brand-teal rounded-pill"></div>
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary"
                  >
                    Property Title
                  </Label>
                  <Input
                    id="title"
                    required
                    placeholder="e.g. Spacious 2BHK near Boring Road"
                    className="h-11 border-brand-border"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="type"
                    className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary"
                  >
                    Property Type
                  </Label>
                  <Select
                    onValueChange={(val) =>
                      setFormData((prev) => ({ ...prev, type: val }))
                    }
                    defaultValue="Flat"
                  >
                    <SelectTrigger className="h-11 border-brand-border">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Flat">Flat</SelectItem>
                      <SelectItem value="PG">PG</SelectItem>
                      <SelectItem value="Room">Single Room</SelectItem>
                      <SelectItem value="Hostel">Hostel</SelectItem>
                      <SelectItem value="Hotel">Hotel</SelectItem>
                      <SelectItem value="Lodge">Lodge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="rent"
                    className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary"
                  >
                    Monthly Rent (₹)
                  </Label>
                  <Input
                    id="rent"
                    type="number"
                    required
                    placeholder="e.g. 15000"
                    className="h-11 border-brand-border"
                    value={formData.rent}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, rent: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="deposit"
                    className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary"
                  >
                    Security Deposit (₹)
                  </Label>
                  <Input
                    id="deposit"
                    type="number"
                    required
                    placeholder="e.g. 30000"
                    className="h-11 border-brand-border"
                    value={formData.deposit}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        deposit: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="furnishing"
                    className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary"
                  >
                    Furnishing
                  </Label>
                  <Select
                    onValueChange={(val) =>
                      setFormData((prev) => ({ ...prev, furnishing: val }))
                    }
                    defaultValue="Unfurnished"
                  >
                    <SelectTrigger className="h-11 border-brand-border">
                      <SelectValue placeholder="Select Furnishing" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fully Furnished">
                        Fully Furnished
                      </SelectItem>
                      <SelectItem value="Semi Furnished">
                        Semi Furnished
                      </SelectItem>
                      <SelectItem value="Unfurnished">Unfurnished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="tenants"
                    className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary"
                  >
                    Preferred Tenants
                  </Label>
                  <Select
                    onValueChange={(val) =>
                      setFormData((prev) => ({
                        ...prev,
                        preferred_tenants: val,
                      }))
                    }
                    defaultValue="Everyone"
                  >
                    <SelectTrigger className="h-11 border-brand-border">
                      <SelectValue placeholder="Select Preferred" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Everyone">Everyone</SelectItem>
                      <SelectItem value="Bachelors">
                        Bachelors
                      </SelectItem>
                      <SelectItem value="Girls Only">Girls Only</SelectItem>
                      <SelectItem value="Boys Only">Boys Only</SelectItem>
                      <SelectItem value="Families">
                        Families
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-lg font-headline font-bold text-brand-text-primary flex items-center gap-2">
                <div className="w-1.5 h-6 bg-brand-teal rounded-pill"></div>
                Location Details
              </h2>

              {/* Geolocation Fetch Button - Using Browser GPS */}
              <div className="bg-brand-bg-warm rounded-lg p-4 border border-brand-border">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-brand-text-primary mb-3">
                    Property Coordinates
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={async () => {
                    if (!navigator.geolocation) {
                      toast({
                        variant: "destructive",
                        title: "Not Supported",
                        description:
                          "Geolocation is not supported by your browser.",
                      });
                      return;
                    }

                    setIsFetchingLocation(true);
                    setLocationError(null);

                    navigator.geolocation.getCurrentPosition(
                      async (position) => {
                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;

                        setLocationData({
                          lat,
                          lng,
                          type: "Point",
                          coordinates: [lng, lat],
                        });

                        try {
                          const reverseRes = await fetch(
                            `/api/location/reverse?lat=${lat}&lng=${lng}`,
                          );
                          const reverseData = await reverseRes.json();

                          if (reverseData.success && reverseData.location) {
                            const loc = reverseData.location;

                            setFormData((prev) => ({
                              ...prev,
                              address: loc.display_name || prev.address,
                              pincode: loc.pincode || prev.pincode,
                              city: loc.city || prev.city,
                            }));

                            toast({
                              title: "✅ Location Fetched",
                              description: loc.display_name
                                ? `Address: ${loc.display_name.substring(0, 50)}...`
                                : `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
                            });
                          } else {
                            toast({
                              title: "✅ Location Fetched",
                              description: `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
                            });
                          }
                        } catch (reverseError) {
                          console.error(
                            "Reverse geocoding error:",
                            reverseError,
                          );
                          toast({
                            title: "✅ Location Fetched",
                            description: `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
                          });
                        }

                        setIsFetchingLocation(false);
                      },
                      (error) => {
                        let errorMessage =
                          "Failed to get your location. Please enable location access.";

                        switch (error.code) {
                          case error.PERMISSION_DENIED:
                            errorMessage =
                              "Location access denied. Please enable location permission in your browser settings.";
                            break;
                          case error.POSITION_UNAVAILABLE:
                            errorMessage =
                              "Location information is unavailable. Please try again.";
                            break;
                          case error.TIMEOUT:
                            errorMessage =
                              "Location request timed out. Please try again.";
                            break;
                        }

                        setLocationError(errorMessage);
                        setIsFetchingLocation(false);
                        toast({
                          variant: "destructive",
                          title: "Location Error",
                          description: errorMessage,
                        });
                      },
                      {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0,
                      },
                    );
                  }}
                  disabled={isFetchingLocation}
                  variant="outline"
                  className="w-full border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white"
                >
                  {isFetchingLocation ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4 mr-2" />
                      Get Location
                    </>
                  )}
                </Button>
                {/* Helper text */}
                <p className="text-sm text-brand-text-secondary mt-2">
                  Click to get your current GPS location
                </p>

                {/* Show fetched location */}
                {locationData && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 text-green-700">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Location fetched successfully
                      </span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      Lat: {locationData.lat.toFixed(6)}, Lng:{" "}
                      {locationData.lng.toFixed(6)}
                    </p>
                  </div>
                )}

                {locationError && (
                  <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-xs text-red-600">{locationError}</p>
                  </div>
                )}
              </div>

              {/* Full Address Field - First */}
              <div className="space-y-2">
                <Label
                  htmlFor="address"
                  className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary"
                >
                  Full Address
                </Label>
                <Input
                  id="address"
                  required
                  placeholder="Street, Landmark, Locality"
                  className="h-11 border-brand-border"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                />
              </div>

              {/* City and Pincode - Second */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="city"
                    className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary"
                  >
                    City
                  </Label>
                  <Input
                    id="city"
                    type="text"
                    required
                    placeholder="Enter city"
                    className="h-11 border-brand-border"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        city: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="pincode"
                    className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary"
                  >
                    Pincode
                  </Label>
                  <Input
                    id="pincode"
                    type="tel"
                    required
                    placeholder="6-digit pincode"
                    className="h-11 border-brand-border"
                    value={formData.pincode}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        pincode: e.target.value.replace(/\D/g, ""),
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="whatsapp"
                  className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary"
                >
                  Your WhatsApp Number
                </Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  required
                  placeholder="10-digit WhatsApp number"
                  className="h-11 border-brand-border"
                  value={formData.owner_whatsapp}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      owner_whatsapp: e.target.value.replace(/\D/g, ""),
                    }))
                  }
                />
                <p className="text-[10px] text-brand-text-secondary">
                  Users will contact you on this number.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="availability"
                    className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary"
                  >
                    When is it available?
                  </Label>
                  <Input
                    id="availability"
                    type="date"
                    required
                    className="h-11 border-brand-border"
                    value={formData.availability_date}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        availability_date: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-headline font-bold text-brand-text-primary flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-brand-teal rounded-pill"></div>
                  Property Description
                </h2>
              </div>
              <div className="space-y-2">
                <Textarea
                  required
                  placeholder="Describe your property features, nearby landmarks, and amenities..."
                  className="min-h-[150px] border-brand-border focus-visible:ring-brand-teal"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
                <p className="text-[10px] text-brand-text-secondary italic">
                  Provide clear, honest details to help tenants find your
                  property faster.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-lg font-headline font-bold text-brand-text-primary flex items-center gap-2">
                <div className="w-1.5 h-6 bg-brand-teal rounded-pill"></div>
                Photos (Min 3)
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {photos.map((url, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg border border-brand-border relative group overflow-hidden"
                  >
                    <Image
                      src={url}
                      alt={`Upload ${index}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-brand-error text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                <div
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  className={`aspect-square rounded-lg border-2 border-dashed border-brand-border flex flex-col items-center justify-center bg-brand-bg-warm group hover:border-brand-teal transition-colors cursor-pointer ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 text-brand-teal animate-spin" />
                  ) : (
                    <>
                      <Camera className="w-6 h-6 text-brand-text-secondary group-hover:text-brand-teal mb-2" />
                      <span className="text-[10px] font-bold text-brand-text-secondary group-hover:text-brand-teal uppercase">
                        Add Photo
                      </span>
                    </>
                  )}
                </div>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>

            <div className="pt-8 border-t border-brand-border space-y-4">
              {photos.length < 3 && (
                <div className="flex items-start gap-3 bg-brand-error/10 p-4 rounded-lg border border-brand-error">
                  <AlertCircle className="w-5 h-5 text-brand-error shrink-0 mt-0.5" />
                  <p className="text-xs text-brand-error font-medium">
                    You need at least{" "}
                    <strong>{3 - photos.length} more photo(s)</strong>
                  </p>
                </div>
              )}

              <div className="flex items-start gap-3 bg-brand-primary-light p-4 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-brand-success shrink-0 mt-0.5" />
                <p className="text-xs text-brand-text-secondary leading-relaxed">
                  By clicking Submit, you agree to Hostlio's terms. Your listing
                  will be reviewed by our admin team and usually goes LIVE
                  within 2-4 hours. Your WhatsApp number will be hidden until a
                  tenant purchases credits.
                </p>
              </div>
              <Button
                type="submit"
                disabled={isSubmitting || isUploading || photos.length < 3}
                className="w-full bg-brand-teal hover:bg-brand-primary-mid text-white font-bold h-14 rounded-md shadow-teal text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Listing for Approval"
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
