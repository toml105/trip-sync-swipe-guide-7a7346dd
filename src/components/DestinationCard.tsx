
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Destination {
  id: string;
  name: string;
  country: string;
  image_url: string;
  estimated_cost_budget: number;
  estimated_cost_mid_range: number;
  estimated_cost_luxury: number;
  best_time_to_visit: string;
  highlights: string[];
  description: string;
}

interface DestinationCardProps {
  destination: Destination;
  budget: '$' | '$$' | '$$$';
  onVote: (destinationId: string, vote: 'like' | 'pass') => void;
  isAnimating?: boolean;
  animationDirection?: 'left' | 'right' | null;
}

const DestinationCard = ({ 
  destination, 
  budget, 
  onVote, 
  isAnimating = false, 
  animationDirection = null 
}: DestinationCardProps) => {
  const budgetKey = budget === '$' ? 'estimated_cost_budget' : 
                   budget === '$$' ? 'estimated_cost_mid_range' : 
                   'estimated_cost_luxury';
  const estimatedCost = destination[budgetKey];

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
            src={destination.image_url}
            alt={destination.name}
            className="w-full h-64 object-cover rounded-t-lg"
          />
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="bg-white/90 text-gray-900">
              {destination.best_time_to_visit}
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
                <span className="text-sm">{destination.best_time_to_visit}</span>
              </div>
            </div>

            <p className="text-gray-700 text-sm">{destination.description}</p>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">Highlights:</p>
              <div className="flex flex-wrap gap-2">
                {destination.highlights?.map((highlight, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {highlight}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
