import { Routes, Route } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import Home from './pages/Home';
import MangaDetail from './pages/MangaDetail';
import Reader from './pages/Reader';

export default function App() {
  return (
    <SettingsProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/manga/:id" element={<MangaDetail />} />
        <Route path="/manga/:mangaId/chapter/:chapterId" element={<Reader />} />
      </Routes>
    </SettingsProvider>
  );
}
