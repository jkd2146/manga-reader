import { useState, useEffect, useCallback } from 'react';
import { PageFit, ReadingDirection } from '../../context/SettingsContext';

interface Props {
  pages: string[];
  pageFit: PageFit;
  direction: ReadingDirection;
  onNextChapter?: () => void;
  onPrevChapter?: () => void;
}

const CHROME_HEIGHT = 120;

function pageImgStyle(fit: PageFit): React.CSSProperties {
  switch (fit) {
    case 'width':
      return { width: '100%', height: 'auto', objectFit: 'contain' };
    case 'height':
      return {
        maxHeight: `calc(100dvh - ${CHROME_HEIGHT}px)`,
        width: 'auto',
        maxWidth: '100%',
        objectFit: 'contain',
      };
    case 'original':
      return {};
  }
}

export default function DoublePage({ pages, pageFit, direction, onNextChapter, onPrevChapter }: Props) {
  // spread 0 = page 0 alone (cover), spread N = pages 2N-1 and 2N
  const [spread, setSpread] = useState(0);

  useEffect(() => { setSpread(0); }, [pages]);

  const totalSpreads = Math.ceil((pages.length - 1) / 2) + 1;

  function spreadToPages(s: number): [number, number | null] {
    if (s === 0) return [0, null];
    const a = 1 + (s - 1) * 2;
    const b = a + 1 < pages.length ? a + 1 : null;
    return direction === 'rtl' ? [b ?? a, a] : [a, b];
  }

  const goNext = useCallback(() => {
    if (spread < totalSpreads - 1) setSpread((s) => s + 1);
    else onNextChapter?.();
  }, [spread, totalSpreads, onNextChapter]);

  const goPrev = useCallback(() => {
    if (spread > 0) setSpread((s) => s - 1);
    else onPrevChapter?.();
  }, [spread, onPrevChapter]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') direction === 'ltr' ? goNext() : goPrev();
      if (e.key === 'ArrowLeft') direction === 'ltr' ? goPrev() : goNext();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [direction, goNext, goPrev]);

  if (pages.length === 0) {
    return (
      <div className="flex items-center justify-center py-32 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
        No pages available for this chapter
      </div>
    );
  }

  const [pageA, pageB] = spreadToPages(spread);
  const style = pageImgStyle(pageFit);

  return (
    <div className="flex flex-col" style={{ minHeight: `calc(100dvh - 48px)` }}>
      {/* Spread area */}
      <div className="flex-1 flex items-center justify-center gap-0 px-4 py-3">
        <div className="flex-1 flex justify-end">
          <img
            src={pages[pageA]}
            alt={`Page ${pageA + 1}`}
            style={style}
            className="max-h-full"
            draggable={false}
          />
        </div>
        {pageB !== null && (
          <div className="flex-1 flex justify-start">
            <img
              src={pages[pageB]}
              alt={`Page ${pageB + 1}`}
              style={style}
              className="max-h-full"
              draggable={false}
            />
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div
        className="flex items-center justify-center gap-8 py-3 px-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      >
        <button
          onClick={direction === 'ltr' ? goPrev : goNext}
          className="text-sm px-3 py-1.5 rounded-lg"
          style={{ color: 'rgba(255,255,255,0.5)', backgroundColor: 'rgba(255,255,255,0.06)' }}
        >
          {direction === 'ltr' ? '← Prev' : 'Next →'}
        </button>
        <span className="text-sm tabular-nums" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {spread + 1} / {totalSpreads}
        </span>
        <button
          onClick={direction === 'ltr' ? goNext : goPrev}
          className="text-sm px-3 py-1.5 rounded-lg"
          style={{ color: 'rgba(255,255,255,0.5)', backgroundColor: 'rgba(255,255,255,0.06)' }}
        >
          {direction === 'ltr' ? 'Next →' : '← Prev'}
        </button>
      </div>
    </div>
  );
}
