import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import {
  useEnrollmentStore, EnrollmentStatus,
  ENROLLMENT_STATUS_LABELS, ENROLLMENT_STATUS_COLORS, Enrollment
} from '@/store/enrollmentStore';
import { formatPrice } from '@/data/mockData';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';

// QR Code component (reused pattern from tutor profile)
const QR_BANK = 'MB';
const QR_ACCOUNT = '1019637462';
const QR_NAME = 'NGUYEN VIET HOANG';

function buildQRUrl(amount: number, content: string) {
  return `https://qr.sepay.vn/img?bank=${QR_BANK}&acc=${QR_ACCOUNT}&template=compact&amount=${amount}&des=${encodeURIComponent(content)}&download=false`;
}

// CSKH Admin Panel - simulates internal staff actions
function CskhPanel({ enrollment, onUpdate }: { enrollment: Enrollment; onUpdate: (id: string, s: EnrollmentStatus) => void }) {
  const nextActions: { from: EnrollmentStatus; to: EnrollmentStatus; label: string; color: string }[] = [
    { from: 'pending', to: 'trial', label: '📅 Xếp lịch học thử', color: '#3B82F6' },
    { from: 'trial', to: 'waiting_confirm', label: '📞 Đánh dấu đã học thử', color: '#8B5CF6' },
    { from: 'waiting_confirm', to: 'confirmed', label: '✅ PH xác nhận – Mở thanh toán', color: '#10B981' },
  ];
  const action = nextActions.find(a => a.from === enrollment.status);
  if (!action) return null;

  return (
    <TouchableOpacity
      style={[styles.cskhBtn, { backgroundColor: action.color }]}
      onPress={() => {
        Alert.alert(
          '🔑 CSKH – Cập nhật trạng thái',
          `Xác nhận chuyển sang:\n"${ENROLLMENT_STATUS_LABELS[action.to]}"?`,
          [
            { text: 'Huỷ', style: 'cancel' },
            { text: 'Xác nhận', onPress: () => onUpdate(enrollment.id, action.to) },
          ]
        );
      }}
    >
      <Text style={styles.cskhBtnText}>{action.label}</Text>
    </TouchableOpacity>
  );
}

