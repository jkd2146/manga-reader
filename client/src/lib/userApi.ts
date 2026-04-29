const API_BASE = import.meta.env.VITE_API_URL ?? '';

export interface LibraryEntry {
  manga_id: string;
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

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export async function getLibrary(): Promise<LibraryEntry[]> {
  const res = await fetch(`${API_BASE}/api/library`);
  return res.json() as Promise<LibraryEntry[]>;
}

export async function addToLibrary(entry: Omit<LibraryEntry, 'added_at'>): Promise<void> {
  await fetch(`${API_BASE}/api/library`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(entry),
  });
}

export async function removeFromLibrary(mangaId: string): Promise<void> {
  await fetch(`${API_BASE}/api/library/${mangaId}`, { method: 'DELETE' });
}

export async function getProgress(mangaId: string): Promise<ProgressEntry | null> {
  const res = await fetch(`${API_BASE}/api/progress/${mangaId}`);
  return res.json() as Promise<ProgressEntry | null>;
}

export async function saveProgress(
  mangaId: string,
  chapterId: string,
  chapterNumber: string
): Promise<void> {
  await fetch(`${API_BASE}/api/progress/${mangaId}`, {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify({ chapter_id: chapterId, chapter_number: chapterNumber }),
  });
}
