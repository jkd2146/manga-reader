import axios from 'axios';
import type { Source, MangaSummary, Chapter, MangaDetail, ChapterPages } from './source';

const client = axios.create({
  baseURL: 'https://api.comick.io',
  timeout: 20000,
  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MangaReader/1.0)' },
});

function comickStatus(code: number): string {
  if (code === 1) return 'ongoing';
  if (code === 2) return 'completed';
  if (code === 3) return 'cancelled';
  if (code === 4) return 'hiatus';
  return 'unknown';
}

function buildCover(comic: Record<string, unknown>): string {
  const covers = comic.md_covers as Array<Record<string, string>> | undefined;
  if (covers && covers.length > 0 && covers[0].b2key) {
    return `https://meo.comick.pictures/${covers[0].b2key}`;
  }
  return (comic.cover_url as string) ?? '';
}

async function fetchChapterPage(
  hid: string,
  page: number
): Promise<{ chapters: Chapter[]; total: number }> {
  const res = await client.get(`/comic/${hid}/chapters`, {
    params: { lang: 'en', page, limit: 300, tachiyomi: true },
  });
  const data = res.data as { chapters: Array<Record<string, unknown>>; total: number };
  const chapters: Chapter[] = (data.chapters ?? []).map((ch) => ({
    id: ch.hid as string,
    number: (ch.chap as string) ?? '0',
    title: (ch.title as string | null) ?? null,
    publishAt: (ch.created_at as string) ?? '',
    language: (ch.lang as string) ?? 'en',
  }));
  return { chapters, total: data.total ?? 0 };
}

async function fetchAllChapters(hid: string): Promise<Chapter[]> {
  const all: Chapter[] = [];
  let page = 0;
  while (true) {
    const { chapters, total } = await fetchChapterPage(hid, page);
    all.push(...chapters);
    page++;
    if (all.length >= total || chapters.length === 0) break;
  }
  return all.sort((a, b) => parseFloat(a.number) - parseFloat(b.number));
}

export const comickSource: Source = {
  async search(query, page = 1, limit = 24) {
    const res = await client.get('/v1.0/search', {
      params: { q: query, limit, page: page - 1, tachiyomi: true },
    });
    const items = res.data as Array<Record<string, unknown>>;
    return items.map((m) => ({
      id: m.hid as string,
      title: m.title as string,
      cover: (m.cover_url as string) ?? '',
      status: comickStatus(m.status as number),
      tags: ((m.genres as string[]) ?? []),
      description: (m.desc as string) ?? '',
    }));
  },

  async getManga(id) {
    const [comicRes, chapters] = await Promise.all([
      client.get(`/comic/${id}`, { params: { tachiyomi: true } }),
      fetchAllChapters(id),
    ]);
    const comic = (comicRes.data as Record<string, unknown>).comic as Record<string, unknown>;
    const genres = ((comic.md_genres as Array<{ name: string }>) ?? []).map((g) => g.name);
    return {
      id: comic.hid as string,
      title: comic.title as string,
      cover: buildCover(comic),
      status: comickStatus(comic.status as number),
      tags: genres,
      description: (comic.desc as string) ?? '',
      chapters,
    };
  },

  async getChapterPages(chapterId) {
    const res = await client.get(`/chapter/${chapterId}`, { params: { tachiyomi: true } });
    const chapter = (res.data as Record<string, unknown>).chapter as Record<string, unknown>;
    const images = (chapter.images as Array<{ url: string }>) ?? [];
    return { chapterId, pages: images.map((img) => img.url) };
  },
};
