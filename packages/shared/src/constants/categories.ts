export const CUISINE_OPTIONS = [
  'Italien', 'Japonais', 'Mexicain', 'Thaïlandais', 'Indien',
  'Français', 'Coréen', 'Méditerranéen', 'Américain', 'Chinois',
  'Vietnamien', 'Moyen-Oriental', 'Grec', 'Espagnol', 'Libanais',
] as const;

export const MUSIC_GENRE_OPTIONS = [
  'Electro', 'Jazz', 'Hip-hop', 'Rock', 'Classique',
  'Pop', 'R&B', 'House', 'Techno', 'Reggae',
  'Metal', 'Indie', 'Folk', 'Latin', 'Soul',
] as const;

export const ACTIVITY_OPTIONS = [
  'Plage', 'Montagne', 'Urbain', 'Campagne',
  'Musées & galeries', 'Spectacles', 'Sports',
  'Bien-être & spa', 'Vie nocturne', 'Tours gastronomiques',
  'Parcs & nature', 'Cinéma', 'Concerts', 'Théâtre',
  'Jeux vidéo', 'Flipper', 'Baby-foot',
  'Escape rooms', 'Cours de cuisine', 'Ateliers créatifs',
  'Comedy clubs',
] as const;

export const LIFE_RHYTHM_OPTIONS = [
  { value: 'early_bird', label: 'Lève-tôt' },
  { value: 'night_owl', label: 'Couche-tard' },
  { value: 'flexible', label: 'Flexible' },
] as const;

export const BUDGET_LEVEL_OPTIONS = [
  { value: 'budget', label: 'Économique', description: 'Moins de 20€/personne' },
  { value: 'moderate', label: 'Modéré', description: '20–50€/personne' },
  { value: 'premium', label: 'Premium', description: '50–100€/personne' },
  { value: 'luxury', label: 'Luxe', description: '100€+/personne' },
] as const;

export const MOBILITY_MODE_OPTIONS = [
  { value: 'walking', label: 'À pied' },
  { value: 'cycling', label: 'Vélo' },
  { value: 'driving', label: 'Voiture' },
  { value: 'transit', label: 'Transports en commun' },
] as const;

export const DIETARY_RESTRICTION_OPTIONS = [
  'Végétarien', 'Végan', 'Sans gluten', 'Halal', 'Casher', 'Aucune',
] as const;
