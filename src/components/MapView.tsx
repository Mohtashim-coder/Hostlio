"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useNearbyProperties } from "@/hooks/use-nearby-properties";

type Props = {
  defaultCenter?: [number, number];
  defaultRadius?: number;
};

const DEFAULT_CENTER: [number, number] = [25.5941, 85.1376];

export default function MapView({ defaultCenter = DEFAULT_CENTER, defaultRadius = 2000 }: Props) {
  const [center, setCenter] = useState<[number, number]>(defaultCenter);
  const [radius, setRadius] = useState(defaultRadius);
  const { properties, loading, error, refetch } = useNearbyProperties({ lat: center[0], lng: center[1], radius, enabled: true });
  const mapRef = useRef<any>(null);

  const [rl, setRl] = useState<any | null>(null);
  const [leafletCssLoaded, setLeafletCssLoaded] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      import("leaflet"),
      import("react-leaflet"),
      // @ts-expect-error  CSS dynamic import does not have types
      import("leaflet/dist/leaflet.css"),
    ]).then(([leafletModule, rlModule]) => {
      if (!mounted) return;
      try {
        leafletModule.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });
      } catch (e) {
        // ignore
      }
      setRl(rlModule);
      setLeafletCssLoaded(true);
    }).catch((err) => {
      setImportError(String(err?.message || err));
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!navigator?.geolocation) {
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCenter([lat, lng]);
      },
      () => {
        // if denied or failed, keep default center
      },
      { enableHighAccuracy: true, maximumAge: 1000 * 60 * 5 }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMoveEnd = (lat: number, lng: number) => {
    setCenter([lat, lng]);
  };

  const handleZoomEnd = (z: number) => {
    const newRadius = Math.round(defaultRadius * Math.pow(1.4, 13 - z));
    setRadius(newRadius);
    refetch().catch(() => {});
  };

  const markers = useMemo(() => properties.filter((p: any) => p.location && p.location.coordinates && p.location.coordinates.length === 2), [properties]);

  useEffect(() => {
    console.debug("Nearby properties count:", properties.length, { center, radius, error });
    console.debug(properties.slice(0, 10));
  }, [properties, center, radius, error]);

  const handleFetchCurrentLocation = () => {
    if (!navigator?.geolocation) {
      alert("Geolocation not available in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCenter([lat, lng]);
        refetch().catch(() => {});
        try {
          if (mapRef.current && typeof mapRef.current.setView === "function") {
            mapRef.current.setView([lat, lng], 14);
          }
        } catch (e) {
          // ignore
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        alert("Failed to get location: " + (err?.message || "unknown"));
      },
      { enableHighAccuracy: true }
    );
  };

  if (importError) {
    return (
      <div className="w-full h-[70vh] rounded-xl overflow-hidden border border-brand-border flex items-center justify-center p-6">
        <div className="text-center">
          <div className="font-bold mb-2">Map libraries not installed</div>
          <div className="text-sm text-gray-600 mb-4">To enable the map view, install the required packages:</div>
          <pre className="bg-gray-100 rounded p-3 text-sm">npm install react-leaflet leaflet</pre>
        </div>
      </div>
    );
  }

  if (!rl || !leafletCssLoaded) {
    return (
      <div className="w-full h-[70vh] rounded-xl overflow-hidden border border-brand-border flex items-center justify-center">
        <div className="text-brand-text-secondary">Loading map...</div>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents, ZoomControl } = rl as any;

  function MapEvents({ onMoveEnd, onZoomEnd }: { onMoveEnd: (lat: number, lng: number) => void; onZoomEnd?: (z: number) => void; }) {
    const debounceRef = useRef<number | null>(null);
    useMapEvents({
      moveend(e: any) {
        const center = e.target.getCenter();
        if (debounceRef.current) window.clearTimeout(debounceRef.current);
        debounceRef.current = window.setTimeout(() => {
          onMoveEnd(center.lat, center.lng);
        }, 300);
      },
      zoomend(e: any) {
        const z = e.target.getZoom();
        if (onZoomEnd) onZoomEnd(z);
      },
    });
    return null;
  }

  return (
    <div className="w-full h-[70vh] rounded-xl overflow-hidden border border-brand-border">
      {/* Debug overlay */}
      <div className="absolute top-4 right-4 z-50 bg-white/90 text-xs p-2 rounded shadow-md">
        <div className="font-medium">Nearby: {properties.length}</div>
        <div className="text-xxs">Center: {center[0].toFixed(4)}, {center[1].toFixed(4)}</div>
        <div className="text-xxs">Radius: {radius}m</div>
        {loading && <div className="text-xxs">Loading…</div>}
        {error && <div className="text-red-600 text-xxs">Error: {error}</div>}
        <div className="mt-2 flex gap-2">
          <button
            onClick={handleFetchCurrentLocation}
            className="bg-brand-teal text-white text-xs px-2 py-1 rounded"
            aria-label="Fetch current location"
          >
            Use my location
          </button>
          <button
            onClick={() => { refetch().catch(() => {}); }}
            className="border border-gray-200 text-xs px-2 py-1 rounded"
            aria-label="Refresh nearby"
          >
            Refresh
          </button>
        </div>
      </div>
      <MapContainer
        center={center}
        zoom={13}
        whenCreated={(map: any) => (mapRef.current = map)}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <ZoomControl position="topright" />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <MapEvents onMoveEnd={handleMoveEnd} onZoomEnd={handleZoomEnd} />

        <Circle center={center} radius={radius} pathOptions={{ color: "#06b6d4", weight: 1, fillOpacity: 0.05 }} />

        {markers.map((p: any) => {
          const [lng, lat] = p.location.coordinates;
          return (
            <Marker key={p._id} position={[lat, lng]}>
              <Popup>
                <div className="min-w-[200px]">
                  <div className="font-bold">{p.title}</div>
                  <div className="text-sm text-gray-600">₹{p.rent?.toLocaleString()}/mo</div>
                  {p.city && <div className="text-sm text-gray-500">{p.city}</div>}
                  <div className="mt-2">
                    <Link href={`/property/${p._id}`} className="text-brand-teal underline">View</Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
