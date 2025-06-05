
import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Heart, ArrowLeft, Share2, Download } from 'lucide-react';
import { Trip } from '@/types/trip';
import { destinations } from '@/data/destinations';
import ShareTripModal from '@/components/ShareTripModal';

const TripResults = () => {
  const { tripId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (!tripId) return;

    const tripData = localStorage.getItem(`trip_${tripId}`);
    if (!tripData) {
      navigate('/');
      return;
    }

    setTrip(JSON.parse(tripData) as Trip);
  }, [tripId, navigate]);

  if (!trip) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Calculate results
  const results = destinations.map(dest => {
    const votes = Object.values(trip.votes).map(userVotes => userVotes[dest.id]).filter(Boolean);
    const likes = votes.filter(vote => vote === 'like').length;
    const totalVotes = votes.length;
    const percentage = totalVotes > 0 ? (likes / totalVotes) * 100 : 0;
    
    return {
      destination: dest,
      likes,
      totalVotes,
      percentage,
      likedBy: Object.entries(trip.votes)
        .filter(([, userVotes]) => userVotes[dest.id] === 'like')
        .map(([userName]) => userName)
    };
  }).sort((a, b) => b.percentage - a.percentage || b.likes - a.likes);

  const topDestinations = results.filter(result => result.likes > 0);
  const votedCount = Object.keys(trip.votes).length;
  const totalParticipants = trip.participants.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(`/trip/${tripId}?name=${searchParams.get('name') || ''}`)}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-orange-500 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{trip.name} - Results</h1>
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
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4">
        {votedCount === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Waiting for votes...</h2>
            <p className="text-gray-600 mb-6">
              Share the trip link so everyone can start voting on destinations!
            </p>
            <Button 
              onClick={() => setShowShareModal(true)}
              className="bg-gradient-to-r from-blue-600 to-orange-600"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Trip
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top Matches */}
            {topDestinations.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  🎉 Your Group's Top Destinations
                </h2>
                <div className="grid gap-6 max-w-4xl mx-auto">
                  {topDestinations.slice(0, 5).map((result, index) => (
                    <Card key={result.destination.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="md:flex">
                        <div className="md:w-1/3">
                          <img
                            src={result.destination.imageUrl}
                            alt={result.destination.name}
                            className="w-full h-48 md:h-full object-cover"
                          />
                        </div>
                        <div className="md:w-2/3 p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center space-x-2 mb-2">
                                {index === 0 && result.percentage >= 50 && (
                                  <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600">
                                    🏆 Top Choice
                                  </Badge>
                                )}
                                <Badge variant="outline">
                                  {Math.round(result.percentage)}% match
                                </Badge>
                              </div>
                              <h3 className="text-xl font-bold text-gray-900">
                                {result.destination.name}
                              </h3>
                              <p className="text-gray-600">{result.destination.country}</p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center text-pink-600 mb-1">
                                <Heart className="w-4 h-4 mr-1 fill-current" />
                                <span className="font-semibold">{result.likes}</span>
                              </div>
                              <p className="text-xs text-gray-500">
                                out of {result.totalVotes} votes
                              </p>
                            </div>
                          </div>

                          <p className="text-gray-700 mb-4">{result.destination.description}</p>

                          <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                              {result.destination.highlights.map((highlight, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {highlight}
                                </Badge>
                              ))}
                            </div>

                            {result.likedBy.length > 0 && (
                              <div>
                                <p className="text-sm text-gray-600 mb-1">Loved by:</p>
                                <div className="flex flex-wrap gap-1">
                                  {result.likedBy.map((name, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {name}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* No matches */}
            {topDestinations.length === 0 && votedCount > 0 && (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">No matches yet</h2>
                <p className="text-gray-600 mb-6">
                  It looks like your group hasn't found any destinations everyone loves yet. 
                  Try getting more people to vote or consider compromising on some options!
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 py-8">
              <Button
                variant="outline"
                onClick={() => navigate(`/trip/${tripId}?name=${searchParams.get('name') || ''}`)}
              >
                Back to Voting
              </Button>
              <Button 
                onClick={() => setShowShareModal(true)}
                className="bg-gradient-to-r from-blue-600 to-orange-600"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Results
              </Button>
            </div>
          </div>
        )}
      </main>

      <ShareTripModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        tripId={tripId || ''}
        tripName={trip.name}
      />
    </div>
  );
};

export default TripResults;
