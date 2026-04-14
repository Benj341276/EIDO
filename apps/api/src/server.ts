import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import supabasePlugin from './plugins/supabase';
import authPlugin from './plugins/auth';

const server = Fastify({ logger: true });

async function start() {
  await server.register(cors, { origin: true });
  await server.register(rateLimit, { max: 100, timeWindow: '1 minute' });
  await server.register(supabasePlugin);
  await server.register(authPlugin);

  server.get('/health', async () => ({ status: 'ok', version: '0.0.1' }));

  const port = Number(process.env.PORT) || 3001;
  await server.listen({ port, host: '0.0.0.0' });
}

start().catch((err) => {
  server.log.error(err);
  process.exit(1);
});
