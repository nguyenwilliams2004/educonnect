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
  status: 'trial_in_progress' | 'trial_completed' | 'enrolled' | 'cancelled';
  studentId?: string | number;
  studentPhone?: string;
  studentName?: string;
  enrollmentId?: string;
  slotDay?: string;
  slotTime?: string;
  slotShift?: string;
}

function enrollmentToTrial(row: any, tutors: any[], isTeacher = false): StudentTrialItem {
  const tutor = tutors.find((t) => String(t.id) === String(row.instructor_id));
  return {
    tutorId: row.instructor_id,
    tutorName: isTeacher ? (row.student_name || 'Học sinh mới') : (tutor?.name || row.class_title || 'Giáo viên'),
    avatar: isTeacher
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400'
      : (tutor?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400'),
    badgeSubject: tutor?.badgeSubject || tutor?.subjects?.[0] || row.class_title || 'Môn học',
    headline: row.notes || tutor?.headline,
    rolePrefix: isTeacher ? 'Học sinh' : tutor?.rolePrefix,
    displayName: isTeacher ? row.student_name : (tutor?.displayName || tutor?.name),
    phone: isTeacher ? (row.parent_phone || '0987654321') : tutor?.phone,
    zalo: isTeacher ? (row.parent_phone || '0987654321') : tutor?.zalo,
    hourlyRate: tutor?.hourlyRate,
    date: new Date(row.created_at || Date.now()).toLocaleDateString('vi-VN'),
    status:
      row.status === 'enrolled'
        ? 'enrolled'
        : row.status === 'not_enrolled' || row.status === 'cancelled'
        ? 'cancelled'
        : row.status === 'trial_completed'
        ? 'trial_completed'
        : 'trial_in_progress',
    studentId: row.student_id,
    studentPhone: row.parent_phone,
    studentName: row.student_name,
    enrollmentId: row.id,
    slotDay: row.slot_day || (row.notes && row.notes.includes('Khung giờ:') ? row.notes.replace('Khung giờ:', '').trim() : undefined),
    slotTime: row.slot_time,
    slotShift: row.slot_shift,
  };
}

const isUUID = (id: any) => /^[0-9a-f-]{36}$/.test(String(id));

export interface BookingContextType {
  myTrials: StudentTrialItem[];
  setMyTrials: React.Dispatch<React.SetStateAction<StudentTrialItem[]>>;
  adminStats: typeof mockAdminStats;
  setAdminStats: React.Dispatch<React.SetStateAction<typeof mockAdminStats>>;
  recordTrialContact: (tutor: any, studentInfo?: { name?: string; phone?: string; slot?: any }) => Promise<void>;
  recordOfficialEnrollment: (tutorId: any, totalTuition?: number, slotId?: string | null) => Promise<void>;
  cancelTrialEnrollment: (tutorId: any) => Promise<void>;
  updateTrialStatus: (targetId: any, status: 'trial_in_progress' | 'trial_completed' | 'enrolled' | 'cancelled') => Promise<void>;
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
      const isTeacher = currentSession.role === 'teacher';
      const storageKey = currentSession.userId
        ? `hantutor_trials_${currentSession.userId}`
        : 'hantutor_trials_guest';

      // 1. LocalStorage fast hydrate
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
        if (Array.isArray(saved) && saved.length > 0) {
          setMyTrials(saved);
        }
      } catch (e) {}

      // 2. Supabase backend sync
      if (!currentSession.userId) return;
      try {
        const query = supabase.from('enrollments').select('*');
        if (isTeacher) {
          query.eq('instructor_id', currentSession.userId);
        } else {
          query.eq('student_id', currentSession.userId);
        }
        const { data, error } = await query.order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped = data.map((row) => enrollmentToTrial(row, tutors, isTeacher));
          setMyTrials(mapped);
          try {
            localStorage.setItem(storageKey, JSON.stringify(mapped));
          } catch (e) {}
        }
      } catch (err) {
        console.error('[BookingContext] load error:', err);
      }
    };

    loadTrials();
  }, [currentSession.userId, currentSession.role, tutors]);

  const recordTrialContact = useCallback(
    async (tutor: any, studentInfo?: { name?: string; phone?: string; slot?: any }) => {
      const selectedSlot = studentInfo?.slot || tutor.selectedSlot;
      const slotDay = selectedSlot?.day;
      const slotTime = selectedSlot?.time || selectedSlot?.shift || selectedSlot?.shiftLabel;
      const slotShift = selectedSlot?.shift || selectedSlot?.shiftLabel;
      const slotText = slotDay ? `Khung giờ: ${slotDay}${slotTime ? ` • ${slotTime}` : ''}` : undefined;

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
        headline: slotText || tutor.headline || 'Đã đăng ký học thử 1-1',
        rolePrefix: tutor.rolePrefix,
        displayName: tutor.displayName,
        phone: tutor.phone,
        zalo: tutor.zalo,
        hourlyRate: tutor.hourlyRate,
        date: new Date().toLocaleDateString('vi-VN'),
        status: 'trial_in_progress',
        studentId: currentSession.userId || 'anon_stud',
        studentPhone: studentInfo?.phone || currentSession.phone,
        slotDay,
        slotTime,
        slotShift,
      };

      setMyTrials((prev) => {
        const existing = prev.find((i) => String(i.tutorId) === String(tutor.id));
        let updated: StudentTrialItem[];
        if (existing) {
          updated = prev.map((i) =>
            String(i.tutorId) === String(tutor.id)
              ? {
                  ...i,
                  status: 'trial_in_progress' as const,
                  headline: slotText || i.headline,
                  slotDay: slotDay || i.slotDay,
                  slotTime: slotTime || i.slotTime,
                  slotShift: slotShift || i.slotShift,
                }
              : i
          );
        } else {
          updated = [newItem, ...prev];
        }
        const storageKey = currentSession.userId
          ? `hantutor_trials_${currentSession.userId}`
          : 'hantutor_trials_guest';
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      const studentName =
        studentInfo?.name ||
        (currentSession.phone
          ? `Học sinh (SĐT: ${currentSession.phone})`
          : currentSession.email
          ? `Học sinh (${currentSession.email})`
          : 'Học sinh mới đăng ký');
      const studentPhone = studentInfo?.phone || currentSession.phone || '0987.654.321';

      const teacherTrialRecord = {
        tutorId: `stud_${Date.now()}`,
        teacherTutorId: String(tutor.id),
        tutorName: `${studentName}`,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400',
        badgeSubject: tutor.badgeSubject || tutor.subjects?.[0] || 'Môn học',
        headline: slotText || `Hẹn học thử: ${tutor.badgeSubject || '1-1'} • SĐT: ${studentPhone}`,
        phone: studentPhone,
        zalo: studentPhone,
        date: new Date().toLocaleDateString('vi-VN'),
        status: 'trial_in_progress' as const,
        slotDay,
        slotTime,
        slotShift,
      };

      try {
        const stored = JSON.parse(localStorage.getItem('hantutor_teacher_student_trials') || '[]');
        localStorage.setItem(
          'hantutor_teacher_student_trials',
          JSON.stringify([teacherTrialRecord, ...stored])
        );
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
          notes: slotText,
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
    [currentSession.userId, currentSession.phone, currentSession.email, setTutors]
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
      setMyTrials((prev) => {
        const updated = prev.map((i) =>
          String(i.tutorId) === String(tutorId) ? { ...i, status: 'enrolled' as const } : i
        );
        const storageKey = currentSession.userId
          ? `hantutor_trials_${currentSession.userId}`
          : 'hantutor_trials_guest';
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

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
    [myTrials, setTutors, tutors, currentSession.userId]
  );

  const cancelTrialEnrollment = useCallback(
    async (tutorId: any) => {
      const trial = myTrials.find((i) => String(i.tutorId) === String(tutorId));
      setMyTrials((prev) => {
        const updated = prev.filter((i) => String(i.tutorId) !== String(tutorId));
        const storageKey = currentSession.userId
          ? `hantutor_trials_${currentSession.userId}`
          : 'hantutor_trials_guest';
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      try {
        const stored = JSON.parse(localStorage.getItem('hantutor_teacher_student_trials') || '[]');
        if (Array.isArray(stored)) {
          const filtered = stored.filter(
            (item: any) => String(item.tutorId) !== String(tutorId) && String(item.teacherTutorId) !== String(tutorId)
          );
          localStorage.setItem('hantutor_teacher_student_trials', JSON.stringify(filtered));
        }
      } catch (e) {}

      if (trial?.enrollmentId && isUUID(trial.enrollmentId)) {
        const { error } = await supabase
          .from('enrollments')
          .update({ status: 'not_enrolled' })
          .eq('id', trial.enrollmentId);
        if (error) console.error('[Supabase] cancelTrialEnrollment error:', error.message);
      }
    },
    [myTrials, currentSession.userId]
  );

  const updateTrialStatus = useCallback(
    async (
      targetId: any,
      newStatus: 'trial_in_progress' | 'trial_completed' | 'enrolled' | 'cancelled'
    ) => {
      setMyTrials((prev) => {
        const updated = prev.map((item) =>
          String(item.tutorId) === String(targetId) ||
          String(item.enrollmentId) === String(targetId)
            ? { ...item, status: newStatus }
            : item
        );
        const storageKey = currentSession.userId
          ? `hantutor_trials_${currentSession.userId}`
          : 'hantutor_trials_guest';
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      try {
        const teacherTrials = JSON.parse(
          localStorage.getItem('hantutor_teacher_student_trials') || '[]'
        );
        if (Array.isArray(teacherTrials)) {
          const updatedTeacherTrials = teacherTrials.map((t: any) =>
            String(t.tutorId) === String(targetId) ? { ...t, status: newStatus } : t
          );
          localStorage.setItem(
            'hantutor_teacher_student_trials',
            JSON.stringify(updatedTeacherTrials)
          );
        }
      } catch (e) {}

      if (isUUID(targetId)) {
        try {
          const dbStatus =
            newStatus === 'enrolled'
              ? 'enrolled'
              : newStatus === 'cancelled'
              ? 'not_enrolled'
              : newStatus;
          await supabase.from('enrollments').update({ status: dbStatus }).eq('id', targetId);
        } catch (e) {
          console.warn('[BookingContext] update trial status error:', e);
        }
      }
    },
    [currentSession.userId]
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
      updateTrialStatus,
    }),
    [
      myTrials,
      adminStats,
      recordTrialContact,
      recordOfficialEnrollment,
      cancelTrialEnrollment,
      updateTrialStatus,
    ]
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}
