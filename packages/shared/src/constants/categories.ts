export const CUISINE_OPTIONS = [
  'Italian', 'Japanese', 'Mexican', 'Thai', 'Indian',
  'French', 'Korean', 'Mediterranean', 'American', 'Chinese',
  'Vietnamese', 'Middle Eastern', 'Greek', 'Spanish', 'Lebanese',
] as const;

export const MUSIC_GENRE_OPTIONS = [
  'Electro', 'Jazz', 'Hip-hop', 'Rock', 'Classical',
  'Pop', 'R&B', 'House', 'Techno', 'Reggae',
  'Metal', 'Indie', 'Folk', 'Latin', 'Soul',
] as const;

export const ACTIVITY_OPTIONS = [
  'Outdoor adventures', 'Museums & galleries', 'Live shows',
  'Sports', 'Wellness & spa', 'Nightlife', 'Food tours',
  'Parks & nature', 'Cinema', 'Concerts', 'Comedy',
  'Escape rooms', 'Cooking classes', 'Art workshops',
] as const;

export const LIFE_RHYTHM_OPTIONS = [
  { value: 'early_bird', label: 'Early bird' },
  { value: 'night_owl', label: 'Night owl' },
  { value: 'flexible', label: 'Flexible' },
] as const;

export const BUDGET_LEVEL_OPTIONS = [
  { value: 'budget', label: 'Budget', description: 'Under €20/person' },
  { value: 'moderate', label: 'Moderate', description: '€20–50/person' },
  { value: 'premium', label: 'Premium', description: '€50–100/person' },
  { value: 'luxury', label: 'Luxury', description: '€100+/person' },
] as const;

export const MOBILITY_MODE_OPTIONS = [
  { value: 'walking', label: 'Walking' },
  { value: 'cycling', label: 'Cycling' },
  { value: 'driving', label: 'Driving' },
  { value: 'transit', label: 'Public transit' },
] as const;

export const DIETARY_RESTRICTION_OPTIONS = [
  'Vegetarian', 'Vegan', 'Gluten-free', 'Halal', 'Kosher', 'None',
] as const;
