// Light theme colors
const lightColors = {
  // Background colors
  background: '#F8F9FA',
  backgroundSecondary: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceVariant: '#F3F4F6',
  
  // Text colors
  textPrimary: '#1A1A1A',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',
  
  // Input colors
  inputBackground: '#FFFFFF',
  inputBorder: '#E5E7EB',
  inputFocus: '#3B82F6',
  
  // Brand colors from app icon
  primary: '#FF6B6B', // Pink from "No"
  secondary: '#FF8C42', // Orange from "Fui" 
  accent: '#4ECDC4', // Blue from "Yo"
  highlight: '#FFD93D', // Yellow from stars
  
  // Button colors
  button: '#FF6B6B', // Primary pink
  buttonSecondary: '#FF8C42', // Orange
  buttonText: '#FFFFFF',
  
  // Link colors
  link: '#3B82F6',
  linkHover: '#2563EB',
  
  // Status colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // Gray scale
  gray900: '#111827',
  gray800: '#1F2937',
  gray700: '#374151',
  gray600: '#4B5563',
  gray500: '#6B7280',
  gray400: '#9CA3AF',
  gray300: '#D1D5DB',
  gray200: '#E5E7EB',
  gray100: '#F3F4F6',
  gray50: '#F9FAFB',
  
  // Gradient colors for backgrounds
  gradientStart: '#FF6B6B',
  gradientMiddle: '#FF8C42',
  gradientEnd: '#4ECDC4',
  
  // Card colors
  cardBackground: '#FFFFFF',
  cardBorder: '#E5E7EB',
  
  // Overlay colors
  overlay: 'rgba(0,0,0,0.1)',
  overlayDark: 'rgba(0,0,0,0.3)',

  // Aliases used by app screens (was react-native NewAppScreen)
  textDark: '#1A1A1A',
  textLight: '#6B7280',
  grayLight: '#E5E7EB',
  grayLighter: '#F3F4F6',
};

// Dark theme colors
const darkColors = {
  // Background colors
  background: '#0F0F0F',
  backgroundSecondary: '#1A1A1A',
  surface: '#1A1A1A',
  surfaceVariant: '#2A2A2A',
  
  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#808080',
  textInverse: '#1A1A1A',
  
  // Input colors
  inputBackground: '#2A2A2A',
  inputBorder: '#404040',
  inputFocus: '#60A5FA',
  
  // Brand colors from app icon (adjusted for dark mode)
  primary: '#FF6B6B', // Pink from "No" - same
  secondary: '#FF8C42', // Orange from "Fui" - same
  accent: '#4ECDC4', // Blue from "Yo" - same
  highlight: '#FFD93D', // Yellow from stars - same
  
  // Button colors
  button: '#FF6B6B', // Primary pink
  buttonSecondary: '#FF8C42', // Orange
  buttonText: '#FFFFFF',
  
  // Link colors
  link: '#60A5FA',
  linkHover: '#93C5FD',
  
  // Status colors
  success: '#34D399',
  error: '#F87171',
  warning: '#FBBF24',
  info: '#60A5FA',
  
  // Gray scale (inverted for dark mode)
  gray900: '#F9FAFB',
  gray800: '#F3F4F6',
  gray700: '#E5E7EB',
  gray600: '#D1D5DB',
  gray500: '#9CA3AF',
  gray400: '#6B7280',
  gray300: '#4B5563',
  gray200: '#374151',
  gray100: '#1F2937',
  gray50: '#111827',
  
  // Gradient colors for backgrounds (darker variants)
  gradientStart: '#E53E3E',
  gradientMiddle: '#DD6B20',
  gradientEnd: '#319795',
  
  // Card colors
  cardBackground: '#1A1A1A',
  cardBorder: '#404040',
  
  // Overlay colors
  overlay: 'rgba(255,255,255,0.05)',
  overlayDark: 'rgba(255,255,255,0.1)',

  // Aliases used by app screens
  textDark: '#FFFFFF',
  textLight: '#B0B0B0',
  grayLight: '#404040',
  grayLighter: '#2A2A2A',
};

// Theme type
export type Theme = 'light' | 'dark';

// Get colors based on theme
export const getColors = (theme: Theme = 'light') => {
  return theme === 'dark' ? darkColors : lightColors;
};

// Default colors (light theme for backward compatibility)
const Colors = lightColors;

export default Colors;