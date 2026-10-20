import { FastifyRequest, FastifyReply, FastifyInstance, RegisterOptions } from 'fastify';
import axios from 'axios';
import * as cheerio from 'cheerio';

const FZ_BASE_URL = 'https://fzmovie.web.za';

const routes = async (fastify: FastifyInstance, options: RegisterOptions) => {
  
  fastify.get('/', async (_, reply) => {
    reply.status(200).send({
      intro: 'FzMovies Scraper Service',
      usage: '/search/:query',
    });
  });

  // Search Route with Fallback Handling
  fastify.get('/search/:query', async (request: FastifyRequest, reply: FastifyReply) => {
    const query = (request.params as { query: string }).query;

    try {
      // Modern FzMovies search format
      const searchUrl = `${FZ_BASE_URL}/search.php?searchkey=${encodeURIComponent(query)}&searchby=name&submit=Search`;
      
      const { data } = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Referer': FZ_BASE_URL,
        },
        timeout: 10000,
      });

      const $ = cheerio.load(data);
      const results: any[] = [];

      $('.movielist, .mainbox, tr, td').each((_, element) => {
        const titleElement = $(element).find('a').first();
        const title = titleElement.text().trim();
        const relativeLink = titleElement.attr('href');

        if (title && relativeLink && (relativeLink.includes('movie') || relativeLink.includes('id='))) {
          results.push({
            title,
            id: relativeLink,
            url: relativeLink.startsWith('http') ? relativeLink : `${FZ_BASE_URL}/${relativeLink}`,
          });
        }
      });

      reply.status(200).send({
        keyword: query,
        total: results.length,
        results: results.length > 0 ? results : [
          {
            title: `${query} (Direct Search on FzMovies)`,
            url: `${FZ_BASE_URL}/search.php?searchkey=${encodeURIComponent(query)}`
          }
        ],
      });

    } catch (err: any) {
      // If direct GET returns 410 or block, return fallback search URL for frontend consumption
      reply.status(200).send({
        keyword: query,
        total: 1,
        results: [
          {
            title: `Search "${query}" directly on FzMovies`,
            url: `${FZ_BASE_URL}/search.php?searchkey=${encodeURIComponent(query)}`
          }
        ]
      });
    }
  });
};

export default routes;
            
