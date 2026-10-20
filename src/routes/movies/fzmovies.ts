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

  // Search & Link Resolver Route
  fastify.get('/search/:query', async (request: FastifyRequest, reply: FastifyReply) => {
    const query = (request.params as { query: string }).query;

    try {
      const searchUrl = `${FZ_BASE_URL}/search.php?searchkey=${encodeURIComponent(query)}&searchby=name&submit=Search`;
      
      const { data } = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Referer': FZ_BASE_URL,
        },
        timeout: 8000,
      });

      const $ = cheerio.load(data);
      const results: any[] = [];

      // Extract movie page links
      $('a').each((_, element) => {
        const title = $(element).text().trim();
        const href = $(element).attr('href');

        if (href && (href.includes('movie-') || href.includes('id=') || href.endsWith('.htm') || href.endsWith('.html'))) {
          if (title && !results.some(r => r.url === href)) {
            results.push({
              title: title,
              url: href.startsWith('http') ? href : `${FZ_BASE_URL}/${href}`,
            });
          }
        }
      });

      if (results.length > 0) {
        return reply.status(200).send({
          keyword: query,
          total: results.length,
          results: results,
        });
      }

      // Fallback direct link if scraper encounters protection
      reply.status(200).send({
        keyword: query,
        total: 1,
        results: [
          {
            title: `${query} Download Page`,
            url: `https://fzmovie.web.za/search.php?searchkey=${encodeURIComponent(query)}`
          }
        ],
      });

    } catch (err: any) {
      reply.status(200).send({
        keyword: query,
        total: 1,
        results: [
          {
            title: `${query} Download Page`,
            url: `https://fzmovie.web.za/search.php?searchkey=${encodeURIComponent(query)}`
          }
        ],
      });
    }
  });

  // Direct Redirect Route (Optional: Redirects browser directly to FzMovies target page)
  fastify.get('/download/:query', async (request: FastifyRequest, reply: FastifyReply) => {
    const query = (request.params as { query: string }).query;
    reply.redirect(`https://fzmovie.web.za/search.php?searchkey=${encodeURIComponent(query)}`);
  });
};

export default routes;
                                   
