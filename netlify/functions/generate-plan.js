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
  const { shipDetails, groupType, vibes, budget, planDate } = preferences;
  const vibeStr = vibes.join(', ');
  const budgetLabel = budget === 'budget' ? 'Free/cheap - avoid expensive paid attractions'
    : budget === 'mid' ? 'Mid-range - mix of free and paid activities, moderate restaurant prices'
    : 'Premium - best local restaurants, private tours, top experiences';

  const startTime = shipDetails.startTime || new Date().toTimeString().slice(0, 5);
  const returnTime = shipDetails.returnTime;
  const availableHours = shipDetails.availableHours || 6;

  return `You are a knowledgeable local Barbados guide helping cruise tourists discover authentic, non-cruise-company experiences for a day ashore.

Generate a day itinerary for Barbados with these details:
- Group type: ${groupType}
- Available time: approximately ${availableHours} hours (starting ${startTime}, must return by ${returnTime})
- Interests/vibes: ${vibeStr}
- Budget: ${budgetLabel}
- Today's date: ${planDate || new Date().toISOString().split('T')[0]}

CRITICAL RULES:
1. All activities MUST be in Barbados only
2. EXCLUDE any cruise company tours, ship excursion operators, or activities marketed to cruise passengers
3. PRIORITISE independent local businesses, rum shops, beach bars, street food, historical sites, local markets
4. Starting AND ending location: Bridgetown Cruise Terminal, Bridgetown, Barbados
5. Account for travel time between locations (Barbados is small, max 45 min coast to coast by taxi)
6. Include 30 minutes buffer before returnTime for walk back to terminal
7. All costs in BBD (Barbados Dollars, 1 USD = 2 BBD approx)
8. Return ONLY valid JSON - no markdown, no code blocks, no apostrophes in values

Generate ${Math.floor(availableHours * 0.8)} to ${Math.ceil(availableHours * 1.0)} activities fitting the available time.

Return this EXACT JSON structure:
{
  "title": "Your Perfect Barbados Day",
  "special_notes": "Brief helpful notes for the tourist without apostrophes",
  "total_cost_bbd": 120,
  "total_duration_minutes": 360,
  "events": [
    {
      "type": "activity",
      "data": {
        "id": "act-1",
        "name": "Activity Name",
        "description": "Vivid description of what to do and expect without apostrophes",
        "address": "Full street address, Parish, Barbados",
        "lat": 13.1234,
        "lng": -59.6234,
        "startTime": "${startTime}",
        "endTime": "11:00",
        "duration_minutes": 90,
        "cost_bbd": 20,
        "category": "beach",
        "why_special": "What makes this a genuine local experience without apostrophes",
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
        "notes": "Take a ZR van or route taxi from the stop on ABC Street"
      }
    }
  ]
}

Category options: beach, water-sports, food, rum, history, culture, nature, music, nightlife, markets, crafts, transport, general
Transfer modes: walking, taxi, minibus, driving

Remember: NO apostrophes anywhere, pure JSON only with double quotes!`;
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
