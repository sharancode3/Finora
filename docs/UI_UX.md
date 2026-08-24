# UI/UX Specification: Finora Autonomous Financial Controller

*Finora is an enterprise-grade Autonomous Financial Controller for merchants. All visual treatments, color tokens, and interface contracts are strictly standardized to eliminate cognitive fatigue, prevent AI template clichés, and maintain uncompromised audit credibility.*

---

## 1. Single Source-of-Truth Monochrome-Plus-Semantic Color System

Color in Finora carries strict, unambiguous semantic meaning. Decorative color fills, random gradients, purple/violet palettes, and arbitrary icon backgrounds are **strictly prohibited**.

### Core Palette Specification

| Token Role | Hex Value | Approved System Uses | Prohibited Uses |
| :--- | :--- | :--- | :--- |
| **Page Canvas** | `#FAFAFA` | Global body background, app layout backdrop | Never pure white, dark blue, or purple |
| **Card Surface** | `#FFFFFF` | Metric containers, data tables, modals, flyout drawers | Never dark navy/black cards |
| **Border / Stroke** | `#E4E4E7` | Card perimeter, table cell dividing lines, header borders | Never neon or colored borders |
| **Primary Text** | `#111827` | Headings, key figures, table values, active labels | Never low-contrast muted grays |
| **Secondary Text** | `#6B7280` | Subtitles, field labels, metadata descriptions | Never unreadable text |
| **Muted Text** | `#9CA3AF` | Inactive captions, table column headers, timestamps | Never for financial amounts |
| **Ink Primary Action** | `#1E293B` | Main action buttons, active navigation pills, modal commits | Never decorative backgrounds |
| **Ink Action Hover** | `#0F172A` | Hover state on all primary ink buttons and triggers | — |
| **Ink Soft Tint** | `#F1F5F9` | Active sidebar item background, subtle filter pills | Never random colored badges |

### Semantic Color Matrix

| Color Family | Values (Text / BG / Border) | Semantic Meaning | Approved System Uses |
| :--- | :--- | :--- | :--- |
| **GREEN (Success)** | `#15803D` / `#F0FDF4` / `#BBF7D0` | **Verified / Healthy / Pass / Settled** | • Exact Match Trust Badge<br>• Healthy Feed Sync State<br>• Benford MAD Compliant Pass<br>• Month-End Close Balanced / Finalized<br>• Resolved Exception Status |
| **AMBER (Warning)** | `#B45309` / `#FFFBEB` / `#FEF3C7` | **Probable / Pending / Review Required** | • Fuzzy Match Trust Badge<br>• Sync Delay / Stale Feed SLA Alert<br>• Statistical Check "Sample Too Small"<br>• Escalated Pending Review Badge |
| **RED (Danger)** | `#B91C1C` / `#FEF2F2` / `#FECACA` | **Exception / Critical / Out-of-Balance** | • Unmatched / Open Exception Badge<br>• Critical & High Risk Tier Badges<br>• SoD Governance Blockers<br>• Month-End Out-of-Balance Warning |
| **BLUE (Info / Float)** | `#1D4ED8` / `#EFF6FF` / `#DBEAFE` | **In-Transit Float / Feed Ingested** | • T+2 Settlement Float In-Transit<br>• Ingested Gateway Feed Nodes<br>• Secondary Hyperlinks & Documentation Links |

---

## 2. Iconic Identity: Finora "F" Monogram Everywhere

- **Zero Sparkles Rule**: Sparkle (`Sparkles`), magic wand (`Wand2`), and starburst icons are completely prohibited from representing AI or autonomous features.
- **Unified Monogram Badge**: Every AI-driven element (Daily Briefing, Ask Controller floating launcher, Root-Cause Investigator, Closing Memo Drafter) displays the Finora **[F]** monogram badge:
  ```tsx
  <div className="w-4 h-4 rounded bg-[#1E293B] text-white flex items-center justify-center text-[9px] font-mono font-bold shrink-0">
    F
  </div>
  ```

---

## 3. Data Density & Visual Rhythm Guidelines

1. **Max 1 Badge Per Card**:
   - Every metric card is restricted to a maximum of one status pill located in the top-right corner.
   - Status clarity is achieved through typography, clear labels, and tabular monospace numbers.
2. **Indian Financial Formatting**:
   - All rupee figures use `₹` followed by standard Indian comma formatting (e.g., `₹2,65,803.50`).
   - Every amount is rendered with tabular monospace numbers (`font-mono`) to ensure clean vertical alignment across columns.
3. **Period-over-Period (PoP) Cap**:
   - When a percentage change exceeds $\pm 300\%$ (e.g. initial base of zero), the UI displays the clear absolute rupee difference (`+₹6,030 vs prior`) rather than meaningless huge percentages (`+184920%`).

---

## 4. The "No Popups" Inline Investigation Architecture

- **Zero Content-Blocking Modals for Analysis**: Record inspections, audit trails, 3-way reconciliation graphs, and exception details expand inline via collapsible drawers or slide-out panels.
- Modals are strictly reserved for irreversible, high-importance state transitions (Reconciliation Engine Run, Cryptographic Period Lock, Add Integration Account).

---

## 5. Global Fino AI Copilot Uniformity

The Fino Copilot is embedded consistently across all application views:
- **Unified Launcher**: Floating bottom-right trigger with the crisp **[F]** badge and label `"Ask Controller"`.
- **Dynamic Page Context**: Reads active route, applied date range filters, and on-screen metrics in real time upon prompt submission.
- **Evidence Trail**: Every AI response outputs confidence tier (`HIGH`, `MEDIUM`), inspectable tool citations (`sqlite_cluster_aggregator`, `deterministic_pattern_matcher`), and verified citations linking directly to underlying SQLite records.
