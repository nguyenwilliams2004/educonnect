import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Platform, useWindowDimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { INSTRUCTORS, CATEGORY_MAP, formatPrice, CategoryType } from '@/data/mockData';

const HERO_STATS = [
  { value: '5,200+', label: 'Chuyên gia', icon: 'people' },
  { value: '28,000+', label: 'Học viên', icon: 'school' },
  { value: '50+', label: 'Lĩnh vực', icon: 'albums' },
  { value: '4.8', label: 'Đánh giá TB', icon: 'star' },
];

const CATEGORY_KEYS: CategoryType[] = ['academic', 'arts', 'sports', 'it', 'language', 'softskill'];
const CATEGORY_COUNTS: Record<CategoryType, string> = {
  academic: '1,420',
  arts: '680',
  sports: '540',
  it: '920',
  language: '1,100',
  softskill: '460',
};

export default function HomeScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;
  const contentMaxWidth = 1200;

  const featured = INSTRUCTORS.filter((t) => t.featured).slice(0, isDesktop ? 4 : 3); // show 4 on desktop, 3 on mobile

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ===== HERO SECTION ===== */}
      <View style={[styles.hero, isDesktop && styles.heroDesktop]}>
        <View style={[styles.contentWrapper, { maxWidth: contentMaxWidth }]}>
          <View style={[styles.heroTop, isDesktop && { justifyContent: 'center', alignItems: 'center' }]}>
            <View style={{ alignItems: isDesktop ? 'center' : 'flex-start' }}>
              {!isDesktop && (
                <Text style={styles.heroGreeting}>
                  Xin chào, {user?.name?.split(' ').pop() || 'bạn'} 👋
                </Text>
              )}
              <Text style={[styles.heroTitle, isDesktop && styles.heroTitleDesktop]}>
                Nền tảng kết nối{'\n'}Chuyên gia & Học viên hàng đầu
              </Text>
              {isDesktop && (
                <Text style={styles.heroSubTitleDesktop}>
                  Học hỏi từ những chuyên gia xuất sắc nhất, ở mọi lĩnh vực, mọi lúc mọi nơi.
                </Text>
              )}
            </View>
            {!isDesktop && (
              <TouchableOpacity style={styles.avatarCircle} onPress={() => router.push('/dashboard')}>
                <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || 'U'}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Search bar */}
          <TouchableOpacity
            style={[styles.searchBar, isDesktop && styles.searchBarDesktop]}
            onPress={() => router.push('/(tabs)/find-tutors')}
            activeOpacity={0.9}
          >
            <Ionicons name="search" size={24} color={Colors.textMuted} />
            <Text style={[styles.searchPlaceholder, isDesktop && { fontSize: Typography.lg }]}>
              Tìm môn học, kỹ năng, chuyên gia...
            </Text>
            <View style={[styles.searchBtn, isDesktop && { width: 48, height: 48, borderRadius: Radius.lg }]}>
              <Ionicons name="arrow-forward" size={24} color={Colors.surface} />
            </View>
          </TouchableOpacity>

          {/* Quick tags */}
          <View style={[styles.tagContainer, isDesktop && { justifyContent: 'center' }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={isDesktop && { flexGrow: 1, justifyContent: 'center' }}>
              <View style={styles.tagRow}>
                {['IELTS', 'Lập trình', 'Piano', 'Yoga', 'Bơi lội', 'Thiết kế'].map((tag) => (
                  <TouchableOpacity key={tag} style={styles.tag} onPress={() => router.push('/(tabs)/find-tutors')} activeOpacity={0.8}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </View>

      {/* ===== CONTENT WRAPPER FOR MAX WIDTH ===== */}
      <View style={[styles.mainContent, { maxWidth: contentMaxWidth }]}>
        {/* ===== ANIMATED BANNER ===== */}
        <View style={[styles.animatedBanner, isDesktop && styles.animatedBannerDesktop]}>
          <Image source={{ uri: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f393/512.gif' }} style={styles.animatedGif} />
          <Text style={styles.animatedBannerText}>Khơi dậy tiềm năng cùng hàng ngàn chuyên gia xuất sắc</Text>
          <Image source={{ uri: 'https://fonts.gstatic.com/s/e/notoemoji/latest/2728/512.gif' }} style={styles.animatedGifSmall} />
        </View>

        {/* ===== CATEGORIES GRID ===== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isDesktop && { fontSize: Typography.xl }]}>Khám phá lĩnh vực</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/find-tutors')}>
              <Text style={styles.seeAll}>Xem tất cả →</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.categoryGrid, isDesktop && { gap: Spacing.lg }]}>
            {CATEGORY_KEYS.map((key) => {
              const cat = CATEGORY_MAP[key];
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.categoryCard, isDesktop ? { width: '15%' } : { width: '31%' }]}
                  onPress={() => router.push('/(tabs)/find-tutors')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.categoryIconWrap, { backgroundColor: cat.color + '15' }, isDesktop && { width: 64, height: 64 }]}>
                    <Ionicons name={cat.icon as any} size={isDesktop ? 32 : 24} color={cat.color} />
                  </View>
                  <Text style={[styles.categoryLabel, isDesktop && { fontSize: Typography.sm }]}>{cat.label}</Text>
                  <Text style={styles.categoryCount}>{CATEGORY_COUNTS[key]} chuyên gia</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ===== FEATURED INSTRUCTORS ===== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isDesktop && { fontSize: Typography.xl }]}>Chuyên gia nổi bật</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/find-tutors')}>
              <Text style={styles.seeAll}>Xem thêm →</Text>
            </TouchableOpacity>
          </View>
          <View style={[isDesktop ? styles.featuredGridDesktop : { gap: Spacing.md }]}>
            {featured.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[styles.instructorCard, isDesktop && { width: '23.5%' }]}
                onPress={() => router.push(`/tutor/${t.id}`)}
                activeOpacity={0.85}
              >
                <View style={[styles.cardTop, isDesktop && { flexDirection: 'column', alignItems: 'center' }]}>
                  <Image source={{ uri: t.avatarUrl }} style={[styles.instructorAv, isDesktop && { width: 80, height: 80, marginRight: 0, marginBottom: Spacing.sm, borderRadius: 40 }]} />
                  <View style={[styles.instructorInfo, isDesktop && { alignItems: 'center', width: '100%' }]}>
                    <View style={[styles.nameRow, isDesktop && { justifyContent: 'center' }]}>
                      <Text style={[styles.instructorName, isDesktop && { fontSize: Typography.lg, textAlign: 'center' }]} numberOfLines={1}>{t.name}</Text>
                      {t.verified && (
                        <View style={styles.verifiedBadge}>
                          <Ionicons name="checkmark-circle" size={isDesktop ? 16 : 14} color={Colors.primary} />
                        </View>
                      )}
                    </View>
                    <Text style={[styles.instructorSubjects, isDesktop && { textAlign: 'center' }]} numberOfLines={1}>
                      {t.subjects.join(', ')}{t.skills.length > 0 ? ` · ${t.skills.slice(0, 1).join(', ')}` : ''}
                    </Text>
                    {!isDesktop && <Text style={styles.instructorEdu} numberOfLines={1}>{t.education}</Text>}
                    <View style={[styles.skillRow, isDesktop && { justifyContent: 'center', marginTop: 4 }]}>
                      {t.levels.slice(0, 2).map((lv) => (
                        <View key={lv} style={styles.levelTag}>
                          <Text style={styles.levelTagText}>{lv}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
                <View style={styles.cardBottom}>
                  <View style={[styles.metaRow, isDesktop && { justifyContent: 'center' }]}>
                    <View style={styles.metaItem}>
                      <Ionicons name="star" size={13} color="#F59E0B" />
                      <Text style={styles.metaText}>{t.rating}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="people-outline" size={13} color={Colors.textSecondary} />
                      <Text style={styles.metaText}>{t.studentCount}</Text>
                    </View>
                  </View>
                  <View style={styles.priceRow}>
                    {!isDesktop && (
                      <View style={styles.locationRow}>
                        <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
                        <Text style={styles.locationText}>{t.district}</Text>
                      </View>
                    )}
                    <View style={[styles.priceWrap, isDesktop && { flex: 1, justifyContent: 'center' }]}>
                      <Text style={styles.price}>{formatPrice(t.price)}</Text>
                      <Text style={styles.priceUnit}>/h</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>



        {/* ===== WHY EDUCONNECT ===== */}
        <View style={[styles.section, isDesktop && { marginBottom: Spacing['3xl'] }]}>
          <Text style={[styles.sectionTitle, { textAlign: 'center', marginBottom: Spacing.xl }, isDesktop && { fontSize: Typography['2xl'] }]}>Tại sao chọn EduConnect?</Text>
          <View style={[isDesktop ? styles.whyGridDesktop : { gap: Spacing.md }]}>
            {[
              { icon: 'shield-checkmark', title: 'Chuyên gia đã xác minh', desc: 'Tất cả chuyên gia đều được xác minh hồ sơ, bằng cấp và năng lực giảng dạy.' },
              { icon: 'layers', title: 'Đa lĩnh vực', desc: 'Từ học thuật, nghệ thuật, thể thao đến kỹ năng mềm, mọi thứ bạn cần đều có tại đây.' },
              { icon: 'flash', title: 'Kết nối nhanh chóng', desc: 'Thuật toán tìm kiếm thông minh giúp bạn ghép nối với chuyên gia phù hợp chỉ trong vài phút.' },
            ].map((item) => (
              <View key={item.title} style={[styles.whyCard, isDesktop && { flex: 1, flexDirection: 'column', textAlign: 'center', padding: Spacing.xl }]}>
                <View style={[styles.whyIconWrap, isDesktop && { width: 64, height: 64, borderRadius: 32, marginBottom: Spacing.md }]}>
                  <Ionicons name={item.icon as any} size={isDesktop ? 32 : 22} color={Colors.primary} />
                </View>
                <View style={isDesktop ? { alignItems: 'center' } : { flex: 1 }}>
                  <Text style={[styles.whyTitle, isDesktop && { fontSize: Typography.lg, marginBottom: Spacing.sm }]}>{item.title}</Text>
                  <Text style={[styles.whyDesc, isDesktop && { textAlign: 'center', lineHeight: 22 }]}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: Spacing['2xl'] }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  mainContent: { width: '100%', alignSelf: 'center', paddingTop: Spacing.md },
  contentWrapper: { width: '100%', alignSelf: 'center' },

  // Hero
  hero: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroDesktop: {
    paddingTop: 80,
    paddingBottom: 120,
    borderBottomLeftRadius: 48,
    borderBottomRightRadius: 48,
  },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: Spacing.lg },
  heroGreeting: { fontFamily: 'Inter_400Regular', fontSize: Typography.sm, color: '#FFFFFFBB', marginBottom: 4 },
  heroTitle: { fontFamily: 'Manrope_700Bold', fontSize: Typography['2xl'], color: Colors.surface, lineHeight: 32 },
  heroTitleDesktop: { fontSize: 48, lineHeight: 56, textAlign: 'center', marginBottom: Spacing.md },
  heroSubTitleDesktop: { fontFamily: 'Inter_400Regular', fontSize: Typography.lg, color: '#FFFFFFDD', textAlign: 'center', maxWidth: 600 },
  avatarCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: { fontFamily: 'Inter_700Bold', fontSize: Typography.md, color: Colors.surface },

  // Search
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, paddingLeft: Spacing.base,
    ...Shadow.md,
  },
  searchBarDesktop: {
    maxWidth: 800, alignSelf: 'center', padding: Spacing.lg, paddingLeft: Spacing.xl, borderRadius: Radius.xl, marginTop: Spacing.xl, width: '100%'
  },
  searchPlaceholder: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: Typography.base, color: Colors.textMuted },
  searchBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
  },

  // Tags
  tagContainer: { marginTop: Spacing.sm },
  tagRow: { flexDirection: 'row', gap: Spacing.sm, paddingRight: Spacing.xl },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  tagText: { fontFamily: 'Inter_500Medium', fontSize: Typography.xs, color: Colors.surface },

  // Animated Banner
  animatedBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.surface, borderRadius: Radius.full, ...Shadow.sm,
    borderWidth: 1, borderColor: Colors.border,
    marginTop: -24, alignSelf: 'center', marginBottom: Spacing.xl,
  },
  animatedBannerDesktop: {
    marginTop: -32,
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing['3xl'],
  },
  animatedGif: { width: 32, height: 32 },
  animatedGifSmall: { width: 24, height: 24 },
  animatedBannerText: { fontFamily: 'Inter_600SemiBold', fontSize: Typography.sm, color: Colors.primary },

  // Section
  section: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontFamily: 'Manrope_700Bold', fontSize: Typography.lg, color: Colors.text },
  seeAll: { fontFamily: 'Inter_500Medium', fontSize: Typography.sm, color: Colors.primary },

  // Category Grid
  categoryGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'space-between'
  },
  categoryCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  categoryIconWrap: {
    width: 48, height: 48, borderRadius: Radius.lg,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm,
  },
  categoryLabel: { fontFamily: 'Inter_600SemiBold', fontSize: Typography.xs + 1, color: Colors.text, textAlign: 'center', marginBottom: 2 },
  categoryCount: { fontFamily: 'Inter_400Regular', fontSize: 10, color: Colors.textMuted, textAlign: 'center' },

  // Instructor Card
  featuredGridDesktop: {
    flexDirection: 'row',
    gap: Spacing.lg,
    justifyContent: 'space-between'
  },
  instructorCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border, ...Shadow.sm, overflow: 'hidden',
  },
  cardTop: {
    flexDirection: 'row', padding: Spacing.base, paddingBottom: Spacing.md,
  },
  instructorAv: {
    width: 56, height: 56, borderRadius: Radius.lg,
    backgroundColor: Colors.borderLight, marginRight: Spacing.md,
  },
  instructorInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 },
  instructorName: { fontFamily: 'Inter_600SemiBold', fontSize: Typography.base, color: Colors.text },
  verifiedBadge: { marginLeft: 2 },
  instructorSubjects: { fontFamily: 'Inter_500Medium', fontSize: Typography.sm, color: Colors.primary, marginBottom: 2 },
  instructorEdu: { fontFamily: 'Inter_400Regular', fontSize: Typography.xs, color: Colors.textSecondary, marginBottom: 6 },
  skillRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  levelTag: {
    backgroundColor: '#EDE9FE', borderRadius: Radius.sm,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  levelTagText: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#7C3AED' },

  cardBottom: {
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    borderTopWidth: 1, borderTopColor: Colors.borderLight, backgroundColor: Colors.background + '80',
  },
  metaRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center', marginBottom: Spacing.sm, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontFamily: 'Inter_400Regular', fontSize: Typography.xs, color: Colors.textSecondary },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  locationText: { fontFamily: 'Inter_400Regular', fontSize: Typography.xs, color: Colors.textMuted },
  priceWrap: { flexDirection: 'row', alignItems: 'baseline' },
  price: { fontFamily: 'Manrope_700Bold', fontSize: Typography.md, color: Colors.primary },
  priceUnit: { fontFamily: 'Inter_400Regular', fontSize: Typography.xs, color: Colors.textMuted, marginLeft: 2 },

  // CTA
  ctaBanner: {
    marginHorizontal: Spacing.xl, backgroundColor: Colors.primary,
    borderRadius: Radius.xl, padding: Spacing.xl, marginBottom: Spacing.xl,
    ...Shadow.lg,
  },
  ctaBannerDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing['3xl'],
  },
  ctaLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  ctaIconWrap: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center',
  },
  ctaTitle: { fontFamily: 'Manrope_700Bold', fontSize: Typography.lg, color: Colors.surface, marginBottom: 4 },
  ctaDesc: { fontFamily: 'Inter_400Regular', fontSize: Typography.sm, color: '#FFFFFFCC' },
  ctaBtn: {
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  ctaBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: Typography.base, color: Colors.primary },

  // Why EduConnect
  whyGridDesktop: {
    flexDirection: 'row', gap: Spacing.xl,
  },
  whyCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.base, flexDirection: 'row', alignItems: 'center',
    gap: Spacing.md, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  whyIconWrap: {
    width: 44, height: 44, borderRadius: Radius.lg,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  whyTitle: { fontFamily: 'Inter_600SemiBold', fontSize: Typography.base, color: Colors.text, marginBottom: 2 },
  whyDesc: { fontFamily: 'Inter_400Regular', fontSize: Typography.sm, color: Colors.textSecondary },
});
