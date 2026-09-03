import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { mockAdminStats } from '../app/data';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useTutors } from './TutorContext';

export interface StudentTrialItem {
  tutorId: string | number;
  tutorName: string;
  avatar: string;
  badgeSubject: string;
  headline?: string;
  rolePrefix?: string;
  displayName?: string;
  phone?: string;
  zalo?: string;
  hourlyRate?: string;
  date: string;
  status: 'trial_in_progress' | 'enrolled' | 'cancelled';
  studentId?: string | number;
  studentPhone?: string;
  enrollmentId?: string;
}

function enrollmentToTrial(row: any, tutors: any[]): StudentTrialItem {
  const tutor = tutors.find((t) => String(t.id) === String(row.instructor_id));
  return {
    tutorId: row.instructor_id,
    tutorName: tutor?.name || row.class_title || 'Giáo viên',
    avatar: tutor?.avatar || '',
    badgeSubject: tutor?.badgeSubject || tutor?.subjects?.[0] || 'Môn học',
    headline: tutor?.headline,
    rolePrefix: tutor?.rolePrefix,
    displayName: tutor?.displayName,
    phone: tutor?.phone,
    zalo: tutor?.zalo,
    hourlyRate: tutor?.hourlyRate,
    date: new Date(row.created_at).toLocaleDateString('vi-VN'),
    status:
      row.status === 'enrolled'
        ? 'enrolled'
        : row.status === 'not_enrolled'
        ? 'cancelled'
        : 'trial_in_progress',
    studentId: row.student_id,
    studentPhone: row.parent_phone,
    enrollmentId: row.id,
  };
}

const isUUID = (id: any) => /^[0-9a-f-]{36}$/.test(String(id));

export interface BookingContextType {
  myTrials: StudentTrialItem[];
  setMyTrials: React.Dispatch<React.SetStateAction<StudentTrialItem[]>>;
  adminStats: typeof mockAdminStats;
  setAdminStats: React.Dispatch<React.SetStateAction<typeof mockAdminStats>>;
  recordTrialContact: (tutor: any, studentInfo?: { name?: string; phone?: string }) => Promise<void>;
  recordOfficialEnrollment: (tutorId: any, totalTuition?: number, slotId?: string | null) => Promise<void>;
  cancelTrialEnrollment: (tutorId: any) => Promise<void>;
}

export const BookingContext = createContext<BookingContextType | null>(null);

