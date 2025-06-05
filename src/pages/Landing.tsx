
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Users, Vote, Heart, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTrips } from '@/hooks/useTrips';
import CreateTripModal from '@/components/CreateTripModal';

const Landing = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user, signOut } = useAuth();
  const { trips, isLoading } = useTrips();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
                TripSync
              </h1>
            </div>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Plan amazing group trips together. Vote on destinations, find the perfect accommodations, 
              and create memories with the people you love.
            </p>
            <Button 
              onClick={() => navigate('/auth')}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-lg px-8 py-3"
            >
              Get Started
            </Button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Collaborative Planning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Invite friends and family to plan your trip together. Everyone gets a voice in the decision.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Vote className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle>Democratic Voting</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Vote on destinations and accommodations. Find options that work for everyone in your group.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-pink-600" />
                </div>
                <CardTitle>Perfect Matches</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Discover destinations and experiences that match your group's preferences and budget.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-orange-500 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
                TripSync
              </h1>
              <p className="text-gray-600">Welcome back, {user.email?.split('@')[0]}!</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-orange-600"
            >
              Create New Trip
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Trips */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Trips</h2>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your trips...</p>
            </div>
          ) : trips.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No trips yet</h3>
                <p className="text-gray-600 mb-6">Create your first trip and start planning with friends!</p>
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-orange-600"
                >
                  Create Your First Trip
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {trips.map((trip) => (
                <Card key={trip.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => navigate(`/trip/${trip.id}`)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{trip.name}</CardTitle>
                        <p className="text-gray-600">
                          {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Budget: {trip.budget}</div>
                        <div className="text-sm text-gray-500">
                          {trip.trip_participants?.length || 0} participants
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>

        <CreateTripModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
        />
      </div>
    </div>
  );
};

export default Landing;
