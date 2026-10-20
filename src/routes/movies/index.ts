import { FastifyRequest, FastifyReply, FastifyInstance, RegisterOptions } from 'fastify';
import { PROVIDERS_LIST } from '@consumet/extensions';

import flixhq from './flixhq';
import viewasian from './viewasian';
import sflix from './sflix';
import fzmovies from './fzmovies'; // <--- Import your custom scraper

const routes = async (fastify: FastifyInstance, options: RegisterOptions) => {
  await fastify.register(flixhq, { prefix: '/flixhq' });
  await fastify.register(viewasian, { prefix: '/viewasian' });
  await fastify.register(sflix, { prefix: '/sflix' });
  await fastify.register(fzmovies, { prefix: '/fzmovies' }); // <--- Register it here

  fastify.get('/', async (request: any, reply: any) => {
    reply.status(200).send('Welcome to Consumet Movies 🎬');
  });

  fastify.get('/:movieProvider', async (request: FastifyRequest, reply: FastifyReply) => {
    const providerParam = decodeURIComponent(
      (request.params as { movieProvider: string }).movieProvider,
    );

    const provider = PROVIDERS_LIST.MOVIES?.find(
      (p: any) => p?.name?.toLowerCase() === providerParam.toLowerCase(),
    );

    try {
      if (provider) {
        reply.redirect(`/movies/${provider.name.toLowerCase()}`);
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
          
