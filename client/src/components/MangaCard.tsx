import { Link } from 'react-router-dom';
import { MangaSummary, proxyImage } from '../lib/api';

export default function MangaCard({ manga }: { manga: MangaSummary }) {
  return (
    <Link to={`/manga/${manga.id}`} className="group block">
      <div
        className="relative aspect-[3/4] overflow-hidden rounded-xl transition-transform duration-200 group-hover:-translate-y-1"
        style={{ backgroundColor: 'var(--card)', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}
      >
        {manga.cover ? (
          <img
            src={proxyImage(manga.cover)}
            alt={manga.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">📖</div>
        )}

        {/* Bottom gradient with status */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/90 to-transparent" />
        <div className="absolute bottom-2 left-2">
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
            style={{
              backgroundColor: manga.status === 'ongoing' ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.12)',
              color: manga.status === 'ongoing' ? 'var(--green)' : 'rgba(255,255,255,0.6)',
              border: `1px solid ${manga.status === 'ongoing' ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.15)'}`,
            }}
          >
            {manga.status}
          </span>
        </div>
      </div>

      <p
        className="mt-2 text-xs font-medium line-clamp-2 leading-snug"
        style={{ color: 'var(--text)' }}
      >
        {manga.title}
      </p>
    </Link>
  );
}
