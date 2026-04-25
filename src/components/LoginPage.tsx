import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { BRANDING } from '../constants/branding';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = login(email.trim(), password);
    setLoading(false);
    if (!success) {
      setError('Invalid email or password.');
    }
  }

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center px-4">
      <div className="rc-card shadow-md w-full max-w-sm p-8 backdrop-blur-sm">
        <div className="mb-6 text-center">
          <img
            src={BRANDING.logoPath}
            alt="RapidCircle"
            className="mx-auto mb-4 h-12 w-auto"
          />
          <h1 className="text-2xl font-bold text-[var(--rc-primary-900)]">{BRANDING.appShortName}</h1>
          <p className="text-sm text-gray-600 mt-1 font-asap tracking-wide">{BRANDING.loginSubtitle}</p>
          <p className="text-xs text-gray-500 mt-1 font-asap">ITIL Process Dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--rc-primary)] focus:border-[var(--rc-primary)]"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--rc-primary)] focus:border-[var(--rc-primary)]"
              placeholder="••••••••"
            />
          </div>
          {error && (
            <p role="alert" aria-live="polite" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rc-primary-btn disabled:opacity-60 font-medium py-2 rounded-lg text-sm"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="text-xs text-gray-500 text-center mt-6">
          Default admin: <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">admin@itil.com</span> / <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">Admin@123</span>
        </p>
      </div>
    </div>
  );
}
