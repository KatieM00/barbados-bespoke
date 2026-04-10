const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

function fixJsonString(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch {
    let fixed = jsonString.replace(/```json\s*|\s*```/g, '');
    fixed = fixed.replace(/[""]/g, '"');
    fixed = fixed.replace(/['']/g, "'");
    try {
      return JSON.parse(fixed);
    } catch {
      throw new Error('Could not parse AI response as valid JSON');
    }
  }
}

// ─── Vibe blend values ────────────────────────────────────────────────────────

const VIBE_BLENDS = {
  relaxing:       { active: 10, culture: 25, scenic: 65, nightlife: 0 },
  cultural:       { active: 10, culture: 70, scenic: 20, nightlife: 0 },
  active:         { active: 55, culture: 10, scenic: 35, nightlife: 0 },
  romantic:       { active: 15, culture: 25, scenic: 60, nightlife: 0 },
  party:          { active: 20, culture:  5, scenic: 25, nightlife: 50 },
  luxurious:      { active: 15, culture: 25, scenic: 60, nightlife: 0 },
  'thrill-seeking': { active: 75, culture: 5, scenic: 20, nightlife: 0 },
};

function calcBlend(vibes) {
  const selected = Array.isArray(vibes) && vibes.length > 0 ? vibes : ['relaxing'];
  const valid = selected.filter(v => VIBE_BLENDS[v]);
  if (valid.length === 0) return VIBE_BLENDS['relaxing'];
  const sum = { active: 0, culture: 0, scenic: 0, nightlife: 0 };
  for (const v of valid) {
    sum.active   += VIBE_BLENDS[v].active;
    sum.culture  += VIBE_BLENDS[v].culture;
    sum.scenic   += VIBE_BLENDS[v].scenic;
    sum.nightlife += VIBE_BLENDS[v].nightlife;
  }
  return {
    active:    Math.round(sum.active   / valid.length),
    culture:   Math.round(sum.culture  / valid.length),
    scenic:    Math.round(sum.scenic   / valid.length),
    nightlife: Math.round(sum.nightlife / valid.length),
  };
}

// ─── Google Places pre-fetch ──────────────────────────────────────────────────

const PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACES_BASE = 'https://maps.googleapis.com/maps/api/place/textsearch/json';

