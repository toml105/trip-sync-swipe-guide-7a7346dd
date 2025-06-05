
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tripId, preferences, budget } = await req.json();
    console.log('Generating complete trip for:', tripId, 'with preferences:', preferences);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create comprehensive prompt from user preferences
    const promptParts = [];
    if (preferences.destinations) promptParts.push(`Destination preferences: ${preferences.destinations}`);
    if (preferences.accommodations) promptParts.push(`Accommodation preferences: ${preferences.accommodations}`);
    if (preferences.transportation) promptParts.push(`Transportation preferences: ${preferences.transportation}`);
    if (preferences.activities) promptParts.push(`Activity preferences: ${preferences.activities}`);
    if (preferences.dietary) promptParts.push(`Dietary requirements: ${preferences.dietary}`);
    if (preferences.accessibility) promptParts.push(`Accessibility needs: ${preferences.accessibility}`);

    const userPreferencesText = promptParts.join('\n');

    // Generate destinations
    const destinationsResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a travel expert that generates destination recommendations. Return exactly 8 diverse destinations as a JSON array. Each destination should have:
            - name: destination name
            - country: country name
            - description: 2-3 sentence description
            - estimated_cost_budget: cost in USD for budget travel
            - estimated_cost_mid_range: cost in USD for mid-range travel
            - estimated_cost_luxury: cost in USD for luxury travel
            - best_time_to_visit: best months to visit
            - highlights: array of 3-4 main attractions/activities
            - image_url: use placeholder image URL like "https://images.unsplash.com/1600x900/?travel,destination-name"
            
            Budget levels: $ = budget, $$ = mid-range, $$$ = luxury`
          },
          {
            role: 'user',
            content: `Generate 8 diverse travel destinations based on these preferences: ${userPreferencesText}. Focus on variety in geography, culture, and experiences. Budget preference: ${budget}`
          }
        ],
        temperature: 0.8,
      }),
    });

    const destinationsData = await destinationsResponse.json();
    const destinations = JSON.parse(destinationsData.choices[0].message.content);

    // Save destinations to database
    const { data: savedDestinations, error: destError } = await supabase
      .from('trip_destinations')
      .insert(
        destinations.map((dest: any) => ({
          trip_id: tripId,
          name: dest.name,
          country: dest.country,
          description: dest.description,
          image_url: dest.image_url,
          estimated_cost_budget: dest.estimated_cost_budget,
          estimated_cost_mid_range: dest.estimated_cost_mid_range,
          estimated_cost_luxury: dest.estimated_cost_luxury,
          best_time_to_visit: dest.best_time_to_visit,
          highlights: dest.highlights,
          ai_generated: true,
        }))
      )
      .select();

    if (destError) throw destError;

    // Generate accommodations
    const accommodationsResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a travel expert that generates accommodation recommendations. Return exactly 12 diverse accommodations as a JSON array. Each accommodation should have:
            - name: accommodation name
            - type: hotel, resort, hostel, apartment, guesthouse, etc.
            - location: city or area name
            - description: 2-3 sentence description
            - image_url: use placeholder image URL like "https://images.unsplash.com/1600x900/?hotel,accommodation-type"
            - price_per_night_budget: price in USD for budget option
            - price_per_night_mid_range: price in USD for mid-range option
            - price_per_night_luxury: price in USD for luxury option
            - amenities: array of 4-6 amenities
            - rating: rating from 3.5 to 5.0`
          },
          {
            role: 'user',
            content: `Generate 12 diverse accommodations based on these preferences: ${userPreferencesText}. Include various types and price ranges. Budget preference: ${budget}`
          }
        ],
        temperature: 0.8,
      }),
    });

    const accommodationsData = await accommodationsResponse.json();
    const accommodations = JSON.parse(accommodationsData.choices[0].message.content);

    // Save accommodations to database
    const { data: savedAccommodations, error: accomError } = await supabase
      .from('trip_accommodations')
      .insert(
        accommodations.map((accom: any) => ({
          trip_id: tripId,
          name: accom.name,
          type: accom.type,
          location: accom.location,
          description: accom.description,
          image_url: accom.image_url,
          price_per_night_budget: accom.price_per_night_budget,
          price_per_night_mid_range: accom.price_per_night_mid_range,
          price_per_night_luxury: accom.price_per_night_luxury,
          amenities: accom.amenities,
          rating: accom.rating,
          ai_generated: true,
        }))
      )
      .select();

    if (accomError) throw accomError;

    // Generate transportation options
    const transportationResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a travel expert that generates transportation recommendations. Return exactly 10 diverse transportation options as a JSON array. Each option should have:
            - type: flight, train, bus, car_rental, private_transfer, etc.
            - provider: airline, train company, bus company, rental agency
            - departure_location: departure city/airport
            - arrival_location: arrival city/airport
            - departure_time: example time like "08:30"
            - arrival_time: example time like "14:45"
            - price_budget: price in USD for budget option
            - price_mid_range: price in USD for mid-range option
            - price_luxury: price in USD for luxury option
            - duration_minutes: total travel time in minutes
            - description: 1-2 sentence description of the service`
          },
          {
            role: 'user',
            content: `Generate 10 diverse transportation options based on these preferences: ${userPreferencesText}. Include various transport types and price ranges. Budget preference: ${budget}`
          }
        ],
        temperature: 0.8,
      }),
    });

    const transportationData = await transportationResponse.json();
    const transportation = JSON.parse(transportationData.choices[0].message.content);

    // Save transportation to database
    const { data: savedTransportation, error: transError } = await supabase
      .from('trip_transportation')
      .insert(
        transportation.map((transport: any) => ({
          trip_id: tripId,
          type: transport.type,
          provider: transport.provider,
          departure_location: transport.departure_location,
          arrival_location: transport.arrival_location,
          departure_time: transport.departure_time,
          arrival_time: transport.arrival_time,
          price_budget: transport.price_budget,
          price_mid_range: transport.price_mid_range,
          price_luxury: transport.price_luxury,
          duration_minutes: transport.duration_minutes,
          description: transport.description,
          ai_generated: true,
        }))
      )
      .select();

    if (transError) throw transError;

    console.log('Successfully generated all trip components:', {
      destinations: savedDestinations.length,
      accommodations: savedAccommodations.length,
      transportation: savedTransportation.length
    });

    return new Response(JSON.stringify({ 
      destinations: savedDestinations,
      accommodations: savedAccommodations,
      transportation: savedTransportation
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-trip-components function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
