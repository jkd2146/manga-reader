import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthCtx {
  token: string | null;
  isAuthed: boolean;
  login: (password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));

  async function login(password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) throw new Error('Invalid password');
    const data = (await res.json()) as { token: string };
    localStorage.setItem('auth_token', data.token);
    setToken(data.token);
  }

  function logout() {
    localStorage.removeItem('auth_token');
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ token, isAuthed: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
