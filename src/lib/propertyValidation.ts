/**
 * Property Validation & Utility Functions
 * Implements business logic from Design Strategy Document
 */

export const PROPERTY_TYPES = [
  "Flat",
  "PG",
  "Room",
  "Hostel",
  "Hotel",
  "Godam",
  "Lodge",
  "Office",
] as const;

export const PROPERTY_STATUS = {
  PENDING: "pending", // Awaiting admin review
  LIVE: "live", // Approved and visible
  BOOKED: "booked", // Tenancy confirmed
  REJECTED: "rejected", // Failed verification
  REMOVED: "removed", // Pulled by owner/admin
  EDIT_REQUESTED: "edit_requested", // Owner edit request (requires admin approval)
} as const;

export const BHK_TYPES = [
  "1 BHK",
  "2 BHK",
  "3 BHK",
  "Studio",
  "Independent House",
] as const;

export const FURNISHING_OPTIONS = [
  "Fully Furnished",
  "Semi Furnished",
  "Unfurnished",
] as const;

export const AMENITIES = [
  "WiFi",
  "AC",
  "Parking",
  "Lift",
  "Gym",
  "CCTV",
  "Power Backup",
  "Water",
] as const;

export const PREFERRED_TENANTS = [
  "Everyone",
  "Boys Only",
  "Girls Only",
  "Families",
  "Bachelors",
] as const;

export const PARKING_OPTIONS = [
  "None",
  "Two-Wheeler",
  "Four-Wheeler",
  "Both",
] as const;

export const RESTRICTIONS = [
  "No Smoking",
  "No Drinking",
  "No Non-Veg",
  "No Pets",
] as const;

export const LANDMARKS = [
  "Hospital",
  "Park",
  "Bus Stand",
  "Railway Station",
  "School",
  "Coaching Centre",
] as const;

/**
 * Validates property submission data
 * @returns Array of validation errors (empty if valid)
 */
export function validatePropertySubmission(data: any): string[] {
  const errors: string[] = [];

  if (!data.title || data.title.trim().length < 5) {
    errors.push("Title must be at least 5 characters");
  }

  if (!data.description || data.description.trim().length < 20) {
    errors.push("Description must be at least 20 characters");
  }

  if (!data.type || !PROPERTY_TYPES.includes(data.type)) {
    errors.push(`Property type must be one of: ${PROPERTY_TYPES.join(", ")}`);
  }

  if (data.rent === undefined || data.rent === null || data.rent < 0) {
    errors.push("Rent price must be a positive number");
  }

  if (data.deposit === undefined || data.deposit === null || data.deposit < 0) {
    errors.push("Deposit amount must be a positive number");
  }

  if (!data.address || data.address.trim().length < 5) {
    errors.push("Address must be at least 5 characters");
  }

  if (!data.city || data.city.trim().length < 2) {
    errors.push("City is required");
  }

  if (!data.pincode || !/^\d{6}$/.test(data.pincode)) {
    errors.push("Pincode must be a valid 6-digit number");
  }

  // Photos validation (Min 3 required)
  if (!Array.isArray(data.photos) || data.photos.length < 3) {
    errors.push("Minimum 3 photos are required");
  } else if (data.photos.length > 20) {
    errors.push("Maximum 20 photos allowed");
  }

  if (!data.availability_date) {
    errors.push("Availability date is required");
  } else {
    const availDate = new Date(data.availability_date);
    if (isNaN(availDate.getTime())) {
      errors.push("Availability date must be a valid date");
    }
  }

  if (!data.owner_whatsapp || !/^\d{10}$/.test(data.owner_whatsapp)) {
    errors.push("Owner WhatsApp must be a valid 10-digit number");
  }

  if (data.video && Array.isArray(data.video) && data.video.length > 2) {
    errors.push("Maximum 2 videos allowed");
  }

  return errors;
}

/**
 * Check if property status transition is valid
 */
export function isValidStatusTransition(
  currentStatus: string,
  newStatus: string,
  userRole: string,
): boolean {
  if (userRole === "admin") {
    if (currentStatus === "pending") {
      return ["live", "rejected", "removed"].includes(newStatus);
    }
    if (currentStatus === "live") {
      return ["booked", "removed"].includes(newStatus);
    }
    if (currentStatus === "edit_requested") {
      return ["live", "rejected"].includes(newStatus);
    }
  }

  if (userRole === "owner") {
    if (currentStatus === "live" && newStatus === "removed") {
      return true;
    }
  }

  return false;
}

/**
 * Get allowed property status for tenant view
 */
export function shouldPropertyBeVisible(status: string): boolean {
  return status === "live";
}

/**
 * Format property data for API response (hide sensitive info)
 */
export function formatPropertyForTenant(property: any): any {
  const formatted = property.toObject ? property.toObject() : property;

  delete formatted.owner_whatsapp;
  delete formatted.approved_by;
  delete formatted.rejection_reason;

  return formatted;
}

/**
 * Check if owner can make edit request
 */
export function canRequestEdit(status: string): boolean {
  return ["live", "edit_requested"].includes(status);
}

/**
 * Get property approval checklist
 */
export function getApprovalChecklist(property: any): {
  item: string;
  status: boolean;
}[] {
  return [
    // {
    //   item: "Geo-tagged photo provided",
    //   status: !!(
    //     property.geo_tag_photo &&
    //     property.geo_tag_photo.url &&
    //     property.geo_tag_photo.geolocation
    //   ),
    // },
    {
      item: "Minimum 3 photos",
      status: Array.isArray(property.photos) && property.photos.length >= 3,
    },
    {
      item: "All required fields filled",
      status: !!(
        property.title &&
        property.description &&
        property.rent &&
        property.deposit &&
        property.address &&
        property.city &&
        property.pincode
      ),
    },
    {
      item: "Valid owner contact",
      status: !!(
        property.owner_whatsapp && /^\d{10}$/.test(property.owner_whatsapp)
      ),
    },
    {
      item: "Valid availability date",
      status: !!(
        property.availability_date &&
        new Date(property.availability_date) > new Date()
      ),
    },
  ];
}
