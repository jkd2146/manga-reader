import { Router, Request, Response } from 'express';
import { db } from '../db';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json(db.library.getAll());
});

router.post('/', (req: Request, res: Response) => {
  const { manga_id, title, cover, status } = req.body as Record<string, string>;
  if (!manga_id || !title) {
    res.status(400).json({ error: 'manga_id and title are required' });
    return;
  }
  db.library.add({ manga_id, title, cover: cover ?? '', status: status ?? 'unknown' });
  res.json({ ok: true });
});

router.delete('/:id', (req: Request, res: Response) => {
  db.library.remove(req.params.id);
  res.json({ ok: true });
});

export default router;
