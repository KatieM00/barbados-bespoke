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

export type BudgetLevel = 'budget' | 'mid' | 'premium';

export type ActivityVibe =
  | 'beach'
  | 'food-rum'
  | 'history-culture'
  | 'nature'
  | 'music-nightlife'
  | 'markets-crafts';

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
  meals: MealPreference[];
  budget: BudgetLevel;
  planDate: string;              // ISO date string
  specificActivities?: string;   // free-text requests from the user
  dietaryRequirements?: string;  // e.g. vegetarian, nut allergy
  accessibilityNeeds?: string;   // e.g. wheelchair, limited mobility
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
  { id: 'beach', emoji: '🌊', label: 'Beach & Water' },
  { id: 'food-rum', emoji: '🍽️', label: 'Food & Rum' },
  { id: 'history-culture', emoji: '🏛️', label: 'History & Culture' },
  { id: 'nature', emoji: '🌿', label: 'Nature & Outdoors' },
  { id: 'music-nightlife', emoji: '🎵', label: 'Local Music & Nightlife' },
  { id: 'markets-crafts', emoji: '🛍️', label: 'Local Markets & Crafts' },
];

export const BUDGET_OPTIONS: { id: BudgetLevel; symbol: string; label: string }[] = [
  { id: 'budget', symbol: '$', label: 'Free/Cheap' },
  { id: 'mid', symbol: '$$', label: 'Mid-range' },
  { id: 'premium', symbol: '$$$', label: 'Splash out' },
];

export const GROUP_OPTIONS: { id: GroupType; emoji: string; label: string }[] = [
  { id: 'solo', emoji: '🧍', label: 'Solo' },
  { id: 'couple', emoji: '👫', label: 'Couple' },
  { id: 'family', emoji: '👨‍👩‍👧', label: 'Family' },
  { id: 'group', emoji: '👥', label: 'Group' },
];

// Currency helpers
export const BBD_TO_GBP = 0.38;
export const BBD_TO_USD = 0.50;

export function bbdToGbp(bbd: number): number {
  return Math.round(bbd * BBD_TO_GBP * 100) / 100;
}

export function bbdToUsd(bbd: number): number {
  return Math.round(bbd * BBD_TO_USD * 100) / 100;
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
