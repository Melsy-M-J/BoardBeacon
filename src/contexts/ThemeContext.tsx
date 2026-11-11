import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { ThemeId, ThemeConfig, THEMES } from '../types/theme';
import { AuthContext } from './AuthContext';

interface ThemeContextType {
  theme: ThemeId;
  currentTheme: ThemeConfig;
  setTheme: (id: ThemeId) => void;
  availableThemes: ThemeConfig[];
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'classic-midnight',
  currentTheme: THEMES['classic-midnight'],
  setTheme: () => {},
  availableThemes: Object.values(THEMES),
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useContext(AuthContext);

  const [theme, setThemeState] = useState<ThemeId>(() => {
    try {
      const stored = localStorage.getItem('boardbeacon_theme') as ThemeId | null;
      if (stored && THEMES[stored]) {
        return stored;
      }
      if (user?.theme && THEMES[user.theme]) {
        return user.theme;
      }
    } catch {}
    return 'classic-midnight';
  });

  const currentTheme = useMemo(() => THEMES[theme] || THEMES['classic-midnight'], [theme]);

  // Synchronize CSS custom properties whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    const colors = currentTheme.colors;

    root.setAttribute('data-theme', theme);
    if (currentTheme.category === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }

    // Apply tokens directly to CSS variables
    root.style.setProperty('--theme-bg-canvas', colors.bgCanvas);
    root.style.setProperty('--theme-surface-card', colors.surfaceCard);
    root.style.setProperty('--theme-surface-card-hover', colors.surfaceCardHover);
    root.style.setProperty('--theme-border-hairline', colors.borderHairline);
    root.style.setProperty('--theme-text-primary', colors.textPrimary);
    root.style.setProperty('--theme-text-secondary', colors.textSecondary);
    root.style.setProperty('--theme-text-muted', colors.textMuted);
    root.style.setProperty('--theme-accent-primary', colors.accentPrimary);
    root.style.setProperty('--theme-accent-hover', colors.accentHover);
    root.style.setProperty('--theme-accent-glow', colors.accentGlow);

    root.style.setProperty('--theme-board-casing', colors.boardCasing);
    root.style.setProperty('--theme-board-border', colors.boardBorder);
    root.style.setProperty('--theme-grid-bg', colors.gridBg);
    root.style.setProperty('--theme-cell-light', colors.cellLight);
    root.style.setProperty('--theme-cell-dark', colors.cellDark);
    root.style.setProperty('--theme-cell-text-light', colors.cellTextLight);
    root.style.setProperty('--theme-cell-text-dark', colors.cellTextDark);
    root.style.setProperty('--theme-highlight-move', colors.highlightMove);
    root.style.setProperty('--theme-highlight-win', colors.highlightWin);

    root.style.setProperty('--theme-piece-player', colors.piecePlayer);
    root.style.setProperty('--theme-piece-opponent', colors.pieceOpponent);
    root.style.setProperty('--theme-piece-player-border', colors.piecePlayerBorder);
    root.style.setProperty('--theme-piece-opponent-border', colors.pieceOpponentBorder);

    try {
      localStorage.setItem('boardbeacon_theme', theme);
    } catch {}
  }, [theme, currentTheme]);

  const setTheme = useCallback((id: ThemeId) => {
    if (THEMES[id]) {
      setThemeState(id);
    }
  }, []);

  const value = useMemo(
    () => ({
      theme,
      currentTheme,
      setTheme,
      availableThemes: Object.values(THEMES),
    }),
    [theme, currentTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
