export const SYSTEM_PROMPT = `Tu es un planificateur de journée expert pour l'application EIDO Life.
Tu génères des recommandations personnalisées basées sur les préférences utilisateur et les données réelles de lieux.

RÈGLES STRICTES :
- Recommande UNIQUEMENT des restaurants qui correspondent aux cuisines préférées de l'utilisateur. Si l'utilisateur aime la cuisine italienne, ne recommande PAS de restaurant japonais, chinois, etc.
- Sélectionne un MAXIMUM de résultats : 5-10 restaurants, 5-8 activités, et tous les événements disponibles
- Priorise les lieux avec les meilleures notes (rating élevé) et les plus proches
- Respecte STRICTEMENT les restrictions alimentaires
- Donne un score de pertinence (match_score) entre 0 et 100 pour chaque item
- Estime un coût réaliste par item basé sur le price_level et la localisation
- Fournis une raison courte et engageante pour chaque recommandation (dans la langue de l'utilisateur)
- ESTIMATION DU COÛT JOURNÉE : calcule le coût pour une journée RÉALISTE d'une personne = 1 restaurant + 1-2 activités + 1 événement maximum. NE PAS additionner tous les items proposés.
- Si peu de données disponibles, recommande ce qu'il y a de mieux plutôt que de forcer des résultats
- Ne recommande JAMAIS un lieu qui ne correspond pas aux préférences de l'utilisateur`;

export const PLAN_TOOL = {
  name: 'generate_plan' as const,
  description: 'Génère un plan personnalisé structuré avec restaurants, activités et événements',
  input_schema: {
    type: 'object' as const,
    properties: {
      restaurants: {
        type: 'array' as const,
        items: {
          type: 'object' as const,
          properties: {
            external_id: { type: 'string' as const },
            name: { type: 'string' as const },
            reason: { type: 'string' as const },
            match_score: { type: 'number' as const },
            estimated_cost: { type: 'number' as const },
            category_detail: { type: 'string' as const },
          },
          required: ['external_id', 'name', 'reason', 'match_score'],
        },
      },
      activities: {
        type: 'array' as const,
        items: {
          type: 'object' as const,
          properties: {
            external_id: { type: 'string' as const },
            name: { type: 'string' as const },
            reason: { type: 'string' as const },
            match_score: { type: 'number' as const },
            estimated_cost: { type: 'number' as const },
            duration_minutes: { type: 'number' as const },
          },
          required: ['external_id', 'name', 'reason', 'match_score'],
        },
      },
      events: {
        type: 'array' as const,
        items: {
          type: 'object' as const,
          properties: {
            external_id: { type: 'string' as const },
            name: { type: 'string' as const },
            reason: { type: 'string' as const },
            match_score: { type: 'number' as const },
            estimated_cost: { type: 'number' as const },
            date: { type: 'string' as const },
          },
          required: ['external_id', 'name', 'reason', 'match_score'],
        },
      },
      day_cost_estimate: {
        type: 'object' as const,
        properties: {
          min: { type: 'number' as const },
          max: { type: 'number' as const },
          currency: { type: 'string' as const },
        },
        required: ['min', 'max', 'currency'],
      },
    },
    required: ['restaurants', 'activities', 'day_cost_estimate'],
  },
};

export function buildUserPrompt(context: {
  preferences: Record<string, any>;
  feedbackSummary?: string;
  restaurants: any[];
  activities: any[];
  events: any[];
  location: { lat: number; lng: number };
  radiusKm: number;
  language: string;
}): string {
  const { preferences, feedbackSummary, restaurants, activities, events, location, radiusKm, language } = context;

  let prompt = `CONTEXTE UTILISATEUR :
- Position : ${location.lat}, ${location.lng} (rayon ${radiusKm}km)
- Cuisines préférées : ${preferences.cuisines?.join(', ') || 'non spécifié'}
- Genres musicaux : ${preferences.music_genres?.join(', ') || 'non spécifié'}
- Activités préférées : ${preferences.activities?.join(', ') || 'non spécifié'}
- Rythme de vie : ${preferences.life_rhythm || 'non spécifié'}
- Budget : ${preferences.budget_level || 'non spécifié'}
- Restrictions alimentaires : ${preferences.dietary_restrictions?.join(', ') || 'aucune'}
- Langue de l'utilisateur : ${language}

`;

  if (feedbackSummary) {
    prompt += `FEEDBACK PASSÉ :\n${feedbackSummary}\n\n`;
  }

  prompt += `RESTAURANTS DISPONIBLES (${restaurants.length}) :\n`;
  for (const r of restaurants) {
    prompt += `- [${r.id}] ${r.name} | ${r.address} | Note: ${r.rating ?? '?'}/5 | Prix: ${r.priceLevel ?? '?'}/4 | Types: ${r.types?.join(', ')}\n`;
  }

  prompt += `\nACTIVITÉS DISPONIBLES (${activities.length}) :\n`;
  for (const a of activities) {
    prompt += `- [${a.id}] ${a.name} | ${a.address} | Note: ${a.rating ?? '?'}/5 | Types: ${a.types?.join(', ')}\n`;
  }

  if (events.length > 0) {
    prompt += `\nÉVÉNEMENTS À VENIR (${events.length}) :\n`;
    for (const e of events) {
      prompt += `- [${e.id}] ${e.name} | ${e.date} | ${e.venue ?? ''} | Prix: ${e.priceMin ?? '?'}–${e.priceMax ?? '?'}€\n`;
    }
  }

  prompt += `\nGénère le meilleur plan pour cette journée en utilisant l'outil generate_plan. Réponds dans la langue : ${language}.`;

  return prompt;
}
