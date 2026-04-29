import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getChapter, getManga, ChapterPages, MangaDetail, proxyImage } from '../lib/api';
import { saveProgress } from '../lib/userApi';
import { useSettings } from '../context/SettingsContext';
import SettingsPanel from '../components/SettingsPanel';
import LongStrip from '../components/reader/LongStrip';
import SinglePage from '../components/reader/SinglePage';
import DoublePage from '../components/reader/DoublePage';

export default function Reader() {
  const { source = 'mangadex', mangaId, chapterId } = useParams<{ source: string; mangaId: string; chapterId: string }>();
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [chapter, setChapter] = useState<ChapterPages | null>(null);
  const [manga, setManga] = useState<MangaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);

  useEffect(() => {
    if (!mangaId) return;
    getManga(source, mangaId).then(setManga).catch(() => null);
  }, [source, mangaId]);

  useEffect(() => {
    if (!chapterId) return;
    setChapter(null);
    setLoading(true);
    setError('');
    window.scrollTo(0, 0);
    getChapter(source, chapterId)
      .then((ch) => {
        setChapter(ch);
        if (mangaId) {
          getManga(source, mangaId).then((m) => {
            const cur = m.chapters.find((c) => c.id === chapterId);
            if (cur) saveProgress(mangaId, chapterId, cur.number).catch(() => null);
          });
        }
      })
      .catch(() => setError('Failed to load chapter'))
      .finally(() => setLoading(false));
  }, [source, chapterId, mangaId]);

  const currentIndex = manga?.chapters.findIndex((ch) => ch.id === chapterId) ?? -1;
  const prevChapter = currentIndex > 0 && manga ? manga.chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex >= 0 && manga && currentIndex < manga.chapters.length - 1
    ? manga.chapters[currentIndex + 1] : null;

  const goToPrev = useCallback(() => {
    if (prevChapter && mangaId) navigate(`/manga/${source}/${mangaId}/chapter/${prevChapter.id}`);
  }, [prevChapter, source, mangaId, navigate]);

  const goToNext = useCallback(() => {
    if (nextChapter && mangaId) navigate(`/manga/${source}/${mangaId}/chapter/${nextChapter.id}`);
  }, [nextChapter, source, mangaId, navigate]);

  useEffect(() => {
    if (settings.readingMode !== 'long-strip') return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [settings.readingMode, goToPrev, goToNext]);

  const currentChapter = manga?.chapters[currentIndex];
  // Memoized so the array reference is stable — prevents SinglePage/DoublePage
  // from resetting to page 0 whenever Reader re-renders (e.g. settings panel open/close)
  const proxiedPages = useMemo(() => chapter?.pages.map(proxyImage) ?? [], [chapter]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p style={{ color: 'var(--red)' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Top nav */}
      <div
        className="sticky top-0 z-20 px-4 py-3 transition-opacity duration-200"
        style={{
          backgroundColor: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          opacity: headerVisible ? 1 : 0,
          pointerEvents: headerVisible ? 'auto' : 'none',
        }}
      >
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link
            to={`/manga/${source}/${mangaId}`}
            className="text-sm font-medium shrink-0"
            style={{ color: 'var(--accent)' }}
          >
            ← Back
          </Link>
          <button
            className="flex-1 text-xs text-center truncate"
            style={{ color: 'rgba(255,255,255,0.5)' }}
            onClick={() => setHeaderVisible((v) => !v)}
          >
            {manga?.title}{currentChapter ? ` · Ch. ${currentChapter.number}` : ''}
          </button>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={goToPrev} disabled={!prevChapter}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-base disabled:opacity-20"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}
            >
              ‹
            </button>
            <button
              onClick={goToNext} disabled={!nextChapter}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-base disabled:opacity-20"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}
            >
              ›
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-xl"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
            >
              ⚙
            </button>
          </div>
        </div>
      </div>

      {/* Tap zone to re-show header */}
      {!headerVisible && (
        <div className="fixed top-0 left-0 right-0 h-14 z-10" onClick={() => setHeaderVisible(true)} />
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-32">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                style={{ backgroundColor: 'var(--accent)', animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      ) : (
        <>
          {settings.readingMode === 'long-strip' && (
            <>
              <LongStrip pages={proxiedPages} pageFit={settings.pageFit} />
              <div className="flex justify-center gap-3 px-4 py-10">
                <button onClick={goToPrev} disabled={!prevChapter}
                  className="flex-1 max-w-xs py-4 rounded-xl text-sm font-semibold disabled:opacity-25 transition-opacity"
                  style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}>
                  ← Previous chapter
                </button>
                <button onClick={goToNext} disabled={!nextChapter}
                  className="flex-1 max-w-xs py-4 rounded-xl text-sm font-semibold text-white disabled:opacity-25 transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)' }}>
                  Next chapter →
                </button>
              </div>
            </>
          )}

          {settings.readingMode === 'single-page' && (
            <SinglePage pages={proxiedPages} pageFit={settings.pageFit}
              direction={settings.readingDirection}
              onNextChapter={goToNext} onPrevChapter={goToPrev} />
          )}

          {settings.readingMode === 'double-page' && (
            <DoublePage pages={proxiedPages} pageFit={settings.pageFit}
              direction={settings.readingDirection}
              onNextChapter={goToNext} onPrevChapter={goToPrev} />
          )}
        </>
      )}

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
