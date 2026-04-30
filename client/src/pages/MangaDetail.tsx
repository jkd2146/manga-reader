import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getManga, MangaDetail, proxyImage } from '../lib/api';
import { addToLibrary, removeFromLibrary, getLibrary, getProgress, ProgressEntry } from '../lib/userApi';
import SettingsPanel from '../components/SettingsPanel';

type SortOrder = 'desc' | 'asc';

export default function MangaDetailPage() {
  const { source = 'mangadex', id } = useParams<{ source: string; id: string }>();
  const [manga, setManga] = useState<MangaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [sort, setSort] = useState<SortOrder>('desc');
  const [inLibrary, setInLibrary] = useState(false);
  const [progress, setProgress] = useState<ProgressEntry | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([getManga(source, id), getLibrary(), getProgress(id)])
      .then(([m, lib, prog]) => {
        setManga(m);
        setInLibrary(lib.some((e) => e.manga_id === id && (e.source ?? 'mangadex') === source));
        setProgress(prog);
      })
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false));
  }, [source, id]);

  async function toggleLibrary() {
    if (!manga) return;
    if (inLibrary) {
      await removeFromLibrary(manga.id);
      setInLibrary(false);
    } else {
      await addToLibrary({ manga_id: manga.id, source, title: manga.title, cover: manga.cover, status: manga.status });
      setInLibrary(true);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 rounded-full animate-bounce"
              style={{ backgroundColor: 'var(--accent)', animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !manga) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <p style={{ color: 'var(--red)' }}>{error || 'Not found'}</p>
      </div>
    );
  }

  const sorted = sort === 'desc'
    ? [...manga.chapters].reverse()
    : [...manga.chapters];

  const listedChapters = showAll ? sorted : sorted.slice(0, 50);

  const continueChapter = progress
    ? manga.chapters.find((ch) => ch.id === progress.chapter_id)
    : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Nav bar */}
      <div
        className="sticky top-0 z-20"
        style={{ backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)', paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1.5 text-sm font-medium" style={{ color: 'var(--accent)' }}>
            ← Library
          </Link>
          <button
            onClick={() => setSettingsOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-lg"
            style={{ backgroundColor: 'var(--card)', color: 'var(--muted)' }}
          >
            ⚙
          </button>
        </div>
      </div>

      {/* Hero — blurred backdrop */}
      <div className="relative overflow-hidden">
        {manga.cover && (
          <div
            className="absolute inset-0 scale-110"
            style={{
              backgroundImage: `url(${proxyImage(manga.cover)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center 20%',
              filter: 'blur(48px) saturate(1.2)',
              opacity: 0.15,
            }}
          />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 50%, var(--bg) 100%)' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-4 pt-8 pb-10 flex gap-6 sm:gap-8">
          {/* Cover */}
          <div className="shrink-0 w-32 sm:w-44">
            {manga.cover ? (
              <img
                src={proxyImage(manga.cover)}
                alt={manga.title}
                className="w-full rounded-2xl"
                style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}
              />
            ) : (
              <div
                className="w-full aspect-[2/3] rounded-2xl flex items-center justify-center text-4xl opacity-20"
                style={{ backgroundColor: 'var(--card)' }}
              >
                📖
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pt-2">
            <h1 className="text-2xl sm:text-3xl font-bold mb-3 leading-tight" style={{ color: 'var(--text)' }}>
              {manga.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{
                  backgroundColor: manga.status === 'ongoing' ? 'rgba(93,155,107,0.15)' : 'var(--card)',
                  color: manga.status === 'ongoing' ? 'var(--green)' : 'var(--muted)',
                  border: `1px solid ${manga.status === 'ongoing' ? 'rgba(93,155,107,0.3)' : 'var(--border)'}`,
                }}
              >
                {manga.status}
              </span>

              {manga.chapters.length === 0 && (
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor: 'rgba(196,106,106,0.12)',
                    color: 'var(--red)',
                    border: '1px solid rgba(196,106,106,0.25)',
                  }}
                >
                  No EN chapters
                </span>
              )}

              <button
                onClick={toggleLibrary}
                className="text-xs font-semibold px-3 py-1 rounded-full transition-all"
                style={{
                  backgroundColor: inLibrary ? 'rgba(196,106,106,0.12)' : 'rgba(201,168,108,0.12)',
                  color: inLibrary ? 'var(--red)' : 'var(--accent)',
                  border: `1px solid ${inLibrary ? 'rgba(196,106,106,0.25)' : 'rgba(201,168,108,0.25)'}`,
                }}
              >
                {inLibrary ? '− Remove from library' : '+ Add to library'}
              </button>
            </div>

            {manga.chapters.length > 0 && (
              <Link
                to={`/manga/${source}/${manga.id}/chapter/${
                  continueChapter ? continueChapter.id : manga.chapters[0].id
                }`}
                className="inline-flex items-center gap-2 mb-4 px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)', color: 'var(--bg)', boxShadow: '0 4px 20px rgba(201,168,108,0.3)' }}
              >
                {continueChapter
                  ? `▶ Continue — Ch. ${continueChapter.number}`
                  : `▶ Start Reading — Ch. ${manga.chapters[0].number}`}
              </Link>
            )}

            {manga.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {manga.tags.slice(0, 10).map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] px-2 py-0.5 rounded-md"
                    style={{ backgroundColor: 'var(--card)', color: 'var(--muted)', border: '1px solid var(--border)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {manga.description && (
              <p className="text-sm leading-relaxed line-clamp-4" style={{ color: 'var(--muted)' }}>
                {manga.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Chapter list */}
      <div className="max-w-5xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold" style={{ color: 'var(--text)' }}>
            Chapters
            <span className="ml-2 text-sm font-normal" style={{ color: 'var(--muted)' }}>({manga.chapters.length})</span>
          </h2>

          {manga.chapters.length > 1 && (
            <div
              className="flex items-center gap-0.5 p-0.5 rounded-lg"
              style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
            >
              {(['desc', 'asc'] as SortOrder[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  className="px-3 py-1 text-xs font-semibold rounded-md transition-all"
                  style={{
                    backgroundColor: sort === s ? 'var(--accent)' : 'transparent',
                    color: sort === s ? 'var(--bg)' : 'var(--muted)',
                  }}
                >
                  {s === 'desc' ? 'Newest' : 'Oldest'}
                </button>
              ))}
            </div>
          )}
        </div>

        {manga.chapters.length === 0 ? (
          <div
            className="rounded-xl px-6 py-10 text-center"
            style={{ border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}
          >
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
              No English chapters available
            </p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
              This title has no readable English chapters on MangaDex — likely due to publisher DMCA takedowns. Try reading on the official publisher site.
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              {listedChapters.map((ch, idx) => {
                const isCurrent = continueChapter?.id === ch.id;
                return (
                  <Link
                    key={ch.id}
                    to={`/manga/${source}/${manga.id}/chapter/${ch.id}`}
                    className="flex items-center justify-between px-4 py-3.5 transition-colors group"
                    style={{
                      backgroundColor: isCurrent ? 'rgba(201,168,108,0.08)' : 'var(--surface)',
                      borderTop: idx === 0 ? 'none' : '1px solid var(--border)',
                    }}
                    onMouseEnter={(e) => { if (!isCurrent) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--card)'; }}
                    onMouseLeave={(e) => { if (!isCurrent) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface)'; }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isCurrent && (
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--accent)' }} />
                      )}
                      <span className="text-sm truncate" style={{ color: isCurrent ? 'var(--accent)' : 'var(--text)' }}>
                        Ch. {ch.number}
                        {ch.title && <span style={{ color: 'var(--muted)' }}> — {ch.title}</span>}
                      </span>
                    </div>
                    <span className="text-xs shrink-0 ml-4" style={{ color: 'var(--muted)' }}>
                      {new Date(ch.publishAt).toLocaleDateString()}
                    </span>
                  </Link>
                );
              })}
            </div>

            {manga.chapters.length > 50 && (
              <button
                onClick={() => setShowAll((v) => !v)}
                className="mt-3 w-full py-3 rounded-xl text-sm font-medium transition-colors"
                style={{ backgroundColor: 'var(--card)', color: 'var(--muted)', border: '1px solid var(--border)' }}
              >
                {showAll ? 'Show fewer chapters' : `Show all ${manga.chapters.length} chapters`}
              </button>
            )}
          </>
        )}
      </div>

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
