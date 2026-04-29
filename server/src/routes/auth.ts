import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../middleware/auth';

const router = Router();
const PASSWORD = process.env.READER_PASSWORD ?? 'manga';

router.post('/login', (req: Request, res: Response) => {
  const { password } = req.body as { password?: string };
  if (!password || password !== PASSWORD) {
    res.status(401).json({ error: 'Invalid password' });
    return;
  }
  const token = jwt.sign({ user: 'reader' }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token });
});

export default router;
