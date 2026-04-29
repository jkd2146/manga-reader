import { Router, Request, Response } from 'express';
import { getSource } from '../services/registry';

const router = Router();

router.get('/:source/:id', async (req: Request, res: Response) => {
  try {
    const manga = await getSource(req.params.source).getManga(req.params.id);
    res.json(manga);
  } catch (err) {
    console.error('Manga fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch manga' });
  }
});

export default router;
