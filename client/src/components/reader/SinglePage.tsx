import { useState, useEffect, useCallback, useRef } from 'react';
import { PageFit, ReadingDirection } from '../../context/SettingsContext';

interface Props {
  pages: string[];
  pageFit: PageFit;
  direction: ReadingDirection;
  onNextChapter?: () => void;
  onPrevChapter?: () => void;
}

const CHROME_HEIGHT = 120;

function imgStyle(fit: PageFit): React.CSSProperties {
  switch (fit) {
    case 'width':
      return { width: '100%', height: 'auto', display: 'block' };
    case 'height':
      return {
        maxHeight: `calc(100dvh - ${CHROME_HEIGHT}px)`,
        width: 'auto',
        maxWidth: '100%',
        objectFit: 'contain',
        display: 'block',
        margin: '0 auto',
      };
    case 'original':
      return { display: 'block', margin: '0 auto' };
  }
}

export default function SinglePage({ pages, pageFit, direction, onNextChapter, onPrevChapter }: Props) {
  const [index, setIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const dirRef = useRef<'forward' | 'backward'>('forward');

  useEffect(() => { setIndex(0); setAnimKey(0); }, [pages]);

  // Silently preload the next 2 pages so navigation feels instant
  useEffect(() => {
    [index + 1, index + 2].forEach((i) => {
      if (pages[i]) { const img = new Image(); img.src = pages[i]; }
    });
  }, [index, pages]);

  const goNext = useCallback(() => {
    if (index < pages.length - 1) {
      dirRef.current = 'forward';
      setAnimKey((k) => k + 1);
      setIndex((i) => i + 1);
    } else {
      onNextChapter?.();
    }
  }, [index, pages.length, onNextChapter]);

  const goPrev = useCallback(() => {
    if (index > 0) {
      dirRef.current = 'backward';
      setAnimKey((k) => k + 1);
      setIndex((i) => i - 1);
    } else {
      onPrevChapter?.();
    }
  }, [index, onPrevChapter]);

  const forward  = direction === 'ltr' ? goNext : goPrev;
  const backward = direction === 'ltr' ? goPrev : goNext;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') forward();
      if (e.key === 'ArrowLeft')  backward();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [forward, backward]);

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const mid = e.currentTarget.getBoundingClientRect().width / 2;
    e.clientX > mid ? forward() : backward();
  }

  if (pages.length === 0) {
    return (
      <div className="flex items-center justify-center py-32 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
        No pages available for this chapter
      </div>
    );
  }

  const animClass = dirRef.current === 'forward' ? 'page-enter-right' : 'page-enter-left';

  return (
    <div className="flex flex-col" style={{ minHeight: `calc(100dvh - 48px)` }}>
      {/* Page area — tap left/right half to navigate, pinch to zoom */}
      <div
        className="flex-1 flex items-center justify-center cursor-pointer select-none px-2 py-2 sm:px-4 sm:py-3"
        onClick={handleClick}
      >
        <img
          key={animKey}
          src={pages[index]}
          alt={`Page ${index + 1}`}
          className={animClass}
          style={imgStyle(pageFit)}
          draggable={false}
        />
      </div>

      {/* Bottom bar */}
      <div
        className="flex items-center justify-between gap-2 px-4 pt-3"
        style={{
          backgroundColor: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)',
        }}
      >
        <button
          onClick={backward}
          className="min-w-[72px] h-11 px-4 rounded-xl text-sm font-medium active:opacity-70"
          style={{ color: 'rgba(255,255,255,0.6)', backgroundColor: 'rgba(255,255,255,0.08)' }}
        >
          {direction === 'ltr' ? '← Prev' : 'Next →'}
        </button>
        <span className="text-sm tabular-nums" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {index + 1} / {pages.length}
        </span>
        <button
          onClick={forward}
          className="min-w-[72px] h-11 px-4 rounded-xl text-sm font-medium active:opacity-70"
          style={{ color: 'rgba(255,255,255,0.6)', backgroundColor: 'rgba(255,255,255,0.08)' }}
        >
          {direction === 'ltr' ? 'Next →' : '← Prev'}
        </button>
      </div>
    </div>
  );
}
