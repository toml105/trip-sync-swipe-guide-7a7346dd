
import { Button } from '@/components/ui/button';
import { Heart, X } from 'lucide-react';

interface VotingActionsProps {
  onVote: (vote: 'like' | 'pass') => void;
  disabled: boolean;
}

const VotingActions = ({ onVote, disabled }: VotingActionsProps) => {
  return (
    <div className="flex justify-center space-x-6 mt-6">
      <Button
        size="lg"
        variant="outline"
        onClick={() => onVote('pass')}
        className="w-16 h-16 rounded-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
        disabled={disabled}
      >
        <X className="w-6 h-6" />
      </Button>
      <Button
        size="lg"
        onClick={() => onVote('like')}
        className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white"
        disabled={disabled}
      >
        <Heart className="w-6 h-6" />
      </Button>
    </div>
  );
};

export default VotingActions;
