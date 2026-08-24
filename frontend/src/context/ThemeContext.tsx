import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  bg: string;
  surface: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primaryInk: string;
  primaryInkHover: string;
  primaryInkSoft: string;
  primaryInkBorder: string;
  primaryInkText: string;
  success: string;
  successBg: string;
  successBorder: string;
  warning: string;
  warningBg: string;
  warningBorder: string;
  danger: string;
  dangerBg: string;
  dangerBorder: string;
  info: string;
  infoBg: string;
  infoBorder: string;
}

export interface ChartThemeColors {
  primary: string;
  primaryHover: string;
  grid: string;
  axis: string;
  axisMuted: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
  mask: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  gross: string;
}

export const THEME_PALETTES: Record<ThemeMode, ThemeColors> = {
  light: {
    bg: '#FAFAFA',
    surface: '#FFFFFF',
    border: '#E4E4E7',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    primaryInk: '#1E293B',
    primaryInkHover: '#0F172A',
    primaryInkSoft: '#F1F5F9',
    primaryInkBorder: '#E2E8F0',
    primaryInkText: '#FFFFFF',
    success: '#15803D',
    successBg: '#F0FDF4',
    successBorder: '#BBF7D0',
    warning: '#B45309',
    warningBg: '#FFFBEB',
    warningBorder: '#FEF3C7',
    danger: '#B91C1C',
    dangerBg: '#FEF2F2',
    dangerBorder: '#FECACA',
    info: '#1D4ED8',
    infoBg: '#EFF6FF',
    infoBorder: '#DBEAFE',
  },
  dark: {
    bg: '#0B0F17',
    surface: '#151B24',
    border: '#262D38',
    textPrimary: '#F3F4F6',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    primaryInk: '#E2E8F0',
    primaryInkHover: '#F8FAFC',
    primaryInkSoft: '#1E293B',
    primaryInkBorder: '#334155',
    primaryInkText: '#0B0F17',
    success: '#4ADE80',
    successBg: 'rgba(74, 222, 128, 0.12)',
    successBorder: 'rgba(74, 222, 128, 0.25)',
    warning: '#FBBF24',
    warningBg: 'rgba(251, 191, 36, 0.12)',
    warningBorder: 'rgba(251, 191, 36, 0.25)',
    danger: '#F87171',
    dangerBg: 'rgba(248, 113, 113, 0.12)',
    dangerBorder: 'rgba(248, 113, 113, 0.25)',
    info: '#60A5FA',
    infoBg: 'rgba(96, 165, 250, 0.12)',
    infoBorder: 'rgba(96, 165, 250, 0.25)',
  }
};

export const CHART_THEME_PALETTES: Record<ThemeMode, ChartThemeColors> = {
  light: {
    primary: '#1E293B',
    primaryHover: '#0F172A',
    grid: '#F1F5F9',
    axis: '#64748B',
    axisMuted: '#94A3B8',
    tooltipBg: '#FFFFFF',
    tooltipBorder: '#E4E4E7',
    tooltipText: '#111827',
    mask: '#FFFFFF',
    success: '#15803D',
    warning: '#B45309',
    danger: '#B91C1C',
    info: '#1D4ED8',
    gross: '#9CA3AF',
  },
  dark: {
    primary: '#E2E8F0',
    primaryHover: '#F8FAFC',
    grid: '#262D38',
    axis: '#9CA3AF',
    axisMuted: '#6B7280',
    tooltipBg: '#151B24',
    tooltipBorder: '#262D38',
    tooltipText: '#F3F4F6',
    mask: '#151B24',
    success: '#4ADE80',
    warning: '#FBBF24',
    danger: '#F87171',
    info: '#60A5FA',
    gross: '#6B7280',
  }
};

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isDark: boolean;
  colors: ThemeColors;
  chartColors: ChartThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('finora_theme') as ThemeMode;
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch (e) {
      // LocalStorage access fallback
    }
    return 'light'; // Default to light theme as specified in requirements
  });

  const applyThemeToDOM = (mode: ThemeMode) => {
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
  };

  useEffect(() => {
    applyThemeToDOM(theme);
    try {
      localStorage.setItem('finora_theme', theme);
    } catch (e) {}
  }, [theme]);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
  };

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const isDark = theme === 'dark';
  const colors = THEME_PALETTES[theme];
  const chartColors = CHART_THEME_PALETTES[theme];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark, colors, chartColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
