import { Router, Request, Response } from 'express';
import { getSource } from '../services/registry';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const query = req.query.q as string;
  const page = parseInt(req.query.page as string) || 1;
  const sourceName = (req.query.source as string) || 'mangadex';

  if (!query?.trim()) {
    res.status(400).json({ error: 'Query is required' });
    return;
  }

  try {
    const results = await getSource(sourceName).search(query.trim(), page);
    res.json({ results });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
