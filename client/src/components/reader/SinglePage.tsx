import { useState, useEffect, useCallback } from 'react';
import { PageFit, ReadingDirection } from '../../context/SettingsContext';

interface Props {
  pages: string[];
  pageFit: PageFit;
  direction: ReadingDirection;
  onNextChapter?: () => void;
  onPrevChapter?: () => void;
}

// Header ~48px + bottom bar ~52px + breathing room = 120px total
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

  useEffect(() => { setIndex(0); }, [pages]);

  const goNext = useCallback(() => {
    if (index < pages.length - 1) setIndex((i) => i + 1);
    else onNextChapter?.();
  }, [index, pages.length, onNextChapter]);

  const goPrev = useCallback(() => {
    if (index > 0) setIndex((i) => i - 1);
    else onPrevChapter?.();
  }, [index, onPrevChapter]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') direction === 'ltr' ? goNext() : goPrev();
      if (e.key === 'ArrowLeft') direction === 'ltr' ? goPrev() : goNext();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [direction, goNext, goPrev]);

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const mid = e.currentTarget.getBoundingClientRect().width / 2;
    const clickedRight = e.clientX > mid;
    if (direction === 'ltr') clickedRight ? goNext() : goPrev();
    else clickedRight ? goPrev() : goNext();
  }

  if (pages.length === 0) {
    return (
      <div className="flex items-center justify-center py-32 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
        No pages available for this chapter
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ minHeight: `calc(100dvh - 48px)` }}>
      {/* Page area */}
      <div
        className="flex-1 flex items-center justify-center cursor-pointer select-none px-4 py-3"
        onClick={handleClick}
      >
        <img
          src={pages[index]}
          alt={`Page ${index + 1}`}
          style={imgStyle(pageFit)}
          draggable={false}
        />
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
          {index + 1} / {pages.length}
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
