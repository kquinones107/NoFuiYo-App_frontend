import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { getColors, Theme } from './Colors';

export const getCustomTheme = (theme: Theme = 'light') => {
  const colors = getColors(theme);
  const baseTheme = theme === 'dark' ? MD3DarkTheme : MD3LightTheme;

  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: colors.primary,
      secondary: colors.secondary,
      tertiary: colors.accent,
      background: colors.background,
      surface: colors.surface,
      surfaceVariant: colors.surfaceVariant,
      text: colors.textPrimary,
      onPrimary: colors.buttonText,
      onSecondary: colors.buttonText,
      onSurface: colors.textPrimary,
      onSurfaceVariant: colors.textSecondary,
      outline: colors.inputBorder,
      outlineVariant: colors.gray300,
      error: colors.error,
      onError: colors.textInverse,
      errorContainer: theme === 'dark' ? '#4B1113' : '#FFDAD6',
      onErrorContainer: theme === 'dark' ? '#FFDAD6' : '#4B1113',
      success: colors.success,
      warning: colors.warning,
      info: colors.info,
    },
  };
};

// Default theme for backward compatibility
export const CustomTheme = getCustomTheme('light');
