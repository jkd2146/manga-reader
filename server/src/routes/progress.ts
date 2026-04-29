import { Router, Request, Response } from 'express';
import { db } from '../db';

const router = Router();

router.get('/:mangaId', (req: Request, res: Response) => {
  res.json(db.progress.get(req.params.mangaId));
});

router.put('/:mangaId', (req: Request, res: Response) => {
  const { chapter_id, chapter_number } = req.body as Record<string, string>;
  if (!chapter_id || !chapter_number) {
    res.status(400).json({ error: 'chapter_id and chapter_number are required' });
    return;
  }
  db.progress.set(req.params.mangaId, { chapter_id, chapter_number });
  res.json({ ok: true });
});

export default router;
