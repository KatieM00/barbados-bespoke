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

function buildPrompt(preferences) {
  const {
    shipDetails, groupType, vibes, mustDos, budget, budgetGbp,
    meals, specificActivities, dietaryRequirements, accessibilityNeeds,
    transportPreferences, previouslySuggested,
  } = preferences;

  const startTime = shipDetails.startTime || new Date().toTimeString().slice(0, 5);
  const returnTime = shipDetails.returnTime;
  const availableHours = shipDetails.availableHours || 6;
  const groupSize = preferences.groupSize || 2;

  const vibeStr = Array.isArray(vibes) ? vibes.join(', ') : 'relaxing';
  const mustDoStr = Array.isArray(mustDos) && mustDos.length > 0 ? mustDos.join(', ') : 'none';
  const mealsFiltered = Array.isArray(meals) ? meals.filter(m => m !== 'skip') : [];
  const mealsStr = mealsFiltered.length > 0 ? mealsFiltered.join(', ') : 'none';
  const specificStr = specificActivities || 'none specified';
  const dietaryStr = dietaryRequirements || 'none';
  const accessibilityStr = accessibilityNeeds || 'none';
  const previousStr = previouslySuggested || 'none';

  const transportStr = Array.isArray(transportPreferences) && transportPreferences.length > 0
    ? transportPreferences.map((t, i) => `${i + 1}. ${t}`).join(', ')
    : '1. taxi';

  const budgetDisplay = budgetGbp !== undefined
    ? (budgetGbp >= 200 ? '£200+ per person' : `£${budgetGbp} per person`)
    : (budget === 'budget' ? 'budget-friendly — free or cheap activities, avoid expensive paid attractions'
      : budget === 'mid' ? 'mid-range — mix of free and paid activities, moderate prices'
      : 'premium — best local restaurants, private tours, top experiences');

  const vibeDefinitions = `- Relaxing: slow pace, beaches, spa, gentle walks, no rushing — never back-to-back high-energy stops
- Cultural: local history, chattel houses, rum distilleries, art, music heritage — authentic over touristy
- Active: watersports, hiking, cycling, high energy — keep the pace up
- Romantic: sunset spots, quiet beaches, scenic views — intimate and unhurried
- Party: beach bars, live music, lively atmosphere — only include fish fry if food is selected AND it is a Friday or Saturday evening
- Luxurious: premium experiences, west coast venues, yacht trips, high-end — no budget compromises
- Thrill Seeking: cliff jumping, jet skiing, zip lines — push the adrenaline`;

  return `You are a local Barbados experience expert helping cruise tourists discover authentic, non-touristy experiences. Create the perfect personalised day itinerary.

ABSOLUTE RULES — NEVER BREAK THESE:
1. Every activity MUST be a real, named, verifiable place in Barbados
2. NEVER repeat an activity within this plan — check all activity names before finalising. This includes near-duplicates (e.g. "Carlisle Bay" and "Carlisle Bay Beach" are the same place)
3. Start time and end time MUST be strictly respected: ${startTime} to ${returnTime}
4. Always build in a 45-minute buffer before ${returnTime}
5. FOOD AND DRINK RULE: Do NOT include any food, drink, restaurant, cafe, rum shop, beach bar, or snack stop UNLESS meals are selected. Currently selected meals: ${mealsStr}. If meals = "none", there must be ZERO food or drink venues in the plan — not even "just a quick stop"
6. Never suggest grocery stores, corner shops or supermarkets
7. Never stack the same type of activity back to back
8. EXCLUDE cruise company tours and ship excursion operators — prioritise independent local businesses
9. Fish fries (e.g. Oistins) are Friday and Saturday evenings ONLY — never suggest them at other times
10. Do not suggest nightlife or evening venues in the morning
11. Never suggest the same category of venue twice (e.g. two beaches, two rum tours)
12. PREVIOUSLY SUGGESTED: You have already suggested the following places in this session: ${previousStr}. Do NOT suggest any of these again. Find genuine alternatives.

PLAN PARAMETERS:
- Available time: ${availableHours} hours (${startTime} to ${returnTime} minus 45 min buffer)
- Group type: ${groupType}
- Group size: ${groupSize} people
- Budget: ${budgetDisplay}
- Selected vibes: ${vibeStr}
- Must-dos (MUST include if possible): ${mustDoStr}
- Specific activities requested (MUST include if possible): ${specificStr}
- Meals requested: ${mealsStr} (breakfast = early morning, lunch = midday, dinner = evening. Each meal = 90–120 mins)

VIBE DEFINITIONS:
${vibeDefinitions}

USER PROFILE:
- Dietary requirements: ${dietaryStr}
- Accessibility needs: ${accessibilityStr}

TRANSPORT PREFERENCES (use in priority order):
${transportStr}
- Walking: only suggest walking between stops that are 30 minutes or less on foot. For longer distances, use the next preferred transport option.
- Estimate REALISTIC Barbados travel times: west coast to west coast = 10–20 min, cross-island = ~45 min, Bridgetown traffic can be slow.
- NEVER default every leg to "taxi 30 mins". Use real distance knowledge to estimate each leg individually.

WHEN CHOOSING ACTIVITIES:
- Match vibes carefully — no party boats for family days, no watersports for relaxing trips
- Check activities are likely open at the suggested time (use your knowledge of Barbados opening hours)
- Balance the energy of the day — mix active and relaxed moments
- Prioritise authentic local experiences over tourist traps
- If a venue appears on every "top 10 Barbados" list, consider whether there is a better local alternative

CURRENCY RULES:
- cost_bbd: whole number (Barbados dollars). Return 0 if free or unknown — NEVER null, undefined, NaN, or a string.
- cost_gbp: number to 2 decimal places (GBP). 1 GBP ≈ 2.63 BBD. Return 0 if free. NEVER null or NaN.

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
        "emoji": "🏖️"
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

Category options: beach, water-sports, food, rum, history, culture, nature, music, nightlife, markets, crafts, transport, general
Transfer modes: walking, taxi, minibus, driving`;
}

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

    const model = genAI.getGenerativeModel(
      { model: 'gemini-2.5-flash-lite' },
      { apiVersion: 'v1beta' }
    );
    const prompt = buildPrompt(preferences);

    console.log('Calling Gemini for Barbados plan...');
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log('Raw AI response length:', text.length);

    const parsed = fixJsonString(text);
    const validated = validatePlan(parsed);

    const plan = {
      id: `plan-${Date.now()}`,
      date: preferences.planDate || new Date().toISOString().split('T')[0],
      preferences,
      ...validated,
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