// Payment Modal
function PaymentModal({ visible, enrollment, onClose, onPaid }: {
  visible: boolean; enrollment: Enrollment | null; onClose: () => void; onPaid: () => void;
}) {
  const [status, setStatus] = useState<'qr' | 'processing' | 'done'>('qr');
  if (!enrollment) return null;

  const content = `EduConnect ${enrollment.classTitle} ${enrollment.parentPhone}`;
  const qrUrl = buildQRUrl(enrollment.price, content);

  const handleConfirm = () => {
    setStatus('processing');
    setTimeout(() => {
      setStatus('done');
      setTimeout(() => {
        setStatus('qr');
        onPaid();
      }, 1500);
    }, 2000);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.payOverlay}>
        <View style={styles.paySheet}>
          <View style={styles.payHeader}>
            <Text style={styles.payTitle}>💳 Thanh toán học phí</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {status === 'done' ? (
            <View style={styles.paySuccess}>
              <Text style={{ fontSize: 56 }}>🎊</Text>
              <Text style={styles.paySuccessTitle}>Thanh toán thành công!</Text>
              <Text style={styles.paySuccessDesc}>Chúc mừng bạn đã đăng ký thành công lớp học!</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.payInfoCard}>
                <Text style={styles.payInfoLabel}>Lớp học</Text>
                <Text style={styles.payInfoValue}>{enrollment.classTitle}</Text>
                
                <Text style={styles.payInfoLabel}>Chi tiết học phí</Text>
                <View style={{ gap: 4, marginTop: 4 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: Typography.xs, color: Colors.textMuted }}>Học phí gốc:</Text>
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: Typography.xs, color: Colors.text }}>{formatPrice(enrollment.price)}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: Typography.xs, color: '#10B981' }}>Ưu đãi học viên (giảm 10%):</Text>
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: Typography.xs, color: '#10B981' }}>- {formatPrice(enrollment.price * 0.1)}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 4, marginTop: 4 }}>
                    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: Typography.sm, color: Colors.primary }}>Thực tế thanh toán:</Text>
                    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: Typography.sm, color: Colors.primary }}>{formatPrice(enrollment.price * 0.9)}</Text>
                  </View>
                </View>

                <Text style={styles.payInfoLabel}>Nội dung CK</Text>
                <Text style={[styles.payInfoValue, { fontFamily: 'Inter_600SemiBold', fontSize: Typography.sm }]}>{content}</Text>
              </View>

              <Text style={styles.payQrLabel}>Quét mã QR để thanh toán</Text>
              {/* eslint-disable-next-line @typescript-eslint/no-require-imports */}
              <View style={styles.qrWrap}>
                {/* Using Image with network URL */}
                <Text style={{ textAlign: 'center', color: Colors.textMuted, fontSize: Typography.xs, marginBottom: 8 }}>
                  STK: {QR_ACCOUNT} — {QR_BANK}{'\n'}{QR_NAME}
                </Text>
                <View style={{ alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12 }}>
                  {/* QR image via URL */}
                  <Text style={{ fontSize: 80, lineHeight: 90 }}>📱</Text>
                  <Text style={{ fontFamily: 'Inter_500Medium', fontSize: Typography.sm, color: Colors.textSecondary, textAlign: 'center', marginTop: 4 }}>
                    Mã QR sẽ hiển thị sau khi tích hợp cổng thanh toán thật
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.payConfirmBtn, status === 'processing' && { opacity: 0.7 }]}
                onPress={handleConfirm}
                disabled={status === 'processing'}
              >
                <Ionicons name={status === 'processing' ? 'hourglass' : 'checkmark-circle'} size={20} color={Colors.surface} />
                <Text style={styles.payConfirmBtnText}>
                  {status === 'processing' ? 'Đang xử lý...' : 'Xác nhận đã chuyển khoản'}
                </Text>
              </TouchableOpacity>
              <View style={{ height: 24 }} />
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

// Status Badge
function StatusBadge({ status }: { status: EnrollmentStatus }) {
  const color = ENROLLMENT_STATUS_COLORS[status];
  const label = ENROLLMENT_STATUS_LABELS[status];
  return (
    <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color + '40' }]}>
      <View style={[styles.badgeDot, { backgroundColor: color }]} />
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

