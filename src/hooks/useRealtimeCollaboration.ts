
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ParticipantStatus {
  id: string;
  name: string;
  hasVoted: boolean;
  isOnline: boolean;
}

export const useRealtimeCollaboration = (tripId: string, stage: 'destinations' | 'accommodations' | 'transportation') => {
  const { user } = useAuth();
  const [participants, setParticipants] = useState<ParticipantStatus[]>([]);
  const [voteCounts, setVoteCounts] = useState<Record<string, { likes: number; passes: number }>>({});

  useEffect(() => {
    if (!tripId || !user) return;

    // Set up real-time subscription for vote updates
    const voteTableName = stage === 'destinations' ? 'destination_votes' : 
                         stage === 'accommodations' ? 'accommodation_votes' : 
                         'transportation_votes';

    const channel = supabase
      .channel(`trip-${tripId}-${stage}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: voteTableName,
          filter: `trip_id=eq.${tripId}`
        },
        (payload) => {
          console.log('Real-time vote update:', payload);
          // Refetch vote counts when votes change
          fetchVoteCounts();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trip_participants',
          filter: `trip_id=eq.${tripId}`
        },
        (payload) => {
          console.log('Real-time participant update:', payload);
          // Refetch participants when participant data changes
          fetchParticipants();
        }
      )
      .subscribe();

    // Initial data fetch
    fetchParticipants();
    fetchVoteCounts();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId, stage, user]);

  const fetchParticipants = async () => {
    try {
      const { data: participants, error } = await supabase
        .from('trip_participants')
        .select('id, name, has_voted_destinations, has_voted_accommodations, has_voted_transport')
        .eq('trip_id', tripId);

      if (error) throw error;

      const participantStatus: ParticipantStatus[] = participants?.map(p => ({
        id: p.id,
        name: p.name,
        hasVoted: stage === 'destinations' ? p.has_voted_destinations : 
                 stage === 'accommodations' ? p.has_voted_accommodations : 
                 p.has_voted_transport,
        isOnline: true // In a real app, you'd track this with presence
      })) || [];

      setParticipants(participantStatus);
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  const fetchVoteCounts = async () => {
    try {
      let votes;
      
      if (stage === 'destinations') {
        const { data, error } = await supabase
          .from('destination_votes')
          .select('destination_id, vote_type')
          .eq('trip_id', tripId);
        
        if (error) throw error;
        votes = data?.map(v => ({ itemId: v.destination_id, vote_type: v.vote_type }));
      } else if (stage === 'accommodations') {
        const { data, error } = await supabase
          .from('accommodation_votes')
          .select('accommodation_id, vote_type')
          .eq('trip_id', tripId);
        
        if (error) throw error;
        votes = data?.map(v => ({ itemId: v.accommodation_id, vote_type: v.vote_type }));
      } else if (stage === 'transportation') {
        const { data, error } = await supabase
          .from('transportation_votes')
          .select('transportation_id, vote_type')
          .eq('trip_id', tripId);
        
        if (error) throw error;
        votes = data?.map(v => ({ itemId: v.transportation_id, vote_type: v.vote_type }));
      }

      const counts: Record<string, { likes: number; passes: number }> = {};
      votes?.forEach(vote => {
        const itemId = vote.itemId;
        if (!counts[itemId]) {
          counts[itemId] = { likes: 0, passes: 0 };
        }
        if (vote.vote_type === 'like') {
          counts[itemId].likes++;
        } else {
          counts[itemId].passes++;
        }
      });

      setVoteCounts(counts);
    } catch (error) {
      console.error('Error fetching vote counts:', error);
    }
  };

  return {
    participants,
    voteCounts,
    refetch: () => {
      fetchParticipants();
      fetchVoteCounts();
    }
  };
};
