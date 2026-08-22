# UI/UX Document: Finora

*Note: This document adapts the base flat-design token system. This is a serious finance product, not a consumer/marketing site. Tone adjustments are explicitly defined below.*

## Base Visual Language Adjustments
While we utilize the supplied flat-design design-token system (colors, type, radius, shadow rules, component stylings, motion rules), we must apply the following strict adjustments to ensure a professional, trustworthy fintech tone:
- **Tone Down Color Vibrancy**: Use the supplied primary/secondary/accent colors far more sparingly. Reserve bold color fills exclusively for meaningful states (`VERIFIED` green, `PROBABLE` amber, `EXCEPTION` red/rose). Do not use them for decorative section blocking.
- **No Decorative Geometry on Data Screens**: Remove large decorative background geometric shapes entirely from data-dense screens (Dashboard, Exceptions Table, Record Detail). They compete with financial data for attention. Decorative flourishes are acceptable *only* on the login/onboarding screens, and even then, minimally.
- **Maintain Base Flat-Design Rules**: Keep every other rule as supplied: no shadows, no gradients on interactive elements, sharp color-block hierarchy, bold geometric typography, consistent `rounded-md`/`rounded-lg` radii, and scale-based hover feedback.
- **White Background**: White must be the dominant canvas background throughout (not colored section blocks). This reads as calmer and more akin to "professional software" rather than a poster-style marketing page, which is critical for trust in a finance tool.

## 1. Information Architecture / Screen List

- **Onboarding (Multi-step, not a wizard modal)**: 
  - Explain-what-we-need screen → Connect Razorpay test-mode key → Upload bank CSV → Upload ledger CSV → Confirmation screen (showing received row counts) → "Run Reconciliation" primary action.
- **Main Dashboard (Home)**: 
  - Top summary cards: total records, overall match rate, VERIFIED/PROBABLE/EXCEPTION counts, processing time.
  - Visualization: A stacked-bar or ring chart showing the match breakdown.
  - Q&A Input: A persistent, fixed, always-visible panel/bar (never a floating chat bubble).
- **Exceptions Table**: 
  - Always-visible table (never hidden behind a click).
  - Each row is expandable in place (inline accordion, *never* a modal that covers the screen).
  - Expanded view shows: the deterministic reason, the plain-English AI summary, and the underlying source records. Each source record is clickable to view the raw data.
- **Record Detail / Evidence View**: 
  - For any match or exception, displays the settlement record, bank record (if any), and ledger record (if any) side by side.
  - Shows the computed confidence breakdown (the actual weighted components from the TRD formula, not just the final number).
  - Displays the Trust-State badge prominently.
- **Ask Your Books (Dedicated AI Visual Canvas)**: 
  - A question input that renders both a grounded text answer AND a relevant chart (built from the same tool-called data).
  - Includes an "evidence: N records" indicator that expands to show exactly which records the answer is grounded in.
- **Cash Position**: 
  - Settlement trend line/bar chart over the batch's date range.
  - Forward T+N forecast with its stated method. This is *always* labeled clearly as a projection and never presented as certain.
- **Connectors / Data Sources**: 
  - Shows the `DataSource` list with status (connected / needs setup / not available).
  - Each has a short, honest description. The stubbed UPI/bank connector is deliberately labeled "Coming with Account Aggregator integration" rather than being hidden.

## 2. The "No Popups" Rule
There are **no content-blocking modals anywhere**, with the sole exception of a true, rare destructive confirmation (e.g., "Clear this batch and start over?"). 
Every other interaction—record detail, exception drill-down, evidence trail—must be implemented as an inline expand, a slide-out drawer, or a dedicated screen reached via navigation. An overlay that blocks the rest of the dashboard context is strictly prohibited.

## 3. AI Navigation Behavior in the UI
When the chat endpoint returns a structured `ui_action`, it is handled client-side exactly as follows:
- **`navigate_to`**: The app routes to the requested screen and displays a small, transient banner (e.g., *"Taking you to Exceptions, filtered to last week"*) so the sudden context switch is explained to the user.
- **`highlight_record`**: The relevant row or card on the current screen receives a brief, non-jarring visual emphasis (e.g., a subtle color-state change pulse, not an overly heavy or bouncy animation).

## 4. Trust-State Visual Language
The visual treatment for Trust States must be exactly consistent across *every* screen (Dashboard, Table, Record Detail). Inconsistency is a credibility risk.
- **VERIFIED**: Green. Consistent badge shape and iconography (e.g., a solid checkmark).
- **PROBABLE**: Amber/Yellow. Consistent badge shape and iconography (e.g., a warning triangle or question mark).
- **EXCEPTION**: Red/Rose. Consistent badge shape and iconography (e.g., a cross or alert icon).

## 5. Empty / Loading / Error States
- **Empty State (Pre-run)**: Before any batch is run, the dashboard shows a clear invitation/call-to-action to connect sources and run reconciliation. It must not be a blank screen.
- **Loading State**: A long-running batch must show real progress (e.g., "Step 2 of 4: Fuzzy Matching"), not an indefinite generic spinner. Processing time is a key metric, so the user should feel the engine working.
- **Error State (Verifier Fallback)**: If an AI answer fails the verifier and falls back, the chat/canvas displays a calm, clearly-worded "insufficient information" state (e.g., *"I don't have enough verified data to answer that precisely."*). It must never show a generic red "Error 500" or raw system stack trace in the chat UI.

## 6. Responsiveness
This is a finance-ops tool; it is not expected to be used primarily on mobile phones.
- The dashboard must remain fully usable and optimized at a **laptop screen width** at minimum.
- It should degrade gracefully and not visibly break on a **tablet-width** viewport.
