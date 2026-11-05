/**
 * Geocoding utility using Nominatim (OpenStreetMap)
 * Converts addresses to latitude/longitude coordinates.
 *
 * PERFORMANCE — Two-layer caching strategy:
 * Layer 1 (Primary):   Upstash Redis — 30-day TTL, survives across serverless instances
 * Layer 2 (Secondary): Next.js fetch cache via `next: { revalidate: 2592000 }` — 30-day CDN cache
 * On Redis miss, Nominatim is called. On Redis error, falls through to live Nominatim call.
 */

interface GeocodingResult {
  lat: number;
  lng: number;
  success: boolean;
  error?: string;
}

const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30; // 2592000

// ─── Lazy Redis Client for Geocoding Cache ────────────────────────────────────
// Only initialized if Upstash env vars are present. Fails gracefully otherwise.
function getGeocodeRedis(): any | null {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return null;
  }
  try {
    const { Redis } = require("@upstash/redis");
    return new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } catch {
    return null;
  }
}

/**
 * Convert an address to coordinates using Nominatim API.
 * Results cached in Redis for 30 days (addresses don't change).
 * Falls back to live Nominatim call if Redis is unavailable.
 */
export async function geocodeAddress(
  address: string,
): Promise<GeocodingResult> {
  const cacheKey = `geocode:${encodeURIComponent(address)}`;

  // Layer 1 — Redis cache (survives across serverless warm instances)
  const redis = getGeocodeRedis();
  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return typeof cached === "string" ? JSON.parse(cached) : cached;
      }
    } catch (err) {
      // Redis failure — fall through to live Nominatim call
      console.error("[Geocoding] Redis cache read failed, using live call:", (err as Error).message);
    }
  }

  try {
    const encodedAddress = encodeURIComponent(address);

    // `next: { revalidate }` adds Next.js fetch cache as a secondary layer.
    // Matches the Redis TTL (30 days). This only applies to this specific Nominatim fetch.
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
      {
        headers: {
          "User-Agent": "Hostlio/1.0 (property rental platform)",
        },
        next: { revalidate: THIRTY_DAYS_SECONDS },
      },
    );

    if (!response.ok) {
      return {
        lat: 0,
        lng: 0,
        success: false,
        error: `Geocoding API error: ${response.status}`,
      };
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return {
        lat: 0,
        lng: 0,
        success: false,
        error: "Address not found",
      };
    }

    const result: GeocodingResult = {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      success: true,
    };

    // Write result to Redis cache (Layer 1) for future serverless instances
    if (redis) {
      try {
        await redis.set(cacheKey, JSON.stringify(result), { ex: THIRTY_DAYS_SECONDS });
      } catch (err) {
        console.error("[Geocoding] Redis cache write failed:", (err as Error).message);
      }
    }

    return result;
  } catch (error) {
    return {
      lat: 0,
      lng: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Build a full address string from components
 */
export function buildFullAddress(
  address: string,
  city: string,
  pincode: string,
  country: string = "India",
): string {
  const parts = [address, city, pincode, country];
  return parts.filter(Boolean).join(", ");
}

/**
 * Convert MongoDB GeoJSON point to [lat, lng] format for Leaflet
 */
export function geoJSONToLeaflet(coordinates: number[]): [number, number] {
  return [coordinates[1], coordinates[0]];
}

/**
 * Convert Leaflet [lat, lng] to MongoDB GeoJSON format
 */
export function leafletToGeoJSON(
  lat: number,
  lng: number,
): {
  type: string;
  coordinates: number[];
} {
  return {
    type: "Point",
    coordinates: [lng, lat],
  };
}
