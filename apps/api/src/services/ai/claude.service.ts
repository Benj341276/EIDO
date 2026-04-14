import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT, PLAN_TOOL, buildUserPrompt } from './prompts';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export interface PlanGenerationContext {
  preferences: Record<string, any>;
  feedbackSummary?: string;
  restaurants: any[];
  activities: any[];
  events: any[];
  location: { lat: number; lng: number };
  radiusKm: number;
  language: string;
}

export interface GeneratedPlan {
  restaurants: GeneratedItem[];
  activities: GeneratedItem[];
  events: GeneratedItem[];
  day_cost_estimate: { min: number; max: number; currency: string };
}

export interface GeneratedItem {
  external_id: string;
  name: string;
  reason: string;
  match_score: number;
  estimated_cost?: number;
  duration_minutes?: number;
  category_detail?: string;
  date?: string;
}

export async function generatePlan(context: PlanGenerationContext): Promise<GeneratedPlan> {
  const userPrompt = buildUserPrompt(context);

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    tools: [PLAN_TOOL],
    tool_choice: { type: 'tool', name: 'generate_plan' },
    messages: [{ role: 'user', content: userPrompt }],
  });

  // Extract tool use result
  const toolUse = response.content.find((block) => block.type === 'tool_use');
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error('Claude did not return a tool use response');
  }

  const plan = toolUse.input as GeneratedPlan;

  return {
    restaurants: plan.restaurants ?? [],
    activities: plan.activities ?? [],
    events: plan.events ?? [],
    day_cost_estimate: plan.day_cost_estimate ?? { min: 0, max: 0, currency: 'EUR' },
  };
}
