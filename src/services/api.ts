import type { BarbadosDayPlan, CruiseTouristPreferences } from '../types';

// ─── Demo mode ───────────────────────────────────────────────────────────────
// All API calls return mock data so the app works without a backend.

export interface GeneratePlanRequest {
  preferences: CruiseTouristPreferences;
}

export const generateBarbadosPlan = async (
  preferences: CruiseTouristPreferences
): Promise<BarbadosDayPlan> => {
  // Simulate a short loading delay
  await new Promise(r => setTimeout(r, 2000));

  const { startTime, returnTime } = preferences.shipDetails;

  const plan: BarbadosDayPlan = {
    id: 'demo-plan-001',
    title: '🌴 Barbados',
    date: new Date().toISOString().split('T')[0],
    preferences,
    totalCost_bbd: 180,
    totalDuration_minutes: 390,
    special_notes: 'Tip: The ZR minibuses are cheap, fast, and very local. Flag them down on the roadside — exact change preferred!',
    events: [
      {
        type: 'activity',
        data: {
          id: 'act-1',
          name: 'Carlisle Bay Beach',
          description: 'A beautiful crescent of white sand right in Bridgetown, perfect for a swim or just soaking up the Caribbean sun before the day begins.',
          address: 'Carlisle Bay, Bridgetown, Barbados',
          lat: 13.0633,
          lng: -59.6167,
          startTime,
          endTime: addMinutes(startTime, 60),
          duration_minutes: 60,
          cost_bbd: 0,
          category: 'beach',
          why_special: 'Crystal-clear water with calm waves — ideal for a refreshing morning dip.',
          google_maps_search_query: 'Carlisle Bay Beach Bridgetown Barbados',
          emoji: '🏖️',
        },
      },
      {
        type: 'transfer',
        data: {
          id: 'tr-1',
          from: 'Carlisle Bay Beach',
          to: 'Oistins Fish Fry',
          startTime: addMinutes(startTime, 60),
          endTime: addMinutes(startTime, 90),
          duration_minutes: 30,
          mode: 'minibus',
          cost_bbd: 3.5,
          notes: 'ZR minibus from Bridgetown to Oistins — about 20 mins, very local experience.',
        },
      },
      {
        type: 'activity',
        data: {
          id: 'act-2',
          name: 'Oistins Fish Fry',
          description: 'The most famous lunch spot on the island — fresh-caught fish, flying fish cutter sandwiches, and cold Banks beer at the market stalls.',
          address: 'Oistins Bay Gardens, Christ Church, Barbados',
          lat: 13.0667,
          lng: -59.5383,
          startTime: addMinutes(startTime, 90),
          endTime: addMinutes(startTime, 150),
          duration_minutes: 60,
          cost_bbd: 40,
          category: 'food',
          why_special: 'An unmissable Barbados institution. The fried flying fish here is legendary.',
          google_maps_search_query: 'Oistins Fish Fry Barbados',
          emoji: '🐟',
        },
      },
      {
        type: 'transfer',
        data: {
          id: 'tr-2',
          from: 'Oistins Fish Fry',
          to: 'Harrison\'s Cave',
          startTime: addMinutes(startTime, 150),
          endTime: addMinutes(startTime, 195),
          duration_minutes: 45,
          mode: 'taxi',
          cost_bbd: 35,
          notes: 'Share a taxi from Oistins — about 25–30 mins through the scenic centre of the island.',
        },
      },
      {
        type: 'activity',
        data: {
          id: 'act-3',
          name: "Harrison's Cave",
          description: "Barbados's most spectacular natural attraction — a crystallized limestone cavern with underground streams, waterfalls and stalagmites. Tram tours run every 30 minutes.",
          address: "Harrison's Cave, Welchman Hall, St. Thomas, Barbados",
          lat: 13.1789,
          lng: -59.5791,
          startTime: addMinutes(startTime, 195),
          endTime: addMinutes(startTime, 285),
          duration_minutes: 90,
          cost_bbd: 80,
          category: 'nature',
          why_special: "One of the Caribbean's most impressive geological wonders, right beneath the surface of Barbados.",
          google_maps_search_query: "Harrison's Cave Barbados",
          emoji: '🪨',
        },
      },
      {
        type: 'transfer',
        data: {
          id: 'tr-3',
          from: "Harrison's Cave",
          to: 'Bridgetown Cruise Terminal',
          startTime: addMinutes(startTime, 285),
          endTime: addMinutes(startTime, 345),
          duration_minutes: 60,
          mode: 'taxi',
          cost_bbd: 45,
          notes: 'Pre-arrange a return taxi at the cave entrance — allow a full hour to get back comfortably.',
        },
      },
      {
        type: 'activity',
        data: {
          id: 'act-4',
          name: 'Bridgetown Rum Shop Stop',
          description: 'A classic Bajan rum shop near the terminal for a farewell Rum Punch and a browse of the local craft stalls before heading back to the ship.',
          address: 'Broad Street, Bridgetown, Barbados',
          lat: 13.0969,
          lng: -59.6145,
          startTime: addMinutes(startTime, 345),
          endTime: returnTime,
          duration_minutes: 30,
          cost_bbd: 25,
          category: 'rum',
          why_special: 'The perfect send-off — Barbados has more rum shops per capita than anywhere else in the world.',
          google_maps_search_query: 'Broad Street Bridgetown Barbados',
          emoji: '🥃',
        },
      },
    ],
    created_at: new Date().toISOString(),
  };

  return plan;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + mins;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

// ─── Activity search (stubbed) ───────────────────────────────────────────────
// Returns a small set of Barbados activities matching a free-text query.
// Replace with a real AI/Places call when the backend is ready.

import type { BarbadosActivity } from '../types';

const SEARCH_POOL: BarbadosActivity[] = [
  {
    id: 'search-1', name: 'Bathsheba Beach', emoji: '🪨',
    description: 'Wild, dramatic Atlantic-coast beach famed for its giant boulders and surf. A favourite with photographers and surfers.',
    address: 'Bathsheba, St. Joseph, Barbados', lat: 13.1869, lng: -59.5296,
    startTime: '09:00', endTime: '10:30', duration_minutes: 90, cost_bbd: 0,
    category: 'beach', why_special: 'One of the most striking beaches on the island — completely different feel from the calm west coast.',
    google_maps_search_query: 'Bathsheba Beach Barbados',
  },
  {
    id: 'search-2', name: 'Hunte\'s Gardens', emoji: '🌺',
    description: 'A magical jungle garden hidden in a limestone gully, created by horticulturalist Anthony Hunte. Often described as one of the most beautiful gardens in the world.',
    address: 'Hunte\'s Gardens, St. Joseph, Barbados', lat: 13.1711, lng: -59.5621,
    startTime: '10:00', endTime: '11:30', duration_minutes: 90, cost_bbd: 40,
    category: 'nature', why_special: 'The owner often chats with visitors personally. A true hidden gem.',
    google_maps_search_query: 'Hunte\'s Gardens Barbados',
  },
  {
    id: 'search-3', name: 'Banks Brewery Tour', emoji: '🍺',
    description: 'Tour Barbados\'s most famous brewery and sample the iconic Banks Beer straight from the source.',
    address: 'Banks Brewery, Wildey, St. Michael, Barbados', lat: 13.0975, lng: -59.5989,
    startTime: '11:00', endTime: '12:30', duration_minutes: 90, cost_bbd: 50,
    category: 'rum', why_special: 'Barbados takes its beer as seriously as its rum — this is a must for drink enthusiasts.',
    google_maps_search_query: 'Banks Brewery Barbados tour',
  },
  {
    id: 'search-4', name: 'Pelican Craft Centre', emoji: '🎨',
    description: 'Bustling artisan market near the cruise terminal selling hand-made crafts, pottery, paintings and local souvenirs.',
    address: 'Pelican Craft Centre, Bridgetown, Barbados', lat: 13.0971, lng: -59.6207,
    startTime: '14:00', endTime: '15:00', duration_minutes: 60, cost_bbd: 0,
    category: 'crafts', why_special: 'Direct from the makers — everything here is genuinely local.',
    google_maps_search_query: 'Pelican Craft Centre Bridgetown Barbados',
  },
  {
    id: 'search-5', name: 'St. Nicholas Abbey', emoji: '🏰',
    description: 'One of the oldest plantation houses in the western hemisphere, dating to the 1650s. Now produces its own exceptional rum.',
    address: 'St. Nicholas Abbey, Cherry Tree Hill, St. Peter, Barbados', lat: 13.2469, lng: -59.5639,
    startTime: '10:00', endTime: '12:00', duration_minutes: 120, cost_bbd: 90,
    category: 'history', why_special: 'The Jacobean great house, cherry tree hill views, and heritage rum all in one stop.',
    google_maps_search_query: 'St Nicholas Abbey Barbados',
  },
  {
    id: 'search-6', name: 'Accra Beach', emoji: '🏖️',
    description: 'Lively south-coast beach lined with beach bars and food stalls. Great for people-watching and easy swimming.',
    address: 'Accra Beach, Rockley, Christ Church, Barbados', lat: 13.0644, lng: -59.5814,
    startTime: '13:00', endTime: '14:30', duration_minutes: 90, cost_bbd: 0,
    category: 'beach', why_special: 'The most social beach on the island — always buzzing with locals and visitors.',
    google_maps_search_query: 'Accra Beach Barbados',
  },
  {
    id: 'search-7', name: 'Mount Gay Rum Tour', emoji: '🥃',
    description: 'Tour the world\'s oldest rum distillery, founded in 1703, with tasting sessions led by expert guides.',
    address: 'Mount Gay Rum, Spring Garden Highway, St. Michael, Barbados', lat: 13.1058, lng: -59.6264,
    startTime: '10:00', endTime: '11:30', duration_minutes: 90, cost_bbd: 70,
    category: 'rum', why_special: 'The original birthplace of rum. The premium tour includes rare barrel tastings.',
    google_maps_search_query: 'Mount Gay Rum Distillery Barbados tour',
  },
  {
    id: 'search-8', name: 'Crane Beach', emoji: '🌊',
    description: 'Often voted one of the world\'s best beaches — a dramatic pink-sand beach framed by cliffs on the south-east coast.',
    address: 'Crane Beach, St. Philip, Barbados', lat: 13.0955, lng: -59.4472,
    startTime: '09:00', endTime: '11:00', duration_minutes: 120, cost_bbd: 0,
    category: 'beach', why_special: 'The cliff-top backdrop and pink-tinged sand make it unlike any other beach in Barbados.',
    google_maps_search_query: 'Crane Beach Barbados',
  },
];

export const searchActivities = async (query: string): Promise<BarbadosActivity[]> => {
  await new Promise(r => setTimeout(r, 700));
  const q = query.toLowerCase();
  const scored = SEARCH_POOL.map(a => {
    let score = 0;
    if (a.name.toLowerCase().includes(q)) score += 3;
    if (a.description.toLowerCase().includes(q)) score += 2;
    if (a.category.toLowerCase().includes(q)) score += 2;
    if (a.why_special.toLowerCase().includes(q)) score += 1;
    return { a, score };
  });
  const results = scored
    .filter(({ score }) => score > 0)
    .sort((x, y) => y.score - x.score)
    .map(({ a }) => a);
  // Fall back to returning 4 varied options if nothing matched
  return results.length > 0 ? results.slice(0, 4) : SEARCH_POOL.slice(0, 4);
};

// ─── Check-in (stubbed) ───────────────────────────────────────────────────────

export interface CheckinRequest {
  qr_code_id: string;
  plan_id?: string;
}

export interface CheckinResponse {
  success: boolean;
  location_name: string;
  stamp_emoji: string;
  stamp_name: string;
  location_id: string;
}

export const validateCheckin = async (
  qrCodeId: string,
  _planId?: string
): Promise<CheckinResponse> => {
  await new Promise(r => setTimeout(r, 800));
  return {
    success: true,
    location_name: 'Demo Location',
    stamp_emoji: '🌴',
    stamp_name: qrCodeId,
    location_id: qrCodeId,
  };
};
