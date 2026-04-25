export const BRANDING = {
  appName: 'ITIL Dashboard',
  appShortName: 'RapidCircle',
  sidebarSubtitle: 'Process Management Suite',
  loginSubtitle: 'Sign in to continue',
  footerText: '© 2026 RapidCircle',
  adminPanelLabel: 'Admin Panel',
  editModeLabel: 'Edit mode active',
  logoPath: '/Logo/Logo_RapidCircle.svg',
} as const;

export type ThemeName = 'rapidcircle' | 'teal' | 'slate';

export interface ThemeTokens {
  primary: string;
  primary50: string;
  primary100: string;
  primary600: string;
  primary700: string;
  primary900: string;
  primary950: string;
  accent: string;
  accentSoft: string;
  surface: string;
  text: string;
  muted: string;
}

export const THEME_PRESETS: Record<ThemeName, ThemeTokens> = {
  rapidcircle: {
    primary: '#056DB6',
    primary50: '#E9F3FB',
    primary100: '#CCE4F6',
    primary600: '#056DB6',
    primary700: '#045D9B',
    primary900: '#033F69',
    primary950: '#022F4F',
    accent: '#3F3F3F',
    accentSoft: '#F2F2F2',
    surface: '#F7F9FC',
    text: '#3F3F3F',
    muted: '#6B7280',
  },
  teal: {
    primary: '#0F766E',
    primary50: '#CCFBF1',
    primary100: '#99F6E4',
    primary600: '#0F766E',
    primary700: '#115E59',
    primary900: '#134E4A',
    primary950: '#022C22',
    accent: '#1F2937',
    accentSoft: '#D1FAE5',
    surface: '#F8FAFC',
    text: '#1F2937',
    muted: '#6B7280',
  },
  slate: {
    primary: '#475569',
    primary50: '#F1F5F9',
    primary100: '#E2E8F0',
    primary600: '#475569',
    primary700: '#334155',
    primary900: '#0F172A',
    primary950: '#020617',
    accent: '#1E293B',
    accentSoft: '#E2E8F0',
    surface: '#F8FAFC',
    text: '#1E293B',
    muted: '#64748B',
  },
};

export const THEME_LABELS: Record<ThemeName, string> = {
  rapidcircle: 'RC',
  teal: 'Teal Classic',
  slate: 'Slate Pro',
};

export const ROLE_LABELS = {
  admin: 'ADMIN',
  sdm: 'SDM',
  user: 'USER',
} as const;

export const ROLE_BADGE_STYLES = {
  admin: 'bg-red-100 text-red-700',
  sdm: 'bg-indigo-100 text-indigo-700',
  user: 'bg-gray-100 text-gray-700',
} as const;

export const ROLE_BADGE_STYLES_WITH_BORDER = {
  admin: 'bg-red-50 text-red-700 border-red-200',
  sdm: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  user: 'bg-gray-100 text-gray-700 border-gray-300',
} as const;
