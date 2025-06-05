
import { Destination } from '@/types/trip';

export const destinations: Destination[] = [
  {
    id: '1',
    name: 'Bali, Indonesia',
    country: 'Indonesia',
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&h=600&fit=crop',
    costPerPerson: { budget: 800, midRange: 1500, luxury: 3000 },
    bestTimeToVisit: 'Apr-Oct',
    highlights: ['Beautiful temples', 'Stunning beaches', 'Rice terraces'],
    description: 'Tropical paradise with rich culture and natural beauty'
  },
  {
    id: '2',
    name: 'Tokyo, Japan',
    country: 'Japan',
    imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&h=600&fit=crop',
    costPerPerson: { budget: 1200, midRange: 2200, luxury: 4500 },
    bestTimeToVisit: 'Mar-May, Sep-Nov',
    highlights: ['Modern technology', 'Ancient traditions', 'Amazing food'],
    description: 'Where tradition meets innovation in perfect harmony'
  },
  {
    id: '3',
    name: 'Santorini, Greece',
    country: 'Greece',
    imageUrl: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&h=600&fit=crop',
    costPerPerson: { budget: 1000, midRange: 1800, luxury: 3500 },
    bestTimeToVisit: 'Apr-Oct',
    highlights: ['Iconic sunsets', 'White-washed buildings', 'Crystal blue waters'],
    description: 'Romantic island paradise in the Aegean Sea'
  },
  {
    id: '4',
    name: 'Patagonia, Chile',
    country: 'Chile',
    imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop',
    costPerPerson: { budget: 1500, midRange: 2500, luxury: 4000 },
    bestTimeToVisit: 'Dec-Mar',
    highlights: ['Dramatic landscapes', 'Hiking trails', 'Glaciers and mountains'],
    description: 'Untamed wilderness at the end of the world'
  },
  {
    id: '5',
    name: 'Iceland',
    country: 'Iceland',
    imageUrl: 'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=800&h=600&fit=crop',
    costPerPerson: { budget: 1800, midRange: 2800, luxury: 5000 },
    bestTimeToVisit: 'Jun-Aug',
    highlights: ['Northern lights', 'Geysers and waterfalls', 'Blue lagoon'],
    description: 'Land of fire and ice with otherworldly landscapes'
  },
  {
    id: '6',
    name: 'Maldives',
    country: 'Maldives',
    imageUrl: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800&h=600&fit=crop',
    costPerPerson: { budget: 2000, midRange: 4000, luxury: 8000 },
    bestTimeToVisit: 'Nov-Apr',
    highlights: ['Overwater bungalows', 'Pristine beaches', 'World-class diving'],
    description: 'Tropical luxury in the Indian Ocean'
  },
  {
    id: '7',
    name: 'Swiss Alps, Switzerland',
    country: 'Switzerland',
    imageUrl: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800&h=600&fit=crop',
    costPerPerson: { budget: 2200, midRange: 3500, luxury: 6000 },
    bestTimeToVisit: 'Dec-Mar, Jun-Sep',
    highlights: ['Mountain peaks', 'Skiing and hiking', 'Charming villages'],
    description: 'Majestic alpine scenery and outdoor adventures'
  },
  {
    id: '8',
    name: 'Morocco',
    country: 'Morocco',
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&h=600&fit=crop',
    costPerPerson: { budget: 700, midRange: 1300, luxury: 2800 },
    bestTimeToVisit: 'Mar-May, Sep-Nov',
    highlights: ['Vibrant markets', 'Desert landscapes', 'Rich culture'],
    description: 'Exotic blend of Arab, Berber, and European influences'
  },
  {
    id: '9',
    name: 'New Zealand',
    country: 'New Zealand',
    imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&h=600&fit=crop',
    costPerPerson: { budget: 1600, midRange: 2600, luxury: 4500 },
    bestTimeToVisit: 'Dec-Feb',
    highlights: ['Diverse landscapes', 'Adventure sports', 'Friendly locals'],
    description: 'Adventure capital with stunning natural beauty'
  },
  {
    id: '10',
    name: 'Costa Rica',
    country: 'Costa Rica',
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&h=600&fit=crop',
    costPerPerson: { budget: 900, midRange: 1600, luxury: 3200 },
    bestTimeToVisit: 'Dec-Apr',
    highlights: ['Biodiversity', 'Beaches and volcanoes', 'Eco-tourism'],
    description: 'Pure life in Central American paradise'
  }
];
