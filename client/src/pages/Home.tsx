import { useState, useEffect, useMemo } from 'react';
import { searchManga, getTrending, MangaSummary, TrendingData } from '../lib/api';
import { getLibrary, getAllProgress, LibraryEntry, ProgressEntry } from '../lib/userApi';
import SearchBar from '../components/SearchBar';
import MangaGrid from '../components/MangaGrid';
import MangaCard from '../components/MangaCard';
import SettingsPanel from '../components/SettingsPanel';

type Tab = 'library' | 'search' | 'discover';
type StatusFilter = 'all' | 'ongoing' | 'completed';

function ShelfRow({ title, manga, progress }: { title: string; manga: MangaSummary[]; progress?: Record<string, ProgressEntry> }) {
  if (manga.length === 0) return null;
  return (
    <div className="mb-8">
      <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--muted)' }}>
        {title}
      </h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {manga.slice(0, 12).map((m) => (
          <MangaCard key={m.id} manga={m} lastChapter={progress?.[m.id]?.chapter_number} />
        ))}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-2 h-2 rounded-full animate-bounce"
            style={{ backgroundColor: 'var(--accent)', animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [tab, setTab] = useState<Tab>('library');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MangaSummary[]>([]);
  const [library, setLibrary] = useState<LibraryEntry[]>([]);
  const [allProgress, setAllProgress] = useState<Record<string, ProgressEntry>>({});
  const [trending, setTrending] = useState<TrendingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Library filters
  const [libSearch, setLibSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    Promise.all([getLibrary(), getAllProgress()])
      .then(([lib, prog]) => { setLibrary(lib); setAllProgress(prog); })
      .catch(() => null);
  }, []);

  useEffect(() => {
    if (tab !== 'discover' || trending) return;
    setTrendingLoading(true);
    getTrending().then(setTrending).catch(() => null).finally(() => setTrendingLoading(false));
  }, [tab, trending]);

  async function handleSearch(q: string) {
    setQuery(q);
    setTab('search');
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      setResults(await searchManga(q));
    } catch {
      setError('Search failed — try again.');
    } finally {
      setLoading(false);
    }
  }

  const libraryAsManga: MangaSummary[] = library.map((e) => ({
    id: e.manga_id,
    source: e.source ?? 'mangadex',
    title: e.title,
    cover: e.cover,
    status: e.status,
    tags: [],
    description: '',
  }));

  const filteredLibrary = useMemo(() => {
    return libraryAsManga.filter((m) => {
      if (libSearch && !m.title.toLowerCase().includes(libSearch.toLowerCase())) return false;
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      return true;
    });
  }, [libraryAsManga, libSearch, statusFilter]);

  // Continue Reading: library items with progress, sorted by most recently read
  const continueReading = useMemo(() => {
    return libraryAsManga
      .filter((m) => allProgress[m.id])
      .sort((a, b) => (allProgress[b.id]?.updated_at ?? 0) - (allProgress[a.id]?.updated_at ?? 0))
      .slice(0, 12);
  }, [libraryAsManga, allProgress]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <header
        className="sticky top-0 z-10"
        style={{ backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)', paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <span
            className="text-base font-bold shrink-0 hidden sm:block"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            MangaReader
          </span>
          <SearchBar onSearch={handleSearch} initialValue={query} />
          <button
            onClick={() => setSettingsOpen(true)}
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
            style={{ backgroundColor: 'var(--card)', color: 'var(--muted)' }}
            title="Settings"
          >
            ⚙
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-4 flex gap-1">
          {(['library', 'discover', 'search'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-2.5 text-sm font-medium border-b-2 transition-all capitalize"
              style={{
                borderColor: tab === t ? 'var(--accent)' : 'transparent',
                color: tab === t ? 'var(--accent)' : 'var(--muted)',
              }}
            >
              {t}
              {t === 'library' && library.length > 0 && (
                <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--card)', color: 'var(--muted)' }}>
                  {library.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">

        {/* ── Library ─────────────────────────────────────────── */}
        {tab === 'library' && (
          library.length === 0 ? (
            <div className="text-center py-32">
              <p className="text-5xl mb-4 opacity-30">📚</p>
              <p className="text-lg font-semibold mb-1" style={{ color: 'var(--text)' }}>Your library is empty</p>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>Search for manga and add them to your library</p>
            </div>
          ) : (
            <>
              {/* Search + filter bar */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <input
                  type="text"
                  placeholder="Filter library…"
                  value={libSearch}
                  onChange={(e) => setLibSearch(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{
                    backgroundColor: 'var(--card)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                  }}
                />
                <div className="flex gap-1.5">
                  {(['all', 'ongoing', 'completed'] as StatusFilter[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold transition-all capitalize"
                      style={{
                        backgroundColor: statusFilter === s ? 'var(--accent)' : 'var(--card)',
                        color: statusFilter === s ? 'var(--bg)' : 'var(--muted)',
                        border: `1px solid ${statusFilter === s ? 'var(--accent)' : 'var(--border)'}`,
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {filteredLibrary.length === 0 ? (
                <p className="text-center py-20 text-sm" style={{ color: 'var(--muted)' }}>
                  No manga match your filter
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 sm:gap-4">
                  {filteredLibrary.map((m) => (
                    <MangaCard key={m.id} manga={m} lastChapter={allProgress[m.id]?.chapter_number} />
                  ))}
                </div>
              )}
            </>
          )
        )}

        {/* ── Discover ────────────────────────────────────────── */}
        {tab === 'discover' && (
          <>
            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { label: 'In Library', value: library.length },
                { label: 'Reading', value: Object.keys(allProgress).length },
                { label: 'Completed', value: library.filter((e) => e.status === 'completed').length },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl p-4 text-center"
                  style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                  <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{value}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Continue Reading */}
            {continueReading.length > 0 && (
              <ShelfRow title="Continue Reading" manga={continueReading} progress={allProgress} />
            )}

            {/* Trending */}
            {trendingLoading && <Spinner />}
            {trending && (
              <>
                <ShelfRow title="Top Rated" manga={trending.topRated} />
                <ShelfRow title="Recently Updated (EN)" manga={trending.recentlyUpdated} />
              </>
            )}
          </>
        )}

        {/* ── Search ──────────────────────────────────────────── */}
        {tab === 'search' && (
          <>
            {!searched && (
              <div className="text-center py-32">
                <p className="text-5xl mb-4 opacity-30">🔍</p>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>Search for any manga above</p>
              </div>
            )}
            {loading && <Spinner />}
            {error && <p className="text-center py-12 text-sm" style={{ color: 'var(--red)' }}>{error}</p>}
            {!loading && results.length > 0 && (
              <>
                <p className="text-xs mb-5" style={{ color: 'var(--muted)' }}>
                  {results.length} results for <span style={{ color: 'var(--text)' }}>"{query}"</span>
                </p>
                <MangaGrid manga={results} />
              </>
            )}
            {!loading && searched && results.length === 0 && !error && (
              <p className="text-center py-32 text-sm" style={{ color: 'var(--muted)' }}>
                No results for "{query}"
              </p>
            )}
          </>
        )}
      </main>

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
