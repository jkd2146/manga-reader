import { Router, Request, Response } from 'express';
import { getChapterPages } from '../services/mangadex';

const router = Router();

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const data = await getChapterPages(req.params.id);
    res.json(data);
  } catch (err) {
    console.error('Chapter fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch chapter' });
  }
});

export default router;
