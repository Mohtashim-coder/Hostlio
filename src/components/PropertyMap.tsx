"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { geoJSONToLeaflet } from "@/lib/geocoding";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

interface PropertyData {
  _id: string;
  title: string;
  type: string;
  rent: number;
  address: string;
  city: string;
  photos: string[];
  location?: {
    type: string;
    coordinates: number[];
  };
}

interface PropertyMapProps {
  properties: PropertyData[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onMarkerClick?: (property: PropertyData) => void;
}

const DEFAULT_CENTER: [number, number] = [28.6139, 77.209];
const DEFAULT_ZOOM = 12;

export default function PropertyMap({
  properties,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  height = "500px",
  onMarkerClick,
}: PropertyMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [Leaflet, setLeaflet] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);

    import("leaflet").then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });
      setLeaflet(L);
    });
  }, []);

  const validProperties = properties.filter(
    (p) =>
      p.location &&
      p.location.coordinates &&
      p.location.coordinates.length === 2,
  );

  const mapCenter =
    validProperties.length > 0 && !center
      ? geoJSONToLeaflet(validProperties[0].location!.coordinates)
      : center;

  if (!isMounted) {
    return (
      <div
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f3f4f6",
          borderRadius: "8px",
        }}
      >
        <span className="text-gray-500">Loading map...</span>
      </div>
    );
  }

  return (
    <div
      style={{ height, width: "100%", borderRadius: "8px", overflow: "hidden" }}
    >
      {isMounted && Leaflet && (
        <MapContainer
          center={mapCenter}
          zoom={zoom}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {validProperties.map((property) => {
            const position = geoJSONToLeaflet(property.location!.coordinates);
            return (
              <Marker
                key={property._id}
                position={position}
                eventHandlers={{
                  click: () => {
                    if (onMarkerClick) {
                      onMarkerClick(property);
                    }
                  },
                }}
              >
                <Popup>
                  <div style={{ minWidth: "200px" }}>
                    {property.photos && property.photos.length > 0 && (
                      <img
                        src={property.photos[0]}
                        alt={property.title}
                        style={{
                          width: "100%",
                          height: "100px",
                          objectFit: "cover",
                          borderRadius: "4px",
                          marginBottom: "8px",
                        }}
                      />
                    )}
                    <h3
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        marginBottom: "4px",
                      }}
                    >
                      {property.title}
                    </h3>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#666",
                        marginBottom: "4px",
                      }}
                    >
                      {property.type}
                    </p>
                    <p
                      style={{
                        fontSize: "18px",
                        fontWeight: "700",
                        color: "#22c55e",
                      }}
                    >
                      ₹{property.rent.toLocaleString()}/month
                    </p>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#888",
                        marginTop: "4px",
                      }}
                    >
                      {property.address}, {property.city}
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      )}
    </div>
  );
}
