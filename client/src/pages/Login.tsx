import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(password);
      navigate('/');
    } catch {
      setError('Incorrect password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-8">Manga Reader</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoFocus
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--card)] border border-[var(--border)] focus:outline-none text-[var(--text)]"
              style={{ outlineColor: 'var(--accent)' }}
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 disabled:opacity-50 rounded-lg font-medium transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', color: 'var(--bg)' }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="text-center text-xs text-[var(--muted)] mt-6">
          Set password via <code className="bg-[var(--card)] px-1 rounded">READER_PASSWORD</code> env var
        </p>
      </div>
    </div>
  );
}
