/**
 * Reverse Geocoding utility using Nominatim (OpenStreetMap)
 * Converts coordinates to address details
 */

interface ReverseGeocodingResult {
  success: boolean;
  data?: {
    display_name: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    latitude: number;
    longitude: number;
  };
  error?: string;
}

/**
 * Reverse geocode coordinates to get address details
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Promise with address details or error
 */
export async function getLocationFromCoords(
  lat: number,
  lng: number,
): Promise<ReverseGeocodingResult> {
  try {
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      return {
        success: false,
        error: "Invalid coordinates provided",
      };
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return {
        success: false,
        error: "Coordinates out of valid range",
      };
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          "User-Agent": "Hostlio/1.0 (property rental platform)",
        },
      },
    );

    if (!response.ok) {
      return {
        success: false,
        error: `API error: ${response.status}`,
      };
    }

    const data = await response.json();

    if (!data || data.error) {
      return {
        success: false,
        error: data?.error || "Location not found",
      };
    }

    const address = data.address || {};

    const city =
      address.city ||
      address.town ||
      address.village ||
      address.county ||
      address.municipality ||
      undefined;

    const state = address.state || address.county || undefined;

    const country = address.country || undefined;

    const pincode = address.postcode || undefined;

    return {
      success: true,
      data: {
        display_name: data.display_name || "",
        city,
        state,
        country,
        pincode,
        latitude: lat,
        longitude: lng,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Build a short location string from reverse geocoding result
 */
export function getShortLocation(
  result: ReverseGeocodingResult["data"],
): string {
  if (!result) return "";

  if (result.city) {
    return result.city;
  }
  if (result.state) {
    return result.state;
  }
  if (result.country) {
    return result.country;
  }
  return "";
}

/**
 * Build full address string from reverse geocoding result
 */
export function getFullAddress(result: ReverseGeocodingResult["data"]): string {
  if (!result) return "";
  return result.display_name || "";
}