export function useBooking(): BookingContextType {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used within BookingProvider');
  return ctx;
}

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const { currentSession } = useAuth();
  const { tutors, setTutors } = useTutors();
  const [myTrials, setMyTrials] = useState<StudentTrialItem[]>([]);
  const [adminStats, setAdminStats] = useState(mockAdminStats);

  useEffect(() => {
    const loadTrials = async () => {
      if (!currentSession.userId) return;
      try {
        const { data, error } = await supabase
          .from('enrollments')
          .select('*')
          .eq('student_id', currentSession.userId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setMyTrials(data.map((row) => enrollmentToTrial(row, tutors)));
        }
      } catch (err) {
        console.error('[BookingContext] load error:', err);
      }
    };

    loadTrials();
  }, [currentSession.userId, tutors]);

  const recordTrialContact = useCallback(
    async (tutor: any, studentInfo?: { name?: string; phone?: string }) => {
      setTutors((prev) =>
        prev.map((t) => {
          if (String(t.id) !== String(tutor.id)) return t;
          const stats = t.trialStats || { totalTrials: 24, officialEnrolled: 22 };
          return { ...t, trialStats: { ...stats, totalTrials: stats.totalTrials + 1 } };
        })
      );

      const newItem: StudentTrialItem = {
        tutorId: tutor.id,
        tutorName: tutor.name,
        avatar: tutor.avatar,
        badgeSubject: tutor.badgeSubject || tutor.subjects?.[0] || 'Môn học',
        headline: tutor.headline,
        rolePrefix: tutor.rolePrefix,
        displayName: tutor.displayName,
        phone: tutor.phone,
        zalo: tutor.zalo,
        hourlyRate: tutor.hourlyRate,
        date: new Date().toLocaleDateString('vi-VN'),
        status: 'trial_in_progress',
        studentId: currentSession.userId || 'anon_stud',
        studentPhone: studentInfo?.phone || currentSession.phone,
      };

      setMyTrials((prev) => {
        const existing = prev.find((i) => String(i.tutorId) === String(tutor.id));
        if (existing) {
          return prev.map((i) =>
            String(i.tutorId) === String(tutor.id) ? { ...i, status: 'trial_in_progress' } : i
          );
        }
        return [newItem, ...prev];
      });

      const studentName = studentInfo?.name || (currentSession.phone ? `Học sinh (SĐT: ${currentSession.phone})` : currentSession.email ? `Học sinh (${currentSession.email})` : 'Học sinh mới đăng ký');
      const studentPhone = studentInfo?.phone || currentSession.phone || '0987.654.321';

      const teacherTrialRecord = {
        tutorId: `stud_${Date.now()}`,
        teacherTutorId: String(tutor.id),
        tutorName: `${studentName}`,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400',
        badgeSubject: tutor.badgeSubject || tutor.subjects?.[0] || 'Môn học',
        headline: `Hẹn học thử: ${tutor.badgeSubject || '1-1'} • SĐT: ${studentPhone}`,
        phone: studentPhone,
        zalo: studentPhone,
        date: new Date().toLocaleDateString('vi-VN'),
        status: 'trial_in_progress' as const
      };

      try {
        const stored = JSON.parse(localStorage.getItem('hantutor_teacher_student_trials') || '[]');
        localStorage.setItem('hantutor_teacher_student_trials', JSON.stringify([teacherTrialRecord, ...stored]));
      } catch (e) {}

      setAdminStats((prev) => ({
        ...prev,
        totalTrialContacts: prev.totalTrialContacts + 1,
        recentActivities: [
          {
            id: `act_${Date.now()}`,
            tutor: tutor.name || 'Giáo viên',
            student: studentName,
            type: 'trial_contact',
            time: 'Vừa xong',
            status: 'Đang học thử 1-1',
          },
          ...prev.recentActivities,
        ],
      }));

      if (!isUUID(tutor.id)) return;
      const { data: insertedRow, error } = await supabase
        .from('enrollments')
        .insert({
          instructor_id: String(tutor.id),
          student_id: currentSession.userId || null,
          class_title: tutor.badgeSubject || tutor.subjects?.[0],
          student_name: studentName,
          parent_phone: studentPhone,
          status: 'trial_booked',
          source_type: 'platform',
        })
        .select()
        .single();

      if (error) {
        console.error('[Supabase] recordTrialContact error:', error.message);
      } else if (insertedRow) {
        setMyTrials((prev) =>
          prev.map((i) =>
            String(i.tutorId) === String(tutor.id) ? { ...i, enrollmentId: insertedRow.id } : i
          )
        );
      }
    },
    [currentSession.userId, currentSession.phone, setTutors]
  );

  const recordOfficialEnrollment = useCallback(
    async (tutorId: any, totalTuition = 1_600_000, slotId?: string | null) => {
      setTutors((prev) =>
        prev.map((t) => {
          if (String(t.id) !== String(tutorId)) return t;
          const stats = t.trialStats || { totalTrials: 24, officialEnrolled: 22 };
          return { ...t, trialStats: { ...stats, officialEnrolled: stats.officialEnrolled + 1 } };
        })
      );

      const trial = myTrials.find((i) => String(i.tutorId) === String(tutorId));
      setMyTrials((prev) =>
        prev.map((i) =>
          String(i.tutorId) === String(tutorId) ? { ...i, status: 'enrolled' as const } : i
        )
      );

      setAdminStats((prev) => ({
        ...prev,
        totalOfficialEnrolled: prev.totalOfficialEnrolled + 1,
        recentActivities: [
          {
            id: `act_${Date.now()}`,
            tutor: tutors.find((t) => String(t.id) === String(tutorId))?.name || 'Giáo viên',
            student: 'Học sinh chính thức',
            type: 'official_enrolled',
            time: 'Vừa xong',
            status: 'Đã thanh toán',
          },
          ...prev.recentActivities,
        ],
      }));

      // Nếu có slot_id thì cập nhật slot thành is_booked = true
      if (slotId && isUUID(slotId)) {
        try {
          await supabase
            .from('availability_slots')
            .update({ is_booked: true, locked_until: null, locked_by: null })
            .eq('id', slotId);
        } catch (e) {
          console.warn('[BookingContext] update availability_slots error:', e);
        }
      }

      if (trial?.enrollmentId) {
        const updatePayload: any = { status: 'enrolled' };
        if (slotId) updatePayload.slot_id = slotId;

        const { error: updErr } = await supabase
          .from('enrollments')
          .update(updatePayload)
          .eq('id', trial.enrollmentId);
        if (updErr) console.error('[Supabase] enrollment update error:', updErr.message);

        const { error: payErr } = await supabase.from('payments').insert({
          enrollment_id: trial.enrollmentId,
          amount: totalTuition,
          payment_method: 'vietqr',
          status: 'success',
          center_amount: Math.round(totalTuition * 0.3),
          tutor_amount: Math.round(totalTuition * 0.7),
          tutor_transfer_status: 'pending',
        });
        if (payErr) console.error('[Supabase] payment insert error:', payErr.message);
      }
    },
    [myTrials, setTutors, tutors]
  );

  const cancelTrialEnrollment = useCallback(
    async (tutorId: any) => {
      const trial = myTrials.find((i) => String(i.tutorId) === String(tutorId));
      setMyTrials((prev) => prev.filter((i) => String(i.tutorId) !== String(tutorId)));
      alert('Đã xóa khỏi danh sách học thử.');
      if (trial?.enrollmentId) {
        const { error } = await supabase
          .from('enrollments')
          .update({ status: 'not_enrolled' })
          .eq('id', trial.enrollmentId);
        if (error) console.error('[Supabase] cancelTrialEnrollment error:', error.message);
      }
    },
    [myTrials]
  );

  const value = useMemo<BookingContextType>(
    () => ({
      myTrials,
      setMyTrials,
      adminStats,
      setAdminStats,
      recordTrialContact,
      recordOfficialEnrollment,
      cancelTrialEnrollment,
    }),
    [
      myTrials,
      adminStats,
      recordTrialContact,
      recordOfficialEnrollment,
      cancelTrialEnrollment,
    ]
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}
