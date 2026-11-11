# BoardBeacon Aesthetic Theme Switcher & Skin System

Comprehensive architectural and design plan to implement dynamic, full-application aesthetic theming across BoardBeacon—supporting five distinct aesthetic skins ('Classic Midnight', 'Neon Cyberpunk', 'Minimalist Paper', 'Walnut Woodcraft', and 'Emerald Casino') covering the app shell, game lobby, headers, modals, and square board game components.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following parameters were confirmed by the user in Phase 1:
> - **Theme Scope**: Applies to the **entire application and game boards** (canvas background, headers, cards, dialogs, board frames, squares, and game piece styles).
> - **Selector Placement**: Integrated inside the **Player Profile & Honors page** with an interactive visual skin gallery, live thumbnail previews, and instant 1-click activation. (A quick-indicator badge is also provided in the header for transparency).
> - **Theme Lineup**: 5 curated aesthetic skins:
>   1. **Classic Midnight** (Default deep navy obsidian & electric cyan)
>   2. **Neon Cyberpunk** (High-voltage synthwave noir, hot magenta, and neon cyan glow)
>   3. **Minimalist Paper** (Warm tactile parchment, sumi-ink typography, and terracotta accents)
>   4. **Walnut Woodcraft** (Polished rich mahogany, maple inlay, and burnished brass)
>   5. **Emerald Casino** (Monte Carlo velvet felt, tournament gold, and deep forest emerald)

---

## 1. Overview & Core Concept

### What It Delivers
A dedicated, reactive theming engine that alters the visual atmosphere and tactile feel of BoardBeacon. When a player selects a theme in their profile, the change propagates instantly through CSS design tokens and React context:
- Canvas background, navigation bars, profile summaries, and dialogs transform to match the mood.
- Every game board (Chess, Checkers, Tic-Tac-Toe, Connect Four, Memory Game, Sudoku, Snakes & Ladders, Mahjong, and Ludo) adapts its board casing, alternating square colors, highlight rings, and piece tokens while strictly maintaining the mathematical 1:1 square geometry established in previous updates.

### Target Audience & Persona
Casual, strategy, and puzzle players who appreciate sensory variety—whether preferring late-night dark navy focus, cozy tactile warm paper for morning sudoku, or tournament-grade walnut wood for serious chess study.

### Key Value
Elevates BoardBeacon from a single dark-mode app to an immersive board gaming lounge with bespoke visual identities tailored to diverse moods and environments.

---

## 2. User Experience & Visual Design

### Key User Flows

```
[ Player in Lobby or Game ]
            │
            ▼
[ Navigates to Profile Page ]
            │
            ▼
[ "Board Aesthetic & Skins" Section ]
  ├── 5 Visual Theme Cards (Interactive Preview Grid)
  │     ├── Thumbnail preview of board colors & piece tokens
  │     ├── Theme title, mood description & contrast badge
  │     └── "Active Skin" indicator with glowing selection ring
  │
  ├── 1-Click Select & Live Preview
  │     ├── CSS root variables update with smooth 200ms transition
  │     ├── Profile page & Header immediately restyle
  │     └── Theme ID persists in localStorage & UserProfile
  │
  ▼
[ Back to Lobby or Game ]
  └── Game board frames, cell squares, discs, and pawns render in selected aesthetic
```

### Aesthetic Presets & Color Token Matrix

