import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { THEME_PRESETS, THEME_LABELS, type ThemeName, type ThemeTokens } from '../constants/branding';
import type { Role } from '../types/auth';

const STORAGE_KEY = 'itil_theme';
const SOURCE_KEY = 'itil_theme_source';
const APPEARANCE_KEY = 'itil_appearance';

export type AppearanceMode = 'light' | 'dark';

type ThemeSource = 'manual' | 'auto-role';

const ROLE_DEFAULT_THEME: Record<Role, ThemeName> = {
  admin: 'rapidcircle',
  sdm: 'teal',
  user: 'slate',
};

interface ThemeContextValue {
  themeName: ThemeName;
  theme: ThemeTokens;
  appearanceMode: AppearanceMode;
  setThemeName: (name: ThemeName) => void;
  setAppearanceMode: (mode: AppearanceMode) => void;
  toggleAppearanceMode: () => void;
  applyRoleDefaultTheme: (role: Role) => void;
  resetToBrandDefault: () => void;
  themeOptions: Array<{ value: ThemeName; label: string }>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemeName(value: string): value is ThemeName {
  return value in THEME_PRESETS;
}

function isAppearanceMode(value: string | null): value is AppearanceMode {
  return value === 'light' || value === 'dark';
}

function getInitialAppearanceMode(): AppearanceMode {
  const savedMode = localStorage.getItem(APPEARANCE_KEY);
  if (isAppearanceMode(savedMode)) {
    return savedMode;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyThemeToDocument(theme: ThemeTokens, mode: AppearanceMode): void {
  const root = document.documentElement;
  const isDarkMode = mode === 'dark';

  root.style.setProperty('--rc-primary', theme.primary);
  root.style.setProperty('--rc-primary-50', theme.primary50);
  root.style.setProperty('--rc-primary-100', theme.primary100);
  root.style.setProperty('--rc-primary-600', theme.primary600);
  root.style.setProperty('--rc-primary-700', theme.primary700);
  root.style.setProperty('--rc-primary-900', theme.primary900);
  root.style.setProperty('--rc-primary-950', theme.primary950);
  root.style.setProperty('--rc-accent', theme.accent);
  root.style.setProperty('--rc-accent-soft', theme.accentSoft);
  root.style.setProperty('--rc-surface', isDarkMode ? '#111827' : theme.surface);
  root.style.setProperty('--rc-text', isDarkMode ? '#E5E7EB' : theme.text);
  root.style.setProperty('--rc-muted', isDarkMode ? '#9CA3AF' : theme.muted);

  root.style.setProperty('--rc-bg-start', isDarkMode ? '#0B1220' : theme.primary50);
  root.style.setProperty('--rc-bg-end', isDarkMode ? '#111827' : theme.surface);
  root.style.setProperty('--rc-surface-elevated', isDarkMode ? '#1F2937' : '#FFFFFF');
  root.style.setProperty('--rc-border-soft', isDarkMode ? '#334155' : '#E5E7EB');
  root.style.setProperty('--rc-flow-grid', isDarkMode ? '#334155' : '#E2E8F0');

  root.classList.toggle('dark', isDarkMode);
  root.style.colorScheme = mode;

  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) {
    themeMeta.setAttribute('content', isDarkMode ? '#0b1220' : theme.primary);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeNameState] = useState<ThemeName>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && isThemeName(saved) ? saved : 'rapidcircle';
  });
  const [themeSource, setThemeSource] = useState<ThemeSource>(() => {
    const saved = localStorage.getItem(SOURCE_KEY);
    return saved === 'manual' ? 'manual' : 'auto-role';
  });
  const [appearanceMode, setAppearanceModeState] = useState<AppearanceMode>(getInitialAppearanceMode);

  const theme = THEME_PRESETS[themeName];

  const setThemeName = useCallback((name: ThemeName): void => {
    setThemeSource('manual');
    setThemeNameState(name);
  }, []);

  const setAppearanceMode = useCallback((mode: AppearanceMode): void => {
    setAppearanceModeState(mode);
  }, []);

  const toggleAppearanceMode = useCallback((): void => {
    setAppearanceModeState(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const applyRoleDefaultTheme = useCallback((role: Role): void => {
    if (themeSource === 'manual') {
      return;
    }
    setThemeNameState(ROLE_DEFAULT_THEME[role]);
    setThemeSource('auto-role');
  }, [themeSource]);

  const resetToBrandDefault = useCallback((): void => {
    setThemeNameState('rapidcircle');
    setAppearanceModeState('light');
    setThemeSource('auto-role');
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, themeName);
    localStorage.setItem(SOURCE_KEY, themeSource);
    localStorage.setItem(APPEARANCE_KEY, appearanceMode);
    applyThemeToDocument(theme, appearanceMode);
  }, [themeName, theme, themeSource, appearanceMode]);

  const themeOptions = useMemo(
    () => (Object.keys(THEME_PRESETS) as ThemeName[]).map(name => ({ value: name, label: THEME_LABELS[name] })),
    [],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      themeName,
      theme,
      appearanceMode,
      setThemeName,
      setAppearanceMode,
      toggleAppearanceMode,
      applyRoleDefaultTheme,
      resetToBrandDefault,
      themeOptions,
    }),
    [
      themeName,
      theme,
      appearanceMode,
      setThemeName,
      setAppearanceMode,
      toggleAppearanceMode,
      applyRoleDefaultTheme,
      resetToBrandDefault,
      themeOptions,
    ],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
