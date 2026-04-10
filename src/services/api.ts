import type { BarbadosDayPlan, CruiseTouristPreferences } from '../types';

// ─── Gemini prompt builder ────────────────────────────────────────────────────
// Builds the system + user prompt for the Gemini plan-generation call.
// Wire into a real generateContent call when the backend/edge function is ready.

const VIBE_BLENDS: Record<string, { active: number; culture: number; scenic: number; nightlife: number }> = {
  relaxing:         { active: 10, culture: 25, scenic: 65, nightlife: 0 },
  cultural:         { active: 10, culture: 70, scenic: 20, nightlife: 0 },
  active:           { active: 55, culture: 10, scenic: 35, nightlife: 0 },
  romantic:         { active: 15, culture: 25, scenic: 60, nightlife: 0 },
  party:            { active: 20, culture:  5, scenic: 25, nightlife: 50 },
  luxurious:        { active: 15, culture: 25, scenic: 60, nightlife: 0 },
  'thrill-seeking': { active: 75, culture:  5, scenic: 20, nightlife: 0 },
};

function calcVibeBlend(vibes: string[]) {
  const valid = vibes.filter(v => VIBE_BLENDS[v]);
  const base = valid.length > 0 ? valid : ['relaxing'];
  const sum = { active: 0, culture: 0, scenic: 0, nightlife: 0 };
  for (const v of base) {
    sum.active    += VIBE_BLENDS[v].active;
    sum.culture   += VIBE_BLENDS[v].culture;
    sum.scenic    += VIBE_BLENDS[v].scenic;
    sum.nightlife += VIBE_BLENDS[v].nightlife;
  }
  return {
    active:    Math.round(sum.active    / base.length),
    culture:   Math.round(sum.culture   / base.length),
    scenic:    Math.round(sum.scenic    / base.length),
    nightlife: Math.round(sum.nightlife / base.length),
  };
}

