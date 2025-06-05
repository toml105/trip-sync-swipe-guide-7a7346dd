
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Users, Heart, Share2 } from 'lucide-react';
import CreateTripModal from '@/components/CreateTripModal';

const Landing = () => {
  const [showCreateTrip, setShowCreateTrip] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-orange-500 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">TripSync</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Plan Group Trips Without the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-600">
              Group Chat Chaos
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Create a trip, share the link, and let everyone swipe on destinations they love. 
            No more endless debates – just fun decisions and amazing adventures.
          </p>

          <Button 
            onClick={() => setShowCreateTrip(true)}
            className="bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            Create New Trip
          </Button>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-6xl mx-auto">
          <Card className="text-center p-8 hover:shadow-lg transition-shadow duration-200 border-0 bg-white/70 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Easy Group Planning</h3>
              <p className="text-gray-600">
                Share a simple link and let everyone join instantly. No accounts needed, no barriers to entry.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-8 hover:shadow-lg transition-shadow duration-200 border-0 bg-white/70 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Swipe & Match</h3>
              <p className="text-gray-600">
                Tinder-style voting on AI-curated destinations. Find places everyone actually wants to visit.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-8 hover:shadow-lg transition-shadow duration-200 border-0 bg-white/70 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Share2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Instant Results</h3>
              <p className="text-gray-600">
                See real-time matches and export your results. From chaos to consensus in minutes.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How it Works */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-16">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Create Trip", desc: "Set dates, budget, and trip details" },
              { step: "2", title: "Share Link", desc: "Send the link to your travel squad" },
              { step: "3", title: "Swipe Together", desc: "Everyone votes on destinations" },
              { step: "4", title: "Book & Go", desc: "See matches and start planning!" }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <CreateTripModal 
        open={showCreateTrip} 
        onOpenChange={setShowCreateTrip}
      />
    </div>
  );
};

export default Landing;
