import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Session } from '../types/auth';
import { getSession, setSession, getUsers, setUsers } from '../utils/storage';

const AUTH_CHANGE_EVENT = 'itil-auth-change';

interface AuthContextValue {
  currentUser: Session | null;
  verifyCredentials: (email: string, password: string) => Session | null;
  login: (session: Session) => void;
  logout: () => void;
  updateProfile: (payload: { name: string; password?: string }) => { success: boolean; message?: string };
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Session | null>(() => getSession());

  useEffect(() => {
    const syncSession = () => {
      setCurrentUser(getSession());
    };

    window.addEventListener(AUTH_CHANGE_EVENT, syncSession);
    window.addEventListener('storage', syncSession);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, syncSession);
      window.removeEventListener('storage', syncSession);
    };
  }, []);

  const verifyCredentials = useCallback((email: string, password: string): Session | null => {
    const users = getUsers();
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) {
      return null;
    }

    return { id: found.id, name: found.name, email: found.email, role: found.role };
  }, []);

  const login = useCallback((session: Session): void => {
    setSession(session);
    setCurrentUser(session);
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    setCurrentUser(null);
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
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
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));

    return { success: true };
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, verifyCredentials, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
