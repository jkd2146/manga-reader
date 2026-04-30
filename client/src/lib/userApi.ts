const API_BASE = import.meta.env.VITE_API_URL ?? '';

export interface LibraryEntry {
  manga_id: string;
  source: string;
  title: string;
  cover: string;
  status: string;
  added_at: number;
}

export interface ProgressEntry {
  chapter_id: string;
  chapter_number: string;
  updated_at: number;
}

export async function getLibrary(): Promise<LibraryEntry[]> {
  const res = await fetch(`${API_BASE}/api/library`);
  if (!res.ok) return [];
  return res.json() as Promise<LibraryEntry[]>;
}

export async function addToLibrary(entry: Omit<LibraryEntry, 'added_at'>): Promise<void> {
  await fetch(`${API_BASE}/api/library`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
}

export async function removeFromLibrary(mangaId: string): Promise<void> {
  await fetch(`${API_BASE}/api/library/${mangaId}`, { method: 'DELETE' });
}

export async function getAllProgress(): Promise<Record<string, ProgressEntry>> {
  const res = await fetch(`${API_BASE}/api/progress`);
  if (!res.ok) return {};
  return res.json() as Promise<Record<string, ProgressEntry>>;
}

export async function getProgress(mangaId: string): Promise<ProgressEntry | null> {
  const res = await fetch(`${API_BASE}/api/progress/${mangaId}`);
  if (!res.ok) return null;
  return res.json() as Promise<ProgressEntry | null>;
}

export async function saveProgress(
  mangaId: string,
  chapterId: string,
  chapterNumber: string
): Promise<void> {
  await fetch(`${API_BASE}/api/progress/${mangaId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chapter_id: chapterId, chapter_number: chapterNumber }),
  });
}
