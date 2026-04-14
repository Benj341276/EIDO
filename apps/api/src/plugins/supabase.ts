import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

declare module 'fastify' {
  interface FastifyInstance {
    supabase: SupabaseClient;
  }
  interface FastifyRequest {
    supabaseClient: SupabaseClient;
  }
}

export default fp(async function supabasePlugin(fastify: FastifyInstance) {
  const adminClient = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  fastify.decorate('supabase', adminClient);

  fastify.addHook('onRequest', async (request) => {
    const token = request.headers.authorization?.replace('Bearer ', '');
    if (token) {
      const userClient = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${token}` } } }
      );
      request.supabaseClient = userClient;
    }
  });
});
