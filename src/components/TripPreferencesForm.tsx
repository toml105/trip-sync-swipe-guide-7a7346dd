
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface TripPreferencesFormProps {
  tripId: string;
  budget: string;
  onDestinationsGenerated: () => void;
}

const TripPreferencesForm = ({ tripId, budget, onDestinationsGenerated }: TripPreferencesFormProps) => {
  const [preferences, setPreferences] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuth();

  const handleGenerateDestinations = async () => {
    if (!preferences.trim()) {
      toast({
        title: "Please describe your preferences",
        description: "Tell us what kind of trip you're looking for!",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    console.log('Generating destinations for trip:', tripId);

    try {
      // Save user preferences
      if (user) {
        await supabase
          .from('user_trip_preferences')
          .insert({
            trip_id: tripId,
            user_id: user.id,
            preferences_text: preferences,
          });
      }

      // Call the edge function to generate destinations
      const { data, error } = await supabase.functions.invoke('generate-destinations', {
        body: {
          tripId,
          preferences,
          budget,
        },
      });

      if (error) throw error;

      console.log('Destinations generated successfully:', data);
      toast({
        title: "Destinations generated!",
        description: "AI has created personalized destination recommendations for your trip.",
      });

      onDestinationsGenerated();
    } catch (error) {
      console.error('Error generating destinations:', error);
      toast({
        title: "Error generating destinations",
        description: "Please try again or contact support if the issue persists.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <span>Describe Your Dream Trip</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Tell us about your ideal trip... What kind of experiences are you looking for? Beach relaxation, cultural exploration, adventure activities, food scenes, nightlife, historical sites? Any specific interests or must-see places?"
          value={preferences}
          onChange={(e) => setPreferences(e.target.value)}
          className="min-h-32"
          disabled={isGenerating}
        />
        
        <Button 
          onClick={handleGenerateDestinations}
          disabled={isGenerating || !preferences.trim()}
          className="w-full bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Destinations...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate AI Destinations
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TripPreferencesForm;
