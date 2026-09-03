/**
 * Google Analytics 4 (GA4) Integration Module
 * Production-ready tracking for HanTutor SPA
 */

export const GA_MEASUREMENT_ID = 'G-V0S336XPVN';

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Kiểm tra xem môi trường hiện tại có hỗ trợ Google Analytics không
 */
export function isGaAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

/**
 * Gửi sự kiện xem trang (page_view) cho Single Page Application (SPA)
 * Tự động ghi nhận: URL đầy đủ, pathname, query parameters (UTM tags), document title.
 */
export function trackPageView(url: string, title?: string): void {
  try {
    if (!isGaAvailable()) return;

    window.gtag!('event', 'page_view', {
      page_title: title || document.title,
      page_location: window.location.href,
      page_path: url,
      send_to: GA_MEASUREMENT_ID,
    });
  } catch (error) {
    // Không bao giờ để lỗi tracking làm gián đoạn trải nghiệm người dùng
    console.warn('[GA4] Lỗi ghi nhận page_view:', error);
  }
}

/**
 * Gửi sự kiện tùy biến (Custom Event) lên GA4
 */
export function trackEvent(eventName: string, eventParams: Record<string, any> = {}): void {
  try {
    if (!isGaAvailable()) return;

    window.gtag!('event', eventName, {
      ...eventParams,
      send_to: GA_MEASUREMENT_ID,
    });
  } catch (error) {
    console.warn(`[GA4] Lỗi ghi nhận event ${eventName}:`, error);
  }
}

/**
 * Theo dõi sự kiện Tìm kiếm gia sư
 */
export function trackTutorSearch(searchQuery: string, subject?: string, grade?: string): void {
  trackEvent('search', {
    search_term: searchQuery,
    subject_filter: subject || 'all',
    grade_filter: grade || 'all',
  });
}

/**
 * Theo dõi sự kiện Xem chi tiết gia sư
 */
export function trackTutorView(tutorId: string, tutorName: string, subject?: string): void {
  trackEvent('view_item', {
    item_id: tutorId,
    item_name: tutorName,
    item_category: subject || 'Tutor',
  });
}

/**
 * Theo dõi sự kiện Bắt đầu đặt lịch học thử / Đăng ký học
 */
export function trackBookingStart(tutorId: string, tutorName: string, price?: number): void {
  trackEvent('begin_checkout', {
    item_id: tutorId,
    item_name: tutorName,
    value: price || 0,
    currency: 'VND',
  });
}

/**
 * Theo dõi sự kiện Bấm vào liên hệ Zalo, Hotline, Messenger
 */
export function trackContactClick(channel: 'zalo' | 'messenger' | 'phone' | 'dock'): void {
  trackEvent('contact_click', {
    channel,
  });
}
