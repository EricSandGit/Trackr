import { create } from 'zustand';

export type ThemeMode = 'dark' | 'light';

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = 'tk_theme_mode';

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === 'dark' || saved === 'light') return saved;
  return 'dark';
}

function applyThemeToDom(theme: ThemeMode) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', theme === 'dark' ? '#0d1117' : '#ffffff');
  }
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
        const next = state.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem(THEME_STORAGE_KEY, next);
        applyThemeToDom(next);
        return { theme: next };
      });
    },
  };
});
