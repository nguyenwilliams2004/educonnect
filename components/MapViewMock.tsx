import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Shadow, Spacing, Typography } from '@/constants/theme';
import { Instructor, Learner, formatPrice } from '@/data/mockData';

const MOCK_COORDS: Record<string, { x: number, y: number }> = {
  'Cầu Giấy': { x: 30, y: 35 },
  'Đống Đa': { x: 45, y: 45 },
  'Thanh Xuân': { x: 35, y: 55 },
  'Hoàng Mai': { x: 55, y: 65 },
  'Ba Đình': { x: 50, y: 30 },
  'Hai Bà Trưng': { x: 60, y: 50 },
  'Quận 1': { x: 40, y: 40 },
  'Quận 3': { x: 35, y: 30 },
  'Quận 7': { x: 50, y: 70 },
  'Bình Thạnh': { x: 60, y: 25 },
  'Hải Châu': { x: 45, y: 45 },
  'Sơn Trà': { x: 65, y: 35 }
};

interface MapViewMockProps {
  items: any[];
  onItemPress: (item: any) => void;
  type: 'instructor' | 'learner';
}

export default function MapViewMock({ items, onItemPress, type }: MapViewMockProps) {
  const [activeItem, setActiveItem] = useState<any>(null);
  const [mapSize, setMapSize] = useState({ width: 300, height: 500 });

  return (
    <View style={styles.container}>
      <View
        style={styles.mapContainer}
        onLayout={(e) => setMapSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
      >
        {Platform.OS === 'web' ? (
           <View style={[styles.mapBackground, { backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px', backgroundColor: '#f1f5f9' } as any]} />
        ) : (
           <View style={[styles.mapBackground, { backgroundColor: '#f1f5f9' }]} />
        )}

        {items.map((item) => {
          const coords = MOCK_COORDS[item.district] || { x: 10 + ((item.id * 17) % 80), y: 10 + ((item.id * 23) % 80) };
          const isActive = activeItem?.id === item.id;
          const leftPx = (coords.x / 100) * mapSize.width;
          const topPx = (coords.y / 100) * mapSize.height;

          return (
            <View key={item.id} style={[styles.pinWrapper, { left: leftPx, top: topPx }]}>
              <TouchableOpacity
                style={[styles.pin, isActive && styles.pinActive]}
                onPress={() => setActiveItem(item)}
                activeOpacity={0.8}
              >
                <Ionicons name={type === 'instructor' ? "school" : "person"} size={16} color={Colors.surface} />
              </TouchableOpacity>

              {isActive && (
                <View style={styles.popup}>
                  <TouchableOpacity style={styles.popupClose} onPress={() => setActiveItem(null)}>
                    <Ionicons name="close" size={16} color={Colors.textMuted} />
                  </TouchableOpacity>
                  <Text style={styles.popupName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.popupSubjects} numberOfLines={1}>
                    {item.subjects ? item.subjects.join(', ') : item.skills?.[0]}
                  </Text>
                  <View style={styles.popupLocation}>
                    <Ionicons name="location" size={12} color={Colors.textMuted} />
                    <Text style={styles.popupLocationText} numberOfLines={2}>
                      {item.ward}, {item.district}, {item.location}
                    </Text>
                  </View>
                  {item.address && (
                    <Text style={styles.popupAddress} numberOfLines={1}>{item.address}</Text>
                  )}
                  {type === 'instructor' && item.rating && (
                    <View style={styles.popupMeta}>
                      <Ionicons name="star" size={11} color="#F59E0B" />
                      <Text style={styles.popupMetaText}>{item.rating}</Text>
                      <Text style={styles.popupPrice}>{formatPrice(item.price)}/giờ</Text>
                    </View>
                  )}
                  <TouchableOpacity style={styles.popupBtn} onPress={() => onItemPress(item)}>
                    <Text style={styles.popupBtnText}>Xem chi tiết</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    minHeight: 500,
  },
  mapBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  pinWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 0,
    height: 0,
    zIndex: 1,
  },
  pin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.surface,
    ...Shadow.md,
    transform: [{ translateX: -18 }, { translateY: -36 }], 
  },
  pinActive: {
    backgroundColor: Colors.accent,
    transform: [{ translateX: -18 }, { translateY: -36 }, { scale: 1.15 }],
    zIndex: 10,
  },
  popup: {
    position: 'absolute',
    bottom: 45,
    left: -110,
    width: 220,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    ...Shadow.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    zIndex: 20,
  },
  popupClose: {
    position: 'absolute',
    top: 5,
    right: 5,
    padding: 5,
    zIndex: 10,
  },
  popupName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: Typography.base,
    color: Colors.text,
    marginBottom: 2,
    paddingRight: 20,
  },
  popupSubjects: {
    fontFamily: 'Inter_500Medium',
    fontSize: Typography.xs,
    color: Colors.primary,
    marginBottom: 4,
  },
  popupLocation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    marginBottom: 2,
  },
  popupLocationText: {
    fontFamily: 'Inter_400Regular',
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    flex: 1,
  },
  popupAddress: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  popupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  popupMetaText: {
    fontFamily: 'Inter_500Medium',
    fontSize: Typography.xs,
    color: Colors.textSecondary,
  },
  popupPrice: {
    fontFamily: 'Manrope_700Bold',
    fontSize: Typography.xs,
    color: Colors.primary,
    flexGrow: 1,
    textAlign: 'right',
  },
  popupBtn: {
    backgroundColor: Colors.primaryLight,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  popupBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: Typography.xs,
    color: Colors.primary,
  }
});
