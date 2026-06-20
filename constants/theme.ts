// ===== DESIGN TOKENS — FORMAL PROFESSIONAL PALETTE =====

export const Colors = {
  // Primary palette
  primary: '#1A2B4A',       // Navy deep
  primaryLight: '#2E4A7A',
  accent: '#2E6FD8',        // Professional blue
  accentLight: '#4B8AEF',
  accentMuted: '#EBF2FF',

  // Status colors
  success: '#1B8A5A',
  successLight: '#E6F5EE',
  warning: '#C8820A',
  warningLight: '#FEF3E2',
  danger: '#C42B2B',
  dangerLight: '#FDE8E8',

  // Neutral palette
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  divider: '#E8ECF4',

  // Text
  text: '#1A1A2E',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  // Overlay
  overlay: 'rgba(26, 43, 74, 0.5)',
};

export const Typography = {
  // Font families
  heading: 'Manrope_700Bold',
  headingSemi: 'Manrope_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',

  // Font sizes
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 34,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
};

export const Shadow = {
  sm: {
    shadowColor: '#1A2B4A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#1A2B4A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09,
    shadowRadius: 10,
    elevation: 4,
  },
  lg: {
    shadowColor: '#1A2B4A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
};
