import { create } from 'zustand';

interface User {
  email: string;
  password: string;
  role: 'learner' | 'instructor';
  name: string;
  avatar: string;
  avatarBg: string;
  level?: string;
  skills?: string[];
  location?: string;
  price?: number;
  rating?: number;
  studentCount?: number;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  login: (user) => set({ user, isLoggedIn: true }),
  logout: () => set({ user: null, isLoggedIn: false }),
}));
