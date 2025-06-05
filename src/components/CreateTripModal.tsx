
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTrips } from '@/hooks/useTrips';

interface CreateTripModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateTripModal = ({ open, onOpenChange }: CreateTripModalProps) => {
  const navigate = useNavigate();
  const { createTrip, isCreating } = useTrips();
  const [tripName, setTripName] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [budget, setBudget] = useState<'$' | '$$' | '$$$'>('$$');

  const handleCreateTrip = () => {
    if (!tripName || !startDate || !endDate) return;

    createTrip({
      name: tripName,
      start_date: startDate.toISOString().split('T')[0], // Convert to YYYY-MM-DD format
      end_date: endDate.toISOString().split('T')[0],
      budget,
      total_travelers: 1,
    });

    // Reset form
    setTripName('');
    setStartDate(undefined);
    setEndDate(undefined);
    setBudget('$$');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Create Your Trip</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="trip-name">Trip Name</Label>
            <Input
              id="trip-name"
              placeholder="Summer Adventure 2024"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "MMM dd") : "Start"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "MMM dd") : "End"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => date < (startDate || new Date())}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Budget Range</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['$', '$$', '$$$'] as const).map((level) => (
                <Button
                  key={level}
                  variant={budget === level ? 'default' : 'outline'}
                  onClick={() => setBudget(level)}
                  className="flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  {level}
                </Button>
              ))}
            </div>
            <p className="text-xs text-gray-500 text-center">
              $ = Budget-friendly • $$ = Mid-range • $$$ = Luxury
            </p>
          </div>

          <Button 
            onClick={handleCreateTrip}
            disabled={!tripName || !startDate || !endDate || isCreating}
            className="w-full bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700"
          >
            {isCreating ? 'Creating Trip...' : 'Create Trip'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTripModal;
