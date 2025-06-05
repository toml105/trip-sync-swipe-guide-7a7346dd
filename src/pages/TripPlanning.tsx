
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTrip } from '@/hooks/useTrips';
import TripPreferencesForm from '@/components/TripPreferencesForm';
import TripHeader from '@/components/TripHeader';
import VotingStageManager from '@/components/VotingStageManager';
import JoinTripModal from '@/components/JoinTripModal';
import ShareTripModal from '@/components/ShareTripModal';
import { useAuth } from '@/contexts/AuthContext';

const TripPlanning = () => {
  const { tripId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: trip, isLoading } = useTrip(tripId || '');
  
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [hasGeneratedDestinations, setHasGeneratedDestinations] = useState(false);

  const destinations = trip?.trip_destinations || [];
  const participants = trip?.trip_participants || [];
  const currentParticipant = participants.find(p => p.user_id === user?.id);

  useEffect(() => {
    if (trip && destinations.length > 0) {
      setHasGeneratedDestinations(true);
    }
  }, [trip, destinations.length]);

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
          <VotingStageManager tripId={tripId || ''} />
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
