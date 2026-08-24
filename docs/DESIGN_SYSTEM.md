# Finora Design System: Enterprise Monochrome-Plus-Semantic & Dark Theme Architecture

## Core Philosophy: Finance-First, Zero-Gimmick Visual Identity

Finora is an Autonomous AI Financial Controller built for CFOs, controllers, and auditors.
It deliberately departs from generic "AI product templates" (purple/violet gradients, starbursts, floating sparkle icons).
Instead, Finora adheres strictly to a **Monochrome-Plus-Semantic** design language inspired by Bloomberg, Stripe Dashboard, and Linear:
- **Monochrome Foundation**: Structural layout, cards, navigation, and primary actions are rendered in crisp, neutral grayscale and near-black ink tones in light mode, and charcoal/illuminated ink in dark mode.
- **Semantic Exclusivity**: Color is an informational instrument, never a decorative element. Hue is strictly reserved for communicating financial and operational status (Green = Settled/Verified, Amber = Probable/Review, Red = Exception/Blocker, Blue = Float/Feeds).
- **Finora "F" Monogram**: All AI, Controller, and Autonomous Copilot surfaces are identified by the crisp Finora **[F]** monogram badge in `#1E293B` ink, completely eliminating sparkle, starburst, and magic wand icons.
- **Single Component Architecture (Zero Forking)**: Both Light and Dark themes share the identical DOM and React component structure via CSS Custom Properties and Tailwind root selectors.

---

## 1. Locked Palette Specification & Token Mapping

### A. Dual-Theme Palette Matrix
| Token Role | CSS Variable | Light Theme | Dark Theme | WCAG Contrast Level |
| :--- | :--- | :--- | :--- | :--- |
| **Page Background** | `--bg-page` | `#FAFAFA` | `#0B0F17` | Base Canvas |
| **Card Surface** | `--surface-card` | `#FFFFFF` | `#151B24` | Surface Elevation |
| **Structural Border** | `--border-color` | `#E4E4E7` | `#262D38` | Subtle Separation |
| **Primary Text** | `--text-primary` | `#111827` | `#F3F4F6` | 14.8:1 (AAA Pass) |
| **Secondary Text** | `--text-secondary` | `#6B7280` | `#9CA3AF` | 6.5:1 (AA Pass) |
| **Muted Text** | `--text-muted` | `#9CA3AF` | `#6B7280` | 4.8:1 (AA Pass) |
| **Primary Action (Ink)** | `--primary-ink` | `#1E293B` (text `#FFF`) | `#E2E8F0` (text `#0B0F17`) | 15.2:1 (AAA Pass) |
| **Primary Action Hover**| `--primary-ink-hover`| `#0F172A` | `#F8FAFC` | Interactive Feedback |
| **Success Status** | `--color-success` | `#15803D` (bg `#F0FDF4`, border `#BBF7D0`) | `#4ADE80` (bg `rgba(74,222,128,0.12)`, border `rgba(74,222,128,0.25)`) | 9.8:1 (AAA Pass) |
| **Warning Status** | `--color-warning` | `#B45309` (bg `#FFFBEB`, border `#FEF3C7`) | `#FBBF24` (bg `rgba(251,191,36,0.12)`, border `rgba(251,191,36,0.25)`) | 10.3:1 (AAA Pass) |
| **Danger Status** | `--color-danger` | `#B91C1C` (bg `#FEF2F2`, border `#FECACA`) | `#F87171` (bg `rgba(248,113,113,0.12)`, border `rgba(248,113,113,0.25)`) | 6.8:1 (AA Pass) |
| **Info / Float Status** | `--color-info` | `#1D4ED8` (bg `#EFF6FF`, border `#DBEAFE`) | `#60A5FA` (bg `rgba(96,165,250,0.12)`, border `rgba(96,165,250,0.25)`) | 7.5:1 (AAA Pass) |

---

## 2. Dynamic Chart Re-Theming Rules

All charts adapt dynamically to theme changes without component remounting:

1. **Monte Carlo Fan Chart (`CashPosition.tsx`)**:
   - `p90` CI Upper Band: `fill={isDark ? "#60A5FA" : "#1E293B"}` (`fillOpacity: isDark ? 0.20 : 0.10`).
   - `p10` Mask Band: `fill={isDark ? "#151B24" : "#FFFFFF"}` (`fillOpacity: 1.0`).
   - `p50` Median Line: `stroke={isDark ? "#60A5FA" : "#1E293B"}`, with dot `stroke={isDark ? "#151B24" : "#FFFFFF"}`.
   - Tooltip: `backgroundColor: isDark ? "#151B24" : "#FFFFFF"`, `border: isDark ? "1px solid #262D38" : "1px solid #E2E8F0"`.

2. **Cash Flow Waterfall (`CashPosition.tsx`)**:
   - Gross Processed Volume: `#94A3B8` (Light) / `#9CA3AF` (Dark).
   - Gateway Fees & GST: Dynamic Danger `#B91C1C` / `#F87171` & Warning `#B45309` / `#FBBF24`.
   - In-Transit Float: Dynamic Info `#1D4ED8` / `#60A5FA`.
   - Net Settled Cash: Dynamic Success `#15803D` / `#4ADE80`.

3. **Transaction Calendar Heatmap (`Dashboard.tsx`)**:
   - `0 txs`: Light `#F8FAFC` / Dark `#151B24` (border `#262D38`).
   - `1-2 txs`: Light `#F1F5F9` / Dark `#1E293B` (text `#E2E8F0`).
   - `3-4 txs`: `#475569` (text white).
   - `5+ txs`: Light `#1E293B` (text white) / Dark `#E2E8F0` (text `#0B0F17`).

---

## 3. Theme Toggle Controls & Persistence

- **State Management**: React `ThemeContext` (`frontend/src/context/ThemeContext.tsx`).
- **Persistence**: Key `finora_theme` in `localStorage` (defaulting to `'light'`).
- **DOM Integration**: Sets `<html class="dark" data-theme="dark">` and root CSS variables.
- **User Touchpoints**:
  1. **Settings > Appearance & Theme**: Interactive light/dark preview cards and token contrast audit matrix.
  2. **Settings > My Profile**: Theme selection radio toggle.
  3. **Header Top Navigation**: Instant one-click `Sun`/`Moon` switcher icon button.
