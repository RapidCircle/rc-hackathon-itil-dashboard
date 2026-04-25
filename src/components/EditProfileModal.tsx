import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';

interface Props {
  onClose: () => void;
}

export default function EditProfileModal({ onClose }: Props) {
  const { currentUser, updateProfile } = useAuth();
  const [name, setName] = useState(currentUser?.name ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(currentUser?.name ?? '');
  }, [currentUser]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (password && password !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setSaving(true);
    const result = updateProfile({
      name,
      password: password || undefined,
    });
    setSaving(false);

    if (!result.success) {
      setError(result.message ?? 'Unable to update profile.');
      return;
    }

    setSuccess('Profile updated successfully.');
    setPassword('');
    setConfirmPassword('');
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
      <div className="rc-card w-full max-w-lg shadow-2xl overflow-hidden" role="dialog" aria-modal="true" aria-label="Edit profile">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--rc-primary-100)] bg-[var(--rc-primary-50)]">
          <h2 className="text-base font-semibold text-[var(--rc-primary-900)]">Edit Profile</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close edit profile"
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="profile-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="profile-email"
              value={currentUser?.email ?? ''}
              readOnly
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-100 text-gray-500"
            />
          </div>

          <div>
            <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <input
              id="profile-name"
              value={name}
              onChange={event => setName(event.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--rc-primary)]"
            />
          </div>

          <div>
            <label htmlFor="profile-password" className="block text-sm font-medium text-gray-700 mb-1">New Password (optional)</label>
            <input
              id="profile-password"
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              minLength={6}
              placeholder="Leave blank to keep current password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--rc-primary)]"
            />
          </div>

          <div>
            <label htmlFor="profile-confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              id="profile-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={event => setConfirmPassword(event.target.value)}
              minLength={6}
              placeholder="Re-enter new password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--rc-primary)]"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {success && (
            <p role="status" className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              {success}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-[var(--rc-primary-100)] text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rc-primary-btn px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
