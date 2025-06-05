
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const amadeusApiKey = Deno.env.get('AMADEUS_API_KEY');
const amadeusApiSecret = Deno.env.get('AMADEUS_API_SECRET');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate AI destinations with proper error handling
async function generateAIDestinations(preferences: any, budget: string, count: number = 8) {
  try {
    console.log('Generating AI destinations with OpenAI...');
    
    const budgetContext = budget === '$' ? 'budget-friendly' : budget === '$$' ? 'mid-range' : 'luxury';
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `You are a travel expert. Generate exactly ${count} diverse travel destinations as a JSON array. Each destination must have these exact fields:
            - name: string (destination name)
            - country: string (country name)  
            - description: string (2-3 sentences)
            - estimated_cost_budget: number (USD, budget travel)
            - estimated_cost_mid_range: number (USD, mid-range travel)
            - estimated_cost_luxury: number (USD, luxury travel)
            - best_time_to_visit: string (best months/seasons)
            - highlights: array of strings (3-4 main attractions)
            - image_url: string (use format: "https://images.unsplash.com/1600x900/?travel,destination-name&fit=crop")

            Return ONLY a valid JSON array with exactly ${count} destinations. No other text.`
          },
          {
            role: 'user',
            content: `Generate ${count} diverse ${budgetContext} destinations based on these preferences:
            - Destinations: ${preferences.destinations || 'varied locations'}
            - Accommodations: ${preferences.accommodations || 'hotels'}
            - Transportation: ${preferences.transportation || 'flights'}
            - Activities: ${preferences.activities || 'sightseeing'}
            
            Include a mix of: beach destinations, cultural cities, mountain locations, tropical islands, historical sites, and adventure spots.`
          }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const aiData = await response.json();
    console.log('OpenAI response received');
    
    if (!aiData.choices || !aiData.choices[0] || !aiData.choices[0].message || !aiData.choices[0].message.content) {
      throw new Error('Invalid OpenAI response structure');
    }

    const content = aiData.choices[0].message.content.trim();
    console.log('Raw OpenAI content:', content);
    
    // Parse the JSON response
    let destinations;
    try {
      destinations = JSON.parse(content);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Content that failed to parse:', content);
      throw new Error('Failed to parse OpenAI response as JSON');
    }
    
    if (!Array.isArray(destinations)) {
      console.error('OpenAI did not return an array:', destinations);
      throw new Error('OpenAI response is not an array');
    }

    if (destinations.length === 0) {
      throw new Error('OpenAI returned empty destinations array');
    }

    console.log('Successfully parsed destinations:', destinations.length);
    return destinations;

  } catch (error) {
    console.error('Error generating AI destinations:', error);
    
    // Return comprehensive fallback destinations
    const fallbackDestinations = [
      {
        name: "Santorini",
        country: "Greece",
        description: "A stunning Greek island famous for its white-washed buildings, blue domes, and breathtaking sunsets over the Aegean Sea.",
        estimated_cost_budget: 600,
        estimated_cost_mid_range: 1000,
        estimated_cost_luxury: 1800,
        best_time_to_visit: "April to October",
        highlights: ["Oia Sunset", "Blue Dome Churches", "Red Beach", "Wine Tasting"],
        image_url: "https://images.unsplash.com/1600x900/?travel,santorini&fit=crop"
      },
      {
        name: "Tokyo",
        country: "Japan",
        description: "A vibrant metropolis blending traditional culture with cutting-edge technology, offering incredible food and unique experiences.",
        estimated_cost_budget: 800,
        estimated_cost_mid_range: 1300,
        estimated_cost_luxury: 2200,
        best_time_to_visit: "March to May, September to November",
        highlights: ["Shibuya Crossing", "Tokyo Tower", "Traditional Temples", "Amazing Food"],
        image_url: "https://images.unsplash.com/1600x900/?travel,tokyo&fit=crop"
      },
      {
        name: "Bali",
        country: "Indonesia",
        description: "A tropical paradise known for its beautiful beaches, ancient temples, lush rice terraces, and vibrant cultural heritage.",
        estimated_cost_budget: 400,
        estimated_cost_mid_range: 700,
        estimated_cost_luxury: 1200,
        best_time_to_visit: "April to October",
        highlights: ["Uluwatu Temple", "Rice Terraces", "Beach Clubs", "Traditional Markets"],
        image_url: "https://images.unsplash.com/1600x900/?travel,bali&fit=crop"
      },
      {
        name: "Paris",
        country: "France",
        description: "The City of Light offers romance, world-class museums, iconic landmarks, and exceptional cuisine and wine.",
        estimated_cost_budget: 700,
        estimated_cost_mid_range: 1200,
        estimated_cost_luxury: 2000,
        best_time_to_visit: "April to June, September to October",
        highlights: ["Eiffel Tower", "Louvre Museum", "Notre-Dame", "Champs-Élysées"],
        image_url: "https://images.unsplash.com/1600x900/?travel,paris&fit=crop"
      },
      {
        name: "New York City",
        country: "United States",
        description: "The city that never sleeps offers Broadway shows, world-class museums, diverse neighborhoods, and iconic skylines.",
        estimated_cost_budget: 900,
        estimated_cost_mid_range: 1500,
        estimated_cost_luxury: 2500,
        best_time_to_visit: "April to June, September to November",
        highlights: ["Times Square", "Central Park", "Statue of Liberty", "Broadway Shows"],
        image_url: "https://images.unsplash.com/1600x900/?travel,new-york&fit=crop"
      },
      {
        name: "Dubai",
        country: "United Arab Emirates",
        description: "A modern metropolis known for luxury shopping, ultramodern architecture, and a lively nightlife scene.",
        estimated_cost_budget: 800,
        estimated_cost_mid_range: 1400,
        estimated_cost_luxury: 2800,
        best_time_to_visit: "November to March",
        highlights: ["Burj Khalifa", "Dubai Mall", "Desert Safari", "Marina Walk"],
        image_url: "https://images.unsplash.com/1600x900/?travel,dubai&fit=crop"
      },
      {
        name: "Barcelona",
        country: "Spain",
        description: "A vibrant Mediterranean city famous for its unique architecture, beautiful beaches, and rich cultural heritage.",
        estimated_cost_budget: 500,
        estimated_cost_mid_range: 900,
        estimated_cost_luxury: 1600,
        best_time_to_visit: "May to September",
        highlights: ["Sagrada Familia", "Park Güell", "Las Ramblas", "Gothic Quarter"],
        image_url: "https://images.unsplash.com/1600x900/?travel,barcelona&fit=crop"
      },
      {
        name: "Thailand",
        country: "Thailand",
        description: "Known for tropical beaches, opulent royal palaces, ancient ruins, and ornate temples displaying figures of Buddha.",
        estimated_cost_budget: 350,
        estimated_cost_mid_range: 600,
        estimated_cost_luxury: 1100,
        best_time_to_visit: "November to March",
        highlights: ["Bangkok Temples", "Phi Phi Islands", "Floating Markets", "Thai Cuisine"],
        image_url: "https://images.unsplash.com/1600x900/?travel,thailand&fit=crop"
      }
    ];

    console.log('Using fallback destinations:', fallbackDestinations.length);
    return fallbackDestinations;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tripId, preferences, budget } = await req.json();
    console.log('Generating trip components for:', tripId, 'with preferences:', preferences);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate AI destinations (8 destinations for voting)
    console.log('Starting destination generation...');
    const aiDestinations = await generateAIDestinations(preferences, budget, 8);
    
    console.log('Generated destinations:', aiDestinations.length);

    // Transform destinations for database
    const destinations = aiDestinations.map((dest: any) => ({
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
    }));

    // Generate some basic accommodations and transportation (simplified for now)
    const accommodations = [
      {
        trip_id: tripId,
        name: 'Budget Hotel',
        type: 'hotel',
        location: 'City Center',
        description: 'Comfortable budget accommodation with basic amenities.',
        image_url: 'https://images.unsplash.com/1600x900/?hotel,budget&fit=crop',
        price_per_night_budget: 50,
        price_per_night_mid_range: 80,
        price_per_night_luxury: 120,
        amenities: ['WiFi', 'Breakfast', 'Air Conditioning'],
        rating: 4.0,
      },
      {
        trip_id: tripId,
        name: 'Luxury Resort',
        type: 'resort',
        location: 'Beachfront',
        description: 'Premium resort with world-class amenities and service.',
        image_url: 'https://images.unsplash.com/1600x900/?resort,luxury&fit=crop',
        price_per_night_budget: 200,
        price_per_night_mid_range: 350,
        price_per_night_luxury: 600,
        amenities: ['WiFi', 'Spa', 'Pool', 'Restaurant', 'Room Service'],
        rating: 4.8,
      }
    ];

    const transportation = [
      {
        trip_id: tripId,
        type: 'flight',
        provider: 'Airlines',
        departure_location: 'Home',
        arrival_location: 'Destination',
        departure_time: '08:00',
        arrival_time: '14:00',
        price_budget: 300,
        price_mid_range: 500,
        price_luxury: 800,
        duration_minutes: 360,
        description: 'Direct flight to your destination',
      }
    ];

    // Save all data to database
    console.log('Saving destinations to database...');
    const { data: savedDestinations, error: destError } = await supabase
      .from('trip_destinations')
      .insert(destinations)
      .select();

    if (destError) {
      console.error('Error saving destinations:', destError);
      throw destError;
    }

    console.log('Saving accommodations to database...');
    const { data: savedAccommodations, error: accomError } = await supabase
      .from('trip_accommodations')
      .insert(accommodations)
      .select();

    if (accomError) {
      console.error('Error saving accommodations:', accomError);
      throw accomError;
    }

    console.log('Saving transportation to database...');
    const { data: savedTransportation, error: transError } = await supabase
      .from('trip_transportation')
      .insert(transportation)
      .select();

    if (transError) {
      console.error('Error saving transportation:', transError);
      throw transError;
    }

    console.log('Successfully generated trip components:', {
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
