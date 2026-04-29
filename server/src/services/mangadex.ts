import axios from 'axios';

const client = axios.create({
  baseURL: 'https://api.mangadex.org',
  timeout: 15000,
});

const COVERS_BASE = 'https://uploads.mangadex.org/covers';

export interface MangaSummary {
  id: string;
  title: string;
  cover: string;
  status: string;
  tags: string[];
  description: string;
}

export interface Chapter {
  id: string;
  number: string;
  title: string | null;
  publishAt: string;
  language: string;
}

export interface MangaDetail extends MangaSummary {
  chapters: Chapter[];
}

export interface ChapterPages {
  chapterId: string;
  pages: string[];
}

function pickTitle(attributes: Record<string, unknown>): string {
  const t = attributes.title as Record<string, string> | undefined;
  if (!t) return 'Unknown';
  return t['en'] ?? t['ja-ro'] ?? (Object.values(t)[0] as string) ?? 'Unknown';
}

function pickDescription(attributes: Record<string, unknown>): string {
  const d = attributes.description as Record<string, string> | undefined;
  if (!d) return '';
  return d['en'] ?? (Object.values(d)[0] as string) ?? '';
}

function coverUrl(mangaId: string, relationships: Array<Record<string, unknown>>): string {
  const rel = relationships?.find((r) => r.type === 'cover_art') as
    | { attributes?: { fileName?: string } }
    | undefined;
  const file = rel?.attributes?.fileName;
  return file ? `${COVERS_BASE}/${mangaId}/${file}.512.jpg` : '';
}

export async function search(query: string, page = 1, limit = 24): Promise<MangaSummary[]> {
  const res = await client.get('/manga', {
    params: {
      title: query,
      limit,
      offset: (page - 1) * limit,
      includes: ['cover_art'],
      'order[relevance]': 'desc',
      'contentRating[]': ['safe', 'suggestive', 'erotica'],
    },
  });

  return res.data.data.map((m: Record<string, unknown>) => {
    const attrs = m.attributes as Record<string, unknown>;
    const rels = m.relationships as Array<Record<string, unknown>>;
    return {
      id: m.id as string,
      title: pickTitle(attrs),
      cover: coverUrl(m.id as string, rels),
      status: (attrs.status as string) ?? 'unknown',
      tags: ((attrs.tags as Array<Record<string, unknown>>) ?? [])
        .map((t) => {
          const ta = t.attributes as Record<string, Record<string, string>>;
          return ta?.name?.en;
        })
        .filter(Boolean),
      description: pickDescription(attrs),
    };
  });
}

/** Fetch one batch of chapters, optionally filtered by language. */
async function fetchChapterBatch(
  mangaId: string,
  offset: number,
  lang?: string
): Promise<{ chapters: Chapter[]; total: number }> {
  const params: Record<string, unknown> = {
    'order[chapter]': 'asc',
    'order[volume]': 'asc',
    limit: 500,
    offset,
  };
  if (lang) params['translatedLanguage[]'] = lang;

  const res = await client.get(`/manga/${mangaId}/feed`, { params });
  const { data, total } = res.data as { data: Array<Record<string, unknown>>; total: number };

  const chapters: Chapter[] = [];
  for (const ch of data) {
    const ca = ch.attributes as Record<string, unknown>;
    // Skip external chapters (MangaPlus etc.) — they have no pages on MangaDex's CDN
    if (ca.externalUrl) continue;
    chapters.push({
      id: ch.id as string,
      number: (ca.chapter as string) ?? '0',
      title: (ca.title as string | null) ?? null,
      publishAt: ca.publishAt as string,
      language: (ca.translatedLanguage as string) ?? 'unknown',
    });
  }

  return { chapters, total };
}

/** Paginate through all chapters for a given language (or all languages). */
async function fetchAllChapters(mangaId: string, lang?: string): Promise<Chapter[]> {
  const all: Chapter[] = [];
  let offset = 0;

  while (true) {
    const { chapters, total } = await fetchChapterBatch(mangaId, offset, lang);
    all.push(...chapters);
    offset += 500; // advance by the raw batch size, not just non-external
    if (offset >= total) break;
  }

  return all;
}

/** Deduplicate chapters by number, keeping the preferred entry. */
function deduplicate(chapters: Chapter[]): Chapter[] {
  const best = new Map<string, Chapter>();
  for (const ch of chapters) {
    const existing = best.get(ch.number);
    if (!existing) {
      best.set(ch.number, ch);
      continue;
    }
    // Prefer English over other languages
    if (ch.language === 'en' && existing.language !== 'en') {
      best.set(ch.number, ch);
    }
  }
  return Array.from(best.values());
}

export async function getManga(id: string): Promise<MangaDetail> {
  const [infoRes, englishChapters] = await Promise.all([
    client.get(`/manga/${id}`, { params: { includes: ['cover_art'] } }),
    fetchAllChapters(id, 'en'),
  ]);

  // Fall back to all languages only when no English chapters exist at all
  // (e.g. Naruto — most EN chapters have been DMCA'd from MangaDex)
  let raw = englishChapters;
  if (raw.length === 0) {
    raw = await fetchAllChapters(id);
  }

  const chapters = deduplicate(raw);

  const m = infoRes.data.data;
  const attrs = m.attributes as Record<string, unknown>;
  const rels = m.relationships as Array<Record<string, unknown>>;

  return {
    id: m.id as string,
    title: pickTitle(attrs),
    cover: coverUrl(m.id as string, rels),
    status: (attrs.status as string) ?? 'unknown',
    tags: ((attrs.tags as Array<Record<string, unknown>>) ?? [])
      .map((t) => {
        const ta = t.attributes as Record<string, Record<string, string>>;
        return ta?.name?.en;
      })
      .filter(Boolean),
    description: pickDescription(attrs),
    chapters,
  };
}

export async function getChapterPages(chapterId: string): Promise<ChapterPages> {
  const res = await client.get(`/at-home/server/${chapterId}`);
  const { baseUrl, chapter } = res.data as {
    baseUrl: string;
    chapter: { hash: string; data: string[] };
  };
  const pages = (chapter.data ?? []).map((f) => `${baseUrl}/data/${chapter.hash}/${f}`);
  return { chapterId, pages };
}
