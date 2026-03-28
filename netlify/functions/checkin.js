const { createClient } = require('@supabase/supabase-js');

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
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const supabaseUrl = process.env.VITE_SUPABASE_DATABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Server configuration error' }),
    };
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    const body = JSON.parse(event.body || '{}');
    const { qr_code_id, plan_id } = body;

    if (!qr_code_id) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'qr_code_id is required' }),
      };
    }

    // Look up the location by QR code
    const { data: location, error: locationError } = await supabase
      .from('locations')
      .select('*')
      .eq('qr_code_id', qr_code_id)
      .eq('is_active', true)
      .maybeSingle();

    if (locationError) throw locationError;

    if (!location) {
      return {
        statusCode: 404,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Location not found or inactive' }),
      };
    }

    // Extract user from Authorization header if present
    let userId = null;
    const authHeader = event.headers['authorization'] || event.headers['Authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    // Record the check-in if we have a user
    if (userId) {
      const { error: checkinError } = await supabase
        .from('checkins')
        .upsert(
          {
            user_id: userId,
            location_id: location.id,
            plan_id: plan_id || null,
          },
          { onConflict: 'user_id,location_id,plan_id' }
        );

      if (checkinError) {
        console.warn('Checkin upsert error (non-fatal):', checkinError.message);
      }
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: true,
        location_name: location.name,
        stamp_emoji: location.stamp_emoji,
        stamp_name: location.stamp_name,
        location_id: location.id,
      }),
    };
  } catch (error) {
    console.error('checkin error:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Check-in failed', details: error.message }),
    };
  }
};
