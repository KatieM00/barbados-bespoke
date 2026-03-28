import { useState } from 'react';
import type { Checkin, Location } from '../types';

const DEMO_LOCATIONS: Location[] = [
  {
    id: 'loc-1',
    name: 'Carlisle Bay Beach',
    address: 'Carlisle Bay, Bridgetown, Barbados',
    lat: 13.0633,
    lng: -59.6167,
    category: 'beach',
    qr_code_id: 'BRGT-001',
    stamp_emoji: '🏖️',
    stamp_name: 'Carlisle Bay',
    is_active: true,
  },
  {
    id: 'loc-2',
    name: 'Oistins Fish Fry',
    address: 'Oistins Bay Gardens, Christ Church, Barbados',
    lat: 13.0667,
    lng: -59.5383,
    category: 'food',
    qr_code_id: 'OIST-001',
    stamp_emoji: '🐟',
    stamp_name: 'Oistins Fish Fry',
    is_active: true,
  },
  {
    id: 'loc-3',
    name: "Harrison's Cave",
    address: "Harrison's Cave, St. Thomas, Barbados",
    lat: 13.1789,
    lng: -59.5791,
    category: 'nature',
    qr_code_id: 'HARR-001',
    stamp_emoji: '🪨',
    stamp_name: "Harrison's Cave",
    is_active: true,
  },
  {
    id: 'loc-4',
    name: 'Mount Gay Rum Distillery',
    address: 'Spring Garden Highway, Bridgetown, Barbados',
    lat: 13.1017,
    lng: -59.6228,
    category: 'rum',
    qr_code_id: 'MGAY-001',
    stamp_emoji: '🥃',
    stamp_name: 'Mount Gay Rum',
    is_active: true,
  },
  {
    id: 'loc-5',
    name: 'St. Nicholas Abbey',
    address: 'Cherry Tree Hill, St. Peter, Barbados',
    lat: 13.2833,
    lng: -59.5667,
    category: 'history',
    qr_code_id: 'SNAB-001',
    stamp_emoji: '🏛️',
    stamp_name: 'St. Nicholas Abbey',
    is_active: true,
  },
  {
    id: 'loc-6',
    name: 'Bathsheba Beach',
    address: 'Bathsheba, St. Joseph, Barbados',
    lat: 13.2167,
    lng: -59.5167,
    category: 'beach',
    qr_code_id: 'BATH-001',
    stamp_emoji: '🌊',
    stamp_name: 'Bathsheba',
    is_active: true,
  },
];

export const useCheckins = () => {
  const [loading, setLoading] = useState(false);
  const [error] = useState<string | null>(null);

  const checkinToLocation = async (locationId: string, planId?: string): Promise<Checkin> => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    setLoading(false);
    return {
      id: `checkin-${Date.now()}`,
      user_id: 'demo-user',
      location_id: locationId,
      plan_id: planId,
      checked_in_at: new Date().toISOString(),
    };
  };

  const getUserCheckins = async (): Promise<Checkin[]> => {
    await new Promise(r => setTimeout(r, 300));
    return [];
  };

  const getAllLocations = async (): Promise<Location[]> => {
    await new Promise(r => setTimeout(r, 300));
    return DEMO_LOCATIONS;
  };

  const getLocationByQrCode = async (qrCodeId: string): Promise<Location | null> => {
    await new Promise(r => setTimeout(r, 200));
    return DEMO_LOCATIONS.find(l => l.qr_code_id === qrCodeId) ?? null;
  };

  return {
    loading,
    error,
    checkinToLocation,
    getUserCheckins,
    getAllLocations,
    getLocationByQrCode,
  };
};
