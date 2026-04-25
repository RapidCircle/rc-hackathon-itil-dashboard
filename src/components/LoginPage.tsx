import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { BRANDING } from '../constants/branding';
import { DEMO_OTP_CODE, DEMO_USERS } from '../utils/seedData';
import type { Session } from '../types/auth';

type LoginStep = 'select-user' | 'otp';

export default function LoginPage() {
  const { login } = useAuth();
  const [step, setStep] = useState<LoginStep>('select-user');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleUserSelect(userId: string) {
    const selectedUser = DEMO_USERS.find(user => user.id === userId);
    if (!selectedUser) {
      return;
    }

    setSelectedSession({
      id: selectedUser.id,
      name: selectedUser.name,
      email: selectedUser.email,
      role: selectedUser.role,
    });
    setOtp('');
    setError('');
    setStep('otp');
  }

  function handleOtpSubmit(e: FormEvent) {
    e.preventDefault();

    if (!selectedSession) {
      setStep('select-user');
      setError('Select a user to continue.');
      return;
    }

    if (otp.trim() !== DEMO_OTP_CODE) {
      setError('Invalid OTP code.');
      return;
    }

    setLoading(true);
    setError('');
    login(selectedSession);
    setLoading(false);
  }

  function handleBackToSelection() {
    setStep('select-user');
    setSelectedSession(null);
    setOtp('');
    setError('');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent px-4">
      <div className="w-full max-w-5xl rounded-[28px] border border-[var(--rc-border-soft)] bg-white/96 p-8 shadow-[0_28px_60px_-32px_rgba(15,23,42,0.45)] backdrop-blur-sm">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <div className="mb-8 text-center lg:text-left">
              <img
                src={BRANDING.logoPath}
                alt="RapidCircle"
                className="mx-auto mb-5 h-12 w-auto lg:mx-0"
              />
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gray-500 font-asap">Secure Access</p>
              <h1 className="mt-3 text-3xl font-bold text-[var(--rc-primary-900)]">{BRANDING.appShortName}</h1>
              <p className="mt-2 text-sm text-gray-600 font-asap">Choose a user profile, verify with OTP, and continue to the dashboard.</p>
            </div>

            {step === 'select-user' ? (
              <div className="space-y-4">
                {DEMO_USERS.map(user => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleUserSelect(user.id)}
                    className="w-full rounded-3xl border border-[var(--rc-primary-100)] bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[var(--rc-primary-50)] hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-gray-900">{user.name}</p>
                        <p className="mt-1 text-sm text-gray-600 font-asap">{user.email}</p>
                      </div>
                      <span className="rounded-full bg-[var(--rc-primary-50)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--rc-primary-900)]">
                        {user.role}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="rounded-3xl border border-[var(--rc-primary-100)] bg-[var(--rc-primary-50)]/80 px-5 py-4 text-left">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--rc-primary-900)] font-asap">OTP Verification</p>
                  <p className="mt-2 text-sm text-gray-700">
                    Continue as <span className="font-semibold">{selectedSession?.name}</span>.
                  </p>
                  <p className="mt-1 text-xs text-gray-500 font-asap">Enter the 6-digit code to access Dashboard.</p>
                </div>

                <div>
                  <label htmlFor="login-otp" className="mb-2 block text-sm font-medium text-gray-700">Enter OTP</label>
                  <input
                    id="login-otp"
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    className={`w-full rounded-2xl border px-4 py-3 text-sm tracking-[0.35em] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--rc-primary)] ${
                      error
                        ? 'border-red-300 bg-red-50 text-red-700 placeholder:text-red-300'
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                    placeholder="123456"
                  />
                </div>

                {error && (
                  <div role="alert" aria-live="polite" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleBackToSelection}
                    className="flex-1 rounded-2xl border border-[var(--rc-primary-100)] bg-white px-4 py-3 text-sm font-semibold text-[var(--rc-primary-900)] transition-colors hover:bg-[var(--rc-primary-50)]"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-2xl bg-[var(--rc-primary-600)] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--rc-primary-700)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? 'Verifying...' : 'Continue'}
                  </button>
                </div>
              </form>
            )}
          </div>

          <aside className="rounded-[28px] border border-[var(--rc-primary-100)] bg-gradient-to-br from-[var(--rc-primary-50)] via-white to-[var(--rc-primary-50)]/50 p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-500 font-asap">Access Flow</p>
            <h2 className="mt-3 text-xl font-bold text-[var(--rc-primary-900)]">User selection first</h2>
            <p className="mt-2 text-sm text-gray-600 font-asap">No password is required now. Select one of the available users, complete OTP verification, and the app opens Dashboard directly.</p>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl border border-[var(--rc-primary-100)] bg-white/85 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500 font-asap">Step 1</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">Choose a user</p>
              </div>
              <div className="rounded-2xl border border-[var(--rc-primary-100)] bg-white/85 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500 font-asap">Step 2</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">Enter OTP</p>
              </div>
              <div className="rounded-2xl border border-[var(--rc-primary-100)] bg-white/85 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500 font-asap">Step 3</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">Open Dashboard</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-[var(--rc-primary-100)] bg-white/75 px-4 py-3 text-xs text-gray-600 font-asap">
              Demo OTP for all users: <span className="font-semibold text-[var(--rc-primary-900)]">{DEMO_OTP_CODE}</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
