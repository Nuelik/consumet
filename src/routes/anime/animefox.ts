import { FastifyRequest, FastifyReply, FastifyInstance, RegisterOptions } from 'fastify';
import { PROVIDERS_LIST } from '@consumet/extensions';

const routes = async (fastify: FastifyInstance, options: RegisterOptions) => {
  const getAnimeFox = () => {
    return (
      PROVIDERS_LIST.ANIME?.find(
        (p: any) => p?.name?.toLowerCase() === 'animefox'
      ) || PROVIDERS_LIST.ANIME?.[0]
    );
  };

  fastify.get('/', async (_, reply) => {
    reply.status(200).send({
      intro: 'Welcome to the AnimeFox provider',
      routes: ['/:query', '/info/:id', '/watch/:episodeId'],
    });
  });

  fastify.get('/:query', async (request: FastifyRequest, reply: FastifyReply) => {
    const animefox = getAnimeFox();
    const query = (request.params as { query: string }).query;
    const page = (request.query as { page: number }).page || 1;

    try {
      const res = await animefox.search(query, page);
      reply.status(200).send(res);
    } catch (err: any) {
      reply.status(500).send({ message: err.message });
    }
  });

  fastify.get('/info/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const animefox = getAnimeFox();
    const id = decodeURIComponent((request.params as { id: string }).id);

    try {
      const res = await animefox.fetchAnimeInfo(id);
      reply.status(200).send(res);
    } catch (err: any) {
      reply.status(404).send({ message: err.message });
    }
  });

  fastify.get('/watch/:episodeId', async (request: FastifyRequest, reply: FastifyReply) => {
    const animefox = getAnimeFox();
    const episodeId = (request.params as { episodeId: string }).episodeId;

    try {
      const res = await animefox.fetchEpisodeSources(episodeId);
      reply.status(200).send(res);
    } catch (err: any) {
      reply.status(404).send({ message: err.message });
    }
  });
};

export default routes;
