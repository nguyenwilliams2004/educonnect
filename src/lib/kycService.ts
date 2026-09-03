import { supabase, STORAGE_BUCKETS } from './supabase';

export interface RegisterTutorParams {
  userId?: string;
  email: string;
  password?: string;
  fullName: string;
  phone: string;
  roleType: 'teacher' | 'tutor';
  headline: string;
  educationLevel: string;
  major: string;
  university: string;
  subjects: string[];
  hourlyRate: string;
  priceUnit?: string;
  levelPrices?: Record<string, string>;
  teachingFormatsOffline?: string;
  isOnlineSupport?: boolean;
  teachingAchievement?: string;
  experience?: string;
  personalityTraits?: string[];
  scheduleSlots: string[];
  cccdNumber: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;

  // File objects
  avatarFile?: File | null;
  cccdFrontFile?: File | null;
  cccdBackFile?: File | null;
  credentialFile?: File | null;
  achievementFile?: File | null;
}

export interface RegisterTutorResult {
  success: boolean;
  userId?: string;
  message: string;
  error?: string;
}

/**
 * Upload ảnh đại diện công khai lên bucket tutor-avatars (Public CDN)
 */
export async function uploadPublicAvatar(file: File, userId: string): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const cleanExt = ext.toLowerCase();
  const filePath = `avatars/${userId}_${Date.now()}.${cleanExt}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKETS.AVATARS)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    throw new Error(`Lỗi tải ảnh đại diện lên CDN: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(STORAGE_BUCKETS.AVATARS).getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * Upload tài liệu nhạy cảm (CCCD, Bằng cấp) vào bucket riêng tư tutor-kyc-docs (Private Storage)
 */
export async function uploadKycDocument(
  file: File,
  userId: string,
  docType: 'cccd_front' | 'cccd_back' | 'credential' | 'achievement'
): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const cleanExt = ext.toLowerCase();
  const filePath = `${userId}/${docType}_${Date.now()}.${cleanExt}`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS.KYC_DOCS)
    .upload(filePath, file, {
      cacheControl: '300',
      upsert: true,
      contentType: file.type,
    });

  if (error) {
    throw new Error(`Lỗi tải tài liệu KYC (${docType}): ${error.message}`);
  }

  return filePath;
}

/**
 * Tạo Signed URL tạm thời (mặc định 5 phút) để Admin kiểm duyệt tài liệu nhạy cảm
 */
export async function getSignedKycUrl(filePath: string, expiresInSeconds: number = 300): Promise<string> {
  if (!filePath) return '';
  // Nếu là URL bên ngoài (Unsplash hoặc base64 cũ), trả về nguyên vẹn
  if (filePath.startsWith('http://') || filePath.startsWith('https://') || filePath.startsWith('data:')) {
    return filePath;
  }

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.KYC_DOCS)
    .createSignedUrl(filePath, expiresInSeconds);

  if (error || !data?.signedUrl) {
    console.error('[kycService] Lỗi tạo Signed URL:', error?.message);
    return '';
  }

  return data.signedUrl;
}

/**
 * Chuyển đổi mã ca dạy và thứ trong tuần sang cấu trúc bảng availability_slots
 */
export function parseScheduleSlots(
  scheduleSlots: string[],
  instructorId: string
): Array<{
  instructor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}> {
  const dayMap: Record<string, number> = {
    'Chủ Nhật': 1,
    'Thứ 2': 2,
    'Thứ 3': 3,
    'Thứ 4': 4,
    'Thứ 5': 5,
    'Thứ 6': 6,
    'Thứ 7': 7,
  };

  const shiftTimeMap: Record<string, { start: string; end: string }> = {
    'Sáng': { start: '08:00:00', end: '11:30:00' },
    'Chiều': { start: '14:00:00', end: '17:30:00' },
    'Tối': { start: '18:30:00', end: '21:30:00' },
  };

  const result: Array<{
    instructor_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
  }> = [];

  for (const slot of scheduleSlots) {
    const parts = slot.split('_');
    if (parts.length >= 2) {
      const dayName = parts[0].trim();
      const shiftName = parts[1].trim();

      const dayNum = dayMap[dayName];
      const times = shiftTimeMap[shiftName];

      if (dayNum && times) {
        result.push({
          instructor_id: instructorId,
          day_of_week: dayNum,
          start_time: times.start,
          end_time: times.end,
        });
      }
    }
  }

  return result;
}

/**
 * Luồng đăng ký hoàn chỉnh: Tạo Auth User -> Upload CDN/Private Storage -> Insert Profiles & Slots
 */
