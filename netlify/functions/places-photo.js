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
    const { photoName, maxWidth = 400 } = JSON.parse(event.body || '{}');
    if (!photoName) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'photoName is required' }) };
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'API key not configured' }) };
    }

    // skipHttpRedirect=true returns a JSON response with photoUri instead of redirecting
    const url = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidth}&key=${apiKey}&skipHttpRedirect=true`;

    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
      console.error('Places photo error:', JSON.stringify(data));
      return { statusCode: res.status, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Places API error' }) };
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ photoUrl: data.photoUri ?? '' }),
    };
  } catch (err) {
    console.error('places-photo error:', err);
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Internal error', details: err.message }) };
  }
};
