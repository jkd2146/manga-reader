import { Router, Request, Response } from 'express';
import { getSource } from '../services/registry';

const router = Router();

router.get('/:source/:id', async (req: Request, res: Response) => {
  try {
    const data = await getSource(req.params.source).getChapterPages(req.params.id);
    res.json(data);
  } catch (err) {
    console.error('Chapter fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch chapter' });
  }
});

export default router;