async function fetchPlacesForTerm(searchTerm) {
  const url = `${PLACES_BASE}?query=${encodeURIComponent(searchTerm)}&key=${PLACES_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results || []).slice(0, 10);
}

async function buildVerifiedPlacesPool(preferences) {
  const { vibes = [], mustDos = [], meals = [] } = preferences;

  const vibeTermMap = {
    relaxing:         ['scenic viewpoint Barbados', 'botanical garden Barbados', 'coastal walk Barbados'],
    cultural:         ['museum Barbados', 'historic site Bridgetown', 'plantation house Barbados', 'art gallery Barbados'],
    active:           ['hiking Barbados', 'cycling Barbados', 'swimming beach Barbados'],
    romantic:         ['sunset spot Barbados', 'scenic beach Barbados', 'fine dining Barbados'],
    party:            ['beach bar Barbados', 'local rum shop Barbados', 'live music Barbados', 'market Barbados'],
    luxurious:        ['luxury beach club Barbados', 'fine dining restaurant Barbados', 'spa Barbados'],
    'thrill-seeking': ['surfing Barbados', 'jet ski Barbados', 'cliff jumping Barbados', 'zipline Barbados', 'kitesurfing Barbados', 'snorkelling Barbados'],
  };

  const mustDoTermMap = {
    beach:          ['beach Barbados'],
    music:          ['live music venue Barbados'],
    shopping:       ['local market Barbados', 'craft shop Barbados'],
    nature:         ['nature reserve Barbados', 'wildlife Barbados'],
    'water-sports': ['watersports Barbados', 'snorkelling Barbados'],
    party:          ['beach party Barbados', 'local bar Barbados'],
  };

  const mealTermMap = {
    breakfast: ['breakfast cafe Bridgetown Barbados'],
    lunch:     ['local lunch restaurant Barbados'],
    dinner:    ['dinner restaurant Barbados'],
    drinks:    ['cocktail bar Barbados', 'rum bar Barbados'],
  };

  const termSet = new Set();
  for (const vibe of vibes) {
    (vibeTermMap[vibe] || []).forEach(t => termSet.add(t));
  }
  for (const mustDo of mustDos) {
    (mustDoTermMap[mustDo] || []).forEach(t => termSet.add(t));
  }
  const mealsFiltered = meals.filter(m => m !== 'skip');
  for (const meal of mealsFiltered) {
    (mealTermMap[meal] || []).forEach(t => termSet.add(t));
  }

  const terms = Array.from(termSet);
  const allResults = await Promise.all(terms.map(fetchPlacesForTerm));

  // Deduplicate by place_id
  const seen = new Set();
  const pool = [];
  for (const results of allResults) {
    for (const place of results) {
      if (place.place_id && !seen.has(place.place_id)) {
        seen.add(place.place_id);
        pool.push(place);
      }
    }
  }
  return pool;
}

function formatPlacesPool(pool) {
  if (!pool || pool.length === 0) return 'No verified places available — use your knowledge of Barbados.';
  return pool.map(p => {
    const loc = p.geometry && p.geometry.location
      ? `${p.geometry.location.lat}, ${p.geometry.location.lng}`
      : 'coordinates unknown';
    return `- ${p.name} | ${p.formatted_address || 'Barbados'} | [${loc}]`;
  }).join('\n');
}

// ─── Seed location fallback ───────────────────────────────────────────────────

const SEED_LOCATIONS = [
  { name: 'Bathsheba Beach', formatted_address: 'Bathsheba, St. Joseph, Barbados', geometry: { location: { lat: 13.1869, lng: -59.5296 } }, place_id: 'seed-1' },
  { name: "Hunte's Gardens", formatted_address: "Hunte's Gardens, St. Joseph, Barbados", geometry: { location: { lat: 13.1711, lng: -59.5621 } }, place_id: 'seed-2' },
  { name: 'Pelican Craft Centre', formatted_address: 'Pelican Craft Centre, Bridgetown, Barbados', geometry: { location: { lat: 13.0971, lng: -59.6207 } }, place_id: 'seed-3' },
  { name: 'St. Nicholas Abbey', formatted_address: 'Cherry Tree Hill, St. Peter, Barbados', geometry: { location: { lat: 13.2469, lng: -59.5639 } }, place_id: 'seed-4' },
  { name: 'Accra Beach', formatted_address: 'Rockley, Christ Church, Barbados', geometry: { location: { lat: 13.0644, lng: -59.5814 } }, place_id: 'seed-5' },
  { name: 'Mount Gay Rum Distillery', formatted_address: 'Spring Garden Highway, St. Michael, Barbados', geometry: { location: { lat: 13.1058, lng: -59.6264 } }, place_id: 'seed-6' },
  { name: 'Crane Beach', formatted_address: 'Crane, St. Philip, Barbados', geometry: { location: { lat: 13.0955, lng: -59.4472 } }, place_id: 'seed-7' },
  { name: 'Bridgetown Historic District', formatted_address: 'Bridgetown, St. Michael, Barbados', geometry: { location: { lat: 13.1000, lng: -59.6167 } }, place_id: 'seed-8' },
];

// ─── Prompt builder ───────────────────────────────────────────────────────────

function buildPrompt(preferences, verifiedPlacesPool, blended) {
  const {
    shipDetails, groupType, budgetGbp,
    meals, specificActivities, dietaryRequirements, accessibilityNeeds,
    transportPreferences, previouslySuggested,
  } = preferences;

  const startTime = shipDetails.startTime || new Date().toTimeString().slice(0, 5);
  const returnTime = shipDetails.returnTime;
  const availableHours = shipDetails.availableHours || 6;
  const groupSize = preferences.groupSize || 2;

  const isFree = budgetGbp === 0;
  const budgetDisplay = budgetGbp >= 200 ? '£200+ per person' : `£${budgetGbp} per person`;

  const mealsFiltered = Array.isArray(meals) ? meals.filter(m => m !== 'skip') : [];
  const mealsStr = mealsFiltered.length > 0
    ? mealsFiltered.join(', ')
    : 'none — do not include any food or drink stops';

  const previousPlans = previouslySuggested || 'none';
  const specificStr = specificActivities || 'none specified';
  const dietaryStr = dietaryRequirements || 'none';
  const accessibilityStr = accessibilityNeeds || 'none';

  // Transport mapping
  const modeMap = { walk: 'walking', 'public-transport': 'minibus', taxi: 'taxi' };
  const allowedModes = Array.isArray(transportPreferences) && transportPreferences.length > 0
    ? transportPreferences.map(t => modeMap[t] || t)
    : ['taxi'];
  const allowedTransferModes = allowedModes.join(', ');

  const transportRuleLines = [];
  if (!allowedModes.includes('taxi')) transportRuleLines.push('Do not suggest taxi — the user has not selected it.');
  if (!allowedModes.includes('walking')) transportRuleLines.push('Do not suggest walking between stops — the user has not selected it.');
  if (allowedModes.includes('walking')) transportRuleLines.push('Walking is allowed but never exceed 30 minutes between any two stops.');
  if (allowedModes.includes('minibus')) transportRuleLines.push('Public transport means bus or ZR route van only.');
  const transportRules = transportRuleLines.join('\n');

  const weather = 'Sunny, 28°C'; // placeholder — wire in real weather when available

  return `You are a local Barbados experience expert helping cruise tourists discover
authentic, non-touristy experiences. Your goal is to create the perfect
personalised day itinerary using ONLY places from the verified list provided.

═══════════════════════════════════════
VERIFIED PLACES POOL
═══════════════════════════════════════
${verifiedPlacesPool}

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

${isFree ? `
ZERO BUDGET RULES — STRICTLY ENFORCED:
- Every activity must be completely free (cost_bbd: 0)
- All activities must be within walking distance of Bridgetown Cruise Terminal
  and within walking distance of one another
- No paid transport between stops
- If any selected meal or must-do activity typically requires payment, you
  must still include it BUT also generate a free alternative for it:
  - Set has_free_alternative: true on the paid activity
  - Populate the free_alternative object with a genuinely free nearby option
  - The free alternative must also be within walking distance
` : `Stay within the budget. Do not suggest activities that would exceed it.`}

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
- Group type: ${groupType}
- Specific requests (include if possible): ${specificStr}
- Dietary requirements: ${dietaryStr}
- Accessibility needs: ${accessibilityStr}
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

Return ONLY valid JSON — no markdown, no code blocks, no explanation. Use this EXACT structure:
{
  "title": "A short evocative title for the day",
  "special_notes": "One practical local tip for the day",
  "total_cost_bbd": 120,
  "total_duration_minutes": 360,
  "events": [
    {
      "type": "activity",
      "data": {
        "id": "act-1",
        "name": "Activity Name",
        "description": "Warm, personal description in local tone",
        "address": "Full street address, Parish, Barbados",
        "lat": 13.1234,
        "lng": -59.6234,
        "startTime": "${startTime}",
        "endTime": "11:00",
        "duration_minutes": 90,
        "cost_bbd": 20,
        "cost_gbp": 7.60,
        "category": "beach",
        "why_special": "What makes this a genuine local experience",
        "google_maps_search_query": "Place Name Barbados",
        "emoji": "🏖️",
        "is_geographic": true
      }
    },
    {
      "type": "transfer",
      "data": {
        "id": "trn-1",
        "from": "Previous location",
        "to": "Next location",
        "startTime": "11:00",
        "endTime": "11:20",
        "duration_minutes": 20,
        "mode": "taxi",
        "cost_bbd": 15,
        "notes": "Practical directions — estimated travel time based on real Barbados geography"
      }
    }
  ]
}

Category options: beach, water-sports, food, rum, history, culture, nature, music, nightlife, markets, crafts, transport, general`;
}

// ─── Post-Gemini validation layer ─────────────────────────────────────────────

const PLACES_DETAILS_BASE = 'https://maps.googleapis.com/maps/api/place/textsearch/json';

async function validateActivityWithPlaces(activity) {
  const query = `${activity.name} Barbados`;
  const url = `${PLACES_DETAILS_BASE}?query=${encodeURIComponent(query)}&location=13.1939,-59.5432&radius=50000&key=${PLACES_API_KEY}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const results = data.results || [];
    if (results.length === 0) return null;
    const match = results[0];
    return {
      lat: match.geometry && match.geometry.location ? match.geometry.location.lat : activity.lat,
      lng: match.geometry && match.geometry.location ? match.geometry.location.lng : activity.lng,
      address: match.formatted_address || activity.address,
      website: match.website || null,
    };
  } catch {
    return null;
  }
}

