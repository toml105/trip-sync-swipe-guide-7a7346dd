
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables, TablesInsert } from '@/integrations/supabase/types';
import { toast } from '@/hooks/use-toast';

type Trip = Tables<'trips'>;
type TripInsert = TablesInsert<'trips'>;
type TripParticipant = Tables<'trip_participants'>;

export const useTrips = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const tripsQuery = useQuery({
    queryKey: ['trips', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          trip_participants (
            id,
            name,
            email,
            has_voted_destinations,
            joined_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createTripMutation = useMutation({
    mutationFn: async (tripData: Omit<TripInsert, 'creator_id'>) => {
      if (!user) throw new Error('Must be authenticated');

      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .insert({ ...tripData, creator_id: user.id })
        .select()
        .single();

      if (tripError) throw tripError;

      // Add creator as first participant
      const { error: participantError } = await supabase
        .from('trip_participants')
        .insert({
          trip_id: trip.id,
          user_id: user.id,
          name: user.email?.split('@')[0] || 'Creator',
          email: user.email,
        });

      if (participantError) throw participantError;

      return trip;
    },
    onSuccess: (trip) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast({
        title: "Trip created!",
        description: "Your trip has been created successfully."
      });
      // Navigate to the newly created trip
      navigate(`/trip/${trip.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error creating trip",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  return {
    trips: tripsQuery.data || [],
    isLoading: tripsQuery.isLoading,
    error: tripsQuery.error,
    createTrip: createTripMutation.mutate,
    isCreating: createTripMutation.isPending,
  };
};

export const useTrip = (tripId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trip', tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          trip_participants (
            id,
            user_id,
            name,
            email,
            has_voted_destinations,
            has_voted_accommodations,
            has_voted_transport,
            joined_at
          ),
          trip_destinations (
            id,
            name,
            country,
            description,
            image_url,
            estimated_cost_budget,
            estimated_cost_mid_range,
            estimated_cost_luxury,
            best_time_to_visit,
            highlights
          ),
          trip_accommodations (
            id,
            name,
            type,
            location,
            description,
            image_url,
            price_per_night_budget,
            price_per_night_mid_range,
            price_per_night_luxury,
            amenities,
            rating
          ),
          trip_transportation (
            id,
            type,
            provider,
            departure_location,
            arrival_location,
            departure_time,
            arrival_time,
            price_budget,
            price_mid_range,
            price_luxury,
            duration_minutes,
            description
          )
        `)
        .eq('id', tripId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!tripId && !!user,
  });
};
