import { FastifyInstance, RegisterOptions } from 'fastify';

const routes = async (fastify: FastifyInstance, options: RegisterOptions) => {
  fastify.get('/', async (_, reply) => {
    reply.status(410).send({
      message: '9anime (Aniwave) has been permanently shut down and removed.',
    });
  });
};

export default routes;
