import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('', { status: 200, headers: CORS_HEADERS });
  }

  try {
    const { placeId } = await req.json();

    if (!placeId) {
      return new Response(
        JSON.stringify({ error: 'placeId is required' }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const apiKey = Deno.env.get('GOOGLE_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Google API key not configured' }),
        { status: 500, headers: CORS_HEADERS }
      );
    }

    const fields = [
      'place_id', 'name', 'formatted_address', 'rating',
      'user_ratings_total', 'photos', 'opening_hours',
      'website', 'geometry',
    ].join(',');

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=${fields}&key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== 'OK') {
      return new Response(
        JSON.stringify({ error: `Places API error: ${data.status}` }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    return new Response(
      JSON.stringify({ result: data.result }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Internal error', details: String(err) }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
});
