"use client";

import { MonumentZone } from "@/types";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import L from "leaflet";

type Props = {
  center: { lat: number; lng: number };
  zones: MonumentZone[];
};

export default function LeafletZonesMap({ center, zones }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = L.map(mapRef.current).setView([center.lat, center.lng], 16);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    zones.forEach((zone) => {
      L.marker([zone.coordinates.lat, zone.coordinates.lng])
        .addTo(map)
        .bindPopup(`<strong>${zone.name}</strong><br/>XP: ${zone.xp}`);

      L.circle([zone.coordinates.lat, zone.coordinates.lng], {
        radius: zone.radius,
        color: "#4B9B8E",
      }).addTo(map);
    });

    return () => {
      map.remove();
    };
  }, [center.lat, center.lng, zones]);

  return (
    <div className="h-[360px] w-full overflow-hidden rounded-xl border border-white/10">
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
}
