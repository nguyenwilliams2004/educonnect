import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView,
  Alert, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { SUBJECTS, SKILLS, LEVELS, CATEGORY_MAP, CategoryType, DISTRICTS, WARDS } from '@/data/mockData';

type Role = 'learner' | 'instructor';
type Step = 1 | 2 | 3;

const CATEGORY_KEYS: CategoryType[] = ['academic', 'arts', 'sports', 'it', 'language', 'softskill'];
const CITIES = ['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng'];

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [step, setStep] = useState<Step>(1);
  const [role, setRole] = useState<Role | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('Hà Nội');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [address, setAddress] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('academic');
  const [level, setLevel] = useState('Cơ bản');
  const [price, setPrice] = useState('150000');
  const [loading, setLoading] = useState(false);

  const toggleItem = (arr: string[], item: string, setter: (v: string[]) => void) =>
    setter(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);

  const availableDistricts = DISTRICTS[city] || [];
  const availableWards = district ? (WARDS[district] || []) : [];

  const handleNext = () => {
    if (step === 1 && !role) { Alert.alert('Thông báo', 'Vui lòng chọn vai trò.'); return; }
    if (step === 2 && (!name || !email || !password)) { Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin.'); return; }
    if (step < 3) setStep((step + 1) as Step);
  };

  const handleRegister = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    login({
      email, password, role: role!, name,
      avatar: name[0].toUpperCase(), avatarBg: Colors.accent,
      skills: [...selectedSubjects, ...selectedSkills], location: city,
      ...(role === 'learner' ? { level } : { price: parseInt(price), rating: 0, studentCount: 0 }),
    });
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* Back */}
          <TouchableOpacity style={styles.backBtn} onPress={() => step > 1 ? setStep((step - 1) as Step) : router.back()}>
            <Ionicons name="chevron-back" size={22} color={Colors.primary} />
            <Text style={styles.backText}>Quay lại</Text>
          </TouchableOpacity>

          {/* Progress */}
          <View style={styles.progressRow}>
            {[1, 2, 3].map((n) => (
              <View key={n} style={[styles.progressDot, step >= n && styles.progressDotActive]} />
            ))}
          </View>

          {/* STEP 1 — Role */}
          {step === 1 && (
            <View>
              <Text style={styles.stepTitle}>Bạn là?</Text>
              <Text style={styles.stepSub}>Chọn vai trò phù hợp với bạn trên EduConnect</Text>
              <View style={styles.roleGrid}>
                <TouchableOpacity
                  style={[styles.roleCard, role === 'learner' && styles.roleCardActive]}
                  onPress={() => setRole('learner')}
                >
                  <View style={[styles.roleIcon, role === 'learner' && styles.roleIconActive]}>
                    <Ionicons name="person" size={28} color={role === 'learner' ? Colors.surface : Colors.primary} />
                  </View>
                  <Text style={[styles.roleName, role === 'learner' && styles.roleNameActive]}>Học viên</Text>
                  <Text style={styles.roleDesc}>Tôi muốn tìm chuyên gia để học</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.roleCard, role === 'instructor' && styles.roleCardActive]}
                  onPress={() => setRole('instructor')}
                >
                  <View style={[styles.roleIcon, role === 'instructor' && styles.roleIconActive]}>
                    <Ionicons name="briefcase" size={28} color={role === 'instructor' ? Colors.surface : Colors.primary} />
                  </View>
                  <Text style={[styles.roleName, role === 'instructor' && styles.roleNameActive]}>Chuyên gia</Text>
                  <Text style={styles.roleDesc}>Tôi muốn giảng dạy và có thu nhập</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* STEP 2 — Basic info */}
          {step === 2 && (
            <View style={{ gap: Spacing.md }}>
              <Text style={styles.stepTitle}>Thông tin cơ bản</Text>
              <Text style={styles.stepSub}>Điền thông tin tài khoản của bạn</Text>
              {[
                { label: 'Họ và tên', icon: 'person-outline', value: name, setter: setName, placeholder: 'Nguyễn Văn A' },
                { label: 'Email', icon: 'mail-outline', value: email, setter: setEmail, placeholder: 'email@example.com' },
                { label: 'Mật khẩu', icon: 'lock-closed-outline', value: password, setter: setPassword, placeholder: 'Ít nhất 6 ký tự', secure: true },
              ].map((f) => (
                <View key={f.label} style={styles.fieldGroup}>
                  <Text style={styles.label}>{f.label}</Text>
                  <View style={styles.inputWrap}>
                    <Ionicons name={f.icon as any} size={18} color={Colors.textMuted} style={{ marginRight: 10 }} />
                    <TextInput
                      style={{ flex: 1, fontFamily: 'Inter_400Regular', fontSize: Typography.base, color: Colors.text, paddingVertical: 14 }}
                      placeholder={f.placeholder} placeholderTextColor={Colors.textMuted}
                      value={f.value} onChangeText={f.setter}
                      secureTextEntry={f.secure} autoCapitalize="none"
                    />
                  </View>
                </View>
              ))}

              {/* City */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Tỉnh / Thành phố</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                    {CITIES.map((c) => (
                      <TouchableOpacity key={c} style={[styles.filterChip, city === c && styles.filterChipActive]} onPress={() => { setCity(c); setDistrict(''); setWard(''); }}>
                        <Text style={[styles.filterChipText, city === c && styles.filterChipTextActive]}>{c}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* District */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Quận / Huyện</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                    {availableDistricts.map((d) => (
                      <TouchableOpacity key={d} style={[styles.filterChip, district === d && styles.filterChipActive]} onPress={() => { setDistrict(d); setWard(''); }}>
                        <Text style={[styles.filterChipText, district === d && styles.filterChipTextActive]}>{d}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Ward */}
              {availableWards.length > 0 && (
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Phường / Xã</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                      {availableWards.map((w) => (
                        <TouchableOpacity key={w} style={[styles.filterChip, ward === w && styles.filterChipActive]} onPress={() => setWard(w)}>
                          <Text style={[styles.filterChipText, ward === w && styles.filterChipTextActive]}>{w}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}

              {/* Specific address */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Địa chỉ cụ thể</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="location-outline" size={18} color={Colors.textMuted} style={{ marginRight: 10 }} />
                  <TextInput
                    style={{ flex: 1, fontFamily: 'Inter_400Regular', fontSize: Typography.base, color: Colors.text, paddingVertical: 14 }}
                    placeholder="Số nhà, đường..." placeholderTextColor={Colors.textMuted}
                    value={address} onChangeText={setAddress}
                  />
                </View>
              </View>

              {/* ID Photo reminder for instructors */}
              {role === 'instructor' && (
                <View style={styles.photoReminder}>
                  <Ionicons name="camera" size={20} color={Colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.photoReminderTitle}>Ảnh thẻ bắt buộc</Text>
                    <Text style={styles.photoReminderDesc}>Vui lòng chuẩn bị ảnh thẻ 3x4 hoặc 4x6 để sử dụng làm ảnh đại diện. Ảnh sẽ được yêu cầu khi xác minh tài khoản.</Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* STEP 3 — Specialization */}
          {step === 3 && (
            <View style={{ gap: Spacing.md }}>
              <Text style={styles.stepTitle}>{role === 'learner' ? 'Bạn muốn học gì?' : 'Chuyên môn của bạn'}</Text>
              <Text style={styles.stepSub}>{role === 'learner' ? 'Chọn lĩnh vực, môn học và kỹ năng quan tâm' : 'Thông tin lĩnh vực giảng dạy'}</Text>

              {/* Category selection */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Lĩnh vực</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                    {CATEGORY_KEYS.map((key) => {
                      const cat = CATEGORY_MAP[key];
                      return (
                        <TouchableOpacity
                          key={key}
                          style={[styles.categoryChip, selectedCategory === key && { backgroundColor: cat.color + '18', borderColor: cat.color }]}
                          onPress={() => setSelectedCategory(key)}
                        >
                          <Ionicons name={cat.icon as any} size={14} color={selectedCategory === key ? cat.color : Colors.textMuted} />
                          <Text style={[styles.categoryChipText, selectedCategory === key && { color: cat.color }]}>{cat.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>

              {/* Subjects - displayed first */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Môn học {role === 'learner' ? 'muốn học' : 'giảng dạy'}</Text>
                <View style={styles.chipGrid}>
                  {SUBJECTS.map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.filterChip, selectedSubjects.includes(s) && styles.filterChipActive]}
                      onPress={() => toggleItem(selectedSubjects, s, setSelectedSubjects)}
                    >
                      <Text style={[styles.filterChipText, selectedSubjects.includes(s) && styles.filterChipTextActive]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Skills - displayed second */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Kỹ năng {role === 'learner' ? 'quan tâm' : 'chuyên môn'}</Text>
                <View style={styles.chipGrid}>
                  {SKILLS.map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.filterChip, selectedSkills.includes(s) && styles.skillChipActive]}
                      onPress={() => toggleItem(selectedSkills, s, setSelectedSkills)}
                    >
                      <Text style={[styles.filterChipText, selectedSkills.includes(s) && styles.skillChipTextActive]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {role === 'learner' ? (
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Trình độ / Lớp</Text>
                  <View style={styles.chipGrid}>
                    {LEVELS.map((g) => (
                      <TouchableOpacity key={g} style={[styles.filterChip, level === g && styles.filterChipActive]} onPress={() => setLevel(g)}>
                        <Text style={[styles.filterChipText, level === g && styles.filterChipTextActive]}>{g}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : (
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Học phí mong muốn (đ/giờ)</Text>
                  <View style={styles.inputWrap}>
                    <Ionicons name="cash-outline" size={18} color={Colors.textMuted} style={{ marginRight: 10 }} />
                    <TextInput
                      style={{ flex: 1, fontFamily: 'Inter_400Regular', fontSize: Typography.base, color: Colors.text, paddingVertical: 14 }}
                      value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="150000"
                      placeholderTextColor={Colors.textMuted}
                    />
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Action button */}
          <TouchableOpacity
            style={[styles.nextBtn, loading && { opacity: 0.7 }]}
            onPress={step === 3 ? handleRegister : handleNext}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.surface} />
            ) : (
              <Text style={styles.nextBtnText}>{step === 3 ? 'Tạo tài khoản' : 'Tiếp tục'}</Text>
            )}
          </TouchableOpacity>

          {step === 1 && (
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Đã có tài khoản? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.footerLink}>Đăng nhập</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flexGrow: 1, padding: Spacing.xl, paddingTop: Spacing.lg },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  backText: { fontFamily: 'Inter_500Medium', fontSize: Typography.sm, color: Colors.primary, marginLeft: 2 },
  progressRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing['2xl'] },
  progressDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: Colors.border },
  progressDotActive: { backgroundColor: Colors.primary },
  stepTitle: { fontFamily: 'Manrope_700Bold', fontSize: Typography['2xl'], color: Colors.primary, marginBottom: Spacing.xs },
  stepSub: { fontFamily: 'Inter_400Regular', fontSize: Typography.sm, color: Colors.textSecondary, marginBottom: Spacing.xl },
  roleGrid: { flexDirection: 'row', gap: Spacing.md },
  roleCard: {
    flex: 1, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.surface, padding: Spacing.lg, alignItems: 'center', gap: Spacing.sm,
    ...Shadow.sm,
  },
  roleCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  roleIcon: { width: 56, height: 56, borderRadius: Radius.md, backgroundColor: Colors.borderLight, alignItems: 'center', justifyContent: 'center' },
  roleIconActive: { backgroundColor: Colors.primary },
  roleName: { fontFamily: 'Manrope_700Bold', fontSize: Typography.md, color: Colors.primary },
  roleNameActive: { color: Colors.accent },
  roleDesc: { fontFamily: 'Inter_400Regular', fontSize: Typography.xs, color: Colors.textMuted, textAlign: 'center' },
  fieldGroup: { gap: Spacing.xs },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: Typography.sm, color: Colors.textSecondary },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, ...Shadow.sm,
  },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  filterChip: {
    paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: Radius.full,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  filterChipText: { fontFamily: 'Inter_500Medium', fontSize: Typography.sm, color: Colors.textSecondary },
  filterChipTextActive: { color: Colors.primary, fontFamily: 'Inter_600SemiBold' },
  skillChipActive: { backgroundColor: Colors.warningLight, borderColor: Colors.warning },
  skillChipTextActive: { color: Colors.warning, fontFamily: 'Inter_600SemiBold' },
  categoryChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: Radius.full,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  categoryChipText: { fontFamily: 'Inter_500Medium', fontSize: Typography.sm, color: Colors.textSecondary },
  photoReminder: {
    flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start',
    backgroundColor: Colors.primaryLight, borderRadius: Radius.md, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.primary + '30',
  },
  photoReminderTitle: { fontFamily: 'Inter_600SemiBold', fontSize: Typography.sm, color: Colors.primary, marginBottom: 2 },
  photoReminderDesc: { fontFamily: 'Inter_400Regular', fontSize: Typography.xs, color: Colors.textSecondary, lineHeight: 18 },
  nextBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingVertical: 16, alignItems: 'center', marginTop: Spacing.xl, ...Shadow.md,
  },
  nextBtnText: { fontFamily: 'Inter_700Bold', fontSize: Typography.md, color: Colors.surface },
  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
  footerText: { fontFamily: 'Inter_400Regular', fontSize: Typography.sm, color: Colors.textSecondary },
  footerLink: { fontFamily: 'Inter_700Bold', fontSize: Typography.sm, color: Colors.primary },
});
