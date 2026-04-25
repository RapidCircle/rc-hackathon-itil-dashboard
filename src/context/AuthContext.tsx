import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Session } from '../types/auth';
import { getSession, setSession, getUsers, setUsers } from '../utils/storage';

interface AuthContextValue {
  currentUser: Session | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  updateProfile: (payload: { name: string; password?: string }) => { success: boolean; message?: string };
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Session | null>(() => getSession());

  const login = useCallback((email: string, password: string): boolean => {
    const users = getUsers();
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) return false;
    const session: Session = { id: found.id, name: found.name, email: found.email, role: found.role };
    setSession(session);
    setCurrentUser(session);
    return true;
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    setCurrentUser(null);
  }, []);

  const updateProfile = useCallback((payload: { name: string; password?: string }) => {
    if (!currentUser) {
      return { success: false, message: 'No active user session.' };
    }

    const trimmedName = payload.name.trim();
    if (!trimmedName) {
      return { success: false, message: 'Name is required.' };
    }

    if (payload.password && payload.password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters.' };
    }

    const users = getUsers();
    const index = users.findIndex(u => u.id === currentUser.id);
    if (index === -1) {
      return { success: false, message: 'User record not found.' };
    }

    const nextUsers = [...users];
    nextUsers[index] = {
      ...nextUsers[index],
      name: trimmedName,
      ...(payload.password ? { password: payload.password } : {}),
    };
    setUsers(nextUsers);

    const updatedSession: Session = {
      ...currentUser,
      name: trimmedName,
    };
    setSession(updatedSession);
    setCurrentUser(updatedSession);

    return { success: true };
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
