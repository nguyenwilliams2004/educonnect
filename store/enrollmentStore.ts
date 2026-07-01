import { create } from 'zustand';

export type EnrollmentStatus = 'pending' | 'trial' | 'waiting_confirm' | 'confirmed' | 'paid';

export interface Enrollment {
  id: string;
  classId: string;
  classTitle: string;
  instructorId: number;
  instructorName: string;
  subject: string;
  schedule: string;
  price: number;
  parentName: string;
  parentPhone: string;
  studentName: string;
  studentAge: string;
  note: string;
  status: EnrollmentStatus;
  createdAt: string;
  trialDate?: string;
}

interface EnrollmentStore {
  enrollments: Enrollment[];
  requestTrial: (data: Omit<Enrollment, 'id' | 'status' | 'createdAt'>) => string;
  updateStatus: (id: string, status: EnrollmentStatus) => void;
}

// Mock initial enrollments for demo
const mockEnrollments: Enrollment[] = [
  {
    id: 'enr-demo-1',
    classId: '1-c0',
    classTitle: 'Lớp Toán - Luyện thi chuyên',
    instructorId: 1,
    instructorName: 'Nguyễn Thị Lan Anh',
    subject: 'Toán',
    schedule: 'Thứ 2 & Thứ 4',
    price: 150000,
    parentName: 'Nguyễn Văn A',
    parentPhone: '0901234567',
    studentName: 'Nguyễn Bảo Anh',
    studentAge: '13',
    note: 'Con đang học lớp 8, muốn ôn thi vào chuyên Toán',
    status: 'waiting_confirm',
    createdAt: '2026-06-25T08:00:00Z',
    trialDate: '2026-06-27',
  },
  {
    id: 'enr-demo-2',
    classId: '3-c0',
    classTitle: 'Lớp Piano - Cơ bản',
    instructorId: 3,
    instructorName: 'Lê Thanh Tùng',
    subject: 'Piano',
    schedule: 'Thứ 7 & Chủ nhật',
    price: 250000,
    parentName: 'Trần Thị B',
    parentPhone: '0912345678',
    studentName: 'Trần Minh Khoa',
    studentAge: '8',
    note: 'Bé chưa biết gì, bắt đầu từ đầu',
    status: 'confirmed',
    createdAt: '2026-06-20T09:00:00Z',
    trialDate: '2026-06-22',
  },
];

export const useEnrollmentStore = create<EnrollmentStore>((set, get) => ({
  enrollments: mockEnrollments,

  requestTrial: (data) => {
    const id = `enr-${Date.now()}`;
    const newEnrollment: Enrollment = {
      ...data,
      id,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ enrollments: [newEnrollment, ...state.enrollments] }));
    return id;
  },

  updateStatus: (id, status) => {
    set((state) => ({
      enrollments: state.enrollments.map((e) =>
        e.id === id ? { ...e, status } : e
      ),
    }));
  },
}));

export const ENROLLMENT_STATUS_LABELS: Record<EnrollmentStatus, string> = {
  pending: 'Chờ xếp lịch',
  trial: 'Đã có lịch học thử',
  waiting_confirm: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận – Sẵn sàng thanh toán',
  paid: 'Đã thanh toán',
};

export const ENROLLMENT_STATUS_COLORS: Record<EnrollmentStatus, string> = {
  pending: '#F59E0B',
  trial: '#3B82F6',
  waiting_confirm: '#8B5CF6',
  confirmed: '#10B981',
  paid: '#6B7280',
};
