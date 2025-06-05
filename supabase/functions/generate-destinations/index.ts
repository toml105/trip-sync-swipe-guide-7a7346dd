
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
    console.log('Generating destinations for trip:', tripId, 'with preferences:', preferences);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate destinations using OpenAI
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
            content: `Generate 8 diverse travel destinations based on these preferences: ${preferences}. Focus on variety in geography, culture, and experiences. Budget preference: ${budget}`
          }
        ],
        temperature: 0.8,
      }),
    });

    const aiData = await response.json();
    const destinations = JSON.parse(aiData.choices[0].message.content);

    // Save destinations to database
    const { data: savedDestinations, error: saveError } = await supabase
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

    if (saveError) {
      console.error('Error saving destinations:', saveError);
      throw saveError;
    }

    console.log('Successfully generated and saved destinations:', savedDestinations.length);

    return new Response(JSON.stringify({ destinations: savedDestinations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-destinations function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
