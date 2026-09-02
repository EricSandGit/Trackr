import { create } from 'zustand';

export type ThemeMode = 'zinc' | 'dark' | 'warm' | 'slate' | 'light';

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = 'tk_theme_mode';
const DEFAULT_THEME: ThemeMode = 'zinc';

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (
    saved === 'zinc' ||
    saved === 'dark' ||
    saved === 'warm' ||
    saved === 'slate' ||
    saved === 'light'
  ) {
    return saved as ThemeMode;
  }
  return DEFAULT_THEME;
}

function applyThemeToDom(theme: ThemeMode) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    const themeColorMap: Record<ThemeMode, string> = {
      zinc: '#09090b',
      dark: '#121317',
      warm: '#f5efe6',
      slate: '#f1f5f9',
      light: '#f8f9fb',
    };
    meta.setAttribute('content', themeColorMap[theme] || '#09090b');
  }

  // Ensure record color attribute is active
  const savedRecordColor = localStorage.getItem('tk_record_color') || 'gold';
  document.documentElement.setAttribute('data-record-color', savedRecordColor);
}

export const useThemeStore = create<ThemeState>((set) => {
  const initial = getInitialTheme();
  applyThemeToDom(initial);

  return {
    theme: initial,
    setTheme: (theme: ThemeMode) => {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
      applyThemeToDom(theme);
      set({ theme });
    },
    toggleTheme: () => {
      set((state) => {
        const order: ThemeMode[] = ['zinc', 'dark', 'warm', 'slate', 'light'];
        const currentIndex = order.indexOf(state.theme);
        const next = order[(currentIndex + 1) % order.length];

        localStorage.setItem(THEME_STORAGE_KEY, next);
        applyThemeToDom(next);
        return { theme: next };
      });
    },
  };
});
