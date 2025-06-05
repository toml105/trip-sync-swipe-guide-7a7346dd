
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, X, MapPin, Calendar, DollarSign } from 'lucide-react';
import { Destination, Trip } from '@/types/trip';
import { cn } from '@/lib/utils';

interface DestinationCardProps {
  destination: Destination;
  trip: Trip;
  onVote: (destinationId: string, vote: 'like' | 'pass') => void;
}

const DestinationCard = ({ destination, trip, onVote }: DestinationCardProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<'left' | 'right' | null>(null);

  const budgetKey = trip.budget === '$' ? 'budget' : trip.budget === '$$' ? 'midRange' : 'luxury';
  const estimatedCost = destination.costPerPerson[budgetKey];

  const handleVote = (vote: 'like' | 'pass') => {
    setIsAnimating(true);
    setAnimationDirection(vote === 'like' ? 'right' : 'left');
    
    setTimeout(() => {
      onVote(destination.id, vote);
      setIsAnimating(false);
      setAnimationDirection(null);
    }, 300);
  };

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <Card 
        className={cn(
          "w-full transition-all duration-300 transform-gpu",
          isAnimating && animationDirection === 'right' && "translate-x-full rotate-12 opacity-0",
          isAnimating && animationDirection === 'left' && "-translate-x-full -rotate-12 opacity-0",
          "hover:scale-105 shadow-lg"
        )}
      >
        <div className="relative">
          <img
            src={destination.imageUrl}
            alt={destination.name}
            className="w-full h-64 object-cover rounded-t-lg"
          />
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="bg-white/90 text-gray-900">
              {destination.bestTimeToVisit}
            </Badge>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{destination.name}</h3>
              <p className="text-gray-600 flex items-center mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                {destination.country}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-green-600">
                <DollarSign className="w-4 h-4 mr-1" />
                <span className="font-semibold">${estimatedCost}</span>
                <span className="text-gray-500 ml-1">per person</span>
              </div>
              <div className="flex items-center text-blue-600">
                <Calendar className="w-4 h-4 mr-1" />
                <span className="text-sm">{destination.bestTimeToVisit}</span>
              </div>
            </div>

            <p className="text-gray-700 text-sm">{destination.description}</p>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">Highlights:</p>
              <div className="flex flex-wrap gap-2">
                {destination.highlights.map((highlight, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {highlight}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-6 mt-6">
        <Button
          size="lg"
          variant="outline"
          onClick={() => handleVote('pass')}
          className="w-16 h-16 rounded-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
          disabled={isAnimating}
        >
          <X className="w-6 h-6" />
        </Button>
        <Button
          size="lg"
          onClick={() => handleVote('like')}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white"
          disabled={isAnimating}
        >
          <Heart className="w-6 h-6" />
        </Button>
      </div>

      {/* Swipe Indicators */}
      {isAnimating && (
        <div className={cn(
          "absolute inset-0 flex items-center justify-center text-4xl font-bold",
          animationDirection === 'right' ? "text-green-500" : "text-red-500"
        )}>
          {animationDirection === 'right' ? '❤️' : '❌'}
        </div>
      )}
    </div>
  );
};

export default DestinationCard;
