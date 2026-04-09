const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { placeId } = JSON.parse(event.body || '{}');
    if (!placeId) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'placeId is required' }) };
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'API key not configured' }) };
    }

    const fieldMask = 'id,displayName,formattedAddress,rating,userRatingCount,photos,regularOpeningHours,websiteUri,location';

    const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
      method: 'GET',
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': fieldMask,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Places details error:', JSON.stringify(data));
      return { statusCode: res.status, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Places API error', details: data }) };
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ place: data }),
    };
  } catch (err) {
    console.error('places-details error:', err);
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Internal error', details: err.message }) };
  }
};
