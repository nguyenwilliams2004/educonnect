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
  bookingTime?: string;
  createdAt?: string;
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
  const createdDate = row.created_at ? new Date(row.created_at) : new Date();
  const rawStudentName = row.student_name || 'Học sinh mới';
  const displayStudentTitle = rawStudentName.startsWith('Học sinh')
    ? rawStudentName
    : `Học sinh: ${rawStudentName}`;

  return {
    tutorId: isTeacher ? (row.student_id || row.id) : row.instructor_id,
    teacherTutorId: String(row.instructor_id),
    tutorName: isTeacher ? displayStudentTitle : (tutor?.name || row.class_title || 'Giáo viên'),
    studentName: row.student_name || 'Học sinh mới',
    avatar: isTeacher
      ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400'
      : (tutor?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400'),
    badgeSubject: tutor?.badgeSubject || tutor?.subjects?.[0] || row.class_title || 'Môn học',
    headline: row.note || row.notes || (isTeacher ? `Hẹn học thử: ${tutor?.badgeSubject || '1-1'} • SĐT: ${row.parent_phone || '0987.654.321'}` : tutor?.headline),
    rolePrefix: isTeacher ? 'Học sinh' : tutor?.rolePrefix,
    displayName: isTeacher ? row.student_name : (tutor?.displayName || tutor?.name),
    phone: isTeacher ? (row.parent_phone || '0987654321') : tutor?.phone,
    zalo: isTeacher ? (row.parent_phone || '0987654321') : tutor?.zalo,
    hourlyRate: tutor?.hourlyRate,
    date: createdDate.toLocaleDateString('vi-VN'),
    bookingTime: createdDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    createdAt: row.created_at,
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
    enrollmentId: row.id,
    slotDay: row.slot_day || ((row.note || row.notes) && (row.note || row.notes).includes('Khung giờ:') ? (row.note || row.notes).replace('Khung giờ:', '').trim() : undefined),
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
      const teacherId = String(currentSession.userId || '00000000-0000-0000-0000-000000000001');

      if (isTeacher) {
        // Fast hydrate cho Giáo viên: đọc từ storage các đơn học thử của giáo viên
        let localTeacherTrials: StudentTrialItem[] = [];
        try {
          localTeacherTrials = JSON.parse(
            localStorage.getItem('hantutor_teacher_student_trials') || '[]'
          );
        } catch (e) {}

        if (Array.isArray(localTeacherTrials) && localTeacherTrials.length > 0) {
          setMyTrials(localTeacherTrials);
        } else {
          setMyTrials([]);
        }
      } else {
        // Fast hydrate cho Học sinh: đọc từ storage cá nhân của học sinh
        const storageKey = currentSession.userId
          ? `hantutor_trials_${currentSession.userId}`
          : 'hantutor_trials_guest';
        try {
          const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
          if (Array.isArray(saved)) {
            setMyTrials(saved);
          }
        } catch (e) {}
      }

      // Supabase backend sync
      if (!currentSession.userId) return;
      try {
        const query = supabase.from('enrollments').select('*');
        if (isTeacher) {
          query.or(`instructor_id.eq.${currentSession.userId},instructor_id.eq.00000000-0000-0000-0000-000000000001`);
        } else {
          query.eq('student_id', currentSession.userId);
        }
        const { data, error } = await query.order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped = data.map((row) => enrollmentToTrial(row, tutors, isTeacher));
          setMyTrials((prev) => {
            const combined = isTeacher ? [...mapped, ...prev] : mapped;
            const seen = new Set<string>();
            return combined.filter((item) => {
              const id = String(item.enrollmentId || item.tutorId);
              if (seen.has(id)) return false;
              seen.add(id);
              return true;
            });
          });
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

      const now = new Date();
      const bookingTime = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

      // LẤY TÊN HỌC SINH CHÍNH XÁC:
      let cachedProfile: any = null;
      try {
        cachedProfile = JSON.parse(localStorage.getItem('hantutor_student_profile') || '{}');
      } catch {}

      const studentName =
        studentInfo?.name ||
        currentSession.fullName ||
        (currentSession as any).name ||
        cachedProfile?.name ||
        (currentSession.phone
          ? `Học sinh (SĐT: ${currentSession.phone})`
          : currentSession.email
          ? `Học sinh (${currentSession.email.split('@')[0]})`
          : 'Học sinh mới đăng ký');

      const studentPhone =
        studentInfo?.phone ||
        currentSession.phone ||
        cachedProfile?.phone ||
        '0987.654.321';

      // 1. Bản ghi góc nhìn HỌC SINH (Student Trial Bookmark)
      const newItem: StudentTrialItem = {
        tutorId: tutor.id,
        teacherTutorId: String(tutor.id),
        tutorName: tutor.name,
        studentName: studentName,
        avatar: tutor.avatar,
        badgeSubject: tutor.badgeSubject || tutor.subjects?.[0] || 'Môn học',
        headline: slotText || tutor.headline || 'Đã đăng ký học thử 1-1',
        rolePrefix: tutor.rolePrefix,
        displayName: tutor.displayName || tutor.name,
        phone: tutor.phone,
        zalo: tutor.zalo,
        hourlyRate: tutor.hourlyRate,
        date: now.toLocaleDateString('vi-VN'),
        bookingTime,
        createdAt: now.toISOString(),
        status: 'trial_in_progress',
        studentId: currentSession.userId || 'anon_stud',
        studentPhone,
        slotDay,
        slotTime,
        slotShift,
      };

      if (currentSession.role !== 'teacher') {
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
                    bookingTime: i.bookingTime || bookingTime,
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
      }

      // 2. Bản ghi góc nhìn GIÁO VIÊN (Teacher view: hiển thị rõ tên học sinh)
      const teacherTrialRecord: StudentTrialItem = {
        tutorId: `stud_${Date.now()}`,
        teacherTutorId: String(tutor.id),
        tutorName: `Học sinh: ${studentName}`,
        studentName: studentName,
        displayName: studentName,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400',
        badgeSubject: tutor.badgeSubject || tutor.subjects?.[0] || 'Môn học',
        headline: slotText || `Hẹn học thử: ${tutor.badgeSubject || '1-1'} • SĐT: ${studentPhone}`,
        phone: studentPhone,
        zalo: studentPhone,
        studentPhone: studentPhone,
        rolePrefix: 'Học sinh',
        date: now.toLocaleDateString('vi-VN'),
        bookingTime,
        createdAt: now.toISOString(),
        status: 'trial_in_progress' as const,
        slotDay,
        slotTime,
        slotShift,
        studentId: currentSession.userId || 'anon_stud',
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

      // 3. ĐỒNG BỘ VÀO SUPABASE ENROLLMENTS TABLE
      const instructorUuid = isUUID(tutor.id)
        ? String(tutor.id)
        : '00000000-0000-0000-0000-000000000001';

      const studentUuid = currentSession.userId && isUUID(currentSession.userId)
        ? currentSession.userId
        : null;

      try {
        const { data: insertedRow, error } = await supabase
          .from('enrollments')
          .insert({
            instructor_id: instructorUuid,
            student_id: studentUuid,
            class_title: tutor.badgeSubject || tutor.subjects?.[0] || 'Lớp học thử 1-1',
            student_name: studentName,
            parent_phone: studentPhone,
            status: 'trial_booked',
            source_type: 'platform',
            note: slotText,
          })
          .select()
          .single();

        if (error) {
          console.warn('[Supabase] recordTrialContact error:', error.message);
        } else if (insertedRow) {
          teacherTrialRecord.enrollmentId = insertedRow.id;
          newItem.enrollmentId = insertedRow.id;
        }
      } catch (dbErr) {
        console.warn('[Supabase] recordTrialContact exception:', dbErr);
      }
    },
    [currentSession.userId, currentSession.phone, currentSession.email, currentSession.fullName, currentSession.role, setTutors]
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
      const idStr = String(tutorId);
      const trial = myTrials.find((i) => String(i.tutorId) === idStr || String(i.enrollmentId) === idStr);

      // 1. Lưu danh sách ID đã xóa vào localStorage để ngăn chặn mọi nguồn mock/cache nạp lại
      try {
        const deletedRaw = localStorage.getItem('hantutor_deleted_trial_ids');
        const deletedArr: string[] = deletedRaw ? JSON.parse(deletedRaw) : [];
        if (!deletedArr.includes(idStr)) deletedArr.push(idStr);
        if (trial?.enrollmentId && !deletedArr.includes(String(trial.enrollmentId))) {
          deletedArr.push(String(trial.enrollmentId));
        }
        if (trial?.tutorId && !deletedArr.includes(String(trial.tutorId))) {
          deletedArr.push(String(trial.tutorId));
        }
        localStorage.setItem('hantutor_deleted_trial_ids', JSON.stringify(deletedArr));
      } catch (e) {}

      // 2. Cập nhật state myTrials
      setMyTrials((prev) => {
        const updated = prev.filter(
          (i) =>
            String(i.tutorId) !== idStr &&
            String(i.enrollmentId) !== idStr &&
            String(i.studentId) !== idStr
        );
        const storageKey = currentSession.userId
          ? `hantutor_trials_${currentSession.userId}`
          : 'hantutor_trials_guest';
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      // 3. Xóa khỏi kho lưu trữ học viên của giáo viên
      try {
        const stored = JSON.parse(localStorage.getItem('hantutor_teacher_student_trials') || '[]');
        if (Array.isArray(stored)) {
          const filtered = stored.filter(
            (item: any) =>
              String(item.tutorId) !== idStr &&
              String(item.enrollmentId) !== idStr &&
              String(item.teacherTutorId) !== idStr &&
              String(item.studentId) !== idStr
          );
          localStorage.setItem('hantutor_teacher_student_trials', JSON.stringify(filtered));
        }
      } catch (e) {}

      // 4. Đồng bộ Supabase nếu là UUID
      const targetDbId = trial?.enrollmentId && isUUID(trial.enrollmentId)
        ? trial.enrollmentId
        : isUUID(tutorId)
        ? tutorId
        : null;

      if (targetDbId) {
        try {
          await supabase.from('enrollments').delete().eq('id', targetDbId);
        } catch (e) {
          console.error('[Supabase] cancelTrialEnrollment error:', e);
        }
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
