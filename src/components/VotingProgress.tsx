
import { Users } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface VotingProgressProps {
  currentIndex: number;
  totalDestinations: number;
  votedParticipants: number;
  totalParticipants: number;
  userVotes: Record<string, 'like' | 'pass'>;
}

const VotingProgress = ({ 
  currentIndex, 
  totalDestinations, 
  votedParticipants, 
  totalParticipants,
  userVotes 
}: VotingProgressProps) => {
  const userProgress = ((currentIndex + Object.keys(userVotes).length) / totalDestinations) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1 text-sm text-gray-600 bg-white/70 px-3 py-1 rounded-full">
          <Users className="w-4 h-4" />
          <span>{votedParticipants}/{totalParticipants} voted</span>
        </div>
        <div className="text-sm text-gray-600">
          Your progress: {Object.keys(userVotes).length}/{totalDestinations}
        </div>
      </div>
      
      <div>
        <Progress value={userProgress} className="h-2" />
      </div>
    </div>
  );
};

export default VotingProgress;
