export interface Feedback {
  id: string;
  user_id: string;
  plan_item_id: string;
  liked: boolean | null;
  rating: 1 | 2 | 3 | 4 | 5 | null;
  visited: boolean;
  created_at: string;
  updated_at: string;
}

export type FeedbackInput = Pick<Feedback, 'liked' | 'rating' | 'visited'>;

export interface FeedbackSummary {
  liked_categories: string[];
  disliked_categories: string[];
  avg_preferred_price_level: number | null;
  total_likes: number;
  total_dislikes: number;
  most_liked_names: string[];
}
