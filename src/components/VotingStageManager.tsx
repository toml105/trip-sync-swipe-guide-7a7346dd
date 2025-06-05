
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTrip } from '@/hooks/useTrips';
import { useRealtimeCollaboration } from '@/hooks/useRealtimeCollaboration';
import DestinationCard from './DestinationCard';
import AccommodationCard from './AccommodationCard';
import TransportationCard from './TransportationCard';
import VotingActions from './VotingActions';
import VotingProgress from './VotingProgress';
import { toast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type VotingStage = 'destinations' | 'accommodations' | 'transportation';
type TripDestination = Tables<'trip_destinations'>;
type TripAccommodation = Tables<'trip_accommodations'>;
type TripTransportation = Tables<'trip_transportation'>;

interface VotingStageManagerProps {
  tripId: string;
}

const VotingStageManager = ({ tripId }: VotingStageManagerProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: trip } = useTrip(tripId);
  
  const [currentStage, setCurrentStage] = useState<VotingStage>('destinations');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userVotes, setUserVotes] = useState<Record<string, 'like' | 'pass'>>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<'left' | 'right' | null>(null);

  const { participants, voteCounts } = useRealtimeCollaboration(tripId, currentStage);
  
  const destinations = trip?.trip_destinations || [];
  const accommodations = trip?.trip_accommodations || [];
  const transportation = trip?.trip_transportation || [];
  
  const currentParticipant = trip?.trip_participants?.find(p => p.user_id === user?.id);

  const getCurrentItems = (): (TripDestination | TripAccommodation | TripTransportation)[] => {
    switch (currentStage) {
      case 'destinations': return destinations;
      case 'accommodations': return accommodations;
      case 'transportation': return transportation;
      default: return [];
    }
  };

  useEffect(() => {
    if (trip) {
      // Determine current stage based on trip progress
      const stage = trip.current_stage as VotingStage || 'destinations';
      setCurrentStage(stage);
      loadUserVotes(stage);
    }
  }, [trip, user?.id]);

  const loadUserVotes = async (stage: VotingStage) => {
    if (!user || !currentParticipant) return;

    try {
      let votes;
      
      if (stage === 'destinations') {
        const { data, error } = await supabase
          .from('destination_votes')
          .select('destination_id, vote_type')
          .eq('trip_id', tripId)
          .eq('participant_id', currentParticipant.id);
        
        if (error) throw error;
        votes = data;
      } else if (stage === 'accommodations') {
        const { data, error } = await supabase
          .from('accommodation_votes')
          .select('accommodation_id, vote_type')
          .eq('trip_id', tripId)
          .eq('participant_id', currentParticipant.id);
        
        if (error) throw error;
        votes = data?.map(v => ({ destination_id: v.accommodation_id, vote_type: v.vote_type }));
      } else if (stage === 'transportation') {
        const { data, error } = await supabase
          .from('transportation_votes')
          .select('transportation_id, vote_type')
          .eq('trip_id', tripId)
          .eq('participant_id', currentParticipant.id);
        
        if (error) throw error;
        votes = data?.map(v => ({ destination_id: v.transportation_id, vote_type: v.vote_type }));
      }

      const votesMap: Record<string, 'like' | 'pass'> = {};
      votes?.forEach(vote => {
        votesMap[vote.destination_id] = vote.vote_type as 'like' | 'pass';
      });

      setUserVotes(votesMap);

      // Find next unvoted item
      const items = getCurrentItems();
      const nextIndex = items.findIndex(item => !votesMap[item.id]);
      if (nextIndex !== -1) {
        setCurrentIndex(nextIndex);
      } else if (items.length > 0) {
        // All items voted on, check if we can move to next stage
        checkStageCompletion(stage);
      }
    } catch (error) {
      console.error('Error loading votes:', error);
    }
  };

  const checkStageCompletion = async (stage: VotingStage) => {
    // Check if all participants have voted
    const allVoted = participants.every(p => p.hasVoted);
    
    if (allVoted) {
      // Move to next stage or results
      const nextStage = stage === 'destinations' ? 'accommodations' : 
                       stage === 'accommodations' ? 'transportation' : 
                       'completed';

      if (nextStage === 'completed') {
        navigate(`/results/${tripId}`);
      } else {
        // Update trip stage
        await supabase
          .from('trips')
          .update({ current_stage: nextStage })
          .eq('id', tripId);
        
        setCurrentStage(nextStage as VotingStage);
        setCurrentIndex(0);
        setUserVotes({});
      }
    }
  };

  const handleVote = async (itemId: string, vote: 'like' | 'pass') => {
    if (!user || !currentParticipant) return;

    setIsAnimating(true);
    setAnimationDirection(vote === 'like' ? 'right' : 'left');

    try {
      // Save vote to database based on current stage
      if (currentStage === 'destinations') {
        const { error } = await supabase
          .from('destination_votes')
          .upsert({
            trip_id: tripId,
            destination_id: itemId,
            participant_id: currentParticipant.id,
            vote_type: vote,
          });
        if (error) throw error;
      } else if (currentStage === 'accommodations') {
        const { error } = await supabase
          .from('accommodation_votes')
          .upsert({
            trip_id: tripId,
            accommodation_id: itemId,
            participant_id: currentParticipant.id,
            vote_type: vote,
          });
        if (error) throw error;
      } else if (currentStage === 'transportation') {
        const { error } = await supabase
          .from('transportation_votes')
          .upsert({
            trip_id: tripId,
            transportation_id: itemId,
            participant_id: currentParticipant.id,
            vote_type: vote,
          });
        if (error) throw error;
      }

      // Update local state
      const newVotes = { ...userVotes, [itemId]: vote };
      setUserVotes(newVotes);

      const items = getCurrentItems();
      
      setTimeout(() => {
        if (currentIndex < items.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          // Update participant vote status
          const hasVotedColumn = currentStage === 'destinations' ? 'has_voted_destinations' : 
                                currentStage === 'accommodations' ? 'has_voted_accommodations' : 
                                'has_voted_transport';
          
          supabase
            .from('trip_participants')
            .update({ [hasVotedColumn]: true })
            .eq('id', currentParticipant.id);

          checkStageCompletion(currentStage);
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

  const renderCurrentCard = () => {
    const items = getCurrentItems();
    if (!items[currentIndex]) return null;

    const item = items[currentIndex];
    const budget = trip?.budget as '$' | '$$' | '$$$' || '$';

    switch (currentStage) {
      case 'destinations':
        return (
          <DestinationCard
            destination={item as TripDestination}
            budget={budget}
            onVote={handleVote}
            isAnimating={isAnimating}
            animationDirection={animationDirection}
          />
        );
      case 'accommodations':
        return (
          <AccommodationCard
            accommodation={item as TripAccommodation}
            budget={budget}
            onVote={handleVote}
            isAnimating={isAnimating}
            animationDirection={animationDirection}
          />
        );
      case 'transportation':
        return (
          <TransportationCard
            transportation={item as TripTransportation}
            budget={budget}
            onVote={handleVote}
            isAnimating={isAnimating}
            animationDirection={animationDirection}
          />
        );
      default:
        return null;
    }
  };

  const items = getCurrentItems();
  const votedParticipants = participants.filter(p => p.hasVoted).length;

  return (
    <div className="space-y-6">
      {/* Stage indicator */}
      <div className="flex justify-center">
        <div className="flex space-x-2">
          {['destinations', 'accommodations', 'transportation'].map((stage, index) => (
            <Badge 
              key={stage}
              variant={currentStage === stage ? "default" : "outline"}
              className="capitalize"
            >
              {index + 1}. {stage}
            </Badge>
          ))}
        </div>
      </div>

      <VotingProgress
        currentIndex={currentIndex}
        totalDestinations={items.length}
        votedParticipants={votedParticipants}
        totalParticipants={participants.length}
        userVotes={userVotes}
      />

      {currentIndex < items.length ? (
        <div className="mt-8">
          {renderCurrentCard()}
          
          <VotingActions
            onVote={(vote) => handleVote(items[currentIndex].id, vote)}
            disabled={isAnimating}
          />

          {/* Real-time voting stats */}
          {voteCounts[items[currentIndex]?.id] && (
            <div className="flex justify-center mt-4 space-x-4 text-sm text-gray-600">
              <span>❤️ {voteCounts[items[currentIndex].id].likes}</span>
              <span>❌ {voteCounts[items[currentIndex].id].passes}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {currentStage} voting complete!
          </h2>
          <p className="text-gray-600 mb-6">
            Waiting for other participants to finish voting...
          </p>
          <div className="space-y-2">
            {participants.map(participant => (
              <div key={participant.id} className="flex items-center justify-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${participant.hasVoted ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm">{participant.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingStageManager;
