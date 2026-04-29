import express from 'express';
import cors from 'cors';
import searchRouter from './routes/search';
import mangaRouter from './routes/manga';
import chapterRouter from './routes/chapter';
import proxyRouter from './routes/proxy';
import authRouter from './routes/auth';
import libraryRouter from './routes/library';
import progressRouter from './routes/progress';

const app = express();
const PORT = process.env.PORT ?? 3001;

// Open CORS for personal LAN/Tailscale use
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/library', libraryRouter);
app.use('/api/progress', progressRouter);
app.use('/api/search', searchRouter);
app.use('/api/manga', mangaRouter);
app.use('/api/chapter', chapterRouter);
app.use('/api/proxy', proxyRouter);

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
