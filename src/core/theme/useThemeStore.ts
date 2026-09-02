import { create } from 'zustand';

export type ThemeMode = 'dark' | 'zinc' | 'light' | 'slate' | 'warm';

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = 'tk_theme_mode';

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (
    saved === 'dark' ||
    saved === 'zinc' ||
    saved === 'light' ||
    saved === 'slate' ||
    saved === 'warm'
  ) {
    return saved;
  }
  return 'dark';
}

function applyThemeToDom(theme: ThemeMode) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    const themeColorMap: Record<ThemeMode, string> = {
      dark: '#121317',
      zinc: '#09090b',
      slate: '#0a0f1d',
      light: '#f8f9fb',
      warm: '#f5efe6',
    };
    meta.setAttribute('content', themeColorMap[theme] || '#121317');
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
        const order: ThemeMode[] = ['dark', 'zinc', 'light', 'slate', 'warm'];
        const currentIndex = order.indexOf(state.theme);
        const next = order[(currentIndex + 1) % order.length];

        localStorage.setItem(THEME_STORAGE_KEY, next);
        applyThemeToDom(next);
        return { theme: next };
      });
    },
  };
});
