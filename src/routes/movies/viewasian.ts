import { FastifyRequest, FastifyReply, FastifyInstance, RegisterOptions } from 'fastify';
import { PROVIDERS_LIST } from '@consumet/extensions';

const routes = async (fastify: FastifyInstance, options: RegisterOptions) => {
  const getViewAsian = () => {
    return (
      PROVIDERS_LIST.MOVIES?.find(
        (p: any) => p?.name?.toLowerCase() === 'viewasian'
      ) || PROVIDERS_LIST.MOVIES?.[0]
    );
  };

  fastify.get('/', async (_, reply) => {
    reply.status(200).send({
      intro: 'Welcome to the ViewAsian movie/drama provider',
      routes: ['/:query', '/info', '/watch'],
    });
  });

  fastify.get('/:query', async (request: FastifyRequest, reply: FastifyReply) => {
    const viewAsian = getViewAsian();
    const query = (request.params as { query: string }).query;
    const page = (request.query as { page: number }).page || 1;

    try {
      const res = await viewAsian.search(query, page);
      reply.status(200).send(res);
    } catch (err: any) {
      reply.status(500).send({ message: err.message });
    }
  });

  fastify.get('/info', async (request: FastifyRequest, reply: FastifyReply) => {
    const viewAsian = getViewAsian();
    const id = (request.query as { id: string }).id;

    try {
      const res = await viewAsian.fetchMediaInfo(id);
      reply.status(200).send(res);
    } catch (err: any) {
      reply.status(404).send({ message: err.message });
    }
  });

  fastify.get('/watch', async (request: FastifyRequest, reply: FastifyReply) => {
    const viewAsian = getViewAsian();
    const episodeId = (request.query as { episodeId: string }).episodeId;
    const mediaId = (request.query as { mediaId: string }).mediaId;

    try {
      const res = await viewAsian.fetchEpisodeSources(episodeId, mediaId);
      reply.status(200).send(res);
    } catch (err: any) {
      reply.status(404).send({ message: err.message });
    }
  });
};

export default routes;
    
