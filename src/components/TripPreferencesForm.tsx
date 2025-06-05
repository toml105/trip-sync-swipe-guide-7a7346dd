
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface TripPreferencesFormProps {
  tripId: string;
  budget: string;
  onDestinationsGenerated: () => void;
}

interface TripPreferences {
  destinations: string;
  accommodations: string;
  transportation: string;
  activities: string;
  dietary: string;
  accessibility: string;
}

const TripPreferencesForm = ({ tripId, budget, onDestinationsGenerated }: TripPreferencesFormProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuth();

  const form = useForm<TripPreferences>({
    defaultValues: {
      destinations: '',
      accommodations: '',
      transportation: '',
      activities: '',
      dietary: '',
      accessibility: ''
    }
  });

  const handleGenerateTrip = async (data: TripPreferences) => {
    const hasAnyPreferences = Object.values(data).some(value => value.trim());
    
    if (!hasAnyPreferences) {
      toast({
        title: "Please provide some preferences",
        description: "Tell us about your ideal trip in at least one category!",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    console.log('Generating complete trip for:', tripId, data);

    try {
      // Save user preferences
      if (user) {
        const preferencesText = [
          data.destinations && `Destinations: ${data.destinations}`,
          data.accommodations && `Accommodations: ${data.accommodations}`,
          data.transportation && `Transportation: ${data.transportation}`,
          data.activities && `Activities: ${data.activities}`,
          data.dietary && `Dietary: ${data.dietary}`,
          data.accessibility && `Accessibility: ${data.accessibility}`
        ].filter(Boolean).join('\n\n');

        await supabase
          .from('user_trip_preferences')
          .insert({
            trip_id: tripId,
            user_id: user.id,
            preferences_text: preferencesText,
          });
      }

      // Call the enhanced edge function to generate all trip components
      const { data: result, error } = await supabase.functions.invoke('generate-trip-components', {
        body: {
          tripId,
          preferences: data,
          budget,
        },
      });

      if (error) throw error;

      console.log('Trip components generated successfully:', result);
      toast({
        title: "Trip generated!",
        description: "AI has created personalized recommendations for your entire trip.",
      });

      onDestinationsGenerated();
    } catch (error) {
      console.error('Error generating trip:', error);
      toast({
        title: "Error generating trip",
        description: "Please try again or contact support if the issue persists.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <span>Plan Your Perfect Trip with AI</span>
        </CardTitle>
        <p className="text-gray-600 text-sm">
          Provide as much or as little detail as you'd like. The AI will create personalized recommendations for destinations, accommodations, and transportation.
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleGenerateTrip)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="destinations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination Preferences</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What kind of destinations interest you? Beach, mountains, cities, cultural sites, adventure spots, tropical islands, historical places..."
                        className="min-h-24"
                        disabled={isGenerating}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accommodations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accommodation Preferences</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What type of accommodations do you prefer? Hotels, resorts, hostels, Airbnb, boutique hotels, luxury suites, budget options, family-friendly..."
                        className="min-h-24"
                        disabled={isGenerating}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transportation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transportation Preferences</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="How do you prefer to travel? Flights, trains, buses, rental cars, private transfers, budget airlines, premium travel, road trips..."
                        className="min-h-24"
                        disabled={isGenerating}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="activities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activities & Experiences</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What activities excite you? Adventure sports, cultural tours, food experiences, nightlife, museums, nature walks, shopping, relaxation..."
                        className="min-h-24"
                        disabled={isGenerating}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dietary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dietary Requirements (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any dietary restrictions or food preferences? Vegetarian, vegan, gluten-free, halal, kosher, allergies, local cuisine interests..."
                        className="min-h-20"
                        disabled={isGenerating}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accessibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accessibility Needs (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any accessibility requirements? Wheelchair access, mobility assistance, visual/hearing accommodations, medical facilities nearby..."
                        className="min-h-20"
                        disabled={isGenerating}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button 
              type="submit"
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Your Perfect Trip...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate AI Trip Plan
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default TripPreferencesForm;
