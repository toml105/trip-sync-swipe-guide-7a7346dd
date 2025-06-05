
import { Button } from '@/components/ui/button';
import { MapPin, ArrowLeft, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TripHeaderProps {
  tripName: string;
  startDate: string;
  endDate: string;
  onShare: () => void;
}

const TripHeader = ({ tripName, startDate, endDate, onShare }: TripHeaderProps) => {
  const navigate = useNavigate();

  return (
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
              <h1 className="text-xl font-bold text-gray-900">{tripName}</h1>
              <p className="text-sm text-gray-600">
                {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={onShare}
          className="bg-white/70"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>
    </header>
  );
};

export default TripHeader;
