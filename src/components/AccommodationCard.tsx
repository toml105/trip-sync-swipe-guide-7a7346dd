
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, DollarSign, Star, Wifi, Car, Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Accommodation {
  id: string;
  name: string;
  type: string;
  location: string;
  description: string;
  image_url: string;
  price_per_night_budget: number;
  price_per_night_mid_range: number;
  price_per_night_luxury: number;
  amenities: string[];
  rating: number;
}

interface AccommodationCardProps {
  accommodation: Accommodation;
  budget: '$' | '$$' | '$$$';
  onVote: (accommodationId: string, vote: 'like' | 'pass') => void;
  isAnimating?: boolean;
  animationDirection?: 'left' | 'right' | null;
}

const AccommodationCard = ({ 
  accommodation, 
  budget, 
  onVote, 
  isAnimating = false, 
  animationDirection = null 
}: AccommodationCardProps) => {
  const budgetKey = budget === '$' ? 'price_per_night_budget' : 
                   budget === '$$' ? 'price_per_night_mid_range' : 
                   'price_per_night_luxury';
  const pricePerNight = accommodation[budgetKey];

  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi') || amenityLower.includes('internet')) return <Wifi className="w-3 h-3" />;
    if (amenityLower.includes('parking')) return <Car className="w-3 h-3" />;
    if (amenityLower.includes('breakfast') || amenityLower.includes('coffee')) return <Coffee className="w-3 h-3" />;
    return null;
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
            src={accommodation.image_url}
            alt={accommodation.name}
            className="w-full h-64 object-cover rounded-t-lg"
          />
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="bg-white/90 text-gray-900">
              {accommodation.type}
            </Badge>
          </div>
          {accommodation.rating && (
            <div className="absolute top-4 left-4 flex items-center bg-white/90 text-gray-900 px-2 py-1 rounded">
              <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium">{accommodation.rating}</span>
            </div>
          )}
        </div>

        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{accommodation.name}</h3>
              <p className="text-gray-600 flex items-center mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                {accommodation.location}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-green-600">
                <DollarSign className="w-4 h-4 mr-1" />
                <span className="font-semibold">${pricePerNight}</span>
                <span className="text-gray-500 ml-1">per night</span>
              </div>
            </div>

            <p className="text-gray-700 text-sm">{accommodation.description}</p>

            {accommodation.amenities && accommodation.amenities.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">Amenities:</p>
                <div className="flex flex-wrap gap-2">
                  {accommodation.amenities.slice(0, 4).map((amenity, index) => (
                    <Badge key={index} variant="outline" className="text-xs flex items-center gap-1">
                      {getAmenityIcon(amenity)}
                      {amenity}
                    </Badge>
                  ))}
                  {accommodation.amenities.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{accommodation.amenities.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
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

export default AccommodationCard;
