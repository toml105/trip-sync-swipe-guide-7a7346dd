
export interface Destination {
  id: string;
  name: string;
  country: string;
  imageUrl: string;
  costPerPerson: {
    budget: number;
    midRange: number;
    luxury: number;
  };
  bestTimeToVisit: string;
  highlights: string[];
  description: string;
}

export interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  budget: '$' | '$$' | '$$$';
  creator: string;
  participants: string[];
  votes: Record<string, Record<string, 'like' | 'pass'>>;
  createdAt: string;
}

export interface TripParticipant {
  name: string;
  hasVoted: boolean;
  joinedAt: string;
}
