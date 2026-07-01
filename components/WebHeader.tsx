import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadow, Radius } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';

export default function WebHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoggedIn } = useAuthStore();
  const isInstructor = user?.role === 'instructor';

  const NAV_ITEMS = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Tìm Chuyên gia', path: '/find-tutors' },
    { label: 'Trở thành Chuyên gia', path: '/become-tutor' },
    { label: isInstructor ? 'Quản lý giảng dạy' : 'Quản lý học tập', path: '/dashboard' },
    { label: 'Đăng ký', path: '/enrollments' },
  ];

  return (
    <View style={styles.header}>
      <View style={styles.content}>
        {/* Logo */}
        <TouchableOpacity style={styles.logoContainer} onPress={() => router.push('/')} activeOpacity={0.8}>
          <Ionicons name="school" size={28} color={Colors.primary} />
          <Text style={styles.logoText}>EduConnect</Text>
        </TouchableOpacity>

        {/* Navigation */}
        <View style={styles.navContainer}>
          {NAV_ITEMS.map((item) => {
            // pathname might be '/(tabs)/find-tutors' or just '/find-tutors' depending on expo router
            const isActive = pathname.endsWith(item.path) || (pathname === '/' && item.path === '/');
            return (
              <TouchableOpacity key={item.path} onPress={() => router.push(item.path as any)} style={styles.navItem} activeOpacity={0.7}>
                <Text style={[styles.navText, isActive && styles.navTextActive]}>
                  {item.label}
                </Text>
                {isActive && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* User Actions */}
        <View style={styles.actionContainer}>
          {isLoggedIn ? (
            <TouchableOpacity style={styles.avatarCircle} onPress={() => router.push('/dashboard')}>
              <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase()}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.loginText}>Đăng nhập / Đăng ký</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.sm,
    ...Shadow.sm,
    zIndex: 100,
  },
  content: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  logoText: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: Typography.xl,
    color: Colors.primary,
  },
  navContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
  },
  navItem: {
    paddingVertical: Spacing.sm,
    position: 'relative',
  },
  navText: {
    fontFamily: 'Inter_500Medium',
    fontSize: Typography.base,
    color: Colors.textMuted,
  },
  navTextActive: {
    fontFamily: 'Inter_600SemiBold',
    color: Colors.primary,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  loginText: {
    fontFamily: 'Inter_600SemiBold',
    color: Colors.surface,
    fontSize: Typography.sm,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.surface,
    fontFamily: 'Inter_700Bold',
    fontSize: Typography.base,
  },
});
