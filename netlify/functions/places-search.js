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
    const { query } = JSON.parse(event.body || '{}');
    if (!query) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'query is required' }) };
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'API key not configured' }) };
    }

    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.photos,places.regularOpeningHours,places.websiteUri,places.location',
      },
      body: JSON.stringify({
        textQuery: query,
        locationBias: {
          circle: {
            center: { latitude: 13.1939, longitude: -59.5432 },
            radius: 50000.0,
          },
        },
        maxResultCount: 5,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Places search error:', JSON.stringify(data));
      return { statusCode: res.status, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Places API error', details: data }) };
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ places: data.places ?? [] }),
    };
  } catch (err) {
    console.error('places-search error:', err);
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Internal error', details: err.message }) };
  }
};
