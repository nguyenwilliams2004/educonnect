import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import {
  LEARNER_BOOKINGS, INSTRUCTOR_BOOKINGS, LEARNER_MESSAGES, INSTRUCTOR_MESSAGES,
  REVIEWS, INSTRUCTORS, LEARNERS, Booking, formatPrice,
} from '@/data/mockData';

type Tab = 'overview' | 'bookings' | 'messages' | 'reviews';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', completed: 'Hoàn thành', cancelled: 'Đã hủy',
};
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: Colors.warningLight, text: Colors.warning },
  confirmed: { bg: Colors.successLight, text: Colors.success },
  completed: { bg: Colors.primaryLight, text: Colors.primary },
  cancelled: { bg: Colors.dangerLight, text: Colors.danger },
};

export default function DashboardScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const isInstructor = user?.role === 'instructor';
  const [tab, setTab] = useState<Tab>('overview');
  const bookings = isInstructor ? INSTRUCTOR_BOOKINGS : LEARNER_BOOKINGS;
  const messages = isInstructor ? INSTRUCTOR_MESSAGES : LEARNER_MESSAGES;

  if (!user) {
    return (
      <View style={styles.guestContainer}>
        <Ionicons name="person-circle-outline" size={72} color={Colors.border} />
        <Text style={styles.guestTitle}>Chưa đăng nhập</Text>
        <Text style={styles.guestDesc}>Đăng nhập để xem lịch học, tin nhắn và quản lý tài khoản của bạn.</Text>
        <TouchableOpacity style={styles.guestLoginBtn} onPress={() => router.push('/(auth)/login')}>
          <Ionicons name="log-in-outline" size={20} color={Colors.surface} />
          <Text style={styles.guestLoginText}>Đăng nhập</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.guestRegisterBtn} onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.guestRegisterText}>Chưa có tài khoản? Đăng ký miễn phí</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const BookingCard = ({ b }: { b: Booking }) => (
    <View style={styles.bookingCard}>
      <View style={[styles.bAvatar, { backgroundColor: b.personBg + '18' }]}>
        <Text style={[styles.bAvatarText, { color: b.personBg }]}>{b.personAvatar}</Text>
      </View>
      <View style={styles.bInfo}>
        <Text style={styles.bName}>{b.personName}</Text>
        <Text style={styles.bMeta}>{b.skill} · {b.date}</Text>
        <Text style={styles.bMeta}>{b.time} · {b.type}</Text>
      </View>
      <View style={styles.bRight}>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[b.status].bg }]}>
          <Text style={[styles.statusText, { color: STATUS_COLORS[b.status].text }]}>{STATUS_LABELS[b.status]}</Text>
        </View>
        <Text style={styles.bPrice}>{formatPrice(b.price)}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile header */}
      <View style={styles.profileHeader}>
        <View style={[styles.headerAvatar, { backgroundColor: user.avatarBg || Colors.primary }]}>
          <Text style={styles.headerAvatarText}>{user.avatar || user.name[0].toUpperCase()}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{user.name}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name={isInstructor ? 'briefcase' : 'person'} size={12} color={Colors.primary} />
            <Text style={styles.roleText}>{isInstructor ? 'Chuyên gia giảng dạy' : 'Học viên'}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.settingsBtn} onPress={() => Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
          { text: 'Huỷ', style: 'cancel' },
          { text: 'Đăng xuất', style: 'destructive', onPress: logout },
        ])}>
          <Ionicons name="log-out-outline" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {isInstructor ? (
          <>
            <View style={styles.statCard}><Text style={styles.statVal}>142</Text><Text style={styles.statLbl}>Học viên</Text></View>
            <View style={styles.statCard}><Text style={styles.statVal}>4.9</Text><Text style={styles.statLbl}>Đánh giá</Text></View>
            <View style={styles.statCard}><Text style={styles.statVal}>4.5M</Text><Text style={styles.statLbl}>Thu nhập</Text></View>
          </>
        ) : (
          <>
            <View style={styles.statCard}><Text style={styles.statVal}>3</Text><Text style={styles.statLbl}>Buổi học</Text></View>
            <View style={styles.statCard}><Text style={styles.statVal}>1</Text><Text style={styles.statLbl}>Hoàn thành</Text></View>
            <View style={styles.statCard}><Text style={styles.statVal}>3</Text><Text style={styles.statLbl}>Yêu thích</Text></View>
          </>
        )}
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={styles.tabContent}>
        {(['overview', 'bookings', 'messages', 'reviews'] as Tab[]).map((t) => (
          <TouchableOpacity key={t} style={[styles.tabBtn, tab === t && styles.tabBtnActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'overview' ? 'Tổng quan' : t === 'bookings' ? 'Lịch học' : t === 'messages' ? 'Tin nhắn' : 'Đánh giá'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.content}>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <View style={{ gap: Spacing.lg }}>
            {isInstructor ? (
              <>
                <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Nhu cầu học mới</Text></View>
                {LEARNERS.slice(0, 2).map((s) => (
                  <View key={s.id} style={styles.requestCard}>
                    <View style={[styles.reqAv, { backgroundColor: s.avatarBg + '18' }]}><Text style={[styles.reqAvText, { color: s.avatarBg }]}>{s.avatar}</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reqName}>{s.name} · {s.level}</Text>
                      <Text style={styles.reqSub}>{s.skills.join(', ')} · {formatPrice(s.budget)}/giờ</Text>
                    </View>
                    <TouchableOpacity style={styles.acceptBtn} onPress={() => Alert.alert('Đã nhận', `Bạn đã nhận dạy ${s.name}!`)}>
                      <Text style={styles.acceptBtnText}>Nhận dạy</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            ) : (
              <>
                <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Chuyên gia gợi ý</Text></View>
                {INSTRUCTORS.slice(0, 3).map((t) => (
                  <TouchableOpacity key={t.id} style={styles.bookingCard} onPress={() => router.push(`/tutor/${t.id}`)}>
                    <View style={[styles.bAvatar, { backgroundColor: t.avatarBg + '18' }]}><Text style={[styles.bAvatarText, { color: t.avatarBg }]}>{t.avatar}</Text></View>
                    <View style={styles.bInfo}>
                      <Text style={styles.bName}>{t.name}</Text>
                      <Text style={styles.bMeta}>{t.skills.join(', ')}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="star" size={11} color="#F59E0B" />
                        <Text style={styles.bMeta}>{t.rating}</Text>
                      </View>
                    </View>
                    <Text style={styles.bPrice}>{formatPrice(t.price)}/giờ</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </View>
        )}

        {/* BOOKINGS */}
        {tab === 'bookings' && (
          <View style={{ gap: Spacing.md }}>
            <Text style={styles.sectionTitle}>Lịch {isInstructor ? 'dạy' : 'học'} của tôi</Text>
            {bookings.map((b) => <BookingCard key={b.id} b={b} />)}
          </View>
        )}

        {/* MESSAGES */}
        {tab === 'messages' && (
          <View style={{ gap: Spacing.sm }}>
            <Text style={styles.sectionTitle}>Tin nhắn</Text>
            {messages.map((m) => (
              <TouchableOpacity key={m.id} style={[styles.msgItem, m.unread && styles.msgItemUnread]} onPress={() => router.push('/chat')}>
                <View style={[styles.msgAv, { backgroundColor: m.avatarBg }]}><Text style={styles.msgAvText}>{m.avatar}</Text></View>
                <View style={styles.msgInfo}>
                  <Text style={[styles.msgName, m.unread && { fontFamily: 'Inter_700Bold' }]}>{m.name}</Text>
                  <Text style={styles.msgLast} numberOfLines={1}>{m.last}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  <Text style={styles.msgTime}>{m.time}</Text>
                  {m.unread && <View style={styles.unreadDot} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* REVIEWS */}
        {tab === 'reviews' && (
          <View style={{ gap: Spacing.md }}>
            <Text style={styles.sectionTitle}>Đánh giá</Text>
            {REVIEWS.map((r) => (
              <View key={r.id} style={styles.reviewCard}>
                <View style={styles.reviewTop}>
                  <View style={styles.reviewAv}><Text style={styles.reviewAvText}>{r.avatar}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewAuthor}>{r.author}</Text>
                    <Text style={styles.reviewDate}>{r.date}</Text>
                  </View>
                  <View style={styles.ratingRow}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Ionicons key={i} name="star" size={13} color={i < r.rating ? '#F59E0B' : Colors.border} />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewComment}>{r.comment}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={{ height: Spacing['2xl'] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.xl, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  headerAvatarText: { fontFamily: 'Inter_700Bold', fontSize: Typography.xl, color: Colors.surface },
  headerInfo: { flex: 1 },
  headerName: { fontFamily: 'Manrope_700Bold', fontSize: Typography.lg, color: Colors.text },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  roleText: { fontFamily: 'Inter_500Medium', fontSize: Typography.sm, color: Colors.primary },
  settingsBtn: { padding: Spacing.sm },
  statsRow: { flexDirection: 'row', gap: Spacing.md, padding: Spacing.base, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  statCard: { flex: 1, alignItems: 'center', padding: Spacing.md, backgroundColor: Colors.background, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border },
  statVal: { fontFamily: 'Manrope_800ExtraBold', fontSize: Typography.xl, color: Colors.primary },
  statLbl: { fontFamily: 'Inter_400Regular', fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  tabScroll: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tabContent: { flexDirection: 'row', padding: Spacing.sm, gap: Spacing.sm },
  tabBtn: { paddingHorizontal: Spacing.md, paddingVertical: 9, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border },
  tabBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontFamily: 'Inter_500Medium', fontSize: Typography.sm, color: Colors.textSecondary },
  tabTextActive: { color: Colors.surface, fontFamily: 'Inter_600SemiBold' },
  content: { padding: Spacing.base },
  sectionHeader: { marginBottom: Spacing.sm },
  sectionTitle: { fontFamily: 'Manrope_700Bold', fontSize: Typography.lg, color: Colors.text, marginBottom: Spacing.sm },
  bookingCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  bAvatar: { width: 44, height: 44, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  bAvatarText: { fontFamily: 'Manrope_700Bold', fontSize: Typography.lg },
  bInfo: { flex: 1 },
  bName: { fontFamily: 'Inter_600SemiBold', fontSize: Typography.base, color: Colors.text, marginBottom: 2 },
  bMeta: { fontFamily: 'Inter_400Regular', fontSize: Typography.xs, color: Colors.textSecondary },
  bRight: { alignItems: 'flex-end', gap: 6 },
  bPrice: { fontFamily: 'Manrope_700Bold', fontSize: Typography.sm, color: Colors.primary },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  statusText: { fontFamily: 'Inter_600SemiBold', fontSize: Typography.xs },
  requestCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  reqAv: { width: 44, height: 44, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  reqAvText: { fontFamily: 'Manrope_700Bold', fontSize: Typography.lg },
  reqName: { fontFamily: 'Inter_600SemiBold', fontSize: Typography.base, color: Colors.text },
  reqSub: { fontFamily: 'Inter_400Regular', fontSize: Typography.sm, color: Colors.textSecondary },
  acceptBtn: { backgroundColor: Colors.success, borderRadius: Radius.sm, paddingHorizontal: 12, paddingVertical: 7 },
  acceptBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: Typography.sm, color: Colors.surface },
  msgItem: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, flexDirection: 'row', gap: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  msgItemUnread: { backgroundColor: Colors.primaryLight + '50', borderColor: Colors.primary + '40' },
  msgAv: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  msgAvText: { fontFamily: 'Inter_700Bold', fontSize: Typography.md, color: Colors.surface },
  msgInfo: { flex: 1 },
  msgName: { fontFamily: 'Inter_600SemiBold', fontSize: Typography.base, color: Colors.text, marginBottom: 2 },
  msgLast: { fontFamily: 'Inter_400Regular', fontSize: Typography.sm, color: Colors.textSecondary },
  msgTime: { fontFamily: 'Inter_400Regular', fontSize: Typography.xs, color: Colors.textMuted },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  reviewCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  reviewTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  reviewAv: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  reviewAvText: { fontFamily: 'Inter_700Bold', fontSize: Typography.sm, color: Colors.primary },
  reviewAuthor: { fontFamily: 'Inter_600SemiBold', fontSize: Typography.base, color: Colors.text },
  reviewDate: { fontFamily: 'Inter_400Regular', fontSize: Typography.xs, color: Colors.textMuted },
  ratingRow: { flexDirection: 'row', gap: 2 },
  reviewComment: { fontFamily: 'Inter_400Regular', fontSize: Typography.sm, color: Colors.textSecondary, lineHeight: 20 },
  // Guest state
  guestContainer: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: Spacing.md },
  guestTitle: { fontFamily: 'Manrope_700Bold', fontSize: Typography['2xl'], color: Colors.text, marginTop: Spacing.sm },
  guestDesc: { fontFamily: 'Inter_400Regular', fontSize: Typography.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  guestLoginBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: 14, borderRadius: Radius.lg, marginTop: Spacing.sm, width: '100%', justifyContent: 'center' },
  guestLoginText: { fontFamily: 'Inter_600SemiBold', fontSize: Typography.base, color: Colors.surface },
  guestRegisterBtn: { paddingVertical: 8 },
  guestRegisterText: { fontFamily: 'Inter_500Medium', fontSize: Typography.sm, color: Colors.primary },
});
