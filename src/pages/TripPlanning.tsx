
import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTrip } from '@/hooks/useTrips';
import TripPreferencesForm from '@/components/TripPreferencesForm';
import TripHeader from '@/components/TripHeader';
import VotingProgress from '@/components/VotingProgress';
import DestinationCard from '@/components/DestinationCard';
import VotingActions from '@/components/VotingActions';
import JoinTripModal from '@/components/JoinTripModal';
import ShareTripModal from '@/components/ShareTripModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const TripPlanning = () => {
  const { tripId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: trip, isLoading } = useTrip(tripId || '');
  
  const [currentDestinationIndex, setCurrentDestinationIndex] = useState(0);
  const [userVotes, setUserVotes] = useState<Record<string, 'like' | 'pass'>>({});
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<'left' | 'right' | null>(null);
  const [hasGeneratedDestinations, setHasGeneratedDestinations] = useState(false);

  const destinations = trip?.trip_destinations || [];
  const participants = trip?.trip_participants || [];
  const currentParticipant = participants.find(p => p.user_id === user?.id);

  useEffect(() => {
    if (trip && destinations.length > 0) {
      setHasGeneratedDestinations(true);
      loadUserVotes();
    }
  }, [trip, destinations.length, user?.id]);

  const loadUserVotes = async () => {
    if (!user || !tripId) return;

    try {
      const { data: votes, error } = await supabase
        .from('destination_votes')
        .select('destination_id, vote_type')
        .eq('trip_id', tripId)
        .eq('participant_id', currentParticipant?.id);

      if (error) throw error;

      const votesMap: Record<string, 'like' | 'pass'> = {};
      votes?.forEach(vote => {
        votesMap[vote.destination_id] = vote.vote_type as 'like' | 'pass';
      });

      setUserVotes(votesMap);

      // Find next unvoted destination
      const nextIndex = destinations.findIndex(dest => !votesMap[dest.id]);
      if (nextIndex !== -1) {
        setCurrentDestinationIndex(nextIndex);
      } else if (destinations.length > 0) {
        // All destinations voted on
        navigate(`/results/${tripId}`);
      }
    } catch (error) {
      console.error('Error loading votes:', error);
    }
  };

  const handleVote = async (destinationId: string, vote: 'like' | 'pass') => {
    if (!user || !currentParticipant || !tripId) return;

    setIsAnimating(true);
    setAnimationDirection(vote === 'like' ? 'right' : 'left');

    try {
      // Save vote to database
      const { error } = await supabase
        .from('destination_votes')
        .upsert({
          trip_id: tripId,
          destination_id: destinationId,
          participant_id: currentParticipant.id,
          vote_type: vote,
        });

      if (error) throw error;

      // Update local state
      const newVotes = { ...userVotes, [destinationId]: vote };
      setUserVotes(newVotes);

      setTimeout(() => {
        if (currentDestinationIndex < destinations.length - 1) {
          setCurrentDestinationIndex(currentDestinationIndex + 1);
        } else {
          // All destinations voted on
          toast({
            title: "Voting complete!",
            description: "You've voted on all destinations. Redirecting to results..."
          });
          setTimeout(() => {
            navigate(`/results/${tripId}`);
          }, 1500);
        }
        setIsAnimating(false);
        setAnimationDirection(null);
      }, 300);
    } catch (error) {
      console.error('Error saving vote:', error);
      toast({
        title: "Error saving vote",
        description: "Please try again.",
        variant: "destructive"
      });
      setIsAnimating(false);
      setAnimationDirection(null);
    }
  };

  const handleDestinationsGenerated = () => {
    setHasGeneratedDestinations(true);
    // Refresh trip data
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trip...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Trip not found</h2>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const votedParticipants = participants.filter(p => p.has_voted_destinations).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <TripHeader
        tripName={trip.name}
        startDate={trip.start_date}
        endDate={trip.end_date}
        onShare={() => setShowShareModal(true)}
      />

      <main className="container mx-auto px-4">
        {!hasGeneratedDestinations || destinations.length === 0 ? (
          <TripPreferencesForm
            tripId={tripId || ''}
            budget={trip.budget}
            onDestinationsGenerated={handleDestinationsGenerated}
          />
        ) : (
          <>
            <VotingProgress
              currentIndex={currentDestinationIndex}
              totalDestinations={destinations.length}
              votedParticipants={votedParticipants}
              totalParticipants={participants.length}
              userVotes={userVotes}
            />

            {currentDestinationIndex < destinations.length ? (
              <div className="mt-8">
                <DestinationCard
                  destination={destinations[currentDestinationIndex]}
                  budget={trip.budget as '$' | '$$' | '$$$'}
                  onVote={handleVote}
                  isAnimating={isAnimating}
                  animationDirection={animationDirection}
                />
                
                <VotingActions
                  onVote={(vote) => handleVote(destinations[currentDestinationIndex].id, vote)}
                  disabled={isAnimating}
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">You're all done!</h2>
                <p className="text-gray-600 mb-6">
                  Thanks for voting! Check back to see what everyone else thinks.
                </p>
                <Button 
                  onClick={() => navigate(`/results/${tripId}`)}
                  className="bg-gradient-to-r from-blue-600 to-orange-600"
                >
                  View Results
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <JoinTripModal
        open={showJoinModal}
        onOpenChange={setShowJoinModal}
        tripId={tripId || ''}
        tripName={trip.name}
        onJoin={() => {}}
      />

      <ShareTripModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        tripId={tripId || ''}
        tripName={trip.name}
      />
    </div>
  );
};

export default TripPlanning;
