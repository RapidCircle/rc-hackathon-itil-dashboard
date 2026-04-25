import { useState, type FormEvent } from 'react';
import type { User, Role } from '../types/auth';
import { getUsers, setUsers } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { ROLE_BADGE_STYLES_WITH_BORDER, ROLE_LABELS } from '../constants/branding';

function generateId(): string {
  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function UserManagement() {
  const { currentUser } = useAuth();
  const [users, setUsersState] = useState<User[]>(() => getUsers());
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('user');
  const [error, setError] = useState('');

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (users.some(u => u.email === email.trim())) {
      setError('A user with that email already exists.');
      return;
    }
    const newUser: User = {
      id: generateId(),
      name: name.trim(),
      email: email.trim(),
      password,
      role,
    };
    const updated = [...users, newUser];
    setUsers(updated);
    setUsersState(updated);
    setName('');
    setEmail('');
    setPassword('');
    setRole('user');
  }

  function handleDelete(id: string) {
    if (id === currentUser?.id) return;
    const updated = users.filter(u => u.id !== id);
    setUsers(updated);
    setUsersState(updated);
  }

  return (
    <div className="space-y-6">
      {/* User table */}
      <div className="rc-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left">
              <th className="px-4 py-3 font-semibold text-gray-600 font-asap">Name</th>
              <th className="px-4 py-3 font-semibold text-gray-600 font-asap">Email</th>
              <th className="px-4 py-3 font-semibold text-gray-600 font-asap">Role</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 text-gray-900 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full border ${ROLE_BADGE_STYLES_WITH_BORDER[u.role]}`}>
                    {ROLE_LABELS[u.role]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {u.id !== currentUser?.id ? (
                    <button
                      onClick={() => handleDelete(u.id)}
                      aria-label={`Remove ${u.name}`}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  ) : (
                    <span className="text-xs text-gray-300 italic">you</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add user form */}
      <div className="rc-card p-5">
        <h4 className="text-sm font-semibold text-[var(--rc-primary-900)] mb-4">Add New User</h4>
        <form onSubmit={handleAdd} className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="add-user-name" className="block text-xs font-medium text-gray-600 mb-1 font-asap">Full Name</label>
            <input
              id="add-user-name"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--rc-primary)]"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label htmlFor="add-user-email" className="block text-xs font-medium text-gray-600 mb-1 font-asap">Email</label>
            <input
              id="add-user-email"
              required
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--rc-primary)]"
              placeholder="jane@company.com"
            />
          </div>
          <div>
            <label htmlFor="add-user-password" className="block text-xs font-medium text-gray-600 mb-1 font-asap">Password</label>
            <input
              id="add-user-password"
              required
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--rc-primary)]"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label htmlFor="add-user-role" className="block text-xs font-medium text-gray-600 mb-1 font-asap">Role</label>
            <select
              id="add-user-role"
              value={role}
              onChange={e => setRole(e.target.value as Role)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--rc-primary)]"
            >
              <option value="user">User</option>
              <option value="sdm">SDM</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {error && (
            <p role="alert" aria-live="polite" className="col-span-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <div className="col-span-2">
            <button
              type="submit"
              className="rc-primary-btn text-sm font-medium px-5 py-2 rounded-lg"
            >
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
