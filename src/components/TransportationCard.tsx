
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plane, Train, Bus, Car, DollarSign, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Transportation {
  id: string;
  type: string;
  provider: string;
  departure_location: string;
  arrival_location: string;
  departure_time: string;
  arrival_time: string;
  price_budget: number;
  price_mid_range: number;
  price_luxury: number;
  duration_minutes: number;
  description: string;
}

interface TransportationCardProps {
  transportation: Transportation;
  budget: '$' | '$$' | '$$$';
  onVote: (transportationId: string, vote: 'like' | 'pass') => void;
  isAnimating?: boolean;
  animationDirection?: 'left' | 'right' | null;
}

const TransportationCard = ({ 
  transportation, 
  budget, 
  onVote, 
  isAnimating = false, 
  animationDirection = null 
}: TransportationCardProps) => {
  const budgetKey = budget === '$' ? 'price_budget' : 
                   budget === '$$' ? 'price_mid_range' : 
                   'price_luxury';
  const price = transportation[budgetKey];

  const getTransportIcon = (type: string) => {
    const typeLower = type.toLowerCase();
    if (typeLower.includes('flight') || typeLower.includes('plane')) return <Plane className="w-5 h-5" />;
    if (typeLower.includes('train')) return <Train className="w-5 h-5" />;
    if (typeLower.includes('bus')) return <Bus className="w-5 h-5" />;
    if (typeLower.includes('car')) return <Car className="w-5 h-5" />;
    return <Plane className="w-5 h-5" />;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  {getTransportIcon(transportation.type)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{transportation.provider}</h3>
                  <Badge variant="outline" className="text-xs">
                    {transportation.type}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center text-green-600">
                  <DollarSign className="w-4 h-4 mr-1" />
                  <span className="font-semibold">${price}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">From</p>
                  <p className="font-medium">{transportation.departure_location}</p>
                  {transportation.departure_time && (
                    <p className="text-sm text-blue-600">{formatTime(transportation.departure_time)}</p>
                  )}
                </div>
                <div className="flex-1 mx-4">
                  <div className="border-t border-dashed border-gray-300 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white px-2">
                        {transportation.duration_minutes && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDuration(transportation.duration_minutes)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">To</p>
                  <p className="font-medium">{transportation.arrival_location}</p>
                  {transportation.arrival_time && (
                    <p className="text-sm text-blue-600">{formatTime(transportation.arrival_time)}</p>
                  )}
                </div>
              </div>
            </div>

            {transportation.description && (
              <p className="text-gray-700 text-sm">{transportation.description}</p>
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

export default TransportationCard;