async function runValidationLayer(events, seedPool) {
  let failCount = 0;
  const validated = [];

  for (const event of events) {
    if (event.type !== 'activity' || event.data.is_geographic === true) {
      validated.push(event);
      continue;
    }

    const activity = event.data;
    const placesMatch = await validateActivityWithPlaces(activity);

    if (placesMatch) {
      const updatedActivity = {
        ...activity,
        lat: placesMatch.lat,
        lng: placesMatch.lng,
        address: placesMatch.address,
      };
      if (placesMatch.website) {
        updatedActivity.verified_website = placesMatch.website;
      }
      validated.push({ type: 'activity', data: updatedActivity });
    } else {
      console.warn('PLACES_VALIDATION_FAILED:', activity.name);
      failCount++;

      // Swap with best seed match for this category
      const seedMatch = seedPool.find(s => !validated.some(v => v.type === 'activity' && v.data.name === s.name));
      if (seedMatch) {
        const replacement = {
          id: activity.id,
          name: seedMatch.name,
          description: `A verified local spot in Barbados — ${seedMatch.name}.`,
          address: seedMatch.formatted_address || 'Barbados',
          lat: seedMatch.geometry && seedMatch.geometry.location ? seedMatch.geometry.location.lat : undefined,
          lng: seedMatch.geometry && seedMatch.geometry.location ? seedMatch.geometry.location.lng : undefined,
          startTime: activity.startTime,
          endTime: activity.endTime,
          duration_minutes: activity.duration_minutes,
          cost_bbd: activity.cost_bbd,
          cost_gbp: activity.cost_gbp,
          category: activity.category,
          why_special: 'A trusted local recommendation.',
          google_maps_search_query: `${seedMatch.name} Barbados`,
          emoji: activity.emoji || '📍',
          is_geographic: false,
        };
        validated.push({ type: 'activity', data: replacement });
      } else {
        validated.push(event);
      }
    }
  }

  if (failCount > 2) {
    console.error('PLACES_VALIDATION_THRESHOLD_EXCEEDED: More than 2 activities failed validation. Triggering regeneration.');
    throw new Error('VALIDATION_THRESHOLD_EXCEEDED');
  }

  return validated;
}

