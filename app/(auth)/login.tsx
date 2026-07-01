import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { DEMO_ACCOUNTS } from '@/data/mockData';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const account = DEMO_ACCOUNTS.find(
      (a) => a.email === email.trim() && a.password === password
    );
    setLoading(false);
    if (account) {
      login(account);
    } else {
      Alert.alert('Đăng nhập thất bại', 'Email hoặc mật khẩu không chính xác.');
    }
  };

  const fillDemo = (role: 'learner' | 'instructor') => {
    const acc = DEMO_ACCOUNTS.find((a) => a.role === role)!;
    setEmail(acc.email);
    setPassword(acc.password);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoMark}>
              <Ionicons name="school" size={28} color={Colors.surface} />
            </View>
            <Text style={styles.appName}>EduConnect</Text>
            <Text style={styles.tagline}>Nền tảng kết nối chuyên gia & học viên</Text>
          </View>

          {/* Demo accounts */}
          <View style={styles.demoBox}>
            <Text style={styles.demoTitle}>Tài khoản demo</Text>
            <View style={styles.demoRow}>
              <TouchableOpacity style={styles.demoBtn} onPress={() => fillDemo('learner')}>
                <Ionicons name="person" size={14} color={Colors.primary} />
                <Text style={styles.demoBtnText}>Học viên</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.demoBtn} onPress={() => fillDemo('instructor')}>
                <Ionicons name="briefcase" size={14} color={Colors.primary} />
                <Text style={styles.demoBtnText}>Chuyên gia</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="example@email.com"
                  placeholderTextColor={Colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Mật khẩu</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={Colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginBtn, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.surface} />
              ) : (
                <Text style={styles.loginBtnText}>Đăng nhập</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.footerLink}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flexGrow: 1, padding: Spacing.xl, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: Spacing['2xl'] },
  logoMark: {
    width: 64, height: 64, borderRadius: Radius.lg,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md, ...Shadow.md,
  },
  appName: {
    fontFamily: 'Manrope_800ExtraBold', fontSize: Typography['3xl'],
    color: Colors.primary, marginBottom: Spacing.xs,
  },
  tagline: {
    fontFamily: 'Inter_400Regular', fontSize: Typography.sm,
    color: Colors.textSecondary, textAlign: 'center',
  },
  demoBox: {
    backgroundColor: Colors.primaryLight, borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.xl,
    borderWidth: 1, borderColor: Colors.primary + '30',
  },
  demoTitle: {
    fontFamily: 'Inter_600SemiBold', fontSize: Typography.sm,
    color: Colors.primary, marginBottom: Spacing.sm,
  },
  demoRow: { flexDirection: 'row', gap: Spacing.sm },
  demoBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: Colors.surface, borderRadius: Radius.md,
    paddingVertical: 8, borderWidth: 1, borderColor: Colors.primary + '40',
  },
  demoBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: Typography.sm, color: Colors.primary },
  form: { gap: Spacing.md },
  fieldGroup: { gap: Spacing.xs },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: Typography.sm, color: Colors.textSecondary },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md,
    ...Shadow.sm,
  },
  inputIcon: { marginRight: Spacing.sm },
  input: {
    flex: 1, paddingVertical: 14,
    fontFamily: 'Inter_400Regular', fontSize: Typography.base, color: Colors.text,
  },
  eyeBtn: { padding: Spacing.sm },
  forgotBtn: { alignSelf: 'flex-end' },
  forgotText: { fontFamily: 'Inter_500Medium', fontSize: Typography.sm, color: Colors.primary },
  loginBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingVertical: 16, alignItems: 'center', marginTop: Spacing.sm,
    ...Shadow.md,
  },
  loginBtnText: { fontFamily: 'Inter_700Bold', fontSize: Typography.md, color: Colors.surface },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing['2xl'] },
  footerText: { fontFamily: 'Inter_400Regular', fontSize: Typography.sm, color: Colors.textSecondary },
  footerLink: { fontFamily: 'Inter_700Bold', fontSize: Typography.sm, color: Colors.primary },
});
