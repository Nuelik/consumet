import { FastifyRequest, FastifyReply, FastifyInstance, RegisterOptions } from 'fastify';
import { PROVIDERS_LIST } from '@consumet/extensions';

const routes = async (fastify: FastifyInstance, options: RegisterOptions) => {
  const getSFlix = () => {
    return (
      PROVIDERS_LIST.MOVIES?.find(
        (p: any) => p?.name?.toLowerCase() === 'sflix'
      ) || PROVIDERS_LIST.MOVIES?.[0]
    );
  };

  fastify.get('/', async (_, reply) => {
    reply.status(200).send({
      intro: 'Welcome to the SFlix movie provider',
      routes: ['/:query', '/info', '/watch'],
    });
  });

  fastify.get('/:query', async (request: FastifyRequest, reply: FastifyReply) => {
    const sflix = getSFlix();
    const query = (request.params as { query: string }).query;
    const page = (request.query as { page: number }).page || 1;

    try {
      const res = await sflix.search(query, page);
      reply.status(200).send(res);
    } catch (err: any) {
      reply.status(500).send({ message: err.message });
    }
  });

  fastify.get('/info', async (request: FastifyRequest, reply: FastifyReply) => {
    const sflix = getSFlix();
    const id = (request.query as { id: string }).id;

    try {
      const res = await sflix.fetchMediaInfo(id);
      reply.status(200).send(res);
    } catch (err: any) {
      reply.status(404).send({ message: err.message });
    }
  });

  fastify.get('/watch', async (request: FastifyRequest, reply: FastifyReply) => {
    const sflix = getSFlix();
    const episodeId = (request.query as { episodeId: string }).episodeId;
    const mediaId = (request.query as { mediaId: string }).mediaId;

    try {
      const res = await sflix.fetchEpisodeSources(episodeId, mediaId);
      reply.status(200).send(res);
    } catch (err: any) {
      reply.status(404).send({ message: err.message });
    }
  });
};

export default routes;
