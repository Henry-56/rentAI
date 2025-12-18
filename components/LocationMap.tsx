import React, { useEffect, useRef } from 'react';
import { Item, Coordinates } from '../types';
import { HUANCAYO_CENTER } from '../constants';

interface LocationMapProps {
  items: Item[]; // Items to show markers for
  center?: Coordinates; // Center of the map
  zoom?: number;
  height?: string;
  selectedItemId?: string;
  onMapClick?: (coords: Coordinates) => void; // New prop for picking location
  showUserLocation?: boolean; // Show a distinct marker for user/selected location
}

export const LocationMap: React.FC<LocationMapProps> = ({
  items,
  center = HUANCAYO_CENTER,
  zoom = 13,
  height = '400px',
  selectedItemId,
  onMapClick,
  showUserLocation
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map if not already initialized
    if (!leafletMap.current) {
      // @ts-ignore - L is global from script tag
      leafletMap.current = window.L.map(mapRef.current).setView([center.lat, center.lng], zoom);

      // Add OpenStreetMap tiles
      // @ts-ignore
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(leafletMap.current);

      // Click handler for picker mode
      leafletMap.current.on('click', (e: any) => {
        if (onMapClick) {
          onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
        }
      });
    } else {
      // Update view if center changes, but only flyTo if significant change to avoid jitter
      leafletMap.current.setView([center.lat, center.lng], zoom);
    }

    // Clear existing markers
    markersRef.current.forEach(m => leafletMap.current.removeLayer(m));
    markersRef.current = [];

    // Define Icons
    // @ts-ignore
    const customIcon = window.L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: #4f46e5; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    // @ts-ignore
    const selectedIcon = window.L.divIcon({
      className: 'custom-div-icon-selected',
      html: `<div style="background-color: #ef4444; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.4); animation: pulse 2s infinite;"></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    // @ts-ignore
    const pickerIcon = window.L.divIcon({
      className: 'custom-div-icon-picker',
      html: `<div style="background-color: #10b981; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.4);"></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    // Add Item Markers
    items.forEach(item => {
      if (!item.coordinates) return; // Skip if no coordinates

      const isSelected = item.id === selectedItemId;
      // @ts-ignore
      const marker = window.L.marker([item.coordinates.lat, item.coordinates.lng], {
        icon: isSelected ? selectedIcon : customIcon
      }).addTo(leafletMap.current);

      marker.bindPopup(`
            <div style="font-family: 'Inter', sans-serif;">
                <h3 style="font-weight: 600; margin-bottom: 4px;">${item.title}</h3>
                <p style="margin: 0; color: #64748b;">S/ ${item.pricePerDay}/día</p>
                <p style="margin: 0; font-size: 10px; color: #94a3b8;">${item.location}</p>
            </div>
        `);

      if (isSelected) {
        marker.openPopup();
      }
      markersRef.current.push(marker);
    });

    // Add Picker/User Location Marker if enabled (even if not in items list)
    if (showUserLocation && items.length === 0) {
      // @ts-ignore
      const marker = window.L.marker([center.lat, center.lng], {
        icon: pickerIcon
      }).addTo(leafletMap.current);
      markersRef.current.push(marker);
    }

    return () => {
      // Cleanup handled by refs mostly
    }
  }, [center?.lat, center?.lng, items, zoom, onMapClick, selectedItemId, showUserLocation]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner group">
      <div ref={mapRef} style={{ height, width: '100%' }} className="z-0" />
      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 text-[10px] rounded z-[400] text-slate-500 pointer-events-none">
        Huancayo, Junín {onMapClick && '(Haz clic para seleccionar)'}
      </div>
    </div>
  );
};