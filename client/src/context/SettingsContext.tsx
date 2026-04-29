import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'dark' | 'light' | 'amoled';
export type ReadingMode = 'long-strip' | 'single-page' | 'double-page';
export type ReadingDirection = 'ltr' | 'rtl';
export type PageFit = 'width' | 'height' | 'original';

export interface Settings {
  theme: Theme;
  readingMode: ReadingMode;
  readingDirection: ReadingDirection;
  pageFit: PageFit;
}

interface SettingsCtx {
  settings: Settings;
  update: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

const DEFAULTS: Settings = {
  theme: 'dark',
  readingMode: 'long-strip',
  readingDirection: 'ltr',
  pageFit: 'width',
};

const SettingsContext = createContext<SettingsCtx>(null!);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem('reader_settings');
      return saved ? { ...DEFAULTS, ...(JSON.parse(saved) as Partial<Settings>) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  useEffect(() => {
    localStorage.setItem('reader_settings', JSON.stringify(settings));
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings]);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <SettingsContext.Provider value={{ settings, update }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
