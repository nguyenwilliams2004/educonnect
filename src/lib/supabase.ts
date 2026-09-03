import { createClient, SupabaseClient } from '@supabase/supabase-js';

// =============================================================================
// HANTUTOR SUPABASE CLIENT CONFIGURATION
// Đọc thông tin kết nối từ .env.local hoặc .env
// =============================================================================

// Thông tin dự án Supabase Live mặc định của HanTutor
const LIVE_SUPABASE_URL = 'https://wopxkprvcyvpmmrtrpvd.supabase.co';
const LIVE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvcHhrcHJ2Y3l2cG1tcnRycHZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0MTQwNDMsImV4cCI6MjEwMzk5MDA0M30.ZkcOisR49i-bjuVp851RFS83ViP9jnQnGgodDFjDDdE';

const envUrl = import.meta.env.VITE_SUPABASE_URL || LIVE_SUPABASE_URL;
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || LIVE_SUPABASE_ANON_KEY;

/**
 * Kiểm tra xem cấu hình Supabase đã được điền thông tin dự án thực tế hay chưa.
 */
export const isSupabaseConfigured = (): boolean => {
  if (!envUrl || !envAnonKey) return false;
  if (envUrl.includes('[YOUR_PROJECT_REF]') || envAnonKey.includes('[YOUR_ANON_KEY]')) return false;
  if (envUrl.includes('placeholder.supabase.co')) return false;
  try {
    const parsed = new URL(envUrl);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
};

const activeUrl = isSupabaseConfigured() ? envUrl : LIVE_SUPABASE_URL;
const activeKey = isSupabaseConfigured() ? envAnonKey : LIVE_SUPABASE_ANON_KEY;

if (!isSupabaseConfigured() && import.meta.env.DEV) {
  console.info(
    '%c[HanTutor Supabase] Đang chạy với cấu hình chờ kết nối Live DB. ' +
    'Vui lòng cập nhật VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY trong file .env.local sau khi khởi tạo trên supabase.com.',
    'color: #2563eb; font-weight: bold;'
  );
}

/**
 * Singleton Supabase Client dùng chung cho toàn bộ ứng dụng HanTutor
 */
export const supabase: SupabaseClient = createClient(activeUrl, activeKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Danh sách định danh chính thức của các Storage Buckets trên Supabase
 */
export const STORAGE_BUCKETS = {
  AVATARS: 'tutor-avatars',      // Bucket công khai chứa ảnh đại diện gia sư (Public CDN)
  KYC_DOCS: 'tutor-kyc-docs',    // Bucket bảo mật chứa CCCD, bằng cấp, chứng chỉ (Private RLS)
} as const;

export type StorageBucketKey = keyof typeof STORAGE_BUCKETS;

// =============================================================================
// DATABASE TYPES (Đồng bộ chuẩn xác với supabase/schema.sql)
// =============================================================================

export interface DbUser {
  id: string; // UUID liên kết auth.users(id)
  email: string;
  full_name: string;
  role: 'student' | 'instructor' | 'center' | 'admin';
  phone?: string | null;
  avatar_url?: string | null;
  created_at: string;
}

export interface DbProfile {
  id: string; // UUID liên kết users(id)
  avatar_url?: string | null;
  subjects: string[];
  skills: string[];
  category_type?: string | null;
  provider_type: '1-1' | 'class';
  target_tags: string[];
  success_story?: string | null;
  levels: string[];
  price: number;
  price_unit: string;
  location?: string | null;
  district?: string | null;
  ward?: string | null;
  address?: string | null;
  online: boolean;
  rating: number;
  reviews_count: number;
  experience: number;
  education?: string | null;
  bio?: string | null;
  intro?: string | null;
  schedule: string[];
  certificates: string[];
  verified: boolean;
  bank_name?: string | null;
  bank_account_number?: string | null;
  bank_account_name?: string | null;
  created_at: string;
}

export interface DbAvailabilitySlot {
  id: string;
  instructor_id: string;
  day_of_week: number; // 1=Chủ Nhật, 2=Thứ 2, ..., 7=Thứ 7
  start_time: string;
  end_time: string;
  is_booked: boolean;
  locked_until?: string | null;
  locked_by?: string | null;
  created_at: string;
}

export interface DbEnrollment {
  id: string;
  instructor_id: string;
  student_id?: string | null;
  slot_id?: string | null;
  class_title?: string | null;
  student_name: string;
  student_age?: string | null;
  parent_name?: string | null;
  parent_phone?: string | null;
  parent_email?: string | null;
  note?: string | null;
  status: 'trial_booked' | 'trial_completed' | 'enrolled' | 'not_enrolled' | 'changed_tutor';
  trial_date?: string | null;
  source_type: string;
  created_at: string;
}

export interface DbPayment {
  id: string;
  enrollment_id: string;
  amount: number;
  payment_method: string;
  status: 'pending' | 'success' | 'failed';
  transaction_code?: string | null;
  center_amount: number; // Phí nền tảng HanTutor
  tutor_amount: number;  // Thù lao gia sư
  tutor_transfer_status: 'pending' | 'transferred' | 'failed';
  transferred_at?: string | null;
  created_at: string;
}

export interface DbPayoutRequest {
  id: string;
  instructor_id: string;
  amount: number;
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  status: 'pending' | 'transferred' | 'rejected';
  admin_note?: string | null;
  transferred_at?: string | null;
  created_at: string;
}

export interface DbReview {
  id: string;
  instructor_id: string;
  student_id?: string | null;
  enrollment_id?: string | null;
  rating: number;
  comment?: string | null;
  student_name?: string | null;
  created_at: string;
}
