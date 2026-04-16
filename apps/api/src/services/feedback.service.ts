import { SupabaseClient } from '@supabase/supabase-js';

// Seuil minimum pour que le signal "intéressé/pas intéressé" influence le prompt.
// Un lieu doit avoir été liké ou disliké au moins N fois pour être mentionné.
// Évite qu'un signal isolé (mauvais jour, erreur de tap) impacte les recommandations.
const INTEREST_THRESHOLD = 10;

const HIGH_RATING = 4; // note ≥ 4 → lieu apprécié
const LOW_RATING = 2;  // note ≤ 2 → lieu peu apprécié

/**
 * Construit le bloc de feedback à injecter dans le prompt Claude.
 * Deux signaux distincts :
 *   1. Intéressé/Pas intéressé (feedback.liked) — intention avant visite
 *   2. Note post-visite (plan_items.user_rating) — expérience réelle
 *
 * Important : on ne remonte jamais de catégorie (restaurant, activité…).
 * Le signal porte sur un lieu spécifique, pas sur un style ou une cuisine.
 */
export async function getFeedbackPromptText(
  supabase: SupabaseClient,
  userId: string,
): Promise<string | null> {
  const parts: string[] = [];

  // --- Signal 1 : Intéressé / Pas intéressé ---
  const { data: feedbackRows } = await supabase
    .from('feedback')
    .select('liked, plan_items(name)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(300);

  if (feedbackRows && feedbackRows.length > 0) {
    const likeCounts: Record<string, number> = {};
    const dislikeCounts: Record<string, number> = {};

    for (const fb of feedbackRows) {
      const name = (fb.plan_items as any)?.name;
      if (!name) continue;
      if (fb.liked === true) {
        likeCounts[name] = (likeCounts[name] ?? 0) + 1;
      } else if (fb.liked === false) {
        dislikeCounts[name] = (dislikeCounts[name] ?? 0) + 1;
      }
    }

    const strongLikes = Object.entries(likeCounts)
      .filter(([, count]) => count >= INTEREST_THRESHOLD)
      .map(([name]) => name);

    const strongDislikes = Object.entries(dislikeCounts)
      .filter(([, count]) => count >= INTEREST_THRESHOLD)
      .map(([name]) => name);

    if (strongLikes.length > 0) {
      parts.push(
        `L'utilisateur est régulièrement attiré par ces lieux spécifiques : ${strongLikes.slice(0, 10).join(', ')}. Propose des lieux d'ambiance et de style similaires.`,
      );
    }
    if (strongDislikes.length > 0) {
      parts.push(
        `L'utilisateur ne souhaite jamais visiter ces lieux spécifiques : ${strongDislikes.slice(0, 10).join(', ')}. Évite de les proposer.`,
      );
    }
  }

  // --- Signal 2 : Notes post-visite ---
  const { data: ratedItems } = await supabase
    .from('plan_items')
    .select('name, user_rating, plans!inner(user_id)')
    .eq('plans.user_id', userId)
    .not('user_rating', 'is', null);

  if (ratedItems && ratedItems.length > 0) {
    const ratingMap: Record<string, number[]> = {};

    for (const item of ratedItems) {
      const name = item.name;
      const rating = item.user_rating as number | null;
      if (!name || rating == null) continue;
      if (!ratingMap[name]) ratingMap[name] = [];
      ratingMap[name].push(rating);
    }

    const enjoyed: string[] = [];
    const didntEnjoy: string[] = [];

    for (const [name, ratings] of Object.entries(ratingMap)) {
      const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      if (avg >= HIGH_RATING) enjoyed.push(name);
      else if (avg <= LOW_RATING) didntEnjoy.push(name);
    }

    if (enjoyed.length > 0) {
      parts.push(
        `L'utilisateur a visité et beaucoup apprécié ces lieux (note ≥ 4/5) : ${enjoyed.slice(0, 10).join(', ')}. Favorise ce type d'ambiance et d'expérience.`,
      );
    }
    if (didntEnjoy.length > 0) {
      parts.push(
        `L'utilisateur a visité et peu apprécié ces lieux (note ≤ 2/5) : ${didntEnjoy.slice(0, 10).join(', ')}. Évite ce type d'expérience.`,
      );
    }
  }

  return parts.length > 0 ? parts.join('\n') : null;
}
