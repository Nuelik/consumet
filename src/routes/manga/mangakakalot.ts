import { FastifyRequest, FastifyReply, FastifyInstance, RegisterOptions } from 'fastify';
import { PROVIDERS_LIST } from '@consumet/extensions';

const routes = async (fastify: FastifyInstance, options: RegisterOptions) => {
  const getMangakakalot = () => {
    return (
      PROVIDERS_LIST.MANGA?.find(
        (p: any) => p?.name?.toLowerCase() === 'mangakakalot'
      ) || PROVIDERS_LIST.MANGA?.[0]
    );
  };

  fastify.get('/', async (_, reply) => {
    reply.status(200).send({
      intro: 'Welcome to the Mangakakalot provider',
      routes: ['/:query', '/info', '/read'],
    });
  });

  fastify.get('/:query', async (request: FastifyRequest, reply: FastifyReply) => {
    const mangakakalot = getMangakakalot();
    const query = (request.params as { query: string }).query;
    const page = (request.query as { page: number }).page || 1;

    try {
      const res = await mangakakalot.search(query, page);
      reply.status(200).send(res);
    } catch (err: any) {
      reply.status(500).send({ message: err.message });
    }
  });

  fastify.get('/info', async (request: FastifyRequest, reply: FastifyReply) => {
    const mangakakalot = getMangakakalot();
    const id = (request.query as { id: string }).id;

    try {
      const res = await mangakakalot.fetchMangaInfo(id);
      reply.status(200).send(res);
    } catch (err: any) {
      reply.status(404).send({ message: err.message });
    }
  });

  fastify.get('/read', async (request: FastifyRequest, reply: FastifyReply) => {
    const mangakakalot = getMangakakalot();
    const chapterId = (request.query as { chapterId: string }).chapterId;

    try {
      const res = await mangakakalot.fetchChapterPages(chapterId);
      reply.status(200).send(res);
    } catch (err: any) {
      reply.status(404).send({ message: err.message });
    }
  });
};

export default routes;
