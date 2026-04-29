import { PageFit } from '../../context/SettingsContext';

interface Props {
  pages: string[];
  pageFit: PageFit;
}

const fitClass: Record<PageFit, string> = {
  width: 'w-full h-auto',
  height: 'h-screen w-auto mx-auto object-contain',
  original: 'max-w-none',
};

export default function LongStrip({ pages, pageFit }: Props) {
  return (
    <div className="flex flex-col items-center">
      {pages.map((url, i) => (
        <img
          key={i}
          src={url}
          alt={`Page ${i + 1}`}
          className={`block ${fitClass[pageFit]}`}
          loading={i < 3 ? 'eager' : 'lazy'}
        />
      ))}
    </div>
  );
}
