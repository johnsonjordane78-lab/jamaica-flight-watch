const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const IATA_CODES = ['MBJ', 'OCJ', 'KIN'];

const IATA_TO_ICAO: Record<string, string> = {
  MBJ: 'MKJS',
  OCJ: 'MKJF',
  KIN: 'MKJP',
};

function mapStatus(status: string | null): string {
  if (!status) return 'on-time';
  const s = status.toLowerCase();
  if (s === 'scheduled' || s === 'active') return 'on-time';
  if (s === 'landed') return 'arrived';
  if (s === 'cancelled') return 'cancelled';
  if (s === 'delayed') return 'delayed';
  if (s === 'departed' || s === 'en-route') return 'departed';
  if (s === 'boarding') return 'boarding';
  return 'on-time';
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return '00:00';
  try {
    const d = new Date(dateStr);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch {
    return '00:00';
  }
}

interface NormalizedFlight {
  id: string;
  flightNumber: string;
  airline: string;
  planeName: string;
  modelNumber: string;
  origin: string;
  destination: string;
  airport: string;
  direction: string;
  status: string;
  scheduledTime: string;
  gate?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const apiKey = Deno.env.get('AVIATIONSTACK_API_KEY');

    if (!supabaseUrl || !supabaseServiceKey || !apiKey) {
      return new Response(JSON.stringify({ error: 'Missing environment variables' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Check Cache
    // We consider cache valid if it was updated in the last 5 minutes (300 seconds)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { data: cachedFlights, error: cacheError } = await supabase
      .from('flights_cache')
      .select('*')
      .gt('last_updated', fiveMinutesAgo);

    if (cacheError) {
      console.error('Error fetching from cache:', cacheError);
    }

    // 2. If we have recent data (at least 1 entry implies a recent fetch for *someone*),
    // return it immediately to save API calls.
    // Note: If you want to ensure we have data for ALL airports, we might want to be more specific,
    // but globally if this table was updated < 5 mins ago, it's fresh.
    if (cachedFlights && cachedFlights.length > 0) {
      console.log('Returning cached flight data');
      
      // Map snaked_case back to camelCase for the frontend
      const flightsToReturn = cachedFlights.map(f => ({
        id: f.id,
        flightNumber: f.flight_number,
        airline: f.airline,
        planeName: f.plane_name,
        modelNumber: f.model_number,
        origin: f.origin,
        destination: f.destination,
        airport: f.airport,
        direction: f.direction,
        status: f.status,
        scheduledTime: f.scheduled_time,
        gate: f.gate
      }));

      return new Response(JSON.stringify({ flights: flightsToReturn, timestamp: cachedFlights[0].last_updated }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300',
        },
      });
    }

    console.log('Cache missed or data stale. Fetching fresh from Aviationstack...');

    const allFlights: NormalizedFlight[] = [];
    const seen = new Set<string>();

    for (const iata of IATA_CODES) {
      const icao = IATA_TO_ICAO[iata];

      // Fetch arrivals
      try {
        const arrUrl = `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&arr_iata=${iata}&limit=10`;
        const arrRes = await fetch(arrUrl);
        const arrData = await arrRes.json();

        if (arrData.data) {
          for (const f of arrData.data) {
            const id = f.flight?.iata || `${f.flight?.icao}-${f.flight_date}`;
            if (seen.has(id)) continue;
            seen.add(id);

            allFlights.push({
              id,
              flightNumber: f.flight?.iata || f.flight?.icao || 'N/A',
              airline: f.airline?.name || 'Unknown Airline',
              planeName: f.aircraft?.registration || f.flight?.iata || 'N/A',
              modelNumber: f.aircraft?.iata ? `Aircraft ${f.aircraft.iata}` : 'Unknown',
              origin: `${f.departure?.airport || 'Unknown'} (${f.departure?.iata || '?'})`,
              destination: `${f.arrival?.airport || 'Unknown'} (${f.arrival?.iata || '?'})`,
              airport: icao,
              direction: 'inbound',
              status: mapStatus(f.flight_status),
              scheduledTime: formatTime(f.arrival?.scheduled || f.departure?.scheduled),
              gate: f.arrival?.gate || f.departure?.gate || undefined,
            });
          }
        }
      } catch (e) {
        console.error(`Error fetching arrivals for ${iata}:`, e);
      }

      // Fetch departures
      try {
        const depUrl = `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&dep_iata=${iata}&limit=10`;
        const depRes = await fetch(depUrl);
        const depData = await depRes.json();

        if (depData.data) {
          for (const f of depData.data) {
            const id = f.flight?.iata || `${f.flight?.icao}-${f.flight_date}`;
            if (seen.has(id)) continue;
            seen.add(id);

            allFlights.push({
              id,
              flightNumber: f.flight?.iata || f.flight?.icao || 'N/A',
              airline: f.airline?.name || 'Unknown Airline',
              planeName: f.aircraft?.registration || f.flight?.iata || 'N/A',
              modelNumber: f.aircraft?.iata ? `Aircraft ${f.aircraft.iata}` : 'Unknown',
              origin: `${f.departure?.airport || 'Unknown'} (${f.departure?.iata || '?'})`,
              destination: `${f.arrival?.airport || 'Unknown'} (${f.arrival?.iata || '?'})`,
              airport: icao,
              direction: 'outbound',
              status: mapStatus(f.flight_status),
              scheduledTime: formatTime(f.departure?.scheduled),
              gate: f.departure?.gate || undefined,
            });
          }
        }
      } catch (e) {
        console.error(`Error fetching departures for ${iata}:`, e);
      }
    }

    // 4. Upsert fresh data into the cache
    if (allFlights.length > 0) {
      const flightsToInsert = allFlights.map(f => ({
        id: f.id,
        flight_number: f.flightNumber,
        airline: f.airline,
        plane_name: f.planeName,
        model_number: f.modelNumber,
        origin: f.origin,
        destination: f.destination,
        airport: f.airport,
        direction: f.direction,
        status: f.status,
        scheduled_time: f.scheduledTime,
        gate: f.gate,
        last_updated: new Date().toISOString()
      }));

      const { error: upsertError } = await supabase
        .from('flights_cache')
        .upsert(flightsToInsert, { onConflict: 'id' });

      if (upsertError) {
        console.error('Error upserting to cache:', upsertError);
      }
      
      // Fire-and-forget cleanup of old flights (> 24h)
      supabase.rpc('delete_old_flights', { cache_duration_hours: 24 }).then(({ error }) => {
        if (error) console.error('Error deleting old flights:', error);
      });
    }

    return new Response(JSON.stringify({ flights: allFlights, timestamp: new Date().toISOString() }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch flights' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
