// In dev: '' (Vite proxy routes /api → localhost:3001)
// In production: set VITE_API_URL=https://your-backend.onrender.com
const API_BASE = import.meta.env.VITE_API_URL ?? '';

export interface MangaSummary {
  id: string;
  source: string;
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

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export async function searchManga(query: string, page = 1, source = 'mangadex'): Promise<MangaSummary[]> {
  const data = await apiFetch<{ results: MangaSummary[] }>(
    `/api/search?q=${encodeURIComponent(query)}&page=${page}&source=${source}`
  );
  return data.results.map((r) => ({ ...r, source }));
}

export async function getManga(source: string, id: string): Promise<MangaDetail> {
  return apiFetch<MangaDetail>(`/api/manga/${source}/${encodeURIComponent(id)}`);
}

export async function getChapter(source: string, id: string): Promise<ChapterPages> {
  return apiFetch<ChapterPages>(`/api/chapter/${source}/${encodeURIComponent(id)}`);
}

export function proxyImage(url: string): string {
  return `${API_BASE}/api/proxy?url=${encodeURIComponent(url)}`;
}
