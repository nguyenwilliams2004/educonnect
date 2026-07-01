import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useWindowDimensions, Platform, View } from 'react-native';
import WebHeader from '@/components/WebHeader';

export default function TabLayout() {
  const { user } = useAuthStore();
  const isInstructor = user?.role === 'instructor';
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* On desktop, show our custom WebHeader. On mobile, we use Expo's native header or hide it if not needed. */}
      {isDesktop && <WebHeader />}
      
      {/* The main content area. On Desktop we can wrap this in a max-width container inside the screens themselves. */}
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: Colors.primary,
            tabBarInactiveTintColor: Colors.textMuted,
            tabBarStyle: {
              // Hide bottom tabs on desktop
              display: isDesktop ? 'none' : 'flex',
              backgroundColor: Colors.surface,
              borderTopColor: Colors.border,
              borderTopWidth: 1,
              height: 72,
              paddingBottom: 14,
              paddingTop: 8,
            },
            tabBarLabelStyle: {
              fontFamily: 'Inter_500Medium',
              fontSize: Typography.xs,
              marginTop: 2,
            },
            tabBarIconStyle: {
              marginBottom: 0,
            },
            // On desktop, we hide the screen's default header because WebHeader is already showing above
            headerShown: !isDesktop,
            headerStyle: { backgroundColor: Colors.surface },
            headerShadowVisible: false,
            headerTitleStyle: { fontFamily: 'Manrope_700Bold', fontSize: Typography.lg, color: Colors.primary },
            headerTintColor: Colors.primary,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Trang chủ',
              tabBarLabel: 'Trang chủ',
              tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
              headerTitle: 'EduConnect',
            }}
          />
          <Tabs.Screen
            name="find-tutors"
            options={{
              title: 'Tìm Chuyên gia',
              tabBarLabel: 'Chuyên gia',
              tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />,
            }}
          />
          <Tabs.Screen
            name="become-tutor"
            options={{
              title: 'Trở thành Chuyên gia',
              tabBarLabel: 'Đăng ký dạy',
              tabBarIcon: ({ color, size }) => <Ionicons name="person-add" size={size} color={color} />,
            }}
          />
          <Tabs.Screen
            name="dashboard"
            options={{
              title: isInstructor ? 'Quản lý giảng dạy' : 'Quản lý học tập',
              tabBarLabel: 'Quản lý',
              tabBarIcon: ({ color, size }) => <Ionicons name="grid" size={size} color={color} />,
            }}
          />
          <Tabs.Screen
            name="enrollments"
            options={{
              title: 'Đăng ký của tôi',
              tabBarLabel: 'Đăng ký',
              tabBarIcon: ({ color, size }) => <Ionicons name="school" size={size} color={color} />,
            }}
          />
        </Tabs>
      </View>
    </View>
  );
}