export async function registerTutorProfile(params: RegisterTutorParams): Promise<RegisterTutorResult> {
  try {
    let activeUserId = params.userId;

    // 1. Nếu chưa có userId (chưa đăng nhập), tạo tài khoản Supabase Auth
    if (!activeUserId) {
      if (!params.password) {
        return {
          success: false,
          message: 'Vui lòng cung cấp mật khẩu để thiết lập tài khoản giáo viên!',
        };
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: params.email.trim(),
        password: params.password,
        options: {
          data: {
            full_name: params.fullName.trim(),
            role: 'instructor',
            phone: params.phone.trim(),
          },
        },
      });

      if (authError) {
        // Nếu email đã tồn tại, thử đăng nhập
        if (authError.message.includes('already registered')) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: params.email.trim(),
            password: params.password,
          });

          if (signInError || !signInData.user) {
            return {
              success: false,
              message: 'Email này đã được đăng ký. Vui lòng kiểm tra lại mật khẩu hoặc đăng nhập trước khi nộp hồ sơ.',
              error: authError.message,
            };
          }
          activeUserId = signInData.user.id;
        } else {
          return {
            success: false,
            message: `Không thể tạo tài khoản xác thực: ${authError.message}`,
            error: authError.message,
          };
        }
      } else if (authData.user) {
        activeUserId = authData.user.id;
      }
    }

    if (!activeUserId) {
      return {
        success: false,
        message: 'Lỗi không xác định: Không tìm thấy định danh người dùng (User ID).',
      };
    }

    // 2. Upload Ảnh đại diện lên Storage CDN (Bucket tutor-avatars)
    let avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400';
    if (params.avatarFile) {
      try {
        avatarUrl = await uploadPublicAvatar(params.avatarFile, activeUserId);
      } catch (err: any) {
        console.warn('[kycService] Lỗi upload avatar, dùng fallback:', err.message);
      }
    }

    // 3. Upload Tài liệu CCCD & Bằng cấp vào Storage Riêng tư (Bucket tutor-kyc-docs)
    let cccdFrontPath = '';
    let cccdBackPath = '';
    let credentialPath = '';

    if (params.cccdFrontFile) {
      try {
        cccdFrontPath = await uploadKycDocument(params.cccdFrontFile, activeUserId, 'cccd_front');
      } catch (err: any) {
        console.warn('[kycService] Lỗi upload CCCD mặt trước:', err.message);
      }
    }

    if (params.cccdBackFile) {
      try {
        cccdBackPath = await uploadKycDocument(params.cccdBackFile, activeUserId, 'cccd_back');
      } catch (err: any) {
        console.warn('[kycService] Lỗi upload CCCD mặt sau:', err.message);
      }
    }

    if (params.credentialFile) {
      try {
        credentialPath = await uploadKycDocument(params.credentialFile, activeUserId, 'credential');
      } catch (err: any) {
        console.warn('[kycService] Lỗi upload Bằng cấp:', err.message);
      }
    }

    // 4. Đồng bộ bảng public.users
    const { error: userError } = await supabase.from('users').upsert({
      id: activeUserId,
      email: params.email.trim(),
      full_name: params.fullName.trim(),
      role: 'instructor',
      phone: params.phone.trim(),
      avatar_url: avatarUrl,
    });

    if (userError) {
      console.warn('[kycService] Cảnh báo đồng bộ public.users:', userError.message);
    }

    // 5. Chuẩn bị dữ liệu hồ sơ Profiles
    const parsedPrice = parseInt(params.hourlyRate.replace(/\D/g, ''), 10) || 200000;
    const certArray: string[] = [];
    if (params.educationLevel) certArray.push(`${params.educationLevel} ${params.major}`);
    if (credentialPath) certArray.push(`KYC_CREDENTIAL:${credentialPath}`);
    if (cccdFrontPath) certArray.push(`KYC_CCCD_FRONT:${cccdFrontPath}`);
    if (cccdBackPath) certArray.push(`KYC_CCCD_BACK:${cccdBackPath}`);

    const profileData = {
      id: activeUserId,
      avatar_url: avatarUrl,
      subjects: params.subjects,
      skills: params.personalityTraits || ['Tận tâm', 'Kiên nhẫn'],
      category_type: params.educationLevel,
      provider_type: params.roleType === 'teacher' ? 'class' : '1-1',
      target_tags: params.subjects.slice(0, 3),
      success_story: params.teachingAchievement || 'Đã đào tạo nhiều học sinh đạt điểm cao.',
      levels: ['THCS', 'THPT'],
      price: parsedPrice,
      price_unit: params.priceUnit || 'giờ',
      location: params.teachingFormatsOffline || 'Hà Nội & Toàn quốc (Online)',
      district: 'Cầu Giấy', // Phân loại mặc định nội thành Hà Nội
      online: params.isOnlineSupport ?? true,
      rating: 5.0,
      reviews_count: 0,
      experience: parseInt((params.experience || '2').replace(/\D/g, ''), 10) || 2,
      education: `${params.educationLevel} ${params.major} (${params.university})`,
      bio: params.headline || `${params.educationLevel} ${params.major}`,
      intro: params.teachingAchievement || 'Phương pháp giảng dạy cá nhân hóa, bám sát năng lực học sinh.',
      schedule: params.scheduleSlots,
      certificates: certArray,
      verified: false, // Mặc định ở trạng thái chờ duyệt
      bank_name: params.bankName,
      bank_account_number: params.bankAccountNumber,
      bank_account_name: params.bankAccountHolder,
    };

    const { error: profileError } = await supabase.from('profiles').upsert(profileData);

    if (profileError) {
      throw new Error(`Lỗi lưu hồ sơ profiles: ${profileError.message}`);
    }

    // 6. Ghi nhận khung giờ rảnh vào bảng availability_slots
    if (params.scheduleSlots && params.scheduleSlots.length > 0) {
      const slotRecords = parseScheduleSlots(params.scheduleSlots, activeUserId);
      if (slotRecords.length > 0) {
        // Xóa các slot cũ chưa được book của giáo viên này nếu có
        await supabase
          .from('availability_slots')
          .delete()
          .eq('instructor_id', activeUserId)
          .eq('is_booked', false);

        const { error: slotsError } = await supabase
          .from('availability_slots')
          .insert(slotRecords);

        if (slotsError) {
          console.warn('[kycService] Cảnh báo lưu availability_slots:', slotsError.message);
        }
      }
    }

    return {
      success: true,
      userId: activeUserId,
      message: 'Hồ sơ đã được gửi lên hệ thống và lưu trữ an toàn trên CSDL Supabase!',
    };
  } catch (error: any) {
    console.error('[kycService] Thất bại trong luồng đăng ký gia sư:', error);
    return {
      success: false,
      message: error.message || 'Có lỗi xảy ra trong quá trình lưu hồ sơ lên máy chủ.',
      error: error.message,
    };
  }
}
