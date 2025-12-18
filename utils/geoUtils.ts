import { Coordinates } from '../types';

// Haversine formula to calculate distance between two points in km
export const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(coord2.lat - coord1.lat);
  const dLng = deg2rad(coord2.lng - coord1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(coord1.lat)) * Math.cos(deg2rad(coord2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return Number(d.toFixed(1));
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

export const formatDistance = (distance?: number): string => {
  if (distance === undefined) return '';
  if (distance < 1) return `${(distance * 1000).toFixed(0)} m`;
  return `${distance} km`;
};

// Check if user is roughly in Huancayo (within 50km of center)
export const isInHuancayoRange = (coords: Coordinates): boolean => {
    const HUANCAYO_CENTER = { lat: -12.0681, lng: -75.2106 };
    const dist = calculateDistance(coords, HUANCAYO_CENTER);
    return dist < 50;
};