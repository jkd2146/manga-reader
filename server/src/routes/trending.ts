import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

const client = axios.create({ baseURL: 'https://api.mangadex.org', timeout: 15000 });
const COVERS_BASE = 'https://uploads.mangadex.org/covers';

function coverUrl(mangaId: string, relationships: Array<Record<string, unknown>>): string {
  const rel = relationships?.find((r) => r.type === 'cover_art') as
    | { attributes?: { fileName?: string } } | undefined;
  const file = rel?.attributes?.fileName;
  return file ? `${COVERS_BASE}/${mangaId}/${file}.512.jpg` : '';
}

function pickTitle(attrs: Record<string, unknown>): string {
  const t = attrs.title as Record<string, string> | undefined;
  if (!t) return 'Unknown';
  return t['en'] ?? t['ja-ro'] ?? (Object.values(t)[0] as string) ?? 'Unknown';
}

async function fetchManga(extraParams: Record<string, unknown>) {
  const res = await client.get('/manga', {
    params: {
      limit: 12,
      'includes[]': ['cover_art'],
      'contentRating[]': ['safe', 'suggestive'],
...extraParams,
    },
  });
  return (res.data.data as Array<Record<string, unknown>>).map((m) => {
    const attrs = m.attributes as Record<string, unknown>;
    const rels = m.relationships as Array<Record<string, unknown>>;
    return {
      id: m.id as string,
      source: 'mangadex',
      title: pickTitle(attrs),
      cover: coverUrl(m.id as string, rels),
      status: (attrs.status as string) ?? 'unknown',
      tags: ((attrs.tags as Array<Record<string, unknown>>) ?? [])
        .map((t) => ((t.attributes as Record<string, Record<string, string>>)?.name?.en))
        .filter(Boolean) as string[],
      description: '',
    };
  });
}

router.get('/', async (_req: Request, res: Response) => {
  try {
    const [topRated, recentlyUpdated] = await Promise.all([
      fetchManga({ 'order[rating]': 'desc' }),
      fetchManga({ 'order[latestUploadedChapter]': 'desc' }),
    ]);
    res.json({ topRated, recentlyUpdated });
  } catch (err) {
    console.error('Trending fetch error:', (err as Error).message);
    res.status(500).json({ error: 'Failed to fetch trending' });
  }
});

export default router;