// ─── Validate plan structure ──────────────────────────────────────────────────

function validatePlan(raw) {
  if (!raw || !Array.isArray(raw.events)) {
    throw new Error('Invalid plan structure: missing events array');
  }
  return {
    title: raw.title || 'Your Barbados Day',
    special_notes: raw.special_notes || '',
    total_cost_bbd: Number(raw.total_cost_bbd) || 0,
    total_duration_minutes: Number(raw.total_duration_minutes) || 0,
    events: raw.events.map((event, i) => {
      if (event.type === 'activity') {
        const d = event.data || {};
        const costBbd = isNaN(Number(d.cost_bbd)) ? 0 : Number(d.cost_bbd);
        const costGbp = isNaN(Number(d.cost_gbp)) ? Math.round(costBbd * 0.38 * 100) / 100 : Number(d.cost_gbp);
        return {
          type: 'activity',
          data: {
            id: d.id || `act-${i}`,
            name: d.name || 'Local Activity',
            description: d.description || '',
            address: d.address || 'Barbados',
            lat: d.lat ? Number(d.lat) : undefined,
            lng: d.lng ? Number(d.lng) : undefined,
            startTime: d.startTime || '09:00',
            endTime: d.endTime || '10:00',
            duration_minutes: Number(d.duration_minutes) || 60,
            cost_bbd: costBbd,
            cost_gbp: costGbp,
            category: d.category || 'general',
            why_special: d.why_special || '',
            google_maps_search_query: d.google_maps_search_query || d.name || '',
            emoji: d.emoji || '📍',
            is_geographic: d.is_geographic === true,
            ...(d.verified_website ? { verified_website: d.verified_website } : {}),
            ...(d.has_free_alternative ? { has_free_alternative: true, free_alternative: d.free_alternative } : {}),
          },
        };
      } else {
        const d = event.data || {};
        return {
          type: 'transfer',
          data: {
            id: d.id || `trn-${i}`,
            from: d.from || '',
            to: d.to || '',
            startTime: d.startTime || '10:00',
            endTime: d.endTime || '10:20',
            duration_minutes: Number(d.duration_minutes) || 15,
            mode: d.mode || 'taxi',
            cost_bbd: isNaN(Number(d.cost_bbd)) ? 0 : Number(d.cost_bbd),
            notes: d.notes || '',
          },
        };
      }
    }),
  };
}

