import { FastifyRequest, FastifyReply, FastifyInstance, RegisterOptions } from 'fastify';
import axios from 'axios';
import * as cheerio from 'cheerio';

const FZ_BASE_URL = 'https://fzmovie.web.za';

const routes = async (fastify: FastifyInstance, options: RegisterOptions) => {
  
  fastify.get('/', async (_, reply) => {
    reply.status(200).send({
      intro: 'FzMovies Custom Scraper Service',
      usage: '/search/:query',
    });
  });

  // Corrected Search Route using WordPress-style /?s= query format
  fastify.get('/search/:query', async (request: FastifyRequest, reply: FastifyReply) => {
    const query = (request.params as { query: string }).query;

    try {
      const searchUrl = `${FZ_BASE_URL}/?s=${encodeURIComponent(query)}`;
      
      const { data } = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Referer': FZ_BASE_URL,
        },
        timeout: 10000,
      });

      const $ = cheerio.load(data);
      const results: any[] = [];

      // Parse search blocks/cards from the results page
      a.each((_, element) => {
        // Fallback or explicit parsing depending on the item cards
      });

      // Extract links matching movie items
      $('a').each((_, element) => {
        const title = $(element).text().trim();
        const href = $(element).attr('href');

        if (href && title && (href.includes('movie') || href.includes('10749') || href.startsWith(FZ_BASE_URL))) {
          if (title.length > 2 && !title.toLowerCase().includes('home') && !title.toLowerCase().includes('search')) {
            const absoluteUrl = href.startsWith('http') ? href : `${FZ_BASE_URL}${href}`;
            if (!results.some(r => r.url === absoluteUrl)) {
              results.push({ title, url: absoluteUrl });
            }
          }
        }
      });

      reply.status(200).send({
        keyword: query,
        total: results.length,
        results: results.length > 0 ? results : [
          {
            title: `Search Results for "${query}"`,
            url: `${FZ_BASE_URL}/?s=${encodeURIComponent(query)}`
          }
        ],
      });

    } catch (err: any) {
      reply.status(200).send({
        keyword: query,
        total: 1,
        results: [
          {
            title: `Search Results for "${query}"`,
            url: `${FZ_BASE_URL}/?s=${encodeURIComponent(query)}`
          }
        ]
      });
    }
  });
};

export default routes;
              
