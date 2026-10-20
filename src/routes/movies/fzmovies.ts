import { FastifyRequest, FastifyReply, FastifyInstance, RegisterOptions } from 'fastify';
import axios from 'axios';
import * as cheerio from 'cheerio';

const FZ_BASE_URL = 'https://fzmovie.web.za';

const routes = async (fastify: FastifyInstance, options: RegisterOptions) => {
  
  // Root info endpoint
  fastify.get('/', async (_, reply) => {
    reply.status(200).send({
      intro: 'Welcome to the custom FzMovies scraper route',
      usage: '/search/:query',
    });
  });

  // Search Route
  fastify.get('/search/:query', async (request: FastifyRequest, reply: FastifyReply) => {
    const query = (request.params as { query: string }).query;

    try {
      const searchUrl = `${FZ_BASE_URL}/search.php?search=${encodeURIComponent(query)}`;
      
      const { data } = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': FZ_BASE_URL,
        },
      });

      const $ = cheerio.load(data);
      const results: any[] = [];

      // Parse search results from FzMovies HTML
      $('.movielist, .mainbox, .search-item').each((_, element) => {
        const titleElement = $(element).find('a');
        const title = titleElement.text().trim();
        const relativeLink = titleElement.attr('href');
        const img = $(element).find('img').attr('src');

        if (title && relativeLink) {
          results.push({
            title,
            id: relativeLink,
            url: relativeLink.startsWith('http') ? relativeLink : `${FZ_BASE_URL}/${relativeLink}`,
            poster: img ? (img.startsWith('http') ? img : `${FZ_BASE_URL}/${img}`) : null,
          });
        }
      });

      reply.status(200).send({
        keyword: query,
        total: results.length,
        results,
      });

    } catch (err: any) {
      reply.status(500).send({
        message: 'Failed to scrape FzMovies search results',
        error: err.message,
      });
    }
  });
};

export default routes;
  
