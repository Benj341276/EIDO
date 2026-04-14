import fp from 'fastify-plugin';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    userId: string;
  }
}

export default fp(async function authPlugin(fastify: FastifyInstance) {
  fastify.decorate(
    'requireAuth',
    async function (request: FastifyRequest, reply: FastifyReply) {
      const token = request.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const { data, error } = await request.supabaseClient.auth.getUser(token);
      if (error || !data.user) {
        return reply.code(401).send({ error: 'Invalid token' });
      }

      request.userId = data.user.id;
    }
  );
});
