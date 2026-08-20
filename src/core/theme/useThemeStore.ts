import { create } from 'zustand';

export type ThemeMode = 'dark' | 'light' | 'warm';

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = 'tk_theme_mode';

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === 'dark' || saved === 'light' || saved === 'warm') return saved;
  return 'dark';
}

function applyThemeToDom(theme: ThemeMode) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    const themeColorMap: Record<ThemeMode, string> = {
      dark: '#121317',
      light: '#f8f9fb',
      warm: '#f5efe6',
    };
    meta.setAttribute('content', themeColorMap[theme]);
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
        let next: ThemeMode;
        if (state.theme === 'dark') next = 'light';
        else if (state.theme === 'light') next = 'warm';
        else next = 'dark';

        localStorage.setItem(THEME_STORAGE_KEY, next);
        applyThemeToDom(next);
        return { theme: next };
      });
    },
  };
});
