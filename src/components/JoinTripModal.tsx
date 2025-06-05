
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';

interface JoinTripModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
  tripName: string;
  onJoin: (name: string) => void;
}

const JoinTripModal = ({ open, onOpenChange, tripId, tripName, onJoin }: JoinTripModalProps) => {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleJoin = () => {
    if (!name.trim()) return;

    // Update trip participants
    const tripData = localStorage.getItem(`trip_${tripId}`);
    if (tripData) {
      const trip = JSON.parse(tripData);
      if (!trip.participants.includes(name)) {
        trip.participants.push(name);
        localStorage.setItem(`trip_${tripId}`, JSON.stringify(trip));
      }
    }

    onJoin(name);
    onOpenChange(false);
    
    // Update URL with name parameter
    navigate(`/trip/${tripId}?name=${encodeURIComponent(name)}`, { replace: true });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-orange-500 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            Join "{tripName}"
          </DialogTitle>
          <p className="text-center text-gray-600">
            Enter your name to start voting on destinations
          </p>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
              autoFocus
            />
          </div>

          <Button 
            onClick={handleJoin}
            disabled={!name.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700"
          >
            Join Trip & Start Voting
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JoinTripModal;