export function buildGeminiPrompt(
  preferences: CruiseTouristPreferences,
  previousPlans: string,
  weather: string,
  seedLocations: string,
): string {
  const { startTime, returnTime, availableHours } = preferences.shipDetails;
  const groupSize = preferences.groupSize ?? 2;
  const specificActivities = preferences.specificActivities || 'none specified';
  const dietaryRequirements = preferences.dietaryRequirements || 'none';
  const accessibilityNeeds = preferences.accessibilityNeeds || 'none';

  const blended = calcVibeBlend(preferences.vibes);
  const isFree = preferences.budgetGbp === 0;
  const budgetDisplay = preferences.budgetGbp >= 200
    ? '£200+ per person'
    : `£${preferences.budgetGbp} per person`;

  const modeMap: Record<string, string> = { walk: 'walking', 'public-transport': 'minibus', taxi: 'taxi' };
  const allowedModes = preferences.transportPreferences.map(t => modeMap[t] || t);
  const allowedTransferModes = allowedModes.join(', ');

  const transportRuleLines: string[] = [];
  if (!allowedModes.includes('taxi')) transportRuleLines.push('Do not suggest taxi — the user has not selected it.');
  if (!allowedModes.includes('walking')) transportRuleLines.push('Do not suggest walking between stops — the user has not selected it.');
  if (allowedModes.includes('walking')) transportRuleLines.push('Walking is allowed but never exceed 30 minutes between any two stops.');
  if (allowedModes.includes('minibus')) transportRuleLines.push('Public transport means bus or ZR route van only.');
  const transportRules = transportRuleLines.join('\n');

  const mealsFiltered = preferences.meals.filter(m => m !== 'skip');
  const mealsStr = mealsFiltered.length > 0
    ? mealsFiltered.join(', ')
    : 'none — do not include any food or drink stops';

  return `You are a local Barbados experience expert helping cruise tourists discover
authentic, non-touristy experiences. Your goal is to create the perfect
personalised day itinerary using ONLY places from the verified list provided.

═══════════════════════════════════════
VERIFIED PLACES POOL
═══════════════════════════════════════
${seedLocations}

You MUST only suggest places from this verified list. Do not suggest any
place not on this list. Do not invent business names. Do not add places
you know from your training data that are not on this list.

═══════════════════════════════════════
STRICT RULES — NEVER BREAK THESE
═══════════════════════════════════════
- Every activity must come from the verified places pool above
- Never repeat an activity within the same plan
- Never repeat activities from this user's previous plans: ${previousPlans}
- Start and end times MUST be strictly respected: ${startTime} to ${returnTime}
- Always build in a 45-minute buffer before ${returnTime} to ensure the
  user returns to the ship on time
- Do not add any food or drink stops unless meals are explicitly listed
  in the meals section below — never add food based on vibe
- Never suggest grocery stores, supermarkets, or chains

═══════════════════════════════════════
LOCATION TYPES
═══════════════════════════════════════
For each activity, set is_geographic correctly:
- is_geographic: true — beaches, bays, hills, viewpoints, parks, nature
  reserves, botanical gardens, any natural feature
- is_geographic: false — named businesses: restaurants, bars, distilleries,
  museums, ticketed attractions
Never attach a business name to a geographic feature.

═══════════════════════════════════════
TRANSPORT RULES
═══════════════════════════════════════
The user's chosen transport modes are: ${allowedTransferModes}
${transportRules}
Every transfer leg mode field must only ever be one of: ${allowedTransferModes}
No exceptions. If the user has not chosen taxi, never suggest taxi.
If the user has not chosen walking, never suggest walking between stops.
If walking is chosen, never exceed 30 minutes walking between any two stops.
Public transport in Barbados means bus or ZR route van only.

═══════════════════════════════════════
BUDGET
═══════════════════════════════════════
Budget per person: ${budgetDisplay}

${isFree ? `ZERO BUDGET RULES — STRICTLY ENFORCED:
- Every activity must be completely free (cost_bbd: 0)
- All activities must be within walking distance of Bridgetown Cruise Terminal
  and within walking distance of one another
- No paid transport between stops
- If any selected meal or must-do activity typically requires payment, you
  must still include it BUT also generate a free alternative for it:
  - Set has_free_alternative: true on the paid activity
  - Populate the free_alternative object with a genuinely free nearby option
  - The free alternative must also be within walking distance` : `Stay within the budget. Do not suggest activities that would exceed it.`}

═══════════════════════════════════════
ACTIVITY MIX
═══════════════════════════════════════
Based on the user's selected vibes, structure the activity mix as follows
(meals excluded — they are handled separately):
- ${blended.active}% active/outdoors activities
- ${blended.culture}% culture/sightseeing activities
- ${blended.scenic}% rest/scenic activities
- ${blended.nightlife}% nightlife/social activities

Thrill-seeking activities in Barbados specifically mean: surfing at
Bathsheba, jet skiing, cliff jumping, zipline, snorkelling, kitesurfing.

Party vibe means: social markets, lively beach bars, sunset spots,
local music — not late-night clubbing (users are back on ship by evening).

═══════════════════════════════════════
MEALS
═══════════════════════════════════════
Meals requested: ${mealsStr}
${mealsFiltered.length === 0 ?
  'Include ZERO food or drink stops. Activities only.' :
  'Place meals at appropriate times only: breakfast early morning, lunch midday, drinks/dinner in the evening.'}

═══════════════════════════════════════
PLAN PARAMETERS
═══════════════════════════════════════
- Available time: ${availableHours} hours (${startTime} to ${returnTime})
- Group size: ${groupSize} people
- Specific requests (include if possible): ${specificActivities}
- Dietary requirements: ${dietaryRequirements}
- Accessibility needs: ${accessibilityNeeds}
- Weather today: ${weather}
- Do not suggest beach or water activities if stormy or heavy rain

═══════════════════════════════════════
JSON OUTPUT REQUIREMENTS
═══════════════════════════════════════
Every activity must include:
name, description, address (full Barbados address), startTime, endTime,
duration_minutes, cost_bbd, cost_gbp, category, why_special,
google_maps_search_query, lat, lng, emoji, is_geographic

Every transfer leg must include:
mode — must only be one of: ${allowedTransferModes}

Include has_free_alternative and free_alternative only where applicable.
Return valid JSON matching the existing BarbadosDayPlan structure exactly.`;
}

export interface GeneratePlanRequest {
  preferences: CruiseTouristPreferences;
}

export const generateBarbadosPlan = async (
  preferences: CruiseTouristPreferences
): Promise<BarbadosDayPlan> => {
  const res = await fetch('/.netlify/functions/generate-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ preferences }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `Plan generation failed (${res.status})`);
  }

  return res.json() as Promise<BarbadosDayPlan>;
};

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
