// Core types for BarbadosBespoke

export type BarbadosActivityCategory =
  | 'beach'
  | 'water-sports'
  | 'food'
  | 'rum'
  | 'history'
  | 'culture'
  | 'nature'
  | 'music'
  | 'nightlife'
  | 'markets'
  | 'crafts'
  | 'transport'
  | 'general';

export type GroupType = 'solo' | 'couple' | 'family' | 'group';

export type ActivityVibe =
  | 'relaxing'
  | 'cultural'
  | 'active'
  | 'romantic'
  | 'party'
  | 'luxurious'
  | 'thrill-seeking';

export type MustDo =
  | 'beach'
  | 'music'
  | 'shopping'
  | 'nature'
  | 'water-sports'
  | 'party';

export type TransportMode = 'walk' | 'public-transport' | 'taxi';

export type MealPreference = 'breakfast' | 'lunch' | 'dinner' | 'drinks' | 'skip';

export interface ShipDetails {
  departurePort: string; // default: "Bridgetown Cruise Terminal, Barbados"
  endLocation?: string;  // if different from departurePort
  returnTime: string;    // HH:mm format
  startTime: string;     // HH:mm format (default = now)
  availableHours: number;
}

export interface CruiseTouristPreferences {
  shipDetails: ShipDetails;
  groupType: GroupType;
  groupSize?: number;            // number of people in the group
  vibes: ActivityVibe[];
  mustDos: MustDo[];
  meals: MealPreference[];
  budgetGbp: number;             // per person in GBP (0–200, 200 means 200+)
  transportPreferences: TransportMode[]; // ordered by priority
  planDate: string;              // ISO date string
  specificActivities?: string;   // free-text requests from the user
  dietaryRequirements?: string;  // e.g. vegetarian, nut allergy
  accessibilityNeeds?: string;   // e.g. wheelchair, limited mobility
  previouslySuggested?: string;  // comma-separated list of venue names from prior plans this session
}

export interface BarbadosActivity {
  id: string;
  name: string;
  description: string;
  address: string;
  lat?: number;
  lng?: number;
  startTime: string;
  endTime: string;
  duration_minutes: number;
  cost_bbd: number;    // Barbados dollars
  cost_gbp?: number;   // GBP estimate (1 BBD ≈ 0.38 GBP)
  cost_usd?: number;   // USD estimate (1 BBD = 0.50 USD)
  category: BarbadosActivityCategory;
  why_special: string;
  google_maps_search_query: string;
  emoji?: string;
  // Google Places data — populated when place details are fetched
  place_id?: string;
  website?: string;         // from Google Places API
  menu_url?: string;        // for food/drinks venues — from Google Places or manual curation
  // QR/stamp info (populated when matched to a curated location)
  location_id?: string;
  qr_code_id?: string;
  stamp_emoji?: string;
  stamp_name?: string;
  // true for natural/scenic locations (beaches, hills, viewpoints, parks)
  // false or undefined for named businesses
  is_geographic?: boolean;
  // only populated after Google Places validation confirms a real website
  verified_website?: string;
  // true when this is a paid activity and user budget is £0
  has_free_alternative?: boolean;
  free_alternative?: {
    name: string;
    description: string;
    address: string;
    lat?: number;
    lng?: number;
    google_maps_search_query: string;
    why_special: string;
  };
  // set by user interaction on conflict card — null by default
  user_choice?: 'free' | 'paid' | 'both' | null;
}

export interface TransferLeg {
  id: string;
  from: string;
  to: string;
  startTime: string;
  endTime: string;
  duration_minutes: number;
  mode: 'walking' | 'taxi' | 'minibus' | 'driving';
  cost_bbd: number;
  notes?: string;
}

export interface ItineraryEvent {
  type: 'activity' | 'transfer';
  data: BarbadosActivity | TransferLeg;
}

export interface BarbadosDayPlan {
  id: string;
  title: string;
  date: string;
  events: ItineraryEvent[];
  totalCost_bbd: number;
  totalDuration_minutes: number;
  preferences: CruiseTouristPreferences;
  special_notes?: string;
  created_at?: string;
}

// Stamp Passport types
export interface Location {
  id: string;
  name: string;
  address: string;
  lat?: number;
  lng?: number;
  category: BarbadosActivityCategory;
  qr_code_id: string;
  stamp_emoji: string;
  stamp_name: string;
  is_active: boolean;
}

export interface Checkin {
  id: string;
  user_id: string;
  location_id: string;
  plan_id?: string;
  checked_in_at: string;
  location?: Location;
}

// Loading messages for plan generation
export const LOADING_MESSAGES = [
  'Asking the locals...',
  'Finding hidden gems...',
  'Checking the rum trail...',
  'Plotting your perfect day...',
  'Consulting the coconut telegraph...',
  'Scouting the best beaches...',
  'Tasting the flying fish...',
];

export const VIBE_OPTIONS: { id: ActivityVibe; emoji: string; label: string }[] = [
  { id: 'relaxing',      emoji: '🌅', label: 'Relaxing' },
  { id: 'cultural',      emoji: '🏛️', label: 'Cultural' },
  { id: 'active',        emoji: '⚡', label: 'Active' },
  { id: 'romantic',      emoji: '💫', label: 'Romantic' },
  { id: 'party',         emoji: '🎉', label: 'Party' },
  { id: 'luxurious',     emoji: '✨', label: 'Luxurious' },
  { id: 'thrill-seeking', emoji: '🔥', label: 'Thrill Seeking' },
];

export const MUST_DO_OPTIONS: { id: MustDo; emoji: string; label: string }[] = [
  { id: 'beach',        emoji: '🏖️', label: 'Beach' },
  { id: 'music',        emoji: '🎵', label: 'Music' },
  { id: 'shopping',     emoji: '🛍️', label: 'Shopping' },
  { id: 'nature',       emoji: '🌿', label: 'Nature' },
  { id: 'water-sports', emoji: '🤿', label: 'Water Sports' },
  { id: 'party',        emoji: '🎉', label: 'Party' },
];

export const GROUP_OPTIONS: { id: GroupType; emoji: string; label: string }[] = [
  { id: 'solo',   emoji: '🧍', label: 'Solo' },
  { id: 'couple', emoji: '👫', label: 'Couple' },
  { id: 'family', emoji: '👨‍👩‍👧', label: 'Family' },
  { id: 'group',  emoji: '👥', label: 'Group' },
];

// Currency helpers
export const BBD_TO_GBP = 0.38;
export const BBD_TO_USD = 0.50;
export const GBP_TO_BBD = 1 / BBD_TO_GBP;

export function bbdToGbp(bbd: number): number {
  if (!bbd || isNaN(bbd)) return 0;
  return Math.round(bbd * BBD_TO_GBP * 100) / 100;
}

export function bbdToUsd(bbd: number): number {
  if (!bbd || isNaN(bbd)) return 0;
  return Math.round(bbd * BBD_TO_USD * 100) / 100;
}

export function gbpToBbd(gbp: number): number {
  if (!gbp || isNaN(gbp)) return 0;
  return Math.round(gbp * GBP_TO_BBD);
}

export const CATEGORY_EMOJIS: Record<BarbadosActivityCategory, string> = {
  beach: '🏖️',
  'water-sports': '🤿',
  food: '🍽️',
  rum: '🥃',
  history: '🏛️',
  culture: '🎭',
  nature: '🌿',
  music: '🎵',
  nightlife: '🌙',
  markets: '🛍️',
  crafts: '🎨',
  transport: '🚕',
  general: '📍',
};
