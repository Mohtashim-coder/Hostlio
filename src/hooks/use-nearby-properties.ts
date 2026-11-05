"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface PropertyLocation {
  type: string;
  coordinates: number[];
}

type Property = {
  _id: string;
  title: string;
  rent: number;
  city?: string;
  location?: { type: string; coordinates: [number, number] };
};

interface NearbyProperty {
  _id: string;
  title: string;
  type: string;
  rent: number;
  deposit: number;
  address: string;
  city: string;
  pincode: string;
  photos: string[];
  location?: PropertyLocation;
  bhk_type?: string;
  area_sqft?: number;
  furnishing?: string;
  amenities?: string[];
}

interface UseNearbyPropertiesOptions {
  lat: number;
  lng: number;
  radius?: number;
  enabled?: boolean;
}

interface UseNearbyPropertiesResult {
  properties: NearbyProperty[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useNearbyProperties({
  lat,
  lng,
  radius = 5000,
  enabled = true,
}: UseNearbyPropertiesOptions): UseNearbyPropertiesResult {
  const [properties, setProperties] = useState<NearbyProperty[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNearbyProperties = useCallback(async () => {
    if (!enabled || !lat || !lng) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
        radius: radius.toString(),
      });

      const response = await fetch(`/api/properties/nearby?${params}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setProperties(data.properties || []);
      } else {
        throw new Error(data.error || "Failed to fetch properties");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [lat, lng, radius, enabled]);

  useEffect(() => {
    fetchNearbyProperties();
  }, [fetchNearbyProperties]);

  return {
    properties,
    loading,
    error,
    refetch: fetchNearbyProperties,
  };
}
