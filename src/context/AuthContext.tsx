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
  userId?: string;
  role: UserRole;
  phone?: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
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
  refreshProfile: () => Promise<void>;
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

  // Đồng bộ thông tin từ bảng public.users dựa trên auth session
  const syncUserFromDb = useCallback(async (authUser: any, token?: string) => {
    if (!authUser?.id) return;
    
    let resolvedRole: UserRole = 'student';
    let resolvedName = authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Người dùng';
    let resolvedPhone = authUser.phone || authUser.user_metadata?.phone;
    let resolvedAvatar = authUser.user_metadata?.avatar_url;

    try {
      const { data: dbUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (dbUser && !error) {
        resolvedRole = dbUser.role === 'instructor' ? 'teacher' : (dbUser.role as UserRole);
        resolvedName = dbUser.full_name || resolvedName;
        resolvedPhone = dbUser.phone || resolvedPhone;
        resolvedAvatar = dbUser.avatar_url || resolvedAvatar;
      } else {
        // Fallback metadata nếu DB chưa có dòng
        const metaRole = authUser.user_metadata?.role;
        if (metaRole === 'instructor' || metaRole === 'teacher') resolvedRole = 'teacher';
        else if (metaRole === 'admin') resolvedRole = 'admin';
        else resolvedRole = 'student';
      }
    } catch (err) {
      console.warn('[AuthContext] syncUserFromDb warning:', err);
    }

    setCurrentSession({
      userId: authUser.id,
      email: authUser.email,
      fullName: resolvedName,
      role: resolvedRole,
      phone: resolvedPhone,
      avatarUrl: resolvedAvatar,
      sessionToken: token || currentSession.sessionToken,
    });
  }, [currentSession.sessionToken]);

  useEffect(() => {
    // 1. Kiểm tra session hiện có
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncUserFromDb(session.user, session.access_token);
      }
    });

    // 2. Lắng nghe thay đổi đăng nhập / đăng xuất
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await syncUserFromDb(session.user, session.access_token);
      } else if (event === 'SIGNED_OUT') {
        setCurrentSession({ role: 'anonymous' });
        try {
          localStorage.removeItem('hantutor_user_session');
        } catch {}
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [syncUserFromDb]);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    setCurrentSession({ role: 'anonymous' });
    try {
      localStorage.removeItem('hantutor_user_session');
    } catch {}
  }, []);

  const refreshProfile = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await syncUserFromDb(session.user, session.access_token);
    }
  }, [syncUserFromDb]);

  const isAuthenticated = useMemo(() => currentSession.role !== 'anonymous', [currentSession.role]);
  const isTeacher = useMemo(() => currentSession.role === 'teacher', [currentSession.role]);
  const isAdmin = useMemo(() => currentSession.role === 'admin', [currentSession.role]);

  const value = useMemo<AuthContextType>(
    () => ({
      currentSession,
      setCurrentSession,
      logout,
      refreshProfile,
      isAuthenticated,
      isTeacher,
      isAdmin,
    }),
    [currentSession, logout, refreshProfile, isAuthenticated, isTeacher, isAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
