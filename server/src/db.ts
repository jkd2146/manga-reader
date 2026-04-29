import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const LIBRARY_FILE = path.join(DATA_DIR, 'library.json');
const PROGRESS_FILE = path.join(DATA_DIR, 'progress.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

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

function readJSON<T>(file: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8')) as T;
  } catch {
    return fallback;
  }
}

function writeJSON(file: string, data: unknown) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

export const db = {
  library: {
    getAll(): LibraryEntry[] {
      return readJSON<LibraryEntry[]>(LIBRARY_FILE, []);
    },
    add(entry: Omit<LibraryEntry, 'added_at'>): void {
      const lib = this.getAll().filter((e) => e.manga_id !== entry.manga_id);
      lib.unshift({ ...entry, added_at: Date.now() });
      writeJSON(LIBRARY_FILE, lib);
    },
    remove(mangaId: string): void {
      writeJSON(LIBRARY_FILE, this.getAll().filter((e) => e.manga_id !== mangaId));
    },
    has(mangaId: string): boolean {
      return this.getAll().some((e) => e.manga_id === mangaId);
    },
  },
  progress: {
    getAll(): Record<string, ProgressEntry> {
      return readJSON<Record<string, ProgressEntry>>(PROGRESS_FILE, {});
    },
    get(mangaId: string): ProgressEntry | null {
      return this.getAll()[mangaId] ?? null;
    },
    set(mangaId: string, entry: Omit<ProgressEntry, 'updated_at'>): void {
      const all = this.getAll();
      all[mangaId] = { ...entry, updated_at: Date.now() };
      writeJSON(PROGRESS_FILE, all);
    },
  },
};
