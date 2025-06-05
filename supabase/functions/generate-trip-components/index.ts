
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

// Get Amadeus access token
async function getAmadeusToken() {
  const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=client_credentials&client_id=${amadeusApiKey}&client_secret=${amadeusApiSecret}`,
  });
  
  const data = await response.json();
  return data.access_token;
}

// Get destination suggestions from Amadeus
async function getDestinations(token: string, preferences: any) {
  const searchTerms = preferences.destinations || 'popular destinations';
  
  try {
    // Get city and airport data from Amadeus
    const response = await fetch(`https://test.api.amadeus.com/v1/reference-data/locations?subType=CITY,AIRPORT&keyword=${encodeURIComponent(searchTerms)}&page[limit]=8`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      // Fallback to popular destinations
      const fallbackResponse = await fetch(`https://test.api.amadeus.com/v1/reference-data/locations?subType=CITY&keyword=paris,london,tokyo,new+york,barcelona,rome,amsterdam,bangkok&page[limit]=8`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const fallbackData = await fallbackResponse.json();
      return fallbackData.data || [];
    }
    
    return data.data;
  } catch (error) {
    console.error('Error fetching destinations from Amadeus:', error);
    return [];
  }
}

// Get hotel data from Amadeus
async function getHotels(token: string, preferences: any) {
  try {
    // Search for hotels in popular cities
    const cities = ['PAR', 'LON', 'NYC', 'BCN', 'ROM', 'AMS', 'BKK', 'DXB']; // IATA codes
    const hotels = [];
    
    for (const cityCode of cities.slice(0, 3)) { // Limit to 3 cities to avoid rate limits
      try {
        const response = await fetch(`https://test.api.amadeus.com/v3/shopping/hotel-offers?cityCode=${cityCode}&adults=2&checkInDate=2024-07-01&checkOutDate=2024-07-03&roomQuantity=1&currency=USD&lang=EN&max=4`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        const data = await response.json();
        if (data.data) {
          hotels.push(...data.data);
        }
      } catch (cityError) {
        console.error(`Error fetching hotels for ${cityCode}:`, cityError);
      }
    }
    
    return hotels;
  } catch (error) {
    console.error('Error fetching hotels from Amadeus:', error);
    return [];
  }
}

// Get flight data from Amadeus
async function getFlights(token: string, preferences: any) {
  try {
    // Sample flight search - you can customize based on preferences
    const origins = ['NYC', 'LON', 'PAR', 'LAX'];
    const destinations = ['BCN', 'ROM', 'AMS', 'BKK', 'DXB', 'SIN'];
    const flights = [];
    
    for (let i = 0; i < Math.min(origins.length, 2); i++) {
      for (let j = 0; j < Math.min(destinations.length, 5); j++) {
        try {
          const response = await fetch(`https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origins[i]}&destinationLocationCode=${destinations[j]}&departureDate=2024-07-01&adults=1&nonStop=false&max=2`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          const data = await response.json();
          if (data.data) {
            flights.push(...data.data);
          }
        } catch (flightError) {
          console.error(`Error fetching flights ${origins[i]} to ${destinations[j]}:`, flightError);
        }
      }
    }
    
    return flights;
  } catch (error) {
    console.error('Error fetching flights from Amadeus:', error);
    return [];
  }
}

// Generate AI destinations with proper error handling
async function generateAIDestinations(preferences: any, count: number) {
  try {
    console.log('Generating AI destinations with OpenAI...');
    
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
            content: `Generate exactly ${count} diverse travel destinations as a JSON array. Each destination must have: name (string), country (string), description (string), estimated_cost_budget (number), estimated_cost_mid_range (number), estimated_cost_luxury (number), best_time_to_visit (string), highlights (array of strings), image_url (string - use unsplash URLs). Return ONLY the JSON array, no other text.`
          },
          {
            role: 'user',
            content: `Generate destinations based on: ${JSON.stringify(preferences)}`
          }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const aiDestData = await response.json();
    console.log('OpenAI response:', aiDestData);
    
    if (!aiDestData.choices || !aiDestData.choices[0] || !aiDestData.choices[0].message) {
      throw new Error('Invalid OpenAI response structure');
    }

    const content = aiDestData.choices[0].message.content;
    if (!content) {
      throw new Error('Empty content from OpenAI');
    }

    const aiDestinations = JSON.parse(content);
    console.log('Parsed AI destinations:', aiDestinations);
    
    if (!Array.isArray(aiDestinations)) {
      throw new Error('OpenAI did not return an array');
    }

    return aiDestinations;
  } catch (error) {
    console.error('Error generating AI destinations:', error);
    // Return fallback destinations
    return [
      {
        name: "Paris",
        country: "France",
        description: "The City of Light offers romance, culture, and world-class cuisine.",
        estimated_cost_budget: 800,
        estimated_cost_mid_range: 1200,
        estimated_cost_luxury: 2000,
        best_time_to_visit: "April to June, September to October",
        highlights: ["Eiffel Tower", "Louvre Museum", "Notre-Dame", "Champs-Élysées"],
        image_url: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f"
      },
      {
        name: "Tokyo",
        country: "Japan",
        description: "A vibrant metropolis blending traditional culture with cutting-edge technology.",
        estimated_cost_budget: 1000,
        estimated_cost_mid_range: 1500,
        estimated_cost_luxury: 2500,
        best_time_to_visit: "March to May, September to November",
        highlights: ["Shibuya Crossing", "Tokyo Tower", "Traditional temples", "Amazing food"],
        image_url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf"
      }
    ];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tripId, preferences, budget } = await req.json();
    console.log('Generating trip with Amadeus API for:', tripId, 'with preferences:', preferences);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get Amadeus access token
    const token = await getAmadeusToken();
    console.log('Amadeus token acquired');

    // Fetch real data from Amadeus APIs
    const [amadeusDestinations, amadeusHotels, amadeusFlights] = await Promise.all([
      getDestinations(token, preferences),
      getHotels(token, preferences),
      getFlights(token, preferences)
    ]);

    console.log('Amadeus data fetched:', {
      destinations: amadeusDestinations.length,
      hotels: amadeusHotels.length,
      flights: amadeusFlights.length
    });

    // Transform Amadeus destination data
    const destinations = amadeusDestinations.slice(0, 8).map((dest: any) => {
      const basePrice = budget === '$' ? 800 : budget === '$$' ? 1200 : 1800;
      const variance = Math.random() * 400 - 200; // ±200 variance
      
      return {
        trip_id: tripId,
        name: dest.name,
        country: dest.address?.countryName || dest.name,
        description: `Discover ${dest.name}, a beautiful destination offering unique experiences and cultural attractions.`,
        image_url: `https://images.unsplash.com/1600x900/?travel,${encodeURIComponent(dest.name)}`,
        estimated_cost_budget: Math.round(basePrice * 0.6 + variance),
        estimated_cost_mid_range: Math.round(basePrice + variance),
        estimated_cost_luxury: Math.round(basePrice * 1.6 + variance),
        best_time_to_visit: 'Year-round',
        highlights: ['Local attractions', 'Cultural sites', 'Dining', 'Shopping'],
        ai_generated: false,
      };
    });

    // If we don't have enough data from Amadeus, supplement with AI-generated content
    if (destinations.length < 8) {
      console.log('Supplementing destinations with AI-generated content');
      const aiDestinations = await generateAIDestinations(preferences, 8 - destinations.length);
      
      aiDestinations.forEach((dest: any) => {
        destinations.push({
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
        });
      });
    }

    // Transform Amadeus hotel data
    const accommodations = amadeusHotels.slice(0, 12).map((hotel: any) => {
      const offer = hotel.offers?.[0];
      const basePrice = offer?.price?.total ? parseInt(offer.price.total) : (budget === '$' ? 80 : budget === '$$' ? 150 : 300);
      
      return {
        trip_id: tripId,
        name: hotel.hotel?.name || 'Hotel',
        type: 'hotel',
        location: hotel.hotel?.address?.cityName || 'City',
        description: `${hotel.hotel?.name || 'Hotel'} offers comfortable accommodation with modern amenities.`,
        image_url: `https://images.unsplash.com/1600x900/?hotel,accommodation`,
        price_per_night_budget: Math.round(basePrice * 0.7),
        price_per_night_mid_range: basePrice,
        price_per_night_luxury: Math.round(basePrice * 1.5),
        amenities: ['WiFi', 'Breakfast', 'Air Conditioning', 'Room Service'],
        rating: hotel.hotel?.rating ? parseFloat(hotel.hotel.rating) : 4.0,
        ai_generated: false,
      };
    });

    // Transform Amadeus flight data
    const transportation = amadeusFlights.slice(0, 10).map((flight: any) => {
      const segment = flight.itineraries?.[0]?.segments?.[0];
      const price = flight.price?.total ? parseInt(flight.price.total) : (budget === '$' ? 300 : budget === '$$' ? 600 : 1200);
      
      return {
        trip_id: tripId,
        type: 'flight',
        provider: segment?.carrierCode || 'Airline',
        departure_location: segment?.departure?.iataCode || 'Airport',
        arrival_location: segment?.arrival?.iataCode || 'Airport',
        departure_time: segment?.departure?.at || '08:00',
        arrival_time: segment?.arrival?.at || '14:00',
        price_budget: Math.round(price * 0.8),
        price_mid_range: price,
        price_luxury: Math.round(price * 1.4),
        duration_minutes: flight.itineraries?.[0]?.duration ? 
          parseInt(flight.itineraries[0].duration.replace('PT', '').replace('H', '').replace('M', '')) || 360 : 360,
        description: `Flight from ${segment?.departure?.iataCode} to ${segment?.arrival?.iataCode}`,
        ai_generated: false,
      };
    });

    // Save all data to database
    const { data: savedDestinations, error: destError } = await supabase
      .from('trip_destinations')
      .insert(destinations)
      .select();

    if (destError) throw destError;

    const { data: savedAccommodations, error: accomError } = await supabase
      .from('trip_accommodations')
      .insert(accommodations)
      .select();

    if (accomError) throw accomError;

    const { data: savedTransportation, error: transError } = await supabase
      .from('trip_transportation')
      .insert(transportation)
      .select();

    if (transError) throw transError;

    console.log('Successfully generated trip with Amadeus data:', {
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
