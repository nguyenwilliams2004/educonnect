import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { supabase } from '../lib/supabase';

export type UserRole = 'anonymous' | 'student' | 'teacher' | 'parent' | 'admin';

export interface UserSessionContext {
  userId?: string | number;
  role: UserRole;
  phone?: string;
  email?: string;
  sessionToken?: string;
}

function getLocalSession(): UserSessionContext {
  try {
    const s = localStorage.getItem('hantutor_user_session');
    if (s) return JSON.parse(s);
  } catch {}
  return { role: 'anonymous' };
}

function saveLocalSession(s: UserSessionContext) {
  try {
    localStorage.setItem('hantutor_user_session', JSON.stringify(s));
  } catch {}
}

export interface AuthContextType {
  currentSession: UserSessionContext;
  setCurrentSession: React.Dispatch<React.SetStateAction<UserSessionContext>>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isTeacher: boolean;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentSession, setCurrentSession] = useState<UserSessionContext>(getLocalSession);

  useEffect(() => {
    saveLocalSession(currentSession);
  }, [currentSession]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentSession((prev) => ({
          ...prev,
          userId: session.user.id,
          email: session.user.email,
          role: (session.user.user_metadata?.role as any) || prev.role || 'student',
          phone: session.user.phone || prev.phone,
        }));
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentSession((prev) => ({
          ...prev,
          userId: session.user.id,
          email: session.user.email,
          role: (session.user.user_metadata?.role as any) || prev.role || 'student',
          phone: session.user.phone || prev.phone,
        }));
      } else {
        setCurrentSession({ role: 'anonymous' });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setCurrentSession({ role: 'anonymous' });
  }, []);

  const isAuthenticated = useMemo(() => currentSession.role !== 'anonymous', [currentSession.role]);
  const isTeacher = useMemo(() => currentSession.role === 'teacher', [currentSession.role]);
  const isAdmin = useMemo(() => currentSession.role === 'admin', [currentSession.role]);

  const value = useMemo<AuthContextType>(
    () => ({
      currentSession,
      setCurrentSession,
      logout,
      isAuthenticated,
      isTeacher,
      isAdmin,
    }),
    [currentSession, logout, isAuthenticated, isTeacher, isAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
