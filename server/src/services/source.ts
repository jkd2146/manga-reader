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

export interface Source {
  search(query: string, page?: number, limit?: number): Promise<MangaSummary[]>;
  getManga(id: string): Promise<MangaDetail>;
  getChapterPages(chapterId: string): Promise<ChapterPages>;
}
