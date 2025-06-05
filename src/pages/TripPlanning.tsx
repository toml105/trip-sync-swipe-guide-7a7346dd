
import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MapPin, Users, Share2, ArrowLeft } from 'lucide-react';
import { Trip } from '@/types/trip';
import { destinations } from '@/data/destinations';
import DestinationCard from '@/components/DestinationCard';
import JoinTripModal from '@/components/JoinTripModal';
import ShareTripModal from '@/components/ShareTripModal';
import { toast } from '@/hooks/use-toast';

const TripPlanning = () => {
  const { tripId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [currentDestinationIndex, setCurrentDestinationIndex] = useState(0);
  const [userVotes, setUserVotes] = useState<Record<string, 'like' | 'pass'>>({});
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>('');

  useEffect(() => {
    if (!tripId) return;

    // Load trip data
    const tripData = localStorage.getItem(`trip_${tripId}`);
    if (!tripData) {
      toast({
        title: "Trip not found",
        description: "This trip link may be invalid or expired.",
        variant: "destructive"
      });
      navigate('/');
      return;
    }

    const parsedTrip = JSON.parse(tripData) as Trip;
    setTrip(parsedTrip);

    // Check if user has a name parameter
    const nameParam = searchParams.get('name');
    if (nameParam) {
      setCurrentUser(nameParam);
      // Add user to participants if not already there
      if (!parsedTrip.participants.includes(nameParam)) {
        const updatedTrip = {
          ...parsedTrip,
          participants: [...parsedTrip.participants, nameParam]
        };
        localStorage.setItem(`trip_${tripId}`, JSON.stringify(updatedTrip));
        setTrip(updatedTrip);
      }
    } else {
      setShowJoinModal(true);
    }

    // Load user's existing votes
    const existingVotes = localStorage.getItem(`votes_${tripId}_${nameParam}`);
    if (existingVotes) {
      const votes = JSON.parse(existingVotes);
      setUserVotes(votes);
      // Find the next unvoted destination
      const nextIndex = destinations.findIndex(dest => !votes[dest.id]);
      if (nextIndex !== -1) {
        setCurrentDestinationIndex(nextIndex);
      } else {
        // All destinations voted on
        navigate(`/results/${tripId}?name=${encodeURIComponent(nameParam || '')}`);
      }
    }
  }, [tripId, searchParams, navigate]);

  const handleVote = (destinationId: string, vote: 'like' | 'pass') => {
    if (!trip || !currentUser) return;

    const newVotes = { ...userVotes, [destinationId]: vote };
    setUserVotes(newVotes);

    // Save to localStorage
    localStorage.setItem(`votes_${tripId}_${currentUser}`, JSON.stringify(newVotes));

    // Update trip votes
    const updatedTripVotes = {
      ...trip.votes,
      [currentUser]: newVotes
    };
    const updatedTrip = { ...trip, votes: updatedTripVotes };
    localStorage.setItem(`trip_${tripId}`, JSON.stringify(updatedTrip));
    setTrip(updatedTrip);

    // Move to next destination
    if (currentDestinationIndex < destinations.length - 1) {
      setCurrentDestinationIndex(currentDestinationIndex + 1);
    } else {
      // All destinations voted on
      toast({
        title: "Voting complete!",
        description: "You've voted on all destinations. Redirecting to results..."
      });
      setTimeout(() => {
        navigate(`/results/${tripId}?name=${encodeURIComponent(currentUser)}`);
      }, 1500);
    }
  };

  const progress = ((currentDestinationIndex + Object.keys(userVotes).length) / destinations.length) * 100;
  const votedCount = Object.keys(trip?.votes || {}).length;
  const totalParticipants = trip?.participants.length || 0;

  if (!trip) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/')}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-orange-500 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{trip.name}</h1>
                <p className="text-sm text-gray-600">
                  {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-sm text-gray-600 bg-white/70 px-3 py-1 rounded-full">
              <Users className="w-4 h-4" />
              <span>{votedCount}/{totalParticipants} voted</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowShareModal(true)}
              className="bg-white/70"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Your progress</span>
            <span>{Object.keys(userVotes).length}/{destinations.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4">
        {currentDestinationIndex < destinations.length ? (
          <div className="max-w-md mx-auto">
            <DestinationCard
              destination={destinations[currentDestinationIndex]}
              trip={trip}
              onVote={handleVote}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">You're all done!</h2>
            <p className="text-gray-600 mb-6">
              Thanks for voting! Check back to see what everyone else thinks.
            </p>
            <Button 
              onClick={() => navigate(`/results/${tripId}?name=${encodeURIComponent(currentUser)}`)}
              className="bg-gradient-to-r from-blue-600 to-orange-600"
            >
              View Results
            </Button>
          </div>
        )}
      </main>

      <JoinTripModal
        open={showJoinModal}
        onOpenChange={setShowJoinModal}
        tripId={tripId || ''}
        tripName={trip.name}
        onJoin={setCurrentUser}
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
