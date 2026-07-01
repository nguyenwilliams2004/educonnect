import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet,
  Platform, useWindowDimensions, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { CATEGORY_MAP, CATEGORY_SUBJECTS, LEVELS, CategoryType, CITIES } from '@/data/mockData';

export default function BecomeTutorScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    bio: '',
    category: '' as CategoryType | '',
    subjects: [] as string[],
    levels: [] as string[],
    city: '',
  });

  const toggleArray = (key: 'subjects' | 'levels', value: string) => {
    setForm(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value]
    }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.phone || !form.category) {
      if (Platform.OS === 'web') {
        window.alert('Vui lòng điền các thông tin bắt buộc (Họ tên, SĐT, Lĩnh vực).');
      } else {
        Alert.alert('Lỗi', 'Vui lòng điền các thông tin bắt buộc (Họ tên, SĐT, Lĩnh vực).');
      }
      return;
    }

    if (Platform.OS === 'web') {
      window.alert('Đăng ký thành công! Đội ngũ EduConnect sẽ liên hệ với bạn sớm nhất.');
    } else {
      Alert.alert('Thành công', 'Đăng ký thành công! Đội ngũ EduConnect sẽ liên hệ với bạn sớm nhất.');
    }
    router.push('/');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={isDesktop ? styles.contentDesktop : styles.contentMobile}>
      <View style={[styles.card, isDesktop && { maxWidth: 800, alignSelf: 'center', width: '100%' }]}>
        <View style={styles.header}>
          <Ionicons name="school" size={40} color={Colors.primary} />
          <Text style={styles.title}>Đăng ký trở thành Chuyên gia</Text>
          <Text style={styles.subtitle}>Gia nhập mạng lưới hàng nghìn giáo viên và chuyên gia giảng dạy trên toàn quốc.</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Họ và tên *</Text>
          <TextInput
            style={styles.input}
            placeholder="VD: Nguyễn Văn A"
            value={form.name}
            onChangeText={(t) => setForm({ ...form, name: t })}
          />
        </View>

        <View style={[styles.row, !isDesktop && { flexDirection: 'column' }]}>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>Số điện thoại *</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: 0987654321"
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={(t) => setForm({ ...form, phone: t })}
            />
          </View>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: email@example.com"
              keyboardType="email-address"
              value={form.email}
              onChangeText={(t) => setForm({ ...form, email: t })}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Địa điểm (Thành phố)</Text>
          <View style={styles.chipWrap}>
            {CITIES.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.chip, form.city === c && styles.chipActive]}
                onPress={() => setForm({ ...form, city: c })}
              >
                <Text style={[styles.chipText, form.city === c && styles.chipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Lĩnh vực giảng dạy chính *</Text>
          <View style={styles.chipWrap}>
            {(Object.keys(CATEGORY_MAP) as CategoryType[]).map(catKey => {
              const cat = CATEGORY_MAP[catKey];
              const active = form.category === catKey;
              return (
                <TouchableOpacity
                  key={catKey}
                  style={[styles.catChip, active && { backgroundColor: cat.color, borderColor: cat.color }]}
                  onPress={() => setForm({ ...form, category: catKey, subjects: [] })}
                >
                  <Ionicons name={cat.icon as any} size={16} color={active ? Colors.surface : cat.color} />
                  <Text style={[styles.catChipText, active && { color: Colors.surface }]}>{cat.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {form.category !== '' && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Môn học cụ thể</Text>
            <View style={styles.chipWrap}>
              {CATEGORY_SUBJECTS[form.category as CategoryType]?.map(sub => {
                const active = form.subjects.includes(sub);
                return (
                  <TouchableOpacity
                    key={sub}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => toggleArray('subjects', sub)}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{sub}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Trình độ giảng dạy</Text>
          <View style={styles.chipWrap}>
            {LEVELS.map(lvl => {
              const active = form.levels.includes(lvl);
              return (
                <TouchableOpacity
                  key={lvl}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => toggleArray('levels', lvl)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{lvl}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Giới thiệu ngắn gọn về kinh nghiệm</Text>
          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
            placeholder="Chia sẻ về kinh nghiệm, bằng cấp và phương pháp giảng dạy của bạn..."
            multiline
            value={form.bio}
            onChangeText={(t) => setForm({ ...form, bio: t })}
          />
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>Gửi Đăng Ký</Text>
          <Ionicons name="arrow-forward" size={20} color={Colors.surface} />
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  contentMobile: { padding: Spacing.base, paddingBottom: 100 },
  contentDesktop: { padding: Spacing['2xl'] },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    ...Shadow.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: { alignItems: 'center', marginBottom: Spacing.xl },
  title: {
    fontFamily: 'Manrope_700Bold',
    fontSize: Typography['2xl'],
    color: Colors.primary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  formGroup: { marginBottom: Spacing.lg },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: Typography.sm,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontFamily: 'Inter_400Regular',
    fontSize: Typography.base,
    color: Colors.text,
  },
  row: { flexDirection: 'row', gap: Spacing.lg },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  chipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  chipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  catChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    ...Shadow.md,
  },
  submitBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: Typography.lg,
    color: Colors.surface,
  },
});
