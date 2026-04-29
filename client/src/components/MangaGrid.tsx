import { MangaSummary } from '../lib/api';
import MangaCard from './MangaCard';

export default function MangaGrid({ manga }: { manga: MangaSummary[] }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 sm:gap-4">
      {manga.map((m) => (
        <MangaCard key={m.id} manga={m} />
      ))}
    </div>
  );
}
