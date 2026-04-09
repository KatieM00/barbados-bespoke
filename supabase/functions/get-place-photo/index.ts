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
    const { photoReference, maxWidth = 400 } = await req.json();

    if (!photoReference) {
      return new Response(
        JSON.stringify({ error: 'photoReference is required' }),
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

    // The Places Photo API redirects to the actual image URL.
    // We follow the redirect and return the final URL so the frontend can use it directly.
    const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${encodeURIComponent(photoReference)}&key=${apiKey}`;
    const res = await fetch(url, { redirect: 'follow' });

    return new Response(
      JSON.stringify({ photoUrl: res.url }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Internal error', details: String(err) }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
});