| Theme ID | Canvas & Surfaces | Board Container & Grid | Primary Accents | Game Pieces & Markings |
| :--- | :--- | :--- | :--- | :--- |
| **`classic-midnight`** | Deep Navy `#0a192f`, Surfaces `#0f172a`, Borders `#1e293b` | Midnight Obsidian slate `#020617`, Grid `#0f172a` | Electric Cyan `#22d3ee`, Aqua `#64ffda` | White frost vs. Dark obsidian; Cyan & Rose indicators |
| **`neon-cyberpunk`** | Cyber Noir `#05050d`, Surfaces `#0f0a1c`, Borders `#2d124d` | Carbon matrix `#120e24`, Grid `#1a1033` | Laser Magenta `#f43f5e`, Fluorescent Cyan `#00f0ff` | Neon Cyan holographic vs. Hot Pink plasma |
| **`minimalist-paper`** | Warm Parchment `#f7f4ec`, Surfaces `#ede8dc`, Borders `#d5cebe` | Textured Warm Bone `#e4ded0`, Grid `#d9d2c2` | Sumi Ink `#1f1e1d`, Terracotta `#c2410c` | Monochromatic Charcoal `#18181b` vs. Raw Linen `#fafaf9` |
| **`walnut-woodcraft`** | Mahogany Study `#1a100b`, Surfaces `#2b1b13`, Borders `#442b1f` | Polished Walnut `#26160d`, Inlay Maple `#d4a373` / `#7a4b2c` | Burnished Brass `#d97706`, Warm Amber `#f59e0b` | Carved Maple/Ivory vs. Dark Ebony; Brass highlight rings |
| **`emerald-casino`** | British Racing Green `#061a12`, Surfaces `#0c2b1e`, Borders `#14422f` | Casino Felt `#0a3322`, Tournament Grid `#072619` | Championship Gold `#fbbf24`, Amber Velvet `#d97706` | Gold-gilt Ivory vs. Onyx discs; Diamond-green highlights |

### Typographic Pairing & Contrast Governance
- **Dark Skins** (`classic-midnight`, `neon-cyberpunk`, `walnut-woodcraft`, `emerald-casino`): High-legibility light text (`text-slate-100`, `#f8fafc`) with optical tracking and AA contrast ratios exceeding 7:1 against card and board surfaces.
- **Light Skin** (`minimalist-paper`): Warm deep sumi charcoal text (`text-stone-900`, `#1c1917`) on warm cream surfaces (`#f7f4ec`), avoiding eye fatigue and clinical blinding white.
- Monospace tabular numerals (`tabular-nums font-mono`) maintained across Sudoku digits, coordinate tags, scores, and move notations.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Theme Architecture via CSS Custom Properties + React ThemeContext
- **Chosen Approach**: Define an explicit `ThemeContext` backed by CSS custom properties (e.g. `--theme-bg-canvas`, `--theme-surface-card`, `--theme-board-casing`, `--theme-cell-light`, `--theme-cell-dark`, `--theme-accent-primary`) injected at the document root, accompanied by a `data-theme="[id]"` attribute on `<html>` / container.
- **Why**: Allows instant theme switching without re-rendering or unmounting the entire DOM tree, ensures sub-millisecond response latency, and seamlessly coordinates both full-app surfaces and deep game board pieces.
- **Alternative Considered**: Inline hardcoded color mappings in every game component. Rejected because it would cause code duplication across 9 games and break consistency.

### Decision 2: Seamless Persistence within UserProfile
- **Chosen Approach**: Store `theme: ThemeId` directly on the `UserProfile` object in `AuthContext` and persist in `localStorage` under `boardbeacon_theme` and `boardbeacon_user`.
- **Why**: Keeps all user preferences unified. Resetting data restores default `classic-midnight`, while normal play retains the user's preferred aesthetic across sessions.

### Decision 3: Preservation of Strict 1:1 Square Geometry
- **Chosen Approach**: Themes strictly alter surface colors, borders, drop shadows, and piece glyph styling—never altering container aspect ratios (`aspect-square`), cell proportions, or padding budgets.
- **Why**: Directly satisfies the prior user constraint: "Always keep the board size square. Let all the cells be of same shape irrespective of the cells containing anything."

---

## 4. Technical Architecture & Data Strategy

