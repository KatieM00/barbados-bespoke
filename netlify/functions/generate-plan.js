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
  const { shipDetails, groupType, vibes, budget, meals, specificActivities, dietaryRequirements, accessibilityNeeds } = preferences;
  const startTime = shipDetails.startTime || new Date().toTimeString().slice(0, 5);
  const returnTime = shipDetails.returnTime;
  const availableHours = shipDetails.availableHours || 6;
  const groupSize = preferences.groupSize || 2;
  const vibeStr = vibes.join(', ');
  const mealsStr = meals && meals.length > 0 ? meals.join(', ') : 'none';
  const specificStr = specificActivities || 'none specified';
  const dietaryStr = dietaryRequirements || 'none';
  const accessibilityStr = accessibilityNeeds || 'none';

  const budgetLabel = budget === 'budget' ? 'budget-friendly — free or cheap activities, avoid expensive paid attractions'
    : budget === 'mid' ? 'mid-range — mix of free and paid activities, moderate prices'
    : 'premium — best local restaurants, private tours, top experiences';

  return `You are a local Barbados experience expert helping cruise tourists discover authentic, non-touristy experiences. Your goal is to create the perfect personalised day itinerary.

STRICT RULES — NEVER BREAK THESE:
- Every activity must be a real, named, verifiable place in Barbados
- Never repeat an activity within the same plan
- Start time and end time MUST be strictly respected: ${startTime} to ${returnTime}
- Always build in a 45-minute buffer before ${returnTime} to ensure the user returns to the ship on time
- Never suggest food or drink stops unless the user has specifically selected a meal (breakfast, lunch, dinner, drinks)
- Never suggest grocery stores, corner shops or supermarkets — shopping means local markets, boutiques, craft shops and souvenirs
- Never stack the same type of activity back to back — vary the pace and energy of the day
- There should always be a natural flow to the day — build in recovery time after high-energy activities
- EXCLUDE cruise company tours and ship excursion operators — prioritise independent local businesses

PLAN PARAMETERS:
- Available time: ${availableHours} hours (${startTime} to ${returnTime} minus 45 min buffer)
- Group type: ${groupType}
- Group size: ${groupSize} people
- Budget: ${budgetLabel}
- Selected vibes: ${vibeStr}
- Specific activities requested by user (MUST include if possible): ${specificStr}
- Meals requested: ${mealsStr} (place meals at appropriate times — breakfast early, lunch midday, dinner evening. Each meal = 90-120 mins)

USER PROFILE:
- Dietary requirements: ${dietaryStr} (filter food suggestions accordingly)
- Accessibility needs: ${accessibilityStr} (flag venues with stairs, uneven terrain, or limited access)

WHEN CHOOSING ACTIVITIES:
- Match vibes carefully — no party boats for family days, no watersports for relaxing shopping trips
- Consider group size for activity capacity — some activities have limits
- Check that activities are likely open at the time suggested (use your knowledge of typical Barbados opening hours)
- Consider travel time between locations — Barbados is small but Bridgetown traffic can be slow. Budget 15-30 mins between stops
- Balance the energy of the day — mix active and relaxed moments
- Prioritise what locals love, hidden gems, and authentic Barbadian experiences over tourist traps

Return ONLY valid JSON — no markdown, no code blocks. Use this EXACT structure:
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
        "notes": "Practical directions for getting there"
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
            cost_bbd: Number(d.cost_bbd) || 0,
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
            duration_minutes: Number(d.duration_minutes) || 20,
            mode: d.mode || 'taxi',
            cost_bbd: Number(d.cost_bbd) || 0,
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

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = buildPrompt(preferences);

    console.log('Calling Gemini for Barbados plan...');
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log('Raw AI response length:', text.length);

    const parsed = fixJsonString(text);
    const validated = validatePlan(parsed);

    // Inject preferences and a generated id/date
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
