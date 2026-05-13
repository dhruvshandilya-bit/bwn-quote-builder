# BWN Quote Builder · Prototype

Tablet-first quote builder for **Basement Waterproofing Nationwide (BWN)** reps.
Covers the full flow: lead pick → estimate build → basement prep → notes → PDF
generation → touch / DocuSign signature capture.

Backed by Merlin Site Pro epic **BWN-110** (19 child stories: BWN-21..BWN-121).

## Quick start

```bash
npm install
npm run dev          # → http://localhost:5173/
```

Production build:

```bash
npm run build        # → dist/
npm run preview      # serves the built bundle locally
```

The prototype is bundled into a single CSS + JS file, so you can also just
`npm run build` and open `dist/index.html` directly.

## End-to-end flow

The bottom-right `⌘ SCENES` rail jumps to any screen for demos. The natural flow
is:

```
Home
 └─ Quote List ─────────────────────────────── + (top-right) → Create New Quote
       └─ Quote Detail (build)
             ├─ + Add Product (FAB) ──── Catalog / Packages / Search
             ├─ All Menus (secondary FAB)
             │     ├─ Line Item
             │     ├─ Add Note
             │     ├─ Activities → Quote Activity
             │     ├─ Emails / Messages / Gallery (placeholder)
             ├─ Basement Preparations & Notes
             ├─ Internal Notes
             └─ Generate Quote → Quote Preview (PDF) → Signature → Done
```

A 5-step `Setup · Build · Review · Sign · Done` stepper renders across the key
screens so the rep always sees where they are.

## What's covered

- **Lead picker + auto-fill** (BWN-22): 9 fields auto-populated from the lead;
  tenant + pre-1978 warning chip on the picker card.
- **Catalog + Packages** (BWN-21): office-managed Sale Item Master across 8
  categories, plus one-tap bundles (Standard Waterproofing Pkg, Sump Replacement
  Pkg, Battery Backup Pkg).
- **Line items** (BWN-22, BWN-121): inline qty stepper, tap-to-edit row, locked
  descriptions, Additional Work free-text escape hatch (BWN-113).
- **Live totals** (BWN-121): Σ(unitPrice × qty) subtotal + rep-overrideable
  final contract total + override delta for office reporting.
- **Basement Preparations & Notes** (BWN-111): 11 sub-items in 3 groups
  (Customer Responsibilities, BWN Responsibilities, Basement Notes) with
  editable boilerplate and voice dictation per item.
- **Cancellation rule** (BWN-114): state × age computed cancel-by date that
  skips weekends + US federal holidays. MD 65+ → 7 biz days, MD &lt;65 → 5,
  other → 3.
- **Pre-Renovation Lead Form** (BWN-115): auto-included when yearBuilt &lt; 1978,
  with tenant self-cert reveal when occupancy is tenant.
- **Per-page initials** (BWN-118): config-driven; defaults to DE pages 7 & 8.
- **Signature capture** (BWN-23): touch (in-person, 6 guided sign points) or
  DocuSign (async envelope), with timestamp + IP capture per sign.
- **PDF preview**: page-by-page in-app preview for pages 1, 2, 3–4, 5, 6, 7–8,
  9, and per-page-initials zone.
- **Quote Activity** (BWN-107, BWN-112): timeline grouped by day, filterable.
- **Voice dictation**: mic on every editable description field with a
  post-transcription review affordance (yellow highlight + "Review transcription
  · tap text to edit" link).

## Tech

- React 19, Vite 8, Tailwind 3.4
- `lucide-react` for icons
- Single source file: [`src/BwnEstimateMobile.jsx`](src/BwnEstimateMobile.jsx)

## Linked JIRA stories

Visible inside the prototype via the **JIRA story badges** on each section.
Tap any badge to open the Story Drawer with the ticket's title, priority,
phase, status, and note.

Stories referenced: BWN-21, BWN-22, BWN-23, BWN-24, BWN-27 (Phase 3),
BWN-95 (subsumed by BWN-23), BWN-106, BWN-107, BWN-110 (epic),
BWN-111..BWN-121.
