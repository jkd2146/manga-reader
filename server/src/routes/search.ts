import { Router, Request, Response } from 'express';
import { search } from '../services/mangadex';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const query = req.query.q as string;
  const page = parseInt(req.query.page as string) || 1;

  if (!query?.trim()) {
    res.status(400).json({ error: 'Query is required' });
    return;
  }

  try {
    const results = await search(query.trim(), page);
    res.json({ results });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
