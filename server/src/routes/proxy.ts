import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const url = req.query.url as string;
  if (!url) {
    res.status(400).json({ error: 'URL is required' });
    return;
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    res.status(400).json({ error: 'Invalid URL' });
    return;
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    res.status(400).json({ error: 'Only http/https allowed' });
    return;
  }

  const referer = parsed.hostname.includes('comick') ? 'https://comick.io' : 'https://mangadex.org';

  try {
    const upstream = await axios.get(url, {
      responseType: 'stream',
      timeout: 20000,
      headers: {
        Referer: referer,
        'User-Agent': 'Mozilla/5.0 (compatible; MangaReader/1.0)',
      },
    });

    const ct = upstream.headers['content-type'];
    res.setHeader('Content-Type', typeof ct === 'string' ? ct : 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    (upstream.data as NodeJS.ReadableStream).pipe(res);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(502).json({ error: 'Failed to fetch image' });
  }
});

export default router;