### System Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Application Root                               │
│                         (App.tsx / ThemeProvider)                           │
│                                                                             │
│   ┌──────────────────────────┐             ┌────────────────────────────┐   │
│   │       AuthContext        │             │        ThemeContext        │   │
│   │  (UserProfile + Storage) │◄───────────►│  (activeTheme, setTheme)   │   │
│   └────────────┬─────────────┘             └─────────────┬──────────────┘   │
└────────────────┼─────────────────────────────────────────┼──────────────────┘
                 │                                         │
                 ▼                                         ▼
   ┌───────────────────────────┐             ┌────────────────────────────┐
   │       App Container       │             │   CSS Custom Properties    │
   │  [data-theme="..."]       │             │  :root / [data-theme="..."]│
   └─────────────┬─────────────┘             └─────────────┬──────────────┘
                 │                                         │
       ┌─────────┴───────────────┬─────────────────────────┴────────┐
       ▼                         ▼                                  ▼
┌──────────────┐      ┌────────────────────┐            ┌────────────────────┐
│ Header.tsx   │      │ ProfilePage.tsx    │            │ BaseGameContainer  │
│ - Brand      │      │ - User Info        │            │ & 9 Board Games    │
│ - Nav Links  │      │ - Theme Selector   │            │ - Square Boards    │
│ - Skin Tag   │      │   Interactive Grid │            │ - Themed Squares   │
└──────────────┘      └────────────────────┘            │ - Themed Pieces    │
                                                        └────────────────────┘
```

### Data Model & Types

```typescript
export type ThemeId =
  | 'classic-midnight'
  | 'neon-cyberpunk'
  | 'minimalist-paper'
  | 'walnut-woodcraft'
  | 'emerald-casino';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  tagline: string;
  category: 'dark' | 'light';
  previewColors: {
    bg: string;
    card: string;
    accent: string;
    piecePrimary: string;
    pieceSecondary: string;
  };
  tokens: {
    bgCanvas: string;
    surfaceCard: string;
    surfaceCardHover: string;
    borderHairline: string;
    boardCasing: string;
    boardFrameBorder: string;
    squareLight: string;
    squareDark: string;
    textPrimary: string;
    textSecondary: string;
    accentPrimary: string;
    accentGlow: string;
  };
}
```

### Component & Interactive Handler Mapping

1. **`src/contexts/ThemeContext.tsx`**:
   - Manages `theme: ThemeId`, `setTheme(themeId: ThemeId)`, and active `ThemeConfig`.
   - On theme change, applies `data-theme` attribute to `document.documentElement` and persists to `localStorage`.
   - Injects synchronized CSS variables so all Tailwind and custom classes adapt automatically.

2. **`src/components/ProfilePage.tsx`**:
   - New section: **"Board Aesthetic & Game Skins"**.
   - Displays 5 cards in a responsive grid with rich live previews showing board cell swatches, mini game piece representations, and theme descriptions.
   - Click handler calls `setTheme(themeId)` with tactile feedback, checkmark badge, and instant live preview.

3. **`src/components/Header.tsx` & `src/App.tsx`**:
   - Outer shell wrapper adopts dynamic themed classes (`bg-[var(--theme-bg-canvas)] text-[var(--theme-text-primary)]`).
   - Header shows subtle current skin tag with link to profile customizer.

4. **Board Games & Containers (`BaseGameContainer.tsx`, `ChessGame.tsx`, etc.)**:
   - Board container outer casing uses theme tokens for border, background, and shadows.
   - Light and dark squares use semantic theme variables while strictly preserving `aspect-square w-full h-full`.

---

## 5. Verification Plan

1. **Compilation & Linting**: Run `compile_applet` and `lint_applet` together to verify zero TypeScript or syntax issues.
2. **Interactive Theme Switching**:
   - Navigate to Profile Page and switch through all 5 skins.
   - Verify localStorage persistence across page reloads.
   - Verify smooth 200ms transition without layout shifts or contrast breakages.
3. **Square Board Geometry Check**:
   - Open Chess, Checkers, Tic-Tac-Toe, Sudoku, Connect Four, and Ludo in every theme.
   - Confirm every board remains strictly square (`aspect-square`) and all cells remain strictly equal in shape.
4. **Contrast & Anti-Slop Audit**:
   - Confirm WCAG AA compliance across all 5 themes.
   - Zero pills for static metadata, clean unboxed text separators.
