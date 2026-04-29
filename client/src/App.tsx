import { Routes, Route, Navigate } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import MangaDetail from './pages/MangaDetail';
import Reader from './pages/Reader';
import Login from './pages/Login';

function Protected({ children }: { children: React.ReactNode }) {
  const { isAuthed } = useAuth();
  return isAuthed ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Protected><Home /></Protected>} />
      <Route path="/manga/:source/:id" element={<Protected><MangaDetail /></Protected>} />
      <Route path="/manga/:source/:mangaId/chapter/:chapterId" element={<Protected><Reader /></Protected>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <AppRoutes />
      </SettingsProvider>
    </AuthProvider>
  );
}
