import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Modal, Platform, useWindowDimensions
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { INSTRUCTORS, LEVELS, CITIES, CATEGORY_MAP, CATEGORY_SUBJECTS, Instructor, formatPrice, CategoryType } from '@/data/mockData';
import MapViewMock from '@/components/MapViewMock';

const SCHEDULES = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
const TIME_RANGES = [
  { key: 'morning', label: 'Sáng (7–12h)' },
  { key: 'afternoon', label: 'Chiều (13–17h)' },
  { key: 'evening', label: 'Tối (18–21h)' },
];

const SORT_OPTIONS = [
  { key: 'rating', label: 'Đánh giá cao nhất' },
  { key: 'price_asc', label: 'Giá thấp nhất' },
  { key: 'price_desc', label: 'Giá cao nhất' },
  { key: 'students', label: 'Nhiều học viên nhất' },
];

const CATEGORY_OPTIONS: { key: CategoryType | 'all'; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'academic', label: 'Học thuật' },
  { key: 'arts', label: 'Nghệ thuật' },
  { key: 'sports', label: 'Thể thao' },
  { key: 'it', label: 'Công nghệ' },
  { key: 'language', label: 'Ngôn ngữ' },
  { key: 'softskill', label: 'Kỹ năng mềm' },
];

export default function FindInstructorsScreen() {
  const router = useRouter();
  const { query } = useLocalSearchParams<{ query?: string }>();
  const [search, setSearch] = useState(query || '');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');
  const [selectedSchedules, setSelectedSchedules] = useState<string[]>([]);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [sortKey, setSortKey] = useState('rating');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [expandedCategory, setExpandedCategory] = useState<CategoryType | null>(null);

  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;
  const contentMaxWidth = 1200;

  const toggleFilter = <T,>(arr: T[], item: T, setter: (v: T[]) => void) =>
    setter(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);

  const results = useMemo(() => {
    let list = INSTRUCTORS.filter((t) => {
      const q = search.toLowerCase();
      if (search) {
        const matchName = t.name.toLowerCase().includes(q);
        const matchSubjects = t.subjects.some((s) => s.toLowerCase().includes(q));
        const matchSkills = t.skills.some((s) => s.toLowerCase().includes(q)); // keep for text search compat
        const matchLocation = t.district.toLowerCase().includes(q) || t.location.toLowerCase().includes(q) || t.ward.toLowerCase().includes(q);
        if (!matchName && !matchSubjects && !matchSkills && !matchLocation) return false;
      }
      if (selectedSubjects.length && !selectedSubjects.some((s) => t.subjects.includes(s))) return false;
      if (selectedLevels.length && !selectedLevels.some((l) => t.levels.includes(l))) return false;
      if (selectedCity && t.location !== selectedCity) return false;
      if (selectedCategory !== 'all' && t.categoryType !== selectedCategory) return false;
      if (selectedSchedules.length && !selectedSchedules.some(s => t.schedule.includes(s))) return false;
      if (onlineOnly && !t.online) return false;
      return true;
    });
    if (sortKey === 'rating') list = list.sort((a, b) => b.rating - a.rating);
    else if (sortKey === 'price_asc') list = list.sort((a, b) => a.price - b.price);
    else if (sortKey === 'price_desc') list = list.sort((a, b) => b.price - a.price);
    else if (sortKey === 'students') list = list.sort((a, b) => b.studentCount - a.studentCount);
    return list;
  }, [search, selectedSubjects, selectedLevels, selectedCity, selectedCategory, selectedSchedules, onlineOnly, sortKey]);

  const activeFilters = selectedSubjects.length + selectedLevels.length + selectedSchedules.length + (selectedCity ? 1 : 0) + (selectedCategory !== 'all' ? 1 : 0) + (onlineOnly ? 1 : 0);

  const FilterContent = () => (
    <View style={{ gap: Spacing.xl, paddingBottom: isDesktop ? 60 : 0 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={[styles.filterSectionTitle, { marginBottom: 0 }]}>Bộ lọc</Text>
        {activeFilters > 0 && (
          <TouchableOpacity onPress={() => {
            setSelectedSubjects([]); setSelectedLevels([]); setSelectedSchedules([]);
            setSelectedCity(''); setSelectedCategory('all'); setOnlineOnly(false);
          }}>
            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: Typography.sm, color: Colors.danger }}>Xoá lọc</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Subjects - Hierarchical */}
      <View>
        <Text style={styles.filterSectionTitle}>Môn học</Text>
        {(Object.keys(CATEGORY_MAP) as CategoryType[]).map(catKey => {
          const cat = CATEGORY_MAP[catKey];
          const isExpanded = expandedCategory === catKey;
          const subs = CATEGORY_SUBJECTS[catKey] || [];
          return (
            <View key={catKey} style={{ marginBottom: Spacing.xs }}>
              <TouchableOpacity 
                style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 4 }}
                onPress={() => setExpandedCategory(isExpanded ? null : catKey)}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name={cat.icon as any} size={18} color={cat.color} />
                  <Text style={{ fontFamily: 'Inter_500Medium', fontSize: Typography.sm, color: Colors.text }}>{cat.label}</Text>
                </View>
                <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.textMuted} />
              </TouchableOpacity>
              {isExpanded && (
                <View style={[styles.chipGrid, { paddingLeft: 26, marginTop: Spacing.xs, marginBottom: Spacing.sm }]}>
                  {subs.map(sub => (
                    <TouchableOpacity 
                      key={sub} 
                      style={[styles.chip, selectedSubjects.includes(sub) && styles.chipActive]} 
                      onPress={() => toggleFilter(selectedSubjects, sub, setSelectedSubjects)}
                    >
                      <Text style={[styles.chipText, selectedSubjects.includes(sub) && styles.chipTextActive]}>{sub}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Levels */}
      <View>
        <Text style={styles.filterSectionTitle}>Trình độ / Lớp</Text>
        <View style={styles.chipGrid}>
          {LEVELS.map((l) => (
            <TouchableOpacity key={l} style={[styles.chip, selectedLevels.includes(l) && styles.chipActive]} onPress={() => toggleFilter(selectedLevels, l, setSelectedLevels)}>
              <Text style={[styles.chipText, selectedLevels.includes(l) && styles.chipTextActive]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* City */}
      <View>
        <Text style={styles.filterSectionTitle}>Địa điểm</Text>
        <View style={styles.chipGrid}>
          {CITIES.map((c) => (
            <TouchableOpacity key={c} style={[styles.chip, selectedCity === c && styles.chipActive]} onPress={() => setSelectedCity(selectedCity === c ? '' : c)}>
              <Text style={[styles.chipText, selectedCity === c && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Schedule */}
      <View>
        <Text style={styles.filterSectionTitle}>Lịch trống có thể học</Text>
        <View style={styles.chipGrid}>
          {SCHEDULES.map((s) => (
            <TouchableOpacity key={s} style={[styles.chip, selectedSchedules.includes(s) && styles.chipActive]} onPress={() => toggleFilter(selectedSchedules, s, setSelectedSchedules)}>
              <Text style={[styles.chipText, selectedSchedules.includes(s) && styles.chipTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Online */}
      <TouchableOpacity style={styles.toggleRow} onPress={() => setOnlineOnly(!onlineOnly)} activeOpacity={0.8}>
        <Text style={styles.toggleLabel}>Chỉ hiện chuyên gia Online</Text>
        <View style={[styles.toggle, onlineOnly && styles.toggleOn]}>
          <View style={[styles.toggleThumb, onlineOnly && styles.toggleThumbOn]} />
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderInstructor = (t: Instructor) => {
    const cat = CATEGORY_MAP[t.categoryType];
    return (
      <TouchableOpacity key={t.id} style={[styles.instructorRow, isDesktop && { width: '48%' }]} onPress={() => router.push(`/tutor/${t.id}`)} activeOpacity={0.85}>
        <View style={[styles.avatarImage, { backgroundColor: t.avatarBg + '30', alignItems: 'center', justifyContent: 'center' }]}>
          <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 24, color: t.avatarBg }}>{t.avatar}</Text>
        </View>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{t.name}</Text>
            {t.verified && <Ionicons name="checkmark-circle" size={14} color={Colors.primary} />}
          </View>
          <Text style={styles.sub} numberOfLines={1}>
            {t.subjects.join(', ')}
          </Text>
          <Text style={styles.locationText} numberOfLines={1}>
            <Ionicons name="location" size={11} color={Colors.textMuted} /> {t.ward}, {t.district}, {t.location}
          </Text>
          <View style={styles.metaRow}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={styles.metaText}>{t.rating} ({t.reviewCount}) · {t.experience} năm KN</Text>
          </View>
          <View style={styles.tagRow}>
            <View style={[styles.catTag, { backgroundColor: cat.color + '15' }]}>
              <Ionicons name={cat.icon as any} size={10} color={cat.color} />
              <Text style={[styles.catTagText, { color: cat.color }]}>{cat.label}</Text>
            </View>
            {t.online && (
              <View style={styles.onlineBadge}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Online</Text>
              </View>
            )}
            {t.levels.slice(0, 1).map((l) => (
              <View key={l} style={styles.levelBadge}>
                <Text style={styles.levelText}>{l}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.priceCol}>
          <Text style={styles.price}>{formatPrice(t.price)}</Text>
          <Text style={styles.priceUnit}>/giờ</Text>
          <TouchableOpacity
            style={styles.bookBtn}
            onPress={() => router.push(`/tutor/${t.id}`)}
          >
            <Text style={styles.bookBtnText}>Liên hệ</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, isDesktop && { alignItems: 'center' }]}>
      <View style={[isDesktop && { width: '100%', maxWidth: contentMaxWidth, flexDirection: 'row', gap: Spacing['2xl'], paddingTop: Spacing.xl, flex: 1 }]}>
        
        {/* DESKTOP SIDEBAR */}
        {isDesktop && (
          <View style={{ width: 280, borderRightWidth: 1, borderRightColor: Colors.border, paddingRight: Spacing.xl }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <FilterContent />
            </ScrollView>
          </View>
        )}

        {/* MAIN CONTENT */}
        <View style={{ flex: 1 }}>
          {/* Search + Filter bar (Mobile only Filter) */}
          <View style={[styles.topBar, isDesktop && { paddingHorizontal: 0 }]}>
            <View style={styles.searchWrap}>
              <Ionicons name="search" size={18} color={Colors.textMuted} />
              <TextInput
                style={[styles.searchInput, isDesktop && { fontSize: Typography.lg, paddingVertical: 4 }]}
                placeholder="Tìm môn học, chuyên gia..."
                placeholderTextColor={Colors.textMuted}
                value={search}
                onChangeText={setSearch}
              />
              {search ? (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              ) : null}
            </View>
            {!isDesktop && (
              <TouchableOpacity style={[styles.filterBtn, activeFilters > 0 && styles.filterBtnActive]} onPress={() => setFilterOpen(true)}>
                <Ionicons name="options" size={18} color={activeFilters > 0 ? Colors.primary : Colors.text} />
                {activeFilters > 0 && <View style={styles.filterBadge}><Text style={styles.filterBadgeText}>{activeFilters}</Text></View>}
              </TouchableOpacity>
            )}
          </View>

          {/* Category row */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={[styles.catContent, isDesktop && { paddingHorizontal: 0 }]}>
            {CATEGORY_OPTIONS.map((c) => (
              <TouchableOpacity
                key={c.key}
                style={[styles.catChip, selectedCategory === c.key && styles.catChipActive]}
                onPress={() => setSelectedCategory(selectedCategory === c.key ? 'all' : (c.key as any))}
              >
                <Text style={[styles.catChipText, selectedCategory === c.key && styles.catChipTextActive]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Results count, Sort trigger & View toggle */}
          <View style={[styles.countRow, isDesktop && { paddingHorizontal: 0 }]}>
            <Text style={[styles.countText, isDesktop && { fontSize: Typography.base }]}>
              Tìm thấy <Text style={{ color: Colors.primary, fontFamily: 'Inter_600SemiBold' }}>{results.length}</Text> chuyên gia
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
              {/* Elegant Sort selection */}
              <TouchableOpacity 
                style={styles.sortTrigger} 
                onPress={() => {
                  const nextIndex = (SORT_OPTIONS.findIndex(s => s.key === sortKey) + 1) % SORT_OPTIONS.length;
                  setSortKey(SORT_OPTIONS[nextIndex].key);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="swap-vertical" size={13} color={Colors.primary} />
                <Text style={styles.sortTriggerText}>
                  {SORT_OPTIONS.find(s => s.key === sortKey)?.label}
                </Text>
              </TouchableOpacity>

              {/* View toggle */}
              <View style={styles.viewToggle}>
                <TouchableOpacity 
                  style={[styles.viewToggleBtn, viewMode === 'list' && styles.viewToggleBtnActive]} 
                  onPress={() => setViewMode('list')}
                >
                  <Ionicons name="list" size={14} color={viewMode === 'list' ? Colors.surface : Colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.viewToggleBtn, viewMode === 'map' && styles.viewToggleBtnActive]} 
                  onPress={() => setViewMode('map')}
                >
                  <Ionicons name="map" size={14} color={viewMode === 'map' ? Colors.surface : Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* List or Map View */}
          {viewMode === 'list' ? (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={isDesktop ? styles.listDesktop : styles.list} showsVerticalScrollIndicator={false}>
              {results.length === 0 ? (
                <View style={styles.empty}>
                  <Text style={styles.emptyTitle}>Không tìm thấy chuyên gia</Text>
                  <Text style={styles.emptyDesc}>Thử thay đổi bộ lọc để có thêm kết quả</Text>
                </View>
              ) : (
                results.map((t) => renderInstructor(t))
              )}
            </ScrollView>
          ) : (
            <View style={styles.mapWrap}>
              <MapViewMock 
                items={results} 
                type="instructor" 
                onItemPress={(item) => router.push(`/tutor/${item.id}`)} 
              />
            </View>
          )}
        </View>

        {/* Filter Modal (Mobile Only) */}
        {!isDesktop && (
          <Modal visible={filterOpen} animationType="slide" presentationStyle="pageSheet">
            <View style={styles.modal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Bộ lọc</Text>
                <TouchableOpacity onPress={() => setFilterOpen(false)}>
                  <Ionicons name="close" size={24} color={Colors.text} />
                </TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={{ padding: Spacing.xl }}>
                <FilterContent />
              </ScrollView>
              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.applyBtn} onPress={() => setFilterOpen(false)}>
                  <Text style={styles.applyBtnText}>Áp dụng ({results.length} chuyên gia)</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.base, paddingBottom: 0, backgroundColor: Colors.surface, borderBottomWidth: 0 },
  searchWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.background, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 10, borderWidth: 1, borderColor: Colors.border },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: Typography.base, color: Colors.text },
  filterBtn: { width: 44, height: 44, borderRadius: Radius.md, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  filterBtnActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  filterBadge: { position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  filterBadgeText: { fontFamily: 'Inter_700Bold', fontSize: 9, color: Colors.surface },
  catScroll: { backgroundColor: Colors.surface, height: 48, flexGrow: 0, marginTop: Spacing.sm },
  catContent: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.base, alignItems: 'center', height: 48 },
  catChip: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catChipText: { fontFamily: 'Inter_500Medium', fontSize: Typography.xs, color: Colors.textSecondary },
  catChipTextActive: { color: Colors.surface, fontFamily: 'Inter_600SemiBold' },

  countRow: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  countText: { fontFamily: 'Inter_400Regular', fontSize: Typography.sm, color: Colors.textSecondary },
  sortTrigger: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primaryLight, paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.primary + '20' },
  sortTriggerText: { fontFamily: 'Inter_500Medium', fontSize: Typography.xs, color: Colors.primary },
  viewToggle: { flexDirection: 'row', backgroundColor: Colors.border, borderRadius: Radius.md, padding: 2 },
  viewToggleBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.sm },
  viewToggleBtnActive: { backgroundColor: Colors.primary, ...Shadow.sm },
  list: { padding: Spacing.base, gap: Spacing.md },
  listDesktop: { paddingVertical: Spacing.base, gap: Spacing.md, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  mapWrap: { flex: 1, padding: Spacing.base, paddingTop: 0 },
  instructorRow: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base, flexDirection: 'row', gap: Spacing.md, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  avatarImage: { width: 60, height: 60, borderRadius: Radius.lg, backgroundColor: Colors.borderLight },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 },
  name: { fontFamily: 'Inter_600SemiBold', fontSize: Typography.base, color: Colors.text },
  sub: { fontFamily: 'Inter_400Regular', fontSize: Typography.sm, color: Colors.textSecondary, marginBottom: 2 },
  locationText: { fontFamily: 'Inter_400Regular', fontSize: Typography.xs, color: Colors.textMuted, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  metaText: { fontFamily: 'Inter_400Regular', fontSize: Typography.xs, color: Colors.textSecondary },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  catTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  catTagText: { fontFamily: 'Inter_500Medium', fontSize: 10 },
  onlineBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.successLight, paddingHorizontal: 7, paddingVertical: 2, borderRadius: Radius.full },
  onlineDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.success },
  onlineText: { fontFamily: 'Inter_500Medium', fontSize: Typography.xs, color: Colors.success },
  levelBadge: { backgroundColor: Colors.warningLight, paddingHorizontal: 7, paddingVertical: 2, borderRadius: Radius.full },
  levelText: { fontFamily: 'Inter_500Medium', fontSize: 10, color: Colors.warning },
  priceCol: { alignItems: 'flex-end', justifyContent: 'space-between' },
  price: { fontFamily: 'Manrope_700Bold', fontSize: Typography.base, color: Colors.primary },
  priceUnit: { fontFamily: 'Inter_400Regular', fontSize: Typography.xs, color: Colors.textMuted },
  bookBtn: { backgroundColor: Colors.primary, borderRadius: Radius.sm, paddingHorizontal: 12, paddingVertical: 6, marginTop: 6 },
  bookBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: Typography.xs, color: Colors.surface },
  empty: { flex: 1, alignItems: 'center', padding: 60, gap: Spacing.md },
  emptyTitle: { fontFamily: 'Manrope_700Bold', fontSize: Typography.lg, color: Colors.textSecondary },
  emptyDesc: { fontFamily: 'Inter_400Regular', fontSize: Typography.sm, color: Colors.textMuted, textAlign: 'center' },
  modal: { flex: 1, backgroundColor: Colors.surface },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.xl, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontFamily: 'Manrope_700Bold', fontSize: Typography.xl, color: Colors.text },
  filterSectionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: Typography.sm, color: Colors.textSecondary, marginBottom: Spacing.md, textTransform: 'uppercase', letterSpacing: 0.6 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  chipActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  chipText: { fontFamily: 'Inter_500Medium', fontSize: Typography.sm, color: Colors.textSecondary },
  chipTextActive: { color: Colors.primary, fontFamily: 'Inter_600SemiBold' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.sm },
  toggleLabel: { fontFamily: 'Inter_500Medium', fontSize: Typography.base, color: Colors.text },
  toggle: { width: 44, height: 24, borderRadius: 12, backgroundColor: Colors.border, justifyContent: 'center', padding: 2 },
  toggleOn: { backgroundColor: Colors.primary },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.surface },
  toggleThumbOn: { alignSelf: 'flex-end' },
  modalFooter: { padding: Spacing.xl, borderTopWidth: 1, borderTopColor: Colors.border },
  applyBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 15, alignItems: 'center', ...Shadow.md },
  applyBtnText: { fontFamily: 'Inter_700Bold', fontSize: Typography.md, color: Colors.surface },
});
