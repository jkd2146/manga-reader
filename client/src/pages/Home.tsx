import { useState, useEffect } from 'react';
import { searchManga, MangaSummary } from '../lib/api';
import { getLibrary, LibraryEntry } from '../lib/userApi';
import SearchBar from '../components/SearchBar';
import MangaGrid from '../components/MangaGrid';
import SettingsPanel from '../components/SettingsPanel';

type Tab = 'library' | 'search';

export default function Home() {
  const [tab, setTab] = useState<Tab>('library');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MangaSummary[]>([]);
  const [library, setLibrary] = useState<LibraryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => { getLibrary().then(setLibrary).catch(() => null); }, []);

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
    id: e.manga_id, title: e.title, cover: e.cover,
    status: e.status, tags: [], description: '',
  }));

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10"
        style={{ backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Logo */}
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

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 flex gap-1">
          {(['library', 'search'] as Tab[]).map((t) => (
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
                <span
                  className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--card)', color: 'var(--muted)' }}
                >
                  {library.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Library */}
        {tab === 'library' && (
          library.length === 0 ? (
            <div className="text-center py-32">
              <p className="text-5xl mb-4 opacity-30">📚</p>
              <p className="text-lg font-semibold mb-1" style={{ color: 'var(--text)' }}>Your library is empty</p>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>Search for manga and add them to your library</p>
            </div>
          ) : (
            <MangaGrid manga={libraryAsManga} />
          )
        )}

        {/* Search */}
        {tab === 'search' && (
          <>
            {!searched && (
              <div className="text-center py-32">
                <p className="text-5xl mb-4 opacity-30">🔍</p>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>Search for any manga above</p>
              </div>
            )}
            {loading && (
              <div className="flex justify-center py-32">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ backgroundColor: 'var(--accent)', animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
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
