import { SupabaseClient } from '@supabase/supabase-js';

export interface FeedbackSummary {
  likedNames: string[];
  dislikedNames: string[];
  likedCategories: string[];
  dislikedCategories: string[];
  totalLikes: number;
  totalDislikes: number;
}

export async function getUserFeedbackSummary(
  supabase: SupabaseClient,
  userId: string,
): Promise<FeedbackSummary | null> {
  const { data, error } = await supabase
    .from('feedback')
    .select('liked, plan_items(name, category)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30);

  if (error || !data || data.length === 0) return null;

  const likedNames: string[] = [];
  const dislikedNames: string[] = [];
  const likedCategories: string[] = [];
  const dislikedCategories: string[] = [];

  for (const fb of data) {
    const item = fb.plan_items as any;
    if (!item) continue;

    if (fb.liked === true) {
      likedNames.push(item.name);
      if (!likedCategories.includes(item.category)) likedCategories.push(item.category);
    } else if (fb.liked === false) {
      dislikedNames.push(item.name);
      if (!dislikedCategories.includes(item.category)) dislikedCategories.push(item.category);
    }
  }

  return {
    likedNames,
    dislikedNames,
    likedCategories,
    dislikedCategories,
    totalLikes: likedNames.length,
    totalDislikes: dislikedNames.length,
  };
}

export function formatFeedbackForPrompt(summary: FeedbackSummary): string {
  const parts: string[] = [];

  if (summary.likedNames.length > 0) {
    parts.push(`L'utilisateur a aimé : ${summary.likedNames.slice(0, 10).join(', ')}`);
  }
  if (summary.dislikedNames.length > 0) {
    parts.push(`L'utilisateur n'a PAS aimé : ${summary.dislikedNames.slice(0, 10).join(', ')}. Évite des lieux similaires.`);
  }

  return parts.join('\n');
}
