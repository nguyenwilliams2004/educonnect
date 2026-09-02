import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
import {
  defaultTutorReviews,
  mockPendingTutors,
  mockTutors,
  TutorReviewItem,
} from '../app/data';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

function profileToTutor(row: any): any {
  return {
    id: row.id,
    name: row.full_name || row.name,
    avatar: row.avatar_url || row.avatar,
    subjects: row.subjects || [],
    skills: row.skills || [],
    category: row.category_type,
    levels: row.levels || [],
    hourlyRate: row.price ? `${row.price.toLocaleString('vi-VN')}đ/giờ` : '',
    price: row.price,
    location: row.location,
    district: row.district,
    online: row.online,
    rating: row.rating ?? 5.0,
    reviews: row.reviews_count ?? 0,
    experience: row.experience,
    education: row.education,
    bio: row.bio,
    intro: row.intro,
    schedule: row.schedule || [],
    certificates: row.certificates || [],
    verified: row.verified,
    kycStatus: row.verified ? 'approved' : 'pending',
    status: 'active',
    bankName: row.bank_name,
    bankAccountNumber: row.bank_account_number,
    bankAccountName: row.bank_account_name,
  };
}

function reviewRowToItem(row: any): TutorReviewItem {
  return {
    id: row.id,
    tutorId: row.instructor_id,
    author: row.student_name || 'Học sinh',
    rating: row.rating,
    comment: row.comment || '',
    date: new Date(row.created_at).toLocaleDateString('vi-VN'),
  };
}

const isUUID = (id: any) => /^[0-9a-f-]{36}$/.test(String(id));

export interface TutorFilters {
  search?: string;
  subject?: string;
  district?: string;
  isOnline?: boolean;
}

export interface TutorContextType {
  tutors: any[];
  setTutors: React.Dispatch<React.SetStateAction<any[]>>;
  pendingTutors: any[];
  setPendingTutors: React.Dispatch<React.SetStateAction<any[]>>;
  reviews: TutorReviewItem[];
  setReviews: React.Dispatch<React.SetStateAction<TutorReviewItem[]>>;
  updateTutorProfile: (tutorId: string | number, updatedData: Partial<any>) => Promise<void>;
  addTutorReview: (review: Omit<TutorReviewItem, 'id' | 'date'>) => Promise<void>;
  approveTutorKyc: (tutorId: any) => Promise<void>;
  rejectTutorKyc: (tutorId: any) => Promise<void>;
  addMockTutor: (newTutor: any) => Promise<void>;
  getMaskedTutor: (tutor: any) => any;
  isLoading: boolean;

  // --- Server-side Pagination ---
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  fetchTutorsPage: (pageNumber: number, filters?: TutorFilters) => Promise<void>;
}

export const TutorContext = createContext<TutorContextType | null>(null);

export function useTutors(): TutorContextType {
  const ctx = useContext(TutorContext);
  if (!ctx) throw new Error('useTutors must be used within TutorProvider');
  return ctx;
}