export default function EnrollmentsScreen() {
  const { enrollments, updateStatus } = useEnrollmentStore();
  const { user } = useAuthStore();
  const [paymentTarget, setPaymentTarget] = useState<Enrollment | null>(null);

  const router = useRouter();

  if (!user) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="school-outline" size={72} color={Colors.border} />
        <Text style={styles.emptyTitle}>Đăng nhập để xem đơn đăng ký</Text>
        <Text style={styles.emptyDesc}>Sau khi đăng ký học thử, bạn cần đăng nhập để theo dõi trạng thái và thanh toán.</Text>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: 14, borderRadius: Radius.lg, marginTop: Spacing.sm, width: '100%', justifyContent: 'center' }}
          onPress={() => router.push('/(auth)/login')}
        >
          <Ionicons name="log-in-outline" size={20} color={Colors.surface} />
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: Typography.base, color: Colors.surface }}>Đăng nhập</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ paddingVertical: 8 }} onPress={() => router.push('/(auth)/register')}>
          <Text style={{ fontFamily: 'Inter_500Medium', fontSize: Typography.sm, color: Colors.primary }}>Chưa có tài khoản? Đăng ký miễn phí</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (enrollments.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="school-outline" size={56} color={Colors.border} />
        <Text style={styles.emptyTitle}>Chưa có đơn đăng ký</Text>
        <Text style={styles.emptyDesc}>Tìm lớp học phù hợp và đăng ký học thử ngay!</Text>
      </View>
    );
  }

  const handlePaid = (id: string) => {
    updateStatus(id, 'paid');
    setPaymentTarget(null);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Flow guide */}
      <View style={styles.flowCard}>
        <Text style={styles.flowTitle}>📋 Quy trình đăng ký lớp</Text>
        <View style={styles.flowSteps}>
          {[
            { icon: '1️⃣', label: 'Chốt lớp' },
            { icon: '→', label: '', isArrow: true },
            { icon: '2️⃣', label: 'Học thử' },
            { icon: '→', label: '', isArrow: true },
            { icon: '📞', label: 'CSKH gọi' },
            { icon: '→', label: '', isArrow: true },
            { icon: '💳', label: 'Thanh toán' },
          ].map((s, i) => (
            <View key={i} style={s.isArrow ? styles.flowArrow : styles.flowStep}>
              <Text style={s.isArrow ? styles.flowArrowText : styles.flowIcon}>{s.icon}</Text>
              {!s.isArrow && <Text style={styles.flowLabel}>{s.label}</Text>}
            </View>
          ))}
        </View>
      </View>

      <Text style={styles.listTitle}>Đơn đăng ký của bạn ({enrollments.length})</Text>

      {enrollments.map((enr) => (
        <View key={enr.id} style={styles.card}>
          {/* Card header */}
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle} numberOfLines={2}>{enr.classTitle}</Text>
              <Text style={styles.cardSub}>
                <Ionicons name="person-outline" size={13} /> {enr.instructorName}
              </Text>
            </View>
          </View>

          <StatusBadge status={enr.status} />

          <View style={styles.cardBody}>
            <View style={styles.cardRow}>
              <Ionicons name="calendar-outline" size={15} color={Colors.textMuted} />
              <Text style={styles.cardRowText}>{enr.schedule}</Text>
            </View>
            <View style={styles.cardRow}>
              <Ionicons name="call-outline" size={15} color={Colors.textMuted} />
              <Text style={styles.cardRowText}>{enr.parentName} — {enr.parentPhone}</Text>
            </View>
            {enr.studentName ? (
              <View style={styles.cardRow}>
                <Ionicons name="school-outline" size={15} color={Colors.textMuted} />
                <Text style={styles.cardRowText}>Học viên: {enr.studentName}{enr.studentAge ? `, ${enr.studentAge} tuổi` : ''}</Text>
              </View>
            ) : null}
            {enr.note ? (
              <View style={styles.cardRow}>
                <Ionicons name="chatbubble-outline" size={15} color={Colors.textMuted} />
                <Text style={styles.cardRowText} numberOfLines={2}>{enr.note}</Text>
              </View>
            ) : null}
            <View style={styles.cardRow}>
              <Ionicons name="cash-outline" size={15} color={Colors.primary} />
              <Text style={[styles.cardRowText, { color: Colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
                {formatPrice(enr.price)}/buổi
              </Text>
            </View>

            {/* Financial breakdown */}
            <View style={{ marginTop: Spacing.sm, padding: Spacing.sm, backgroundColor: Colors.background, borderRadius: Radius.md, gap: 4 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: Typography.xs, color: Colors.textSecondary }}>Học phí gốc:</Text>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: Typography.xs, color: Colors.text }}>{formatPrice(enr.price)}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: Typography.xs, color: '#10B981' }}>Ưu đãi học viên (10%):</Text>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: Typography.xs, color: '#10B981' }}>- {formatPrice(enr.price * 0.1)}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: Colors.border, paddingBottom: 4, marginBottom: 4 }}>
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: Typography.xs, color: Colors.primary }}>Học viên thực trả:</Text>
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: Typography.xs, color: Colors.primary }}>{formatPrice(enr.price * 0.9)}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: Typography.xs, color: Colors.textMuted }}>Phí nền tảng (30% gia sư):</Text>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: Typography.xs, color: Colors.textMuted }}>{formatPrice(enr.price * 0.3)}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: Typography.xs, color: Colors.textSecondary }}>Thực nhận của Gia sư:</Text>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: Typography.xs, color: Colors.textSecondary }}>{formatPrice(enr.price * 0.7)}</Text>
              </View>
            </View>
          </View>

          {/* CSKH simulation panel */}
          <View style={styles.cskhSection}>
            <Text style={styles.cskhLabel}>🔑 CSKH (Nội bộ — Demo)</Text>
            <CskhPanel enrollment={enr} onUpdate={updateStatus} />
            {(enr.status === 'paid') && (
              <View style={styles.paidBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.paidText}>Đã hoàn tất thanh toán</Text>
              </View>
            )}
          </View>

          {/* Payment button - only when confirmed */}
          {enr.status === 'confirmed' && (
            <TouchableOpacity
              style={styles.payBtn}
              onPress={() => setPaymentTarget(enr)}
            >
              <Ionicons name="qr-code" size={20} color={Colors.surface} />
              <Text style={styles.payBtnText}>Thanh toán ngay</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      <View style={{ height: 32 }} />

      <PaymentModal
        visible={!!paymentTarget}
        enrollment={paymentTarget}
        onClose={() => setPaymentTarget(null)}
        onPaid={() => paymentTarget && handlePaid(paymentTarget.id)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.md,
  },
  flowCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  flowTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: Typography.sm,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  flowSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  flowStep: {
    alignItems: 'center',
    minWidth: 44,
  },
  flowIcon: { fontSize: 20 },
  flowLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  flowArrow: { paddingHorizontal: 2 },
  flowArrowText: { fontSize: 16, color: Colors.textMuted },
  listTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: Typography.lg,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  cardHeader: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    gap: 8,
  },
  cardTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: Typography.base,
    color: Colors.text,
    marginBottom: 4,
  },
  cardSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  badgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: Typography.xs,
  },
  cardBody: {
    padding: Spacing.md,
    gap: 8,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  cardRowText: {
    fontFamily: 'Inter_400Regular',
    fontSize: Typography.sm,
    color: Colors.text,
    flex: 1,
    lineHeight: 20,
  },
  cskhSection: {
    backgroundColor: '#FEF3C7',
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#FDE68A',
  },
  cskhLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: Typography.xs,
    color: '#92400E',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cskhBtn: {
    paddingVertical: 10,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  cskhBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: Typography.sm,
    color: '#fff',
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  paidText: {
    fontFamily: 'Inter_500Medium',
    fontSize: Typography.sm,
    color: '#10B981',
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    margin: Spacing.md,
    paddingVertical: 14,
    borderRadius: Radius.lg,
    ...Shadow.md,
  },
  payBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: Typography.base,
    color: Colors.surface,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: Typography.xl,
    color: Colors.text,
    marginTop: Spacing.sm,
  },
  emptyDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Payment Modal
  payOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  paySheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    paddingTop: 8,
  },
  payHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  payTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: Typography.lg,
    color: Colors.text,
  },
  payInfoCard: {
    backgroundColor: Colors.background,
    margin: Spacing.lg,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 4,
  },
  payInfoLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: Typography.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 8,
  },
  payInfoValue: {
    fontFamily: 'Inter_500Medium',
    fontSize: Typography.base,
    color: Colors.text,
  },
  payQrLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  qrWrap: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  payConfirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    marginHorizontal: Spacing.lg,
    paddingVertical: 14,
    borderRadius: Radius.lg,
    ...Shadow.md,
  },
  payConfirmBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: Typography.base,
    color: Colors.surface,
  },
  paySuccess: {
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  paySuccessTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: Typography.xl,
    color: Colors.text,
  },
  paySuccessDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
