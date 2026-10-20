import { FastifyRequest, FastifyReply, FastifyInstance, RegisterOptions } from 'fastify';
import axios from 'axios';
import * as cheerio from 'cheerio';

const FZ_BASE_URL = 'https://fzmovie.web.za';

const routes = async (fastify: FastifyInstance, options: RegisterOptions) => {
  
  fastify.get('/', async (_, reply) => {
    reply.status(200).send({
      intro: 'FzMovies Custom Scraper Service',
      usage: '/search/:query or /watch?url=...',
    });
  });

  // 1. Search Route: Auto-resolves actual movie page links from search results
  fastify.get('/search/:query', async (request: FastifyRequest, reply: FastifyReply) => {
    const query = (request.params as { query: string }).query;

    try {
      const searchUrl = `${FZ_BASE_URL}/search.php?searchkey=${encodeURIComponent(query)}&searchby=name&submit=Search`;
      
      const { data } = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Referer': FZ_BASE_URL,
        },
        timeout: 10000,
      });

      const $ = cheerio.load(data);
      const results: any[] = [];

      // Parse search list links that point to individual movies
      $('a').each((_, element) => {
        const title = $(element).text().trim();
        const href = $(element).attr('href');

        if (href && title && (href.includes('movie') || href.includes('id=') || href.endsWith('.htm') || href.endsWith('.html'))) {
          // Filter out navigation/footer links and keep movie titles
          if (title.length > 2 && !title.toLowerCase().includes('home') && !title.toLowerCase().includes('search')) {
            const absoluteUrl = href.startsWith('http') ? href : `${FZ_BASE_URL}/${href}`;
            if (!results.some(r => r.url === absoluteUrl)) {
              results.push({
                title,
                url: absoluteUrl,
              });
            }
          }
        }
      });

      reply.status(200).send({
        keyword: query,
        total: results.length,
        results: results.length > 0 ? results : [
          {
            title: `Search results for "${query}"`,
            url: `${FZ_BASE_URL}/search.php?searchkey=${encodeURIComponent(query)}`
          }
        ],
      });

    } catch (err: any) {
      reply.status(500).send({
        message: 'Failed to resolve search results',
        error: err.message,
      });
    }
  });

  // 2. Watch/Download Route: Extracts direct MP4 files from the resolved movie page
  fastify.get('/watch', async (request: FastifyRequest, reply: FastifyReply) => {
    const movieUrl = (request.query as { url: string }).url;

    if (!movieUrl) {
      return reply.status(400).send({ message: 'Movie URL query parameter is required (?url=...)' });
    }

    try {
      const { data } = await axios.get(movieUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': FZ_BASE_URL,
        },
        timeout: 10000,
      });

      const $ = cheerio.load(data);
      const downloadLinks: any[] = [];

      // Look for MP4 or download links on the movie details page
      $('a').each((_, element) => {
        const href = $(element).attr('href');
        const text = $(element).text().trim();
        
        if (href && (href.endsWith('.mp4') || href.includes('download') || text.toLowerCase().includes('download'))) {
          downloadLinks.push({
            quality: text || 'MP4 Download',
            link: href.startsWith('http') ? href : `${FZ_BASE_URL}/${href}`,
          });
        }
      });

      reply.status(200).send({
        source: 'FzMovies',
        originalUrl: movieUrl,
        downloads: downloadLinks,
      });

    } catch (err: any) {
      reply.status(500).send({
        message: 'Failed to extract download links from movie page',
        error: err.message,
      });
    }
  });
};

export default routes;
        
