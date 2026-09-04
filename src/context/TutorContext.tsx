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

const applyTutorOverrides = (tutorList: any[]) => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('hantutor_tutor_profile_overrides') : null;
    if (!raw) return tutorList;
    const overrides = JSON.parse(raw);
    return tutorList.map((t) => {
      const idStr = String(t.id);
      const override =
        overrides[idStr] ||
        (idStr === 't1' ? overrides['00000000-0000-0000-0000-000000000001'] : null) ||
        (idStr === '00000000-0000-0000-0000-000000000001' ? overrides['t1'] : null);
      if (!override) return t;
      return {
        ...t,
        ...override,
        levelPrices: {
          ...(t.levelPrices || {}),
          ...(override.levelPrices || {}),
        },
      };
    });
  } catch {
    return tutorList;
  }
};

export const TutorContext = createContext<TutorContextType | null>(null);

export function useTutors(): TutorContextType {
  const ctx = useContext(TutorContext);
  if (!ctx) throw new Error('useTutors must be used within TutorProvider');
  return ctx;
}

export function TutorProvider({ children }: { children: React.ReactNode }) {
  const { currentSession } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [tutors, setTutors] = useState<any[]>(() => applyTutorOverrides(mockTutors));
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

        let liveTutors: any[] = [];
        if (!error && data && data.length > 0) {
          liveTutors = data.map((row) =>
            profileToTutor({ ...row, full_name: row.users?.full_name ?? row.full_name })
          );
        }

        // HỢP NHẤT TOÀN DIỆN:
        // Kết hợp giữa giáo viên trên Supabase và danh mục đội ngũ giáo viên chuẩn (mockTutors)
        // Đảm bảo toàn bộ giáo viên luôn hiển thị đầy đủ và không bao giờ bị biến mất
        const liveIds = new Set(liveTutors.map((t) => String(t.id)));
        const liveNames = new Set(liveTutors.map((t) => (t.name || '').toLowerCase().trim()));

        const remainingMock = mockTutors.filter((m) => {
          const mId = String(m.id);
          const mName = (m.name || '').toLowerCase().trim();
          if (
            mId === 't1' &&
            (liveIds.has('00000000-0000-0000-0000-000000000001') || liveNames.has('cô sương mai'))
          ) {
            return false;
          }
          return !liveIds.has(mId) && !liveNames.has(mName);
        });

        let allTutors = [...liveTutors, ...remainingMock];

        if (filters?.subject) {
          allTutors = allTutors.filter((t) =>
            t.badgeSubject?.toLowerCase().includes(filters.subject!.toLowerCase()) ||
            t.subjects?.some((s: string) => s.toLowerCase().includes(filters.subject!.toLowerCase()))
          );
        }
        if (filters?.district) {
          allTutors = allTutors.filter((t) =>
            t.district?.toLowerCase().includes(filters.district!.toLowerCase()) ||
            t.location?.toLowerCase().includes(filters.district!.toLowerCase())
          );
        }
        if (filters?.isOnline !== undefined) {
          allTutors = allTutors.filter((t) => t.online === filters.isOnline || t.isOnline === filters.isOnline);
        }

        setTutors(applyTutorOverrides(allTutors));
        setTotalCount(allTutors.length);
        setCurrentPage(pageNumber);
      } catch (err) {
        console.error('[TutorContext] pagination error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [pageSize]
  );

  // Fetch danh sách gia sư chờ duyệt KYC từ Supabase profiles (verified = false)
  const fetchPendingTutors = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, users!inner(full_name, email, role, phone, avatar_url)')
        .eq('verified', false)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const livePending = data.map((row) => {
          let cccdFront = '';
          let cccdBack = '';
          let credentialFile = '';

          if (Array.isArray(row.certificates)) {
            for (const cert of row.certificates) {
              if (typeof cert === 'string') {
                if (cert.startsWith('KYC_CCCD_FRONT:')) cccdFront = cert.replace('KYC_CCCD_FRONT:', '');
                else if (cert.startsWith('KYC_CCCD_BACK:')) cccdBack = cert.replace('KYC_CCCD_BACK:', '');
                else if (cert.startsWith('KYC_CREDENTIAL:')) credentialFile = cert.replace('KYC_CREDENTIAL:', '');
              }
            }
          }

          const item = profileToTutor({
            ...row,
            full_name: row.users?.full_name,
            avatar_url: row.avatar_url || row.users?.avatar_url,
          });

          return {
            ...item,
            cccdFront: cccdFront || item.cccdFront || 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=600',
            cccdBack: cccdBack || item.cccdBack || 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=600',
            credentialFile: credentialFile || item.credentialFile || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800',
            phone: row.users?.phone,
            email: row.users?.email,
            kycStatus: 'pending',
          };
        });

        setPendingTutors((prevMock) => {
          const liveIds = new Set(livePending.map((p) => String(p.id)));
          const filteredMock = prevMock.filter((m) => !liveIds.has(String(m.id)));
          return [...livePending, ...filteredMock];
        });
      }
    } catch (err) {
      console.warn('[TutorContext] Không thể nạp pending tutors từ Supabase:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const boot = async () => {
      await Promise.all([
        fetchTutorsPage(1),
        fetchPendingTutors(),
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
  }, [fetchTutorsPage, fetchPendingTutors]);

  const updateTutorProfile = useCallback(
    async (tutorId: string | number, updatedData: Partial<any>) => {
      const idStr = String(tutorId);

      // 1. Lưu vào localStorage để persist vĩnh viễn qua mọi lần refresh
      try {
        const raw = localStorage.getItem('hantutor_tutor_profile_overrides');
        const overrides = raw ? JSON.parse(raw) : {};
        const existing = overrides[idStr] || {};
        const merged = {
          ...existing,
          ...updatedData,
          levelPrices: {
            ...(existing.levelPrices || {}),
            ...(updatedData.levelPrices || {}),
          },
        };
        overrides[idStr] = merged;
        if (idStr === 't1') {
          overrides['00000000-0000-0000-0000-000000000001'] = merged;
        } else if (idStr === '00000000-0000-0000-0000-000000000001') {
          overrides['t1'] = merged;
        }
        localStorage.setItem('hantutor_tutor_profile_overrides', JSON.stringify(overrides));
      } catch (e) {
        console.warn('[TutorContext] Không thể lưu overrides vào localStorage:', e);
      }

      // 2. Cập nhật state in-memory ngay lập tức
      setTutors((prev) =>
        prev.map((t) => {
          const tid = String(t.id);
          const isTarget =
            tid === idStr ||
            (idStr === 't1' && tid === '00000000-0000-0000-0000-000000000001') ||
            (idStr === '00000000-0000-0000-0000-000000000001' && tid === 't1');
          if (!isTarget) return t;
          return {
            ...t,
            ...updatedData,
            levelPrices: {
              ...(t.levelPrices || {}),
              ...(updatedData.levelPrices || {}),
            },
          };
        })
      );

      // 3. Đồng bộ Supabase nếu là UUID
      const targetDbId = isUUID(tutorId)
        ? String(tutorId)
        : idStr === 't1'
        ? '00000000-0000-0000-0000-000000000001'
        : null;

      if (!targetDbId) return;
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            bio: updatedData.bio,
            intro: updatedData.intro,
            price: updatedData.price || updatedData.pricePerSession,
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
          .eq('id', targetDbId);
        if (error) console.error('[Supabase] updateTutorProfile error:', error.message);
      } catch (dbErr) {
        console.warn('[Supabase] updateTutorProfile exception:', dbErr);
      }
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

      if (isUUID(tutorId)) {
        const { error } = await supabase
          .from('profiles')
          .update({ verified: true })
          .eq('id', String(tutorId));
        if (error) {
          console.error('[Supabase] approveTutorKyc error:', error.message);
        } else {
          // Refresh lại danh sách trang công khai
          fetchTutorsPage(1);
        }
      }
    },
    [pendingTutors, fetchTutorsPage]
  );

  const rejectTutorKyc = useCallback(async (tutorId: any) => {
    setPendingTutors((prev) => prev.filter((t) => String(t.id) !== String(tutorId)));
    if (isUUID(tutorId)) {
      await supabase
        .from('profiles')
        .delete()
        .eq('id', String(tutorId));
    }
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
