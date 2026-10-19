import { FastifyRequest, FastifyReply, FastifyInstance, RegisterOptions } from 'fastify';
import { PROVIDERS_LIST } from '@consumet/extensions';
import readlightnovels from './readlightnovels';

const routes = async (fastify: FastifyInstance, options: RegisterOptions) => {
  await fastify.register(readlightnovels, { prefix: '/readlightnovels' });

  fastify.get('/', async (request: any, reply: any) => {
    reply.status(200).send('Welcome to Consumet Light Novels 📚');
  });

  fastify.get('/:lightNovelProvider', async (request: FastifyRequest, reply: FastifyReply) => {
    const providerParam = decodeURIComponent(
      (request.params as { lightNovelProvider: string }).lightNovelProvider,
    );

    const provider = PROVIDERS_LIST.LIGHT_NOVELS?.find(
      (p: any) => p?.name?.toLowerCase() === providerParam.toLowerCase(),
    );

    try {
      if (provider) {
        reply.redirect(`/light-novels/${provider.name.toLowerCase()}`);
      } else {
        reply
          .status(404)
          .send({ message: 'Provider not found, please check the providers list.' });
      }
    } catch (err) {
      reply.status(500).send('Something went wrong. Please try again later.');
    }
  });
};

export default routes;
