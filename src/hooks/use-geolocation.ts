import { useState, useEffect, useCallback } from "react";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

const defaultOptions: UseGeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 300000,
};

export function useGeolocation(
  options: UseGeolocationOptions = defaultOptions,
) {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
  });

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation is not supported by your browser",
        loading: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
        });
      },
      (error) => {
        let errorMessage = "Unknown error";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location permission denied. Please enable location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
          default:
            errorMessage = error.message;
        }

        setState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
      },
      {
        enableHighAccuracy: options.enableHighAccuracy,
        timeout: options.timeout,
        maximumAge: options.maximumAge,
      },
    );
  }, [options.enableHighAccuracy, options.timeout, options.maximumAge]);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  return {
    ...state,
    refresh: getLocation,
  };
}

/**
 * Get user's current location with a fallback to a default city
 */
export function useUserLocation(defaultCity: string = "Delhi") {
  const geo = useGeolocation();

  const cityFallbacks: Record<string, [number, number]> = {
    Delhi: [28.6139, 77.209],
    Mumbai: [19.076, 72.8777],
    Bangalore: [12.9716, 77.5946],
    Chennai: [13.0827, 80.2707],
    Hyderabad: [17.385, 78.4867],
    Pune: [18.5204, 73.8567],
    Kolkata: [22.5726, 88.3639],
    Gurgaon: [28.4595, 77.0266],
    Noida: [28.5721, 77.3276],
  };

  const fallback = cityFallbacks[defaultCity] || cityFallbacks["Delhi"];

  return {
    latitude: geo.latitude ?? fallback[0],
    longitude: geo.longitude ?? fallback[1],
    error: geo.error,
    loading: geo.loading,
    refresh: geo.refresh,
    hasLocation: geo.latitude !== null && geo.longitude !== null,
  };
}
