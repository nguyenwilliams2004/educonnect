import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = path.resolve(import.meta.dirname, '..');

test('GA4 ANALYTICS - index.html chứa mã theo dõi chính thức G-V0S336XPVN', () => {
  const indexPath = path.join(rootDir, 'index.html');
  const indexHtml = fs.readFileSync(indexPath, 'utf8');

  assert.ok(indexHtml.includes('googletagmanager.com/gtag/js?id=G-V0S336XPVN'), 'Phải nạp thư viện gtag.js với mã G-V0S336XPVN');
  assert.ok(indexHtml.includes("gtag('config', 'G-V0S336XPVN'"), 'Phải khởi tạo cấu hình gtag cho mã G-V0S336XPVN');
  assert.ok(indexHtml.includes('send_page_view: false'), 'Phải tắt auto pageview ở root để React Router chủ động gửi chính xác trên SPA');
});

test('GA4 ANALYTICS - Module analytics.ts sẵn sàng phục vụ SPA và Business Events', () => {
  const analyticsPath = path.join(rootDir, 'src', 'lib', 'analytics.ts');
  assert.ok(fs.existsSync(analyticsPath), 'File src/lib/analytics.ts phải tồn tại');

  const code = fs.readFileSync(analyticsPath, 'utf8');
  assert.ok(code.includes("GA_MEASUREMENT_ID = 'G-V0S336XPVN'"), 'Mã GA_MEASUREMENT_ID phải là G-V0S336XPVN');
  assert.ok(code.includes('trackPageView'), 'Phải có hàm trackPageView');
  assert.ok(code.includes('trackEvent'), 'Phải có hàm trackEvent');
  assert.ok(code.includes('trackTutorSearch'), 'Phải có hàm trackTutorSearch');
  assert.ok(code.includes('trackTutorView'), 'Phải có hàm trackTutorView');
  assert.ok(code.includes('trackBookingStart'), 'Phải có hàm trackBookingStart');
  assert.ok(code.includes('trackContactClick'), 'Phải có hàm trackContactClick');
});

test('GA4 ANALYTICS - App.tsx tích hợp RouteChangeTracker bắt mọi lần chuyển trang SPA', () => {
  const appPath = path.join(rootDir, 'src', 'app', 'App.tsx');
  const appCode = fs.readFileSync(appPath, 'utf8');

  assert.ok(appCode.includes("trackPageView(location.pathname + location.search)"), 'Phải bắt URL và UTM query params khi chuyển route');
  assert.ok(appCode.includes('<RouteChangeTracker />'), 'Phải gắn RouteChangeTracker vào cây Component');
});

test('GA4 ANALYTICS - FloatingContactDock ghi nhận sự kiện chuyển đổi tương tác', () => {
  const dockPath = path.join(rootDir, 'src', 'app', 'components', 'FloatingContactDock.tsx');
  const dockCode = fs.readFileSync(dockPath, 'utf8');

  assert.ok(dockCode.includes("trackContactClick('messenger')"), 'Phải bắt sự kiện khi click Messenger');
  assert.ok(dockCode.includes("trackEvent('ai_chat_open')"), 'Phải bắt sự kiện khi mở AI Chat');
});
