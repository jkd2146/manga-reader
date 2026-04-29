import { search, getManga, getChapterPages } from './mangadex';
import type { Source } from './source';

const mangadexSource: Source = { search, getManga, getChapterPages };

const sources: Record<string, Source> = {
  mangadex: mangadexSource,
};

export function getSource(name: string): Source {
  return sources[name] ?? mangadexSource;
}

export function listSources(): string[] {
  return Object.keys(sources);
}
