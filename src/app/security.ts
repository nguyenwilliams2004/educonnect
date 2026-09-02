/**
 * HanTutor Security Architecture
 * 1. Rate Limiting (Sliding Window & Token Bucket with Lockout)
 * 2. Row Level Security (RLS) & Fine-Grained Data Masking
 * 3. Insecure Direct Object References (IDOR) Protection & Security Audit Log
 */

// ============================================================================
// 1. RATE LIMITING ENGINE (Sliding Window Algorithm)
// ============================================================================

export interface RateLimitConfig {
  maxRequests: number;      // Số request tối đa trong cửa sổ thời gian
  windowMs: number;         // Độ dài cửa sổ thời gian (milliseconds)
  lockoutMs?: number;       // Thời gian khóa tạm thời nếu vi phạm (milliseconds)
  description: string;      // Mô tả hành vi
}

export const RATE_LIMIT_RULES: Record<string, RateLimitConfig> = {
  AUTH_LOGIN: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 phút
    lockoutMs: 5 * 60 * 1000, // Khóa 5 phút nếu nhập sai quá 5 lần
    description: 'Đăng nhập tài khoản'
  },
  AUTH_OTP: {
    maxRequests: 3,
    windowMs: 10 * 60 * 1000, // 10 phút
    lockoutMs: 10 * 60 * 1000,
    description: 'Gửi yêu cầu mã OTP'
  },
  AUTH_REGISTER: {
    maxRequests: 4,
    windowMs: 60 * 60 * 1000, // 1 giờ
    description: 'Đăng ký tài khoản mới'
  },
  TRIAL_BOOKING: {
    maxRequests: 3,
    windowMs: 10 * 60 * 1000, // 10 phút tối đa 3 lần đăng ký học thử
    lockoutMs: 5 * 60 * 1000,
    description: 'Đăng ký học thử 1-1'
  },
  REVIEW_SUBMIT: {
    maxRequests: 2,
    windowMs: 5 * 60 * 1000,  // 5 phút tối đa 2 đánh giá
    description: 'Gửi đánh giá giáo viên'
  },
  KYC_SUBMIT: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 phút
    description: 'Tải lên hồ sơ đối soát KYC'
  },
  ADMIN_ACTION: {
    maxRequests: 30,
    windowMs: 60 * 1000,      // 1 phút tối đa 30 thao tác
    description: 'Thao tác quản trị viên'
  },
  CONTACT_CLICK: {
    maxRequests: 10,
    windowMs: 60 * 1000,      // 1 phút tối đa 10 click liên hệ
    description: 'Nhấp liên hệ Zalo/Phone'
  }
};

interface RateLimitRecord {
  timestamps: number[];
  lockedUntil?: number;
}

const STORAGE_KEY_RATE_LIMIT = 'hantutor_security_ratelimit';
const STORAGE_KEY_AUDIT_LOGS = 'hantutor_security_audit_logs';

function getStoredRateLimits(): Record<string, RateLimitRecord> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_RATE_LIMIT) || '{}');
  } catch {
    return {};
  }
}

