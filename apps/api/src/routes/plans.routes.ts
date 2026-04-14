import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { generateUserPlan } from '../services/plan-generator.service';

interface GenerateBody {
  latitude: number;
  longitude: number;
  radius_km: number;
  location_name?: string;
  language?: string;
}

export default async function plansRoutes(fastify: FastifyInstance) {
  // Generate a plan — SSE streaming
  fastify.post<{ Body: GenerateBody }>(
    '/plans/generate',
    { preHandler: [fastify.requireAuth] },
    async (request: FastifyRequest<{ Body: GenerateBody }>, reply: FastifyReply) => {
      const { latitude, longitude, radius_km, location_name, language } = request.body;

      // SSE headers
      reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      });

      function sendEvent(event: string, data: any) {
        reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      }

      try {
        sendEvent('status', { message: 'searching_places' });

        const result = await generateUserPlan({
          userId: request.userId,
          latitude,
          longitude,
          radiusKm: radius_km,
          locationName: location_name,
          language: language ?? 'fr',
          supabase: request.supabaseClient,
        });

        // Stream items one by one
        for (const item of result.items) {
          sendEvent('plan_item', item);
        }

        sendEvent('plan_complete', {
          plan_id: result.planId,
          total_cost: result.totalCost,
          item_count: result.items.length,
        });
      } catch (err: any) {
        console.error('[Plans] Generation error:', err);
        sendEvent('error', { message: err.message ?? 'Plan generation failed' });
      }

      reply.raw.end();
    },
  );

  // Get a plan with items
  fastify.get<{ Params: { id: string } }>(
    '/plans/:id',
    { preHandler: [fastify.requireAuth] },
    async (request, reply) => {
      const { data: plan, error } = await request.supabaseClient
        .from('plans')
        .select('*, plan_items(*)')
        .eq('id', request.params.id)
        .single();

      if (error || !plan) return reply.code(404).send({ error: 'Plan not found' });
      return plan;
    },
  );

  // List user's plans
  fastify.get(
    '/plans',
    { preHandler: [fastify.requireAuth] },
    async (request) => {
      const { data } = await request.supabaseClient
        .from('plans')
        .select('id, mode, location_name, radius_km, status, total_estimated_cost, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

      return data ?? [];
    },
  );
}