export function TutorProvider({ children }: { children: React.ReactNode }) {
  const { currentSession } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [tutors, setTutors] = useState<any[]>(mockTutors);
  const [pendingTutors, setPendingTutors] = useState<any[]>(mockPendingTutors);
  const [reviews, setReviews] = useState<TutorReviewItem[]>(defaultTutorReviews);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 8;
  const [totalCount, setTotalCount] = useState<number>(mockTutors.length);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalCount / pageSize));
  }, [totalCount, pageSize]);

  // Server-side paginated fetcher
  const fetchTutorsPage = useCallback(
    async (pageNumber: number = 1, filters?: TutorFilters) => {
      setIsLoading(true);
      try {
        const from = (pageNumber - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = supabase
          .from('profiles')
          .select('*, users!inner(full_name, email, role)', { count: 'exact' })
          .eq('users.role', 'instructor');

        if (filters?.subject) {
          query = query.contains('subjects', [filters.subject]);
        }
        if (filters?.district) {
          query = query.eq('district', filters.district);
        }
        if (filters?.isOnline !== undefined) {
          query = query.eq('online', filters.isOnline);
        }

        const { data, count, error } = await query
          .order('rating', { ascending: false })
          .range(from, to);

        if (!error && data && data.length > 0) {
          const loadedTutors = data.map((row) =>
            profileToTutor({ ...row, full_name: row.users?.full_name ?? row.full_name })
          );
          setTutors(loadedTutors);
          if (count !== null) setTotalCount(count);
          setCurrentPage(pageNumber);
        } else {
          // Fallback to in-memory mock slice if DB is empty or during offline dev
          const slice = mockTutors.slice(from, to + 1);
          if (slice.length > 0) {
            setTutors(slice);
          } else {
            setTutors(mockTutors.slice(0, pageSize));
          }
          setTotalCount(mockTutors.length);
          setCurrentPage(pageNumber);
        }
      } catch (err) {
        console.error('[TutorContext] pagination error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [pageSize]
  );

  // Initial load
  useEffect(() => {
    const boot = async () => {
      await Promise.all([
        fetchTutorsPage(1),
        (async () => {
          const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .order('created_at', { ascending: false });
          if (!error && data && data.length > 0) {
            setReviews(data.map(reviewRowToItem));
          }
        })(),
      ]);
    };
    boot();
  }, [fetchTutorsPage]);

  const updateTutorProfile = useCallback(
    async (tutorId: string | number, updatedData: Partial<any>) => {
      setTutors((prev) =>
        prev.map((t) => (String(t.id) === String(tutorId) ? { ...t, ...updatedData } : t))
      );
      if (!isUUID(tutorId)) return;
      const { error } = await supabase
        .from('profiles')
        .update({
          bio: updatedData.bio,
          intro: updatedData.intro,
          price: updatedData.price,
          location: updatedData.location,
          district: updatedData.district,
          online: updatedData.online,
          subjects: updatedData.subjects,
          levels: updatedData.levels,
          schedule: updatedData.schedule,
          bank_name: updatedData.bankName,
          bank_account_number: updatedData.bankAccountNumber,
          bank_account_name: updatedData.bankAccountName,
        })
        .eq('id', String(tutorId));
      if (error) console.error('[Supabase] updateTutorProfile error:', error.message);
    },
    []
  );

  const addTutorReview = useCallback(
    async (newReviewData: Omit<TutorReviewItem, 'id' | 'date'>) => {
      const newReview: TutorReviewItem = {
        ...newReviewData,
        id: `rev_${Date.now()}`,
        date: new Date().toLocaleDateString('vi-VN'),
      };
      setReviews((prev) => [newReview, ...prev]);
      setTutors((prev) =>
        prev.map((t) =>
          String(t.id) === String(newReview.tutorId)
            ? { ...t, reviews: (t.reviews || 0) + 1, rating: 5.0 }
            : t
        )
      );
      if (!isUUID(newReviewData.tutorId) || !currentSession.userId) return;
      const { error } = await supabase.from('reviews').insert({
        instructor_id: String(newReviewData.tutorId),
        student_id: currentSession.userId,
        rating: newReviewData.rating,
        comment: newReviewData.comment,
        student_name: newReviewData.author,
      });
      if (error) console.error('[Supabase] addTutorReview error:', error.message);
    },
    [currentSession.userId]
  );

  const approveTutorKyc = useCallback(
    async (tutorId: any) => {
      const tutorToApprove = pendingTutors.find((t) => String(t.id) === String(tutorId));
      if (!tutorToApprove) return;
      const approved: any = {
        ...tutorToApprove,
        kycStatus: 'approved',
        status: 'active',
        isPromoted: true,
        rating: tutorToApprove.rating || 5.0,
        reviews: tutorToApprove.reviews || 0,
        trialStats: tutorToApprove.trialStats || { totalTrials: 10, officialEnrolled: 10 },
        personality: tutorToApprove.personality || ['Tận tâm', 'Trách nhiệm', 'Nhiệt tình'],
        certificates: tutorToApprove.certificates || ['Đã xác thực CCCD & Bằng cấp'],
      };
      setPendingTutors((prev) => prev.filter((t) => String(t.id) !== String(tutorId)));
      setTutors((prev) => [approved, ...prev.filter((t) => String(t.id) !== String(tutorId))]);
      if (!isUUID(tutorId)) return;
      const { error } = await supabase
        .from('profiles')
        .update({ verified: true })
        .eq('id', String(tutorId));
      if (error) console.error('[Supabase] approveTutorKyc error:', error.message);
    },
    [pendingTutors]
  );

  const rejectTutorKyc = useCallback(async (tutorId: any) => {
    setPendingTutors((prev) => prev.filter((t) => String(t.id) !== String(tutorId)));
  }, []);

  const addMockTutor = useCallback(async (newTutor: any) => {
    setPendingTutors((prev) => [newTutor, ...prev]);
  }, []);

  const getMaskedTutor = useCallback((tutor: any) => tutor, []);

  const value = useMemo<TutorContextType>(
    () => ({
      tutors,
      setTutors,
      pendingTutors,
      setPendingTutors,
      reviews,
      setReviews,
      updateTutorProfile,
      addTutorReview,
      approveTutorKyc,
      rejectTutorKyc,
      addMockTutor,
      getMaskedTutor,
      isLoading,
      currentPage,
      setCurrentPage,
      pageSize,
      totalCount,
      totalPages,
      fetchTutorsPage,
    }),
    [
      tutors,
      pendingTutors,
      reviews,
      updateTutorProfile,
      addTutorReview,
      approveTutorKyc,
      rejectTutorKyc,
      addMockTutor,
      getMaskedTutor,
      isLoading,
      currentPage,
      pageSize,
      totalCount,
      totalPages,
      fetchTutorsPage,
    ]
  );

  return <TutorContext.Provider value={value}>{children}</TutorContext.Provider>;
}