function saveStoredRateLimits(data: Record<string, RateLimitRecord>) {
  try {
    localStorage.setItem(STORAGE_KEY_RATE_LIMIT, JSON.stringify(data));
  } catch (e) {
    console.error('[RateLimiter] Failed to persist rate limits:', e);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTimeMs: number;
  waitSeconds: number;
  errorMessage?: string;
}

export class RateLimiter {
  /**
   * Kiểm tra và ghi nhận yêu cầu theo thuật toán Sliding Window
   */
  static check(actionKey: keyof typeof RATE_LIMIT_RULES, identifier: string = 'client_default'): RateLimitResult {
    const config = RATE_LIMIT_RULES[actionKey];
    if (!config) {
      return { allowed: true, remaining: 999, resetTimeMs: 0, waitSeconds: 0 };
    }

    const now = Date.now();
    const storageKey = `${actionKey}:${identifier}`;
    const allRecords = getStoredRateLimits();
    const record: RateLimitRecord = allRecords[storageKey] || { timestamps: [] };

    // 1. Kiểm tra trạng thái Lockout (nếu đang bị khóa)
    if (record.lockedUntil && record.lockedUntil > now) {
      const waitSeconds = Math.ceil((record.lockedUntil - now) / 1000);
      SecurityAuditLogger.log({
        type: 'RATE_LIMIT_BLOCKED',
        severity: 'MEDIUM',
        action: String(actionKey),
        target: identifier,
        details: `Hành động bị chặn do đang trong thời gian khóa (${waitSeconds}s còn lại).`
      });
      return {
        allowed: false,
        remaining: 0,
        resetTimeMs: record.lockedUntil,
        waitSeconds,
        errorMessage: `Bạn đã thao tác quá nhiều lần. Vui lòng thử lại sau ${waitSeconds} giây.`
      };
    }

    // 2. Lọc bỏ các timestamp nằm ngoài Sliding Window
    const validTimestamps = record.timestamps.filter(ts => now - ts < config.windowMs);

    // 3. Kiểm tra số lượng request
    if (validTimestamps.length >= config.maxRequests) {
      const oldestValid = validTimestamps[0];
      const lockoutDuration = config.lockoutMs || (oldestValid + config.windowMs - now);
      const lockedUntil = now + lockoutDuration;
      const waitSeconds = Math.ceil(lockoutDuration / 1000);

      allRecords[storageKey] = {
        timestamps: validTimestamps,
        lockedUntil
      };
      saveStoredRateLimits(allRecords);

      SecurityAuditLogger.log({
        type: 'RATE_LIMIT_EXCEEDED',
        severity: 'HIGH',
        action: String(actionKey),
        target: identifier,
        details: `Vượt quá giới hạn (${validTimestamps.length}/${config.maxRequests} reqs trong ${config.windowMs / 1000}s). Tạm khóa ${waitSeconds}s.`
      });

      return {
        allowed: false,
        remaining: 0,
        resetTimeMs: lockedUntil,
        waitSeconds,
        errorMessage: `Thao tác quá nhanh (${config.description}). Vui lòng chờ ${waitSeconds} giây.`
      };
    }

    // 4. Cho phép và ghi nhận request mới
    validTimestamps.push(now);
    allRecords[storageKey] = {
      timestamps: validTimestamps,
      lockedUntil: undefined
    };
    saveStoredRateLimits(allRecords);

    const remaining = config.maxRequests - validTimestamps.length;
    return {
      allowed: true,
      remaining,
      resetTimeMs: now + config.windowMs,
      waitSeconds: 0
    };
  }

  /**
   * Reset rate limit cho identifier (ví dụ sau khi đăng nhập thành công)
   */
  static reset(actionKey: keyof typeof RATE_LIMIT_RULES, identifier: string = 'client_default') {
    const storageKey = `${actionKey}:${identifier}`;
    const allRecords = getStoredRateLimits();
    delete allRecords[storageKey];
    saveStoredRateLimits(allRecords);
  }
}

// ============================================================================
// 2. ROW LEVEL SECURITY (RLS) & DATA MASKING ENGINE
// ============================================================================

export type UserRole = 'anonymous' | 'student' | 'teacher' | 'admin';

export interface UserSessionContext {
  userId?: string | number;
  role: UserRole;
  phone?: string;
  email?: string;
  sessionToken?: string;
  kycVerified?: boolean;
}

export class RowLevelSecurity {
  /**
   * Che giấu thông tin nhạy cảm (Data Masking) cho người xem không có quyền
   */
  static maskPhone(phone?: string): string {
    if (!phone) return '09******';
    const clean = phone.replace(/[^0-9]/g, '');
    if (clean.length < 6) return '09******';
    return clean.slice(0, 4) + '***' + clean.slice(-3);
  }

  static maskCCCD(idNum?: string): string {
    if (!idNum) return '001**********';
    const clean = idNum.replace(/[^0-9]/g, '');
    if (clean.length < 6) return '001**********';
    return clean.slice(0, 3) + '******' + clean.slice(-3);
  }

  static maskBankAccount(acc?: string): string {
    if (!acc) return '******';
    if (acc.length <= 4) return '****';
    return '******' + acc.slice(-4);
  }

  static maskEmail(email?: string): string {
    if (!email || !email.includes('@')) return '***@email.com';
    const [name, domain] = email.split('@');
    if (name.length <= 2) return `${name[0]}*@${domain}`;
    return `${name.slice(0, 2)}***@${domain}`;
  }

  /**
   * Áp dụng RLS Policy cho đối tượng Giáo viên (Tutor Profile)
   * - Public: xem thông tin công khai, số điện thoại & CCCD bị mask
   * - Owner Tutor / Admin: xem toàn bộ dữ liệu gốc
   */
  static applyTutorRLS(tutor: any, context: UserSessionContext): any {
    if (!tutor) return null;

    const isOwner = context.role === 'teacher' && (String(context.userId) === String(tutor.id) || (context.phone && context.phone === tutor.phone));
    const isAdmin = context.role === 'admin';

    if (isOwner || isAdmin) {
      return { ...tutor, _accessLevel: 'FULL_PRIVILEGED' };
    }

    // Public / Student View: Mask Sensitive Fields
    return {
      ...tutor,
      phone: this.maskPhone(tutor.phone),
      zalo: tutor.zalo ? this.maskPhone(tutor.zalo) : undefined,
      kycData: tutor.kycData ? {
        status: tutor.kycData.status,
        verifiedAt: tutor.kycData.verifiedAt,
        idNumber: this.maskCCCD(tutor.kycData.idNumber),
        frontDoc: isOwner || isAdmin ? tutor.kycData.frontDoc : undefined,
        degreeDoc: isOwner || isAdmin ? tutor.kycData.degreeDoc : undefined
      } : undefined,
      _accessLevel: 'MASKED_PUBLIC'
    };
  }

  /**
   * Áp dụng RLS Policy cho danh sách Lớp học thử / Đăng ký (Trials & Enrollments)
   * - Học sinh: Chỉ xem được lớp của chính mình
   * - Giáo viên: Chỉ xem được các học sinh đã đăng ký với lớp của mình
   * - Admin: Toàn quyền xem
   */
  static filterTrialsRLS(trials: any[], context: UserSessionContext): any[] {
    if (!Array.isArray(trials)) return [];
    if (context.role === 'admin') return trials;

    if (context.role === 'teacher') {
      return trials.filter(t => String(t.tutorId) === String(context.userId));
    }

    if (context.role === 'student' || context.role === 'anonymous') {
      return trials.filter(t => {
        if (!context.userId && !context.phone) return true;
        return String(t.studentId) === String(context.userId) || (context.phone && t.studentPhone === context.phone);
      });
    }

    return [];
  }

  /**
   * Kiểm tra quyền sửa/xóa bản ghi (Row Ownership Verification)
   */
  static verifyRowOwnership(
    resourceType: 'TUTOR' | 'TRIAL' | 'REVIEW' | 'KYC_DOCUMENT',
    resourceOwnerId: string | number,
    context: UserSessionContext
  ): boolean {
    if (context.role === 'admin') return true;
    if (!context.userId && !context.phone) return false;

    const isMatch = String(context.userId) === String(resourceOwnerId) ||
                    (context.phone && String(context.phone) === String(resourceOwnerId));

    if (!isMatch) {
      SecurityAuditLogger.log({
        type: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        severity: 'HIGH',
        action: `MODIFY_${resourceType}`,
        target: String(resourceOwnerId),
        details: `Người dùng ${context.role} (ID: ${context.userId || 'n/a'}) cố gắng thao tác trên tài nguyên của Owner ID: ${resourceOwnerId}`
      });
    }

    return isMatch;
  }
}

// ============================================================================
// 3. INSECURE DIRECT OBJECT REFERENCES (IDOR) PREVENTION ENGINE
// ============================================================================

export class IDORGuard {
  private static idMap: Map<string, string> = new Map();
  private static reverseMap: Map<string, string> = new Map();

  /**
   * Tạo Secure Non-Sequential Opaque Token thay vì dùng ID số tăng dần (1, 2, 3)
   */
  static toSecureId(resourceType: string, internalId: string | number): string {
    const rawKey = `${resourceType}:${internalId}`;
    if (this.idMap.has(rawKey)) {
      return this.idMap.get(rawKey)!;
    }

    const randomBytes = Math.random().toString(36).substring(2, 10) +
                        Date.now().toString(36).substring(4);
    const secureId = `sec_${resourceType.toLowerCase().slice(0, 3)}_${randomBytes}`;

    this.idMap.set(rawKey, secureId);
    this.reverseMap.set(secureId, String(internalId));
    return secureId;
  }

  /**
   * Giải mã Secure Token về ID gốc nội bộ
   */
  static fromSecureId(secureId: string): string | null {
    if (!secureId) return null;
    if (this.reverseMap.has(secureId)) {
      return this.reverseMap.get(secureId)!;
    }
    return secureId;
  }

  /**
   * Kiểm tra và phòng ngừa tấn công IDOR khi truy cập Object
   * - Ngăn chặn người dùng sửa URL ID để xem dữ liệu của người khác
   */
  static verifyAccess(
    resourceType: 'TUTOR' | 'TRIAL' | 'KYC_DOCUMENT' | 'ORDER',
    objectId: string | number,
    objectOwnerId: string | number,
    context: UserSessionContext
  ): { authorized: boolean; reason?: string } {
    if (resourceType === 'TUTOR') {
      return { authorized: true };
    }

    if (context.role === 'admin') {
      return { authorized: true };
    }

    const isOwner = String(context.userId) === String(objectOwnerId) ||
                    (context.phone && String(context.phone) === String(objectOwnerId));

    if (!isOwner) {
      SecurityAuditLogger.log({
        type: 'IDOR_PROBE_DETECTED',
        severity: 'CRITICAL',
        action: `ACCESS_${resourceType}`,
        target: String(objectId),
        details: `Cảnh báo IDOR: User ${context.role} (ID: ${context.userId || 'Anon'}) cố gắng truy cập trực tiếp đối tượng riêng tư ${resourceType} ID #${objectId} thuộc về Owner ${objectOwnerId}`
      });

      return {
        authorized: false,
        reason: 'Truy cập bị từ chối: Bạn không có quyền xem hoặc thao tác trên đối tượng này (IDOR Protection).'
      };
    }

    return { authorized: true };
  }
}

// ============================================================================
// 4. SECURITY AUDIT LOGGER (Giám sát & Ghi vết an ninh)
// ============================================================================

export interface SecurityAuditEvent {
  id: string;
  timestamp: string;
  type: 'RATE_LIMIT_EXCEEDED' | 'RATE_LIMIT_BLOCKED' | 'IDOR_PROBE_DETECTED' | 'UNAUTHORIZED_ACCESS_ATTEMPT' | 'ADMIN_AUTH_FAILED';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  action: string;
  target: string;
  details: string;
}

export class SecurityAuditLogger {
  static log(event: Omit<SecurityAuditEvent, 'id' | 'timestamp'>) {
    const newEntry: SecurityAuditEvent = {
      id: 'sec_log_' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      ...event
    };

    try {
      const logs = this.getLogs();
      logs.unshift(newEntry);
      const trimmed = logs.slice(0, 100);
      localStorage.setItem(STORAGE_KEY_AUDIT_LOGS, JSON.stringify(trimmed));
      
      if (event.severity === 'CRITICAL' || event.severity === 'HIGH') {
        console.warn(`🚨 [SECURITY ALERT - ${event.type}]`, event.details);
      }
    } catch (e) {
      console.error('[SecurityAuditLogger] Failed to write log:', e);
    }
  }

  static getLogs(): SecurityAuditEvent[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_AUDIT_LOGS) || '[]');
    } catch {
      return [];
    }
  }

  static clearLogs() {
    localStorage.removeItem(STORAGE_KEY_AUDIT_LOGS);
  }
}
