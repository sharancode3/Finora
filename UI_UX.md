# UI/UX Design System Specification: Finora

*Note: Finora is an enterprise-grade Autonomous Financial Controller for Razorpay merchants. All visual treatments, color tokens, and interface contracts are strictly standardized to eliminate cognitive fatigue and maintain audit credibility.*

---

## 1. Single Source-of-Truth Color System (Locked)

Color in Finora carries strict, unambiguous semantic meaning. Decorative color fills, random gradients, and arbitrary icon backgrounds are **strictly prohibited**.

### Semantic Color Matrix

| Color Family | Tailwind Token | Semantic Meaning | Approved System Uses | Prohibited Uses |
| :--- | :--- | :--- | :--- | :--- |
| **GREEN** | `emerald` (`bg-emerald-50`, `text-emerald-700`, `border-emerald-200`, `bg-emerald-600`) | **Verified / Healthy / Pass / Good / Settled** | • Exact Match Trust Badge<br>• Healthy Feed Sync State<br>• Benford MAD Compliant Pass<br>• Month-End Close Balanced / Finalized<br>• Resolved Exception Status | • Decorative buttons<br>• Arbitrary card accents |
| **AMBER / ORANGE** | `amber` (`bg-amber-50`, `text-amber-800`, `border-amber-200`, `bg-amber-600`) | **Probable / Pending / Needs Attention / Review Required / Stale** | • Fuzzy Match Trust Badge<br>• Sync Delay / Stale Feed SLA Alert<br>• Statistical Check "Sample Too Small"<br>• Medium/Low Exception Severity Badge<br>• Escalated Pending Review Badge | • Unverified positive metrics |
| **RED / ROSE** | `rose` (`bg-rose-50`, `text-rose-700`, `border-rose-200`, `bg-rose-600`) | **Exception / Critical / Failed / High Risk / Unresolved** | • Unmatched / Open Exception Badge<br>• Critical & High Risk Tier Badges<br>• SoD Governance Blockers<br>• Month-End Out-of-Balance Warning<br>• Destructive Confirmation Trigger | • Non-urgent warnings |
| **INDIGO** | `indigo` (`bg-indigo-50`, `text-indigo-700`, `border-indigo-200`, `text-indigo-600`) | **AI-Generated Content / Fino Intelligence / Sparkles** | • ✨ Fino AI launcher & reasoning trails<br>• AI-generated Forensic Narrations<br>• AI Root-Cause Investigation Summaries<br>• AI Month-End Close Narrative Memo | • Standard system status badges<br>• General navigation elements |
| **SLATE / GRAY** | `slate` (`bg-slate-50` to `bg-slate-900`, `text-slate-700`) | **Neutral Chrome / Structural Bounds / Metadata** | • Data table borders & headers<br>• Transaction IDs, UTRs, timestamps<br>• Standard icon containers<br>• Secondary filters & search inputs | • Trust state encoding |

> [!IMPORTANT]
> **Strict Blue Prohibition**: Blue (`blue-500`, `blue-600`) is **strictly prohibited** from being used as a status, risk, or trust color anywhere in Finora. Blue is reserved only for standard hyperlink hover states or navigation breadcrumbs if needed.

---

## 2. Statistical Forensic Checks & Sample Size Guardrails

When statistical or unsupervised ML checks cannot evaluate meaningfully due to a small filtered sample (e.g. date range with $< 30$ transactions or single-account filter):
- **Never display a bare "0" or vague "Insufficient Data" without rationale.**
- Display the mandatory transparent explanation:
  $$\text{"Fewer than [N] transactions in this view (found [X]) — statistical checks need a larger sample to be meaningful."}$$
- Style the card notification using the **Amber (`bg-amber-50 border-amber-200 text-amber-900`)** state.

---

## 3. The "No Popups" Architecture
- **Zero Content-Blocking Modals**: Every record inspection, audit evidence graph, exception breakdown, and timeline history expands **inline (accordion)**, via **slide-out drawer**, or as a dedicated deep-audit view.
- Overlays that obscure operational dashboard context are prohibited, preserving multi-screen comparison workflows for financial controllers.

---

## 4. Global Fino AI Copilot Uniformity
The Fino Copilot interface is identical across all 7 views (`/`, `/exceptions`, `/reconciliation`, `/cash-position`, `/linked-accounts`, `/month-end-close`, `/ask-your-books`):
- **Visual Launcher**: Uniform bottom-right floating trigger with sparkling Fino AI indicator.
- **Context Injection**: Live, dynamic `PageContext` reading current route, active filters, and visible numbers at moment of submission.
- **Trust-Badge & Reasoning Trail**: Every answer renders confidence level (`HIGH`, `MEDIUM`, `LOW`), underlying transaction evidence chips, verifier status, and step-by-step tool reasoning chain.

---

## 5. Absolute Prohibition on Dark Cards & Low-Contrast Backgrounds

Dark navy, dark purple, and black container cards (`bg-slate-900`, `bg-indigo-950`, `bg-purple-950`, etc.) are **strictly prohibited** across all pages, modals, and drawers:
- **Card Backgrounds**: Must always use crisp, clean white (`bg-white`) or light tint backgrounds (`bg-slate-50`, `bg-indigo-50/70`, `bg-emerald-50`, `bg-amber-50`, `bg-rose-50`).
- **Typography**: Must always maintain high contrast using dark slate typography (`text-slate-900`, `text-slate-800`, `text-slate-700`).
- **Borders & Dividers**: Must use clean, subtle borders (`border-slate-200`, `border-indigo-100`, `border-emerald-200`, `border-amber-200`, `border-rose-200`).
- **Zero Low-Contrast Muddy Cards**: Every AI investigation factor, audit step, conclusion banner, and financial KPI card must be completely legible on all display types.
