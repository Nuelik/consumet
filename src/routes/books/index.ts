import { FastifyRequest, FastifyReply, FastifyInstance, RegisterOptions } from 'fastify';

const routes = async (fastify: FastifyInstance, options: RegisterOptions) => {
  fastify.get('/', async (request: any, reply: any) => {
    reply.status(200).send('Welcome to Consumet Books 📚');
  });

  fastify.get('/s', async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.status(501).send({
      message: 'Book search provider is currently unavailable.',
      error: 'not_implemented',
    });
  });
};

export default routes;
