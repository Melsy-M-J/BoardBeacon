export type ThemeId =
  | 'classic-midnight'
  | 'neon-cyberpunk'
  | 'minimalist-paper'
  | 'walnut-woodcraft'
  | 'emerald-casino';

export interface ThemeColors {
  // App Canvas & Surfaces
  bgCanvas: string;
  surfaceCard: string;
  surfaceCardHover: string;
  borderHairline: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentPrimary: string;
  accentHover: string;
  accentGlow: string;

  // Board Specifics
  boardCasing: string;
  boardBorder: string;
  gridBg: string;
  cellLight: string;
  cellDark: string;
  cellTextLight: string;
  cellTextDark: string;
  highlightMove: string;
  highlightWin: string;
  
  // Piece Palette
  piecePlayer: string;
  pieceOpponent: string;
  piecePlayerBorder: string;
  pieceOpponentBorder: string;
}

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  tagline: string;
  category: 'dark' | 'light';
  colors: ThemeColors;
  preview: {
    cellLight: string;
    cellDark: string;
    p1: string;
    p2: string;
  };
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  'classic-midnight': {
    id: 'classic-midnight',
    name: 'Classic Midnight',
    tagline: 'Deep obsidian navy with glowing electric cyan accents',
    category: 'dark',
    colors: {
      bgCanvas: '#0a192f',
      surfaceCard: '#0f172a',
      surfaceCardHover: '#1e293b',
      borderHairline: '#1e293b',
      textPrimary: '#f8fafc',
      textSecondary: '#94a3b8',
      textMuted: '#64748b',
      accentPrimary: '#06b6d4',
      accentHover: '#22d3ee',
      accentGlow: 'rgba(6, 182, 212, 0.25)',

      boardCasing: '#091322',
      boardBorder: '#1e293b',
      gridBg: '#020617',
      cellLight: '#1e293b',
      cellDark: '#0f172a',
      cellTextLight: '#f1f5f9',
      cellTextDark: '#94a3b8',
      highlightMove: 'rgba(6, 182, 212, 0.4)',
      highlightWin: 'rgba(251, 191, 36, 0.4)',

      piecePlayer: '#06b6d4',
      pieceOpponent: '#f43f5e',
      piecePlayerBorder: '#67e8f9',
      pieceOpponentBorder: '#fda4af',
    },
    preview: {
      cellLight: '#1e293b',
      cellDark: '#0f172a',
      p1: '#06b6d4',
      p2: '#f43f5e',
    },
  },

  'neon-cyberpunk': {
    id: 'neon-cyberpunk',
    name: 'Neon Cyberpunk',
    tagline: 'High-voltage synthwave noir with laser magenta & cyan pulse',
    category: 'dark',
    colors: {
      bgCanvas: '#06030e',
      surfaceCard: '#0f081d',
      surfaceCardHover: '#180e30',
      borderHairline: '#281347',
      textPrimary: '#fdf4ff',
      textSecondary: '#c084fc',
      textMuted: '#7e22ce',
      accentPrimary: '#f43f5e',
      accentHover: '#fb7185',
      accentGlow: 'rgba(244, 63, 94, 0.35)',

      boardCasing: '#0a0514',
      boardBorder: '#3b1263',
      gridBg: '#05020a',
      cellLight: '#231140',
      cellDark: '#120726',
      cellTextLight: '#fae8ff',
      cellTextDark: '#c084fc',
      highlightMove: 'rgba(0, 240, 255, 0.45)',
      highlightWin: 'rgba(244, 63, 94, 0.5)',

      piecePlayer: '#00f0ff',
      pieceOpponent: '#ff0055',
      piecePlayerBorder: '#67e8f9',
      pieceOpponentBorder: '#ff77aa',
    },
    preview: {
      cellLight: '#231140',
      cellDark: '#120726',
      p1: '#00f0ff',
      p2: '#ff0055',
    },
  },

  'minimalist-paper': {
    id: 'minimalist-paper',
    name: 'Minimalist Paper',
    tagline: 'Warm tactile parchment, sumi-ink glyphs & terracotta accents',
    category: 'light',
    colors: {
      bgCanvas: '#f5f2e9',
      surfaceCard: '#ebe5d8',
      surfaceCardHover: '#dfd8c8',
      borderHairline: '#d3cbb9',
      textPrimary: '#1c1917',
      textSecondary: '#57534e',
      textMuted: '#78716c',
      accentPrimary: '#c2410c',
      accentHover: '#ea580c',
      accentGlow: 'rgba(194, 65, 12, 0.2)',

      boardCasing: '#e5ded0',
      boardBorder: '#c8bfab',
      gridBg: '#dcd4c3',
      cellLight: '#f5f0e6',
      cellDark: '#dcd3c1',
      cellTextLight: '#1c1917',
      cellTextDark: '#292524',
      highlightMove: 'rgba(194, 65, 12, 0.25)',
      highlightWin: 'rgba(202, 138, 4, 0.3)',

      piecePlayer: '#292524',
      pieceOpponent: '#9a3412',
      piecePlayerBorder: '#57534e',
      pieceOpponentBorder: '#c2410c',
    },
    preview: {
      cellLight: '#f5f0e6',
      cellDark: '#dcd3c1',
      p1: '#292524',
      p2: '#9a3412',
    },
  },

  'walnut-woodcraft': {
    id: 'walnut-woodcraft',
    name: 'Walnut Woodcraft',
    tagline: 'Rich polished mahogany, carved maple squares & burnished brass',
    category: 'dark',
    colors: {
      bgCanvas: '#170f0a',
      surfaceCard: '#241710',
      surfaceCardHover: '#322017',
      borderHairline: '#452b1f',
      textPrimary: '#fed7aa',
      textSecondary: '#d97706',
      textMuted: '#92400e',
      accentPrimary: '#d97706',
      accentHover: '#f59e0b',
      accentGlow: 'rgba(217, 119, 6, 0.3)',

      boardCasing: '#20120a',
      boardBorder: '#5c3928',
      gridBg: '#130a05',
      cellLight: '#d4a373',
      cellDark: '#7a4b2c',
      cellTextLight: '#2c180e',
      cellTextDark: '#fed7aa',
      highlightMove: 'rgba(245, 158, 11, 0.45)',
      highlightWin: 'rgba(234, 179, 8, 0.5)',

      piecePlayer: '#fef3c7',
      pieceOpponent: '#381e11',
      piecePlayerBorder: '#fde68a',
      pieceOpponentBorder: '#78350f',
    },
    preview: {
      cellLight: '#d4a373',
      cellDark: '#7a4b2c',
      p1: '#fef3c7',
      p2: '#381e11',
    },
  },

  'emerald-casino': {
    id: 'emerald-casino',
    name: 'Emerald Casino',
    tagline: 'Monte Carlo tournament felt, gold-gilt trim & deep forest velvet',
    category: 'dark',
    colors: {
      bgCanvas: '#051b11',
      surfaceCard: '#0a291b',
      surfaceCardHover: '#0f3825',
      borderHairline: '#154a32',
      textPrimary: '#ecfdf5',
      textSecondary: '#6ee7b7',
      textMuted: '#059669',
      accentPrimary: '#fbbf24',
      accentHover: '#f59e0b',
      accentGlow: 'rgba(251, 191, 36, 0.3)',

      boardCasing: '#072417',
      boardBorder: '#1c5e40',
      gridBg: '#03140c',
      cellLight: '#144c33',
      cellDark: '#0b3020',
      cellTextLight: '#fef08a',
      cellTextDark: '#a7f3d0',
      highlightMove: 'rgba(251, 191, 36, 0.4)',
      highlightWin: 'rgba(245, 158, 11, 0.55)',

      piecePlayer: '#fef08a',
      pieceOpponent: '#f87171',
      piecePlayerBorder: '#fde047',
      pieceOpponentBorder: '#fca5a5',
    },
    preview: {
      cellLight: '#144c33',
      cellDark: '#0b3020',
      p1: '#fef08a',
      p2: '#f87171',
    },
  },
};
