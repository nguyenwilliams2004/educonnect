import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Platform, useWindowDimensions
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { INSTRUCTORS, formatPrice, CATEGORY_MAP } from '@/data/mockData';
import { useAuthStore } from '@/store/authStore';
import TrialRequestModal from '@/components/TrialRequestModal';
import SafeImage from '@/components/SafeImage';

export default function InstructorProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;
  const contentMaxWidth = 1200;

  const instructor = INSTRUCTORS.find((t) => t.id === parseInt(id as string)) || INSTRUCTORS[0];
  const [trialModalOpen, setTrialModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);

  const category = CATEGORY_MAP[instructor.categoryType];

  const avgRating = instructor.reviews.length > 0
    ? (instructor.reviews.reduce((sum, r) => sum + r.rating, 0) / instructor.reviews.length).toFixed(1)
    : instructor.rating.toString();

  const handleRegister = (c: any) => {
    setSelectedClass(c);
    setTrialModalOpen(true);
  };

  const BookingSidebar = () => (
    <View style={styles.sidebarCard}>
      <View style={{ marginBottom: Spacing.xl }}>
        <Text style={styles.priceMain}>{formatPrice(instructor.price)}<Text style={styles.priceUnit}>/giờ</Text></Text>
        <View style={styles.ratingSmall}>
          <Ionicons name="star" size={14} color={Colors.warning} />
          <Text style={styles.ratingSmallText}>{instructor.rating} ({instructor.reviewCount} đánh giá)</Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.bookBtn} onPress={() => handleRegister(null)}>
        <Text style={styles.bookBtnText}>Liên hệ & Đăng ký</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.msgBtn} onPress={() => router.push('/chat')}>
        <Ionicons name="chatbubble-ellipses-outline" size={20} color={Colors.primary} />
        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: Typography.sm, color: Colors.primary, marginLeft: 8 }}>Nhắn tin</Text>
      </TouchableOpacity>

      <View style={{ marginTop: Spacing.xl, gap: Spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="shield-checkmark" size={16} color={Colors.success} />
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: Typography.sm, color: Colors.text }}>Bảo vệ thanh toán 100%</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="refresh" size={16} color={Colors.success} />
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: Typography.sm, color: Colors.text }}>Hỗ trợ đổi chuyên gia</Text>
        </View>
      </View>
    </View>
  );

  return (
    <>
      <View style={[styles.container, isDesktop && { alignItems: 'center' }]}>
        <View style={[isDesktop && { width: '100%', maxWidth: contentMaxWidth, flexDirection: 'row', gap: Spacing['2xl'], paddingTop: Spacing.xl, paddingBottom: Spacing.xl, flex: 1 }]}>
          
          {/* Main Content (Left on Desktop) */}
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {/* Profile header card */}
            <View style={[styles.headerCard, isDesktop && styles.desktopCard]}>
              <View style={styles.headerTop}>
                <SafeImage uri={instructor.avatarUrl} style={[styles.avatarImage, isDesktop && { width: 120, height: 120 }]} fallbackText={instructor.avatar} fallbackBg={instructor.avatarBg} />
                <View style={styles.headerInfo}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.name, isDesktop && { fontSize: 32 }]}>{instructor.name}</Text>
                    {instructor.verified && (
                      <Ionicons name="checkmark-circle" size={isDesktop ? 24 : 18} color={Colors.primary} style={{ marginLeft: 4 }} />
                    )}
                  </View>
                  <Text style={[styles.location, isDesktop && { fontSize: Typography.base }]}>
                    <Ionicons name="location" size={14} color={Colors.textMuted} /> {instructor.ward}, {instructor.district}, {instructor.location}
                  </Text>
                  <Text style={styles.addressDetail}>{instructor.address}</Text>
                  <View style={styles.metaRow}>
                    <Ionicons name="star" size={14} color={Colors.warning} />
                    <Text style={styles.rating}>{instructor.rating} ({instructor.reviewCount} đánh giá)</Text>
                  </View>
                  {instructor.online && (
                    <View style={styles.onlineBadge}>
                      <View style={styles.onlineDot} />
                      <Text style={styles.onlineText}>Có thể dạy Online</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={[styles.categoryBadge, { backgroundColor: category.color + '15', borderColor: category.color + '30' }]}>
                <Ionicons name={category.icon as any} size={14} color={category.color} />
                <Text style={[styles.categoryBadgeText, { color: category.color }]}>{category.label}</Text>
              </View>

              <Text style={styles.intro}>"{instructor.intro}"</Text>

              <View style={styles.skillsSection}>
                <Text style={styles.skillsSectionTitle}>Môn học</Text>
                <View style={styles.skillsWrap}>
                  {instructor.subjects.map((s) => (
                    <TouchableOpacity key={s} onPress={() => router.push({ pathname: '/(tabs)/find-tutors', params: { query: s } })}>
                      <View style={styles.tag}><Text style={styles.tagText}>{s}</Text></View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.skillsSection}>
                <Text style={styles.skillsSectionTitle}>Trình độ giảng dạy</Text>
                <View style={styles.skillsWrap}>
                  {instructor.levels.map((g) => (
                    <TouchableOpacity key={g} onPress={() => router.push({ pathname: '/(tabs)/find-tutors', params: { query: g } })}>
                      <View style={styles.levelTag}><Text style={styles.levelTagText}>{g}</Text></View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Stats row */}
            <View style={[styles.statsRow, isDesktop && { borderRadius: Radius.lg, marginBottom: Spacing.md }]}>
              {[
                { icon: 'people', val: instructor.studentCount.toString(), lbl: 'Học viên' },
                { icon: 'star', val: instructor.rating.toString(), lbl: 'Đánh giá' },
                { icon: 'chatbubbles', val: instructor.reviewCount.toString(), lbl: 'Nhận xét' },
                { icon: 'briefcase', val: `${instructor.experience}n`, lbl: 'Kinh nghiệm' },
              ].map((s) => (
                <View key={s.lbl} style={styles.statItem}>
                  <Ionicons name={s.icon as any} size={20} color={Colors.primary} />
                  <Text style={styles.statVal}>{s.val}</Text>
                  <Text style={styles.statLbl}>{s.lbl}</Text>
                </View>
              ))}
            </View>

            {/* About */}
            <View style={[styles.section, isDesktop && styles.desktopCard]}>
              <Text style={styles.sectionTitle}>Giới thiệu</Text>
              <Text style={styles.bio}>{instructor.bio}</Text>
            </View>

            {/* Education & Certs */}
            <View style={[styles.section, isDesktop && styles.desktopCard]}>
              <Text style={styles.sectionTitle}>Học vấn & Chứng chỉ</Text>
              <View style={styles.eduRow}>
                <Ionicons name="school" size={18} color={Colors.primary} />
                <Text style={styles.eduText}>{instructor.education}</Text>
              </View>
              {instructor.certificates.map((c) => (
                <View key={c} style={styles.certRow}>
                  <Ionicons name="document-text" size={16} color={Colors.textMuted} />
                  <Text style={styles.certText}>{c}</Text>
                  <View style={styles.verifiedBadge}><Text style={styles.verifiedText}>Đã xác minh</Text></View>
                </View>
              ))}
            </View>

            {/* Schedule */}
            <View style={[styles.section, isDesktop && styles.desktopCard]}>
              <Text style={styles.sectionTitle}>Lịch dạy trong tuần</Text>
              <View style={styles.scheduleRow}>
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d, i) => {
                  const dayMap = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
                  const active = instructor.schedule.includes(dayMap[i]);
                  return (
                    <View key={d} style={[styles.scheduleDay, active && styles.scheduleDayActive]}>
                      <Text style={[styles.scheduleDayText, active && styles.scheduleDayTextActive]}>{d}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Address */}
            <View style={[styles.section, isDesktop && styles.desktopCard]}>
              <Text style={styles.sectionTitle}>Địa điểm dạy</Text>
              <View style={styles.addressCard}>
                <Ionicons name="location" size={24} color={Colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.addressMain}>{instructor.address}</Text>
                  <Text style={styles.addressSub}>{instructor.ward}, {instructor.district}, {instructor.location}</Text>
                </View>
              </View>
            </View>

            {/* Classes */}
            <View style={[styles.section, isDesktop && styles.desktopCard]}>
              <Text style={styles.sectionTitle}>Các lớp đang mở</Text>
              <View style={{ gap: Spacing.md }}>
                {instructor.classes?.map((c) => (
                  <View key={c.id} style={{ backgroundColor: Colors.background, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: Typography.base, color: Colors.primary }}>{c.title}</Text>
                        <Text style={{ fontFamily: 'Inter_500Medium', fontSize: Typography.sm, color: Colors.textSecondary, marginTop: 4 }}>
                          <Ionicons name="person-outline" size={14} /> {c.teacherName}
                        </Text>
                      </View>
                      <View style={{ backgroundColor: Colors.primaryLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.sm }}>
                        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: Typography.xs, color: Colors.primary }}>{c.goal}</Text>
                      </View>
                    </View>
                    
                    <View style={{ flexDirection: 'row', gap: 16, marginBottom: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="time-outline" size={16} color={Colors.textMuted} />
                        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: Typography.sm, color: Colors.text }}>{c.schedule}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="cash-outline" size={16} color={Colors.textMuted} />
                        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: Typography.sm, color: Colors.text }}>{formatPrice(c.price)}</Text>
                      </View>
                    </View>

                    <TouchableOpacity 
                      style={{ backgroundColor: Colors.primary, paddingVertical: 10, borderRadius: Radius.md, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}
                      onPress={() => handleRegister(c)}
                    >
                      <Ionicons name="school-outline" size={16} color={Colors.surface} />
                      <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: Typography.sm, color: Colors.surface }}>Đăng ký học thử miễn phí</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>

            {/* Bảng vàng thành tích */}
            {instructor.achievements && instructor.achievements.length > 0 && (
              <View style={[styles.section, isDesktop && styles.desktopCard]}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.sectionTitle}>🏆 Bảng vàng thành tích</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.md, paddingBottom: 8 }}>
                  {instructor.achievements.map((a) => (
                    <View key={a.id} style={{ width: 280, backgroundColor: Colors.background, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border }}>
                      {a.imageUrl ? (
                        <SafeImage uri={a.imageUrl} style={{ width: '100%', height: 140, borderRadius: Radius.sm, marginBottom: 8 }} />
                      ) : (
                        <View style={{ width: '100%', height: 140, backgroundColor: Colors.primaryLight, borderRadius: Radius.sm, marginBottom: 8, alignItems: 'center', justifyContent: 'center' }}>
                          <Ionicons name="trophy-outline" size={40} color={Colors.primary} />
                        </View>
                      )}
                      <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: Typography.base, color: Colors.primary }}>{a.title}</Text>
                      <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: Typography.sm, color: Colors.text, marginTop: 4 }}>Học viên: {a.studentName} ({a.year})</Text>
                      <Text style={{ fontFamily: 'Inter_400Regular', fontSize: Typography.sm, color: Colors.textSecondary, marginTop: 4, lineHeight: 20 }} numberOfLines={3}>{a.description}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Reviews */}
            <View style={[styles.section, isDesktop && styles.desktopCard, isDesktop && { borderBottomWidth: 0 }]}>
              <View style={styles.reviewHeader}>
                <Text style={styles.sectionTitle}>Nhận xét từ học viên</Text>
                <View style={styles.reviewSummary}>
                  <Ionicons name="star" size={16} color={Colors.warning} />
                  <Text style={styles.reviewAvg}>{avgRating}</Text>
                  <Text style={styles.reviewTotal}>({instructor.reviews.length} đánh giá)</Text>
                </View>
              </View>
              {instructor.reviews.length > 0 ? (
                instructor.reviews.map((r) => (
                  <View key={r.id} style={styles.reviewCard}>
                    <View style={styles.reviewTop}>
                      <View style={styles.reviewAv}><Text style={styles.reviewAvText}>{r.avatar}</Text></View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.reviewAuthor}>{r.author}</Text>
                        <Text style={styles.reviewDate}>{r.date}</Text>
                      </View>
                      <View style={styles.reviewStars}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Ionicons key={i} name="star" size={13} color={i < r.rating ? Colors.warning : Colors.border} />
                        ))}
                      </View>
                    </View>
                    <Text style={styles.reviewComment}>{r.comment}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.emptyReview}>
                  <Ionicons name="chatbubble-outline" size={32} color={Colors.border} />
                  <Text style={styles.emptyReviewText}>Chưa có đánh giá nào</Text>
                </View>
              )}
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Desktop Right Sidebar */}
          {isDesktop && (
            <View style={{ width: 340 }}>
              <BookingSidebar />
            </View>
          )}

        </View>
      </View>

      {/* Mobile Bottom Bar */}
      {!isDesktop && (
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.priceMain}>{formatPrice(instructor.price)}<Text style={styles.priceUnit}>/giờ</Text></Text>
            <View style={styles.ratingSmall}>
              <Ionicons name="star" size={12} color={Colors.warning} />
              <Text style={styles.ratingSmallText}>{instructor.rating} ({instructor.reviewCount})</Text>
            </View>
          </View>
          <View style={styles.bottomBtns}>
            <TouchableOpacity style={styles.msgBtnMobile} onPress={() => router.push('/chat')}>
              <Ionicons name="chatbubble-ellipses-outline" size={22} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.bookBtnMobile} onPress={() => handleRegister(null)}>
              <Text style={styles.bookBtnText}>Đăng ký</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <TrialRequestModal
        visible={trialModalOpen}
        onClose={() => setTrialModalOpen(false)}
        classInfo={selectedClass || {
          id: `${instructor.id}-c0`,
          title: instructor.name,
          subject: instructor.subjects[0] || '',
          schedule: instructor.schedule.join(' & '),
          price: instructor.price,
          teacherName: instructor.name,
        }}
        instructorId={instructor.id}
        instructorName={instructor.name}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  desktopCard: { borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md, ...Shadow.sm },
  headerCard: { backgroundColor: Colors.surface, padding: Spacing.xl, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTop: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  avatarImage: { width: 80, height: 80, borderRadius: Radius.lg, backgroundColor: Colors.borderLight },
  headerInfo: { flex: 1, justifyContent: 'center', gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  name: { fontFamily: 'Manrope_700Bold', fontSize: Typography['2xl'], color: Colors.primary },
  location: { fontFamily: 'Inter_400Regular', fontSize: Typography.sm, color: Colors.textMuted },
  addressDetail: { fontFamily: 'Inter_400Regular', fontSize: Typography.xs, color: Colors.textMuted, marginTop: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rating: { fontFamily: 'Inter_500Medium', fontSize: Typography.sm, color: Colors.textSecondary },
  onlineBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.successLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, alignSelf: 'flex-start' },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  onlineText: { fontFamily: 'Inter_500Medium', fontSize: Typography.xs, color: Colors.success },
  categoryBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.full,
    borderWidth: 1, marginBottom: Spacing.md,
  },
  categoryBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: Typography.xs },
  intro: { fontFamily: 'Inter_400Regular', fontSize: Typography.sm, color: Colors.textSecondary, fontStyle: 'italic', borderLeftWidth: 3, borderLeftColor: Colors.primary, paddingLeft: Spacing.md, marginBottom: Spacing.md, lineHeight: 20 },
  skillsSection: { marginBottom: Spacing.sm },
  skillsSectionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: Typography.xs, color: Colors.textMuted, marginBottom: Spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  tag: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.primaryLight, borderWidth: 1, borderColor: Colors.primary + '30' },
  tagText: { fontFamily: 'Inter_500Medium', fontSize: Typography.sm, color: Colors.primary },
  tagSecondary: { backgroundColor: Colors.warningLight, borderColor: Colors.warning + '40' },
  tagTextSecondary: { color: Colors.warning },
  levelTag: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: '#EDE9FE', borderWidth: 1, borderColor: '#7C3AED30' },
  levelTagText: { fontFamily: 'Inter_500Medium', fontSize: Typography.sm, color: '#7C3AED' },
  statsRow: { flexDirection: 'row', backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  statItem: { flex: 1, alignItems: 'center', padding: Spacing.md, gap: 6 },
  statVal: { fontFamily: 'Manrope_700Bold', fontSize: Typography.lg, color: Colors.primary },
  statLbl: { fontFamily: 'Inter_400Regular', fontSize: Typography.xs, color: Colors.textMuted },
  section: { backgroundColor: Colors.surface, padding: Spacing.xl, borderBottomWidth: 1, borderBottomColor: Colors.border },
  sectionTitle: { fontFamily: 'Manrope_700Bold', fontSize: Typography.lg, color: Colors.primary, marginBottom: Spacing.md },
  bio: { fontFamily: 'Inter_400Regular', fontSize: Typography.base, color: Colors.textSecondary, lineHeight: 24 },
  eduRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  eduText: { fontFamily: 'Inter_500Medium', fontSize: Typography.base, color: Colors.text },
  certRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 10, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  certText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: Typography.base, color: Colors.text },
  verifiedBadge: { backgroundColor: Colors.successLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  verifiedText: { fontFamily: 'Inter_500Medium', fontSize: Typography.xs, color: Colors.success },
  scheduleRow: { flexDirection: 'row', gap: Spacing.sm },
  scheduleDay: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: Radius.md, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  scheduleDayActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  scheduleDayText: { fontFamily: 'Inter_500Medium', fontSize: Typography.xs, color: Colors.textMuted },
  scheduleDayTextActive: { color: Colors.primary, fontFamily: 'Inter_600SemiBold' },
  addressCard: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center', backgroundColor: Colors.background, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  addressMain: { fontFamily: 'Inter_500Medium', fontSize: Typography.base, color: Colors.text, marginBottom: 2 },
  addressSub: { fontFamily: 'Inter_400Regular', fontSize: Typography.sm, color: Colors.textSecondary },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  reviewSummary: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reviewAvg: { fontFamily: 'Manrope_700Bold', fontSize: Typography.lg, color: Colors.primary },
  reviewTotal: { fontFamily: 'Inter_400Regular', fontSize: Typography.sm, color: Colors.textMuted },
  reviewCard: { marginBottom: Spacing.md, padding: Spacing.md, backgroundColor: Colors.background, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border },
  reviewTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  reviewAv: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  reviewAvText: { fontFamily: 'Inter_700Bold', fontSize: Typography.sm, color: Colors.primary },
  reviewAuthor: { fontFamily: 'Inter_600SemiBold', fontSize: Typography.base, color: Colors.text },
  reviewDate: { fontFamily: 'Inter_400Regular', fontSize: Typography.xs, color: Colors.textMuted },
  reviewStars: { flexDirection: 'row', gap: 2 },
  reviewComment: { fontFamily: 'Inter_400Regular', fontSize: Typography.sm, color: Colors.textSecondary, lineHeight: 20 },
  emptyReview: { alignItems: 'center', padding: Spacing.xl, gap: Spacing.sm },
  emptyReviewText: { fontFamily: 'Inter_400Regular', fontSize: Typography.sm, color: Colors.textMuted },
  
  // Desktop Sidebar
  sidebarCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.lg,
    position: 'sticky' as any,
    top: 20,
  },
  
  // Mobile Bottom Bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border,
    padding: Spacing.base, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    ...Shadow.lg,
  },
  priceMain: { fontFamily: 'Manrope_800ExtraBold', fontSize: Typography.xl, color: Colors.primary },
  priceUnit: { fontFamily: 'Inter_400Regular', fontSize: Typography.sm, color: Colors.textMuted },
  ratingSmall: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingSmallText: { fontFamily: 'Inter_400Regular', fontSize: Typography.xs, color: Colors.textSecondary },
  bottomBtns: { flexDirection: 'row', gap: Spacing.sm },
  msgBtnMobile: { width: 46, height: 46, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  bookBtnMobile: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingHorizontal: Spacing.xl, paddingVertical: 13, ...Shadow.md },
  
  msgBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', paddingVertical: 12, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.primary, marginTop: Spacing.sm },
  bookBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 14, alignItems: 'center', width: '100%', ...Shadow.md },
  bookBtnText: { fontFamily: 'Inter_700Bold', fontSize: Typography.base, color: Colors.surface },
});
