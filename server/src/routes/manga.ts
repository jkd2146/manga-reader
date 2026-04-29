import { Router, Request, Response } from 'express';
import { getManga } from '../services/mangadex';

const router = Router();

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const manga = await getManga(req.params.id);
    res.json(manga);
  } catch (err) {
    console.error('Manga fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch manga' });
  }
});

export default router;