// ─── Handler ──────────────────────────────────────────────────────────────────

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { preferences } = body;

    if (!preferences) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'preferences are required' }),
      };
    }

    // ── PART A: Google Places pre-fetch ──────────────────────────────────────
    let placesPool = [];
    let seedPool = SEED_LOCATIONS;

    try {
      placesPool = await buildVerifiedPlacesPool(preferences);
    } catch (err) {
      console.warn('PLACES_PREFETCH_FAILED: Google Places pre-fetch failed. Falling back to seed locations. Plan quality may be reduced.');
      placesPool = SEED_LOCATIONS;
    }

    if (placesPool.length === 0) {
      placesPool = SEED_LOCATIONS;
    }

    const verifiedPlacesPool = formatPlacesPool(placesPool);
    const blended = calcBlend(preferences.vibes);

    // ── PART B: Gemini call ──────────────────────────────────────────────────
    const model = genAI.getGenerativeModel(
      { model: 'gemini-2.5-flash-lite' },
      { apiVersion: 'v1beta' }
    );

    const generateAndValidate = async () => {
      const prompt = buildPrompt(preferences, verifiedPlacesPool, blended);

      console.log('Calling Gemini for Barbados plan...');
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      console.log('Raw AI response length:', text.length);

      const parsed = fixJsonString(text);
      const validated = validatePlan(parsed);

      // ── PART C: Validation layer ───────────────────────────────────────────
      const validatedEvents = await runValidationLayer(validated.events, seedPool);
      validated.events = validatedEvents;

      return validated;
    };

    let validated;
    try {
      validated = await generateAndValidate();
    } catch (err) {
      if (err.message === 'VALIDATION_THRESHOLD_EXCEEDED') {
        // One full regeneration attempt
        console.log('Retrying plan generation after validation threshold exceeded...');
        validated = await generateAndValidate();
      } else {
        throw err;
      }
    }

    const plan = {
      id: `plan-${Date.now()}`,
      date: preferences.planDate || new Date().toISOString().split('T')[0],
      preferences,
      title: validated.title,
      special_notes: validated.special_notes,
      totalCost_bbd: validated.total_cost_bbd,
      totalDuration_minutes: validated.total_duration_minutes,
      events: validated.events,
    };

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(plan),
    };
  } catch (error) {
    console.error('generate-plan error:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Failed to generate plan', details: error.message }),
    };
  }
};
