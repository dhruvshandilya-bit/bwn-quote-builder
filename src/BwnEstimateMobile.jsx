import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ArrowLeft, ArrowRight, Search, Filter, ArrowUpDown, Plus, Pencil,
  Trash2, X, Calendar, Camera, Mail, MessageSquare, Clock, FileText,
  Image as ImageIcon, Headphones, Bell, Globe, ChevronDown, ChevronRight,
  Check, AlertCircle, DollarSign, Box, Info, Sparkles, PenTool, Lock,
  Home, Briefcase, Package, ClipboardList, Truck, Receipt, Users,
  Repeat, BookOpen, Building2, MapPin, Phone, MailIcon, User, Shield,
  CheckCircle2, AlertTriangle, ChevronUp, MoreVertical, Send, Tag,
  CircleDot, FileCheck, Banknote, ScrollText, Eye, Wand2, ChevronLeft,
  Layers, Hammer, Wrench, Droplets, Mic,
  ListChecks, Flame, Radiation,
} from "lucide-react";

// ============================================================================
// DESIGN TOKENS — match live Merlin app (sampled from screenshots)
// ============================================================================
const T = {
  // Brand
  purple:        "#5b2d8e",
  purpleAccent:  "#7c3aed",
  purpleDark:    "#4a1d6b",
  purpleSoft:    "#f3e8ff",
  purpleSofter:  "#faf5ff",
  // Surfaces
  bg:            "#f5f5f7",
  surface:       "#ffffff",
  surfaceAlt:    "#fafafa",
  border:        "#e5e7eb",
  borderSoft:    "#f1f1f3",
  // Text
  text:          "#111827",
  textSecondary: "#6b7280",
  textTertiary:  "#9ca3af",
  // Status
  success:       "#16a34a",
  successSoft:   "#dcfce7",
  warning:       "#ea580c",
  warningSoft:   "#fff7ed",
  error:         "#dc2626",
  errorSoft:     "#fee2e2",
  info:          "#2563eb",
  infoSoft:      "#dbeafe",
  // Category accent backgrounds (matching home tile palette)
  tileBlue:      "#e0f2fe",
  tileBlueInk:   "#2563eb",
  tilePurple:    "#ede9fe",
  tilePurpleInk: "#7c3aed",
  tileOrange:    "#ffedd5",
  tileOrangeInk: "#ea580c",
  tileGreen:     "#d1fae5",
  tileGreenInk:  "#059669",
  tilePink:      "#fce7f3",
  tilePinkInk:   "#db2777",
  tileCyan:      "#cffafe",
  tileCyanInk:   "#0891b2",
  tileYellow:    "#fef3c7",
  tileYellowInk: "#b45309",
  tileRed:       "#fee2e2",
  tileRedInk:    "#dc2626",
};

// ============================================================================
// JIRA STORY METADATA — BWN-110 epic child stories (existing + N1–N11)
// ============================================================================
const STORIES = {
  "BWN-21":  { title: "Sale Item Master / Product Catalog", priority: "M", phase: 1, status: "In progress", note: "Office-managed catalog. SKUs, category, locked description, UOM, unitPrice, defaultQty, warrantyType, isFreeText (only true for ADDITIONAL_WORK). Signed quotes stamp the catalog version at sign-time — later edits don't mutate signed history." },
  "BWN-22":  { title: "Mobile Quote Creation (Estimate Builder)", priority: "M", phase: 1, status: "In progress", note: "Tablet-first builder. Auto-fill 9 fields from Lead, Year Built REQUIRED, occupancy captured. Picker → qty editable, UOM + description read-only (except ADDITIONAL_WORK). Subtotal auto-sums unitPrice × qty. Rep override at total-level only. No line-level pricing on customer PDF." },
  "BWN-23":  { title: "Digital Contract with Wet Signature (Touch + DocuSign)", priority: "M", phase: 1, status: "In progress", note: "D11 FINAL — both methods in Phase 1. 6 signature points: Scope p2, Basement Prep p4, Cancellation p5, Payment p6, T&C p8, Lead Form p9. Each timestamped + IP-stamped. Status → Signed only when all required points captured. DE adds per-page initials (BWN-118). Subsumes BWN-95." },
  "BWN-24":  { title: "Customer-Facing PDF Generation (10-page)", priority: "M", phase: 1, status: "To Do", note: "PDFMonkey render mirroring Chrisler.pdf. Page header on every page (logo + customer info). Page footer 'Page X of N'. NO unit/line price column. Conditional pages: Lead Form p9 only if yearBuilt<1978; MD/DE T&C blocks state-conditional. Cross-cutting risk — shared service across 11 client orgs." },
  "BWN-27":  { title: "AI-Assisted Estimate from Site Notes", priority: "C", phase: 3, status: "Backlog", note: "Voice note → AI extracts LF, component counts, location → suggests products from catalog. Draft quote for rep review. Accuracy threshold TBD." },
  "BWN-95":  { title: "Digital contract signing with auto-import (SUBSUMED)", priority: "M", phase: 1, status: "Closed — duplicate of BWN-23", note: "Resolved by D11; close as duplicate of BWN-23." },
  "BWN-106": { title: "Quotes — line-item quotes with auto-totaling", priority: "M", phase: 1, status: "In progress", note: "Generate Quote modal — Valid Until, Deposit, Homeowner 65+, Basement Prep toggle, Lead Form (auto-ON pre-1978), Notice of Cancellation LOCKED ON, T&C LOCKED ON. Taxable REMOVED. Scope-of-Work defaults OFF. Subtotal auto-sums; no customer-visible line pricing." },
  "BWN-107": { title: "Sale page — editable totals, lifecycle, quote import", priority: "M", phase: 2, status: "To Do", note: "Sale lifecycle Working → Net → Paid in Full → Final, each transition timestamped. Sold Price auto-totals, total-level override (Edit Sold Price). Form-of-Payment enum. Late Payment per-contract editable default 2%/mo. $250 service charge editable per-contract. Import Quote pulls items + signatures." },
  "BWN-111": { title: "N1 · Basement Preparations & Notes section", priority: "M", phase: 1, status: "In progress", note: "11 selectable sub-items in 2 groups. Customer Responsibilities (7): Items to Move/Stay (default 'None'), Wall Coverings, Floor Coverings, Electrical Disconnection, Plumbing Disconnection, HVAC/Duct Relocation. Basement Notes (4): Existing Sump Pump Disposition, Drain Tile Connection, Egress Window Access, Other Notes (free-text). Renders PDF p3–4 + signature #2." },
  "BWN-112": { title: "N2 · Free-text Notes block on Quote", priority: "M", phase: 1, status: "In progress", note: "Per-quote text area, separate from CRM activity feed. Auto-saves. 'Include in PDF' default OFF. When ON, prints within Basement Preps & Notes on p3–4. Locks into signed PDF artifact at sign-time. Searchable in office list." },
  "BWN-130": { title: "N9 · Customer Preparation Checklist (digitized Pre-Inspect form)", priority: "M", phase: 1, status: "In progress", note: "Verbatim digitization of the BWN paper Customer Preparation Checklist (Ver. 12/06/23). 16-item work-area grid with Move/Stay/N-A per item — any 'Stay' auto-flags service-fee exposure and surfaces the count on the card + PDF. Walls (No coverings / Flood cut / Full demo) and Floors (Bare / Carpet 5′ / Tile 2′) single-select. Dust, sump-power, fireplace, and radon acknowledgments captured. Sump location multi-select + Specified free-text (mic-enabled). NOTES free-text. Renders PDF page 4a + signature point #3 (renumbers Cancellation→4, Payment→5, T&C→6, Lead Form→7). Separate section, sits below BWN-111." },
  "BWN-113": { title: "N3 · 'Additional Work' SKU type — free-text", priority: "M", phase: 2, status: "In progress", note: "Pre-seeded SaleItem, category=ADDITIONAL_WORK, isFreeText=true. All 4 fields editable on that line (title, description, qty, unitPrice). Multiple lines allowed. Feeds into auto-total. The one escape hatch from the locked-description model." },
  "BWN-114": { title: "N4 · Notice of Cancellation — state × age", priority: "M", phase: 2, status: "Blocked — A3 pending", note: "MD <65 = 5 biz days · MD 65+ = 7 biz days · other = 3 biz days. State parsed from address. Cancel-by date = contract date + N biz days (skip weekends + US federal holidays). Renders p5 (buyer) + p10 (seller). LOCKED ON for BWN. Final language from Steve." },
  "BWN-115": { title: "N5 · Pre-Renovation Lead Form (federal RRP)", priority: "M", phase: 2, status: "To Do", note: "yearBuilt < 1978 → toggle auto-ON, page 9 renders. ≥1978 → optional, p9 omitted (numbering adjusts). Tenant self-cert HIDDEN unless occupancy=tenant. Signature #6 on p9. RRP fields (Pamphlet Given/Signed dates) auto-stamp at sign-time." },
  "BWN-116": { title: "N6 · Terms & Conditions — state-conditional", priority: "M", phase: 2, status: "Partially blocked — A1 pending", note: "Always: 4 warranty blocks, arbitration, $250 service charge (verbatim, editable per-contract), Late Payment terms (editable default 2%/mo). MD: MHIC Guaranty Fund disclosure + §8-405(c) clause INSIDE Arbitration. DE: Consumer Rights Summary + per-page initials (BWN-118). Renders p7–8, signature #5 on p8. Templated text versioned." },
  "BWN-117": { title: "N7 · Payment Schedule — Form-of-Payment enum", priority: "M", phase: 2, status: "In progress", note: "Total inherited. Deposit default $0. Single dropdown: Check / Credit Card / Financed. Financed → deposit auto-$0 (read-only), balance = full contract due on completion, informational financing block prints. Late Payment per-contract editable default 2%/mo. Renders p6, signature #4." },
  "BWN-118": { title: "N8 · Per-page initials for Delaware contracts", priority: "M", phase: 3, status: "Blocked — A1 pending", note: "When state=='DE' → initials zone bottom-right of p7–8. Touch: guided per-page capture after main sig. DocuSign: per-page initial fields on envelope. Config-driven {\"DE\":[7,8]} per state — extensible. Status → Signed only when all initials + sigs captured. Audit log per initial." },
  "BWN-119": { title: "N9 · Multi-state license header on contract page 1", priority: "M", phase: 2, status: "To Do", note: "Per Dhruv override: customer-state-dynamic display (show only the license relevant to customer's state). License master is office-managed: state, licenseNumber, expirationDate, displayLabel, active. Expired auto-hide unless grace flag. Office can add/edit/deactivate without code deploy." },
  "BWN-120": { title: "N10 · Quote validity & expiry (Valid Until + re-issue)", priority: "M", phase: 3, status: "To Do", note: "Valid Until default = creation date + 30 days (configurable per-org). Renders p1 + p6. today > validUntil & unsigned → Expired, cannot be signed until rep re-issues. Re-issue creates new version, preserves history, resets Valid Until. Office manual extend on unsigned (audit logged). Notifications 3 days before + on expiry." },
  "BWN-121": { title: "N11 · Sale Item unit pricing — live total auto-calc", priority: "M", phase: 1, status: "In progress", note: "Live total = Σ(unitPrice × qty). subtotalFromLineItems (computed) + finalContractTotal (rep override, total-level only). Both stored, both locked at sign-time. Override delta captured for office reporting. Additional Work SKUs (BWN-113) accept rep-entered unit price and participate in total. PDF p6 prints only finalContractTotal." },
};

// ============================================================================
// SEED DATA — Chrisler-equivalent example contract for demos
// ============================================================================
const TENANT = {
  brand: { name: "Basement Waterproofing Nationwide", short: "BWN" },
  // License Master (BWN-119) — office-managed, state-keyed.
  // Per Dhruv override (2026-05-13): customer-state-dynamic display (D12 default = all-state, deferred).
  licenses: {
    MD: { state: "MD", label: "MD MHIC",            displayLabel: "MD MHIC",           number: "30160",       expirationDate: "2027-08-31", active: true  },
    DE: { state: "DE", label: "DE Contractor",      displayLabel: "DE Contractor",     number: "2016101433",  expirationDate: "2027-04-15", active: true  },
    VA: { state: "VA", label: "VA Class A",         displayLabel: "VA Class A",        number: "2705-991122", expirationDate: "2026-12-01", active: true  },
    PA: { state: "PA", label: "PA HIC",             displayLabel: "PA HIC",            number: "PA177331",    expirationDate: "2026-09-30", active: false },
  },
};

// ============================================================================
// ORG CONFIG (BWN-110 cross-cutting risk — all behaviors flag-gated)
// "No hardcoded if (org=='BWN') checks. Other clients regress to current
//  behavior by default." Per the epic, these are the flags that need to gate
//  every BWN-specific behavior in the shared estimate/quote service.
// ============================================================================
const DEFAULT_ORG_CONFIG = {
  orgKey:                  "BWN",
  taxableEnabled:          false,        // BWN: false  | others: true
  scopeOfWorkDefault:      false,        // BWN: false  | others: true
  lockedDescriptions:      true,         // BWN: true   | others: false
  uomReadOnlyAtQuote:      true,         // BWN: true   | others: false
  perPageInitialsStates:   { DE: [7, 8] },// extensible per state
  licenseDisplayMode:      "state",      // "state" (per Dhruv) | "all" (Chrisler default per epic D12)
  cancellationLockedOn:    true,
  termsAndConditionsLocked:true,
  validUntilDefaultDays:   30,
  defaultLatePaymentRate:  "2% per month",
  defaultServiceCharge:    250,
};

// ============================================================================
// SALE LIFECYCLE (BWN-107) — Working → Net → Paid in Full → Final
// ============================================================================
const SALE_LIFECYCLE_STATES = [
  { key: "working",     label: "Working",        ink: T.info,    bg: T.infoSoft,    note: "Quote being built / sent" },
  { key: "net",         label: "Net",            ink: T.warning, bg: T.warningSoft, note: "Signed · awaiting balance" },
  { key: "paidInFull",  label: "Paid in Full",   ink: T.success, bg: T.successSoft, note: "Balance collected" },
  { key: "final",       label: "Final",          ink: T.purpleAccent, bg: T.purpleSoft, note: "Closed · archived" },
];

// US federal holidays for cancel-by date calc (BWN-114).
// Limited window — extend as needed.
const FEDERAL_HOLIDAYS = new Set([
  "2026-01-01", "2026-01-19", "2026-02-16", "2026-05-25", "2026-06-19",
  "2026-07-03", "2026-09-07", "2026-10-12", "2026-11-11", "2026-11-26",
  "2026-12-25",
  "2027-01-01", "2027-01-18", "2027-02-15", "2027-05-31", "2027-06-18",
  "2027-07-05", "2027-09-06", "2027-10-11", "2027-11-11", "2027-11-25",
  "2027-12-24",
]);

// CATALOG (BWN-21) — office-managed Sale Item Master.
// version is stamped onto each signed quote at sign-time so retroactive edits
// to the master don't mutate signed history. Items seeded from BWN Pricing
// Guide (2026-02-23 Pricing with warranties and exclusions).
const CATALOG_VERSION = "2026.05.13-r3";
const CATALOG = [
  // ─── Floor System ────────────────────────────────────────────────
  {
    sku: "BWN-FLR-001", category: "FLOOR_SYSTEM", categoryDisplay: "Floor System",
    title: "Interior Below-Floor Drainage System",
    description: "Supply and install new, interior, high performance, anti-clog, below-floor drainage system designed to relieve hydrostatic pressure and channel water to the sump pump. System includes filter fabric and is bedded in clean stone. Lifetime Transferable Warranty against system clogging.",
    uom: "LF", unitPrice: 125, warrantyType: "Lifetime", isFreeText: false, version: CATALOG_VERSION, icon: Droplets, accent: T.tileBlue, accentInk: T.tileBlueInk,
  },
  {
    sku: "BWN-FLR-002", category: "FLOOR_SYSTEM", categoryDisplay: "Floor System",
    title: "Interior Above-Floor Cove Channel System",
    description: "Supply and install new, interior, high performance, anti-clog, above-floor cove channel system. System is installed at the floor-to-wall joint where slab cutting is not feasible. Lifetime Transferable Warranty against system clogging.",
    uom: "LF", unitPrice: 125, warrantyType: "Lifetime", isFreeText: false, version: CATALOG_VERSION, icon: Droplets, accent: T.tileBlue, accentInk: T.tileBlueInk,
  },

  // ─── Sump Pumps ──────────────────────────────────────────────────
  {
    sku: "BWN-SMP-001", category: "SUMP_PUMPS", categoryDisplay: "Sump Pumps",
    title: "Primary Sump Pump · 1/3 hp",
    description: "Supply and install new, cast iron, high capacity, automatically operating primary sump pump. Homeowner responsible for the supply of electric power to the sump pump. Pumps are warranted only by the manufacturer. Includes 5 year manufacturer's warranty.",
    uom: "EA", unitPrice: 1200, warrantyType: "Term", warrantyTermYears: 5, isFreeText: false, version: CATALOG_VERSION, icon: Wrench, accent: T.tilePurple, accentInk: T.tilePurpleInk,
  },
  {
    sku: "BWN-SMP-002", category: "SUMP_PUMPS", categoryDisplay: "Sump Pumps",
    title: "Primary Sump Pump · 1/2 hp",
    description: "Supply and install new, cast iron, high capacity, automatically operating primary sump pump. Homeowner responsible for the supply of electric power to the sump pump. Pumps are warranted only by the manufacturer. Includes 5 year manufacturer's warranty.",
    uom: "EA", unitPrice: 1400, warrantyType: "Term", warrantyTermYears: 5, isFreeText: false, version: CATALOG_VERSION, icon: Wrench, accent: T.tilePurple, accentInk: T.tilePurpleInk,
  },
  {
    sku: "BWN-SMP-003", category: "SUMP_PUMPS", categoryDisplay: "Sump Pumps",
    title: "Two Primary Sump Pumps · 1/3 hp",
    description: "Supply and install two new, cast iron, high capacity, automatically operating primary sump pumps with pump stand. Homeowner responsible for the supply of electric power. Includes 5 year manufacturer's warranty.",
    uom: "EA", unitPrice: 2200, warrantyType: "Term", warrantyTermYears: 5, isFreeText: false, version: CATALOG_VERSION, icon: Wrench, accent: T.tilePurple, accentInk: T.tilePurpleInk,
  },

  // ─── Sump Liners ─────────────────────────────────────────────────
  {
    sku: "BWN-LNR-001", category: "SUMP_LINERS", categoryDisplay: "Sump Liners",
    title: "Sump Liner",
    description: "Supply and install new standard sump liner with stone bed for drainage, includes fitted cover. Homeowner responsible to keep sump liner free and clear of debris. Installation only — see terms and conditions for full details. All work to be performed at or above industry standards.",
    uom: "EA", unitPrice: 1400, warrantyType: "Term", warrantyTermYears: 5, isFreeText: false, version: CATALOG_VERSION, icon: Box, accent: T.tileCyan, accentInk: T.tileCyanInk,
  },
  {
    sku: "BWN-LNR-002", category: "SUMP_LINERS", categoryDisplay: "Sump Liners",
    title: "Standard Sump Liner with Sump Pump",
    description: "Supply and install new 20\" sump liner with stone bed for drainage, includes fitted cover plus cast iron primary sump pump. Pumps warranted by the manufacturer. Includes 5 year manufacturer's warranty.",
    uom: "EA", unitPrice: 2500, warrantyType: "Term", warrantyTermYears: 5, isFreeText: false, version: CATALOG_VERSION, icon: Box, accent: T.tileCyan, accentInk: T.tileCyanInk,
  },

  // ─── Discharge Lines ─────────────────────────────────────────────
  {
    sku: "BWN-DIS-001", category: "DISCHARGE_LINES", categoryDisplay: "Discharge Lines",
    title: "IceGuard™ Exterior Discharge Line",
    description: "Supply and install IceGuard™ exterior discharge line system. Prevents freeze-up of discharge line in winter conditions through a passive overflow design. Lifetime Warranty on freeze-prevention design.",
    uom: "LF", unitPrice: 45, warrantyType: "Lifetime", isFreeText: false, version: CATALOG_VERSION, icon: ArrowRight, accent: T.tileCyan, accentInk: T.tileCyanInk,
  },
  {
    sku: "BWN-DIS-002", category: "DISCHARGE_LINES", categoryDisplay: "Discharge Lines",
    title: "Discharge Splash Block",
    description: "Discharge line to exit basement onto a splash block. Homeowner responsible to keep splash block in place and keep discharge line free and clear of debris. Installation only — see terms and conditions for full details.",
    uom: "EA", unitPrice: 150, warrantyType: "None", isFreeText: false, version: CATALOG_VERSION, icon: ArrowRight, accent: T.tileCyan, accentInk: T.tileCyanInk,
  },

  // ─── Wall System ─────────────────────────────────────────────────
  {
    sku: "BWN-WAL-001", category: "WALLS", categoryDisplay: "Wall System",
    title: "CleanSpace™ Wall Vapor Barrier",
    description: "Supply and install CleanSpace™ 20-mil reinforced polyethylene vapor barrier on basement walls. Anti-microbial protection bonded into film. Lifetime Warranty against tearing and microbial growth under normal conditions.",
    // UOM per client catalog confirmation (2026-05-13): LF. Standalone unit
    // price still TBC from client; placeholder retained for prototype math.
    uom: "LF", unitPrice: 9.5, warrantyType: "Lifetime", isFreeText: false, version: CATALOG_VERSION, icon: Layers, accent: T.tileGreen, accentInk: T.tileGreenInk,
  },
  {
    sku: "BWN-WAL-002", category: "WALLS", categoryDisplay: "Wall System",
    title: "Anti-Microbial Spray Application",
    description: "Spray application for masonry walls where accessible. Installation only — see terms and conditions for full details. All work to be performed at or above industry standards.",
    uom: "LF", unitPrice: 18, warrantyType: "None", isFreeText: false, version: CATALOG_VERSION, icon: Layers, accent: T.tileGreen, accentInk: T.tileGreenInk,
  },

  // ─── Drains ──────────────────────────────────────────────────────
  {
    sku: "BWN-DRN-001", category: "DRAINS", categoryDisplay: "Drains",
    title: "Window Well Drain",
    description: "Install gravity-fed drain at base of window well, tied into the interior drainage system. Includes excavation, stone bed, and 4\" perforated drain pipe.",
    uom: "EA", unitPrice: 425, warrantyType: "Lifetime", isFreeText: false, version: CATALOG_VERSION, icon: Hammer, accent: T.tileYellow, accentInk: T.tileYellowInk,
  },
  {
    sku: "BWN-DRN-002", category: "DRAINS", categoryDisplay: "Drains",
    title: "Channel Grate Drain",
    description: "Supply and install new interior channel grate drain located at basement door. Homeowner maintenance required to keep channel drain free and clear of debris. Homeowner understands any water seepage through basement door — no warranty. Installation only.",
    uom: "EA", unitPrice: 600, warrantyType: "None", isFreeText: false, version: CATALOG_VERSION, icon: Hammer, accent: T.tileYellow, accentInk: T.tileYellowInk,
  },

  // ─── Battery Pumps ───────────────────────────────────────────────
  {
    sku: "BWN-BAT-001", category: "BATTERY_PUMPS", categoryDisplay: "Battery Pumps",
    title: "Battery Pump System",
    description: "Supply and install new battery pump system, includes charger and one battery. Homeowner responsible for the supply of electric power to the battery pump charging system. Pumps are warranted only by the manufacturer. Includes 3 year manufacturer's warranty.",
    uom: "EA", unitPrice: 1850, warrantyType: "Term", warrantyTermYears: 3, isFreeText: false, version: CATALOG_VERSION, icon: Wrench, accent: T.tileOrange, accentInk: T.tileOrangeInk,
  },
  {
    sku: "BWN-BAT-002", category: "BATTERY_PUMPS", categoryDisplay: "Battery Pumps",
    title: "Battery AGM 27",
    description: "Supply and install new battery. Batteries are warranted only by the manufacturer. Includes 3 year manufacturer's warranty.",
    uom: "EA", unitPrice: 750, warrantyType: "Term", warrantyTermYears: 3, isFreeText: false, version: CATALOG_VERSION, icon: Wrench, accent: T.tileOrange, accentInk: T.tileOrangeInk,
  },

  // ─── Additional Work ─────────────────────────────────────────────
  {
    sku: "BWN-ADD-001", category: "ADDITIONAL_WORK", categoryDisplay: "Additional Work",
    title: "Additional Work (Custom)",
    description: "", // free-text — rep types description on-the-fly (BWN-113)
    uom: "EA", unitPrice: 0, isFreeText: true, version: CATALOG_VERSION, icon: Wand2, accent: T.tilePink, accentInk: T.tilePinkInk,
  },
];

// ============================================================================
// PACKAGES (BWN-21) — pre-built bundles of catalog SKUs.
// Per client catalog (2026-05-13): only the Standard Waterproofing Pkg exists.
// One item — the Interior Below-Floor Drainage System — drives the price at
// $125 / LF (the rep enters the LF). Every other item in the package is
// "Included at $0" (bundled: true → customPrice forced to 0 when added).
// ============================================================================
const PACKAGES = [
  {
    key: "PKG-STD-WP",
    title: "Standard Waterproofing Pkg",
    description: "Full-perimeter interior drainage + sump system + vapor barrier — bundled at $0; only the drainage system's LF drives the contract price.",
    icon: Droplets,
    accent: T.tileBlue,
    accentInk: T.tileBlueInk,
    items: [
      // Anchor: priced at $125/LF; rep enters actual LF after the package is added.
      { sku: "BWN-FLR-001", qty: 1, bundled: false },
      // Satellites: included at $0; qty cosmetic (rep can leave at 1 or adjust).
      { sku: "BWN-SMP-001", qty: 1, bundled: true },
      { sku: "BWN-LNR-001", qty: 1, bundled: true },
      { sku: "BWN-DIS-002", qty: 1, bundled: true },
      { sku: "BWN-WAL-002", qty: 1, bundled: true },
      { sku: "BWN-WAL-001", qty: 1, bundled: true },
      { sku: "BWN-DRN-002", qty: 1, bundled: true },
    ],
  },
];

// BASEMENT_PREP_ITEMS (BWN-111) — merged from current prototype + BWN-110 spec list.
// 3 groups: Customer Responsibilities, BWN Responsibilities, Basement Notes.
// Spec says 2 groups but the BWN-Responsibilities items (Logistics, Dust Protection)
// aren't customer-or-notes — kept as a 3rd group per Dhruv "keep both" decision.
const BASEMENT_PREP_ITEMS = [
  // Customer Responsibilities (merged, 11)
  { key: "accessToWorkArea",   label: "Access to Work Area",         group: "Customer Responsibilities", boilerplate: "Customer to provide clear access to the work area for the duration of the project, including an unobstructed path from the closest exterior door to the basement.", editable: true },
  { key: "itemsToMove",        label: "Items to Move",               group: "Customer Responsibilities", boilerplate: "None", isFreeText: true },
  { key: "itemsToStay",        label: "Items to Stay",               group: "Customer Responsibilities", boilerplate: "None", isFreeText: true },
  { key: "wallCoverings",      label: "Wall Coverings / Paneling Removal", group: "Customer Responsibilities", boilerplate: "Customer responsible for removal and replacement of any wall coverings (panel, drywall, insulation) within 4 ft of work area.", editable: true },
  { key: "floorCoverings",     label: "Floor Coverings Removal",     group: "Customer Responsibilities", boilerplate: "Customer responsible for removal and replacement of floor coverings (carpet, tile, laminate) within work area.", editable: true },
  { key: "electricalDisconnect", label: "Electrical Disconnection",  group: "Customer Responsibilities", boilerplate: "Customer responsible for disconnecting and protecting any electrical outlets, fixtures, or wiring within 4 ft of the work area before crew arrival.", editable: true },
  { key: "plumbingDisconnect", label: "Plumbing Disconnection",      group: "Customer Responsibilities", boilerplate: "Customer responsible for shutoff and disconnection of any plumbing lines (washer, slop sink, water heater) within work area.", editable: true },
  { key: "hvacRelocation",     label: "HVAC / Duct Relocation",      group: "Customer Responsibilities", boilerplate: "Any HVAC duct or component requiring relocation must be handled by a licensed HVAC contractor at customer expense prior to start of work.", editable: true },
  { key: "oilTankLines",       label: "Oil Tank Lines",              group: "Customer Responsibilities", boilerplate: "If oil tank lines run through work area, customer is responsible for arranging relocation with their oil service company prior to work start.", editable: true },
  { key: "fireplacesChimneys", label: "Fireplaces & Chimneys",       group: "Customer Responsibilities", boilerplate: "Not applicable to this project.", editable: true },
  { key: "radonSystems",       label: "Radon Systems",               group: "Customer Responsibilities", boilerplate: "Not applicable to this project.", editable: true },

  // BWN Responsibilities (2)
  { key: "logistics",          label: "Logistics",                   group: "BWN Responsibilities",      boilerplate: "BWN crew arrives between 7–8 AM. Job-site coordination, scheduling, and daily clean-up will be managed by the site foreman. Customer will be notified by 5 PM of next-day arrival time.", editable: true },
  { key: "dustProtection",     label: "Dust Protection",             group: "BWN Responsibilities",      boilerplate: "BWN will install plastic dust barriers at work area boundaries. Customer should clear personal items 4 ft from work area.", editable: true },

  // Basement Notes (4 from spec + existing Sump Pump Location)
  { key: "existingSumpDisposition", label: "Existing Sump Pump Disposition", group: "Basement Notes",   boilerplate: "Existing sump pump and basin will be removed and disposed of by BWN crew unless customer elects to retain.", editable: true },
  { key: "drainTileConnection", label: "Drain Tile Connection",      group: "Basement Notes",            boilerplate: "New interior drain tile to tie into existing perimeter foundation drain where present and serviceable.", editable: true },
  { key: "egressAccess",       label: "Egress Window / Doorway Access", group: "Basement Notes",         boilerplate: "Existing egress window well will remain. BWN will route discharge to avoid blocking egress access.", editable: true },
  { key: "sumpPumpLocation",   label: "Sump Pump Specified Location", group: "Basement Notes",           isFreeText: true, boilerplate: "Northeast corner of basement, beneath existing utility shelf." },
  { key: "otherNotes",         label: "Other Notes",                 group: "Basement Notes",            isFreeText: true, boilerplate: "" },
];

// ============================================================================
// PREP_CHECKLIST (BWN-130) — verbatim digitization of the BWN paper
// "Customer Preparation Checklist" (Ver. 12/06/23). Separate from BWN-111.
// 16 work-area items (Move/Stay/N-A), Walls + Floors, Dust, Sump, Other Items.
// Kept in paper column order: left column (8) then right column (8).
// ============================================================================
const PREP_CHECKLIST_ITEMS = [
  // Left column on paper
  { key: "washerDryer",    label: "Washing machine / dryer / set tub" },
  { key: "hotWaterTank",   label: "Hot water tank" },
  { key: "furnaceBoiler",  label: "Furnace / boiler / AC unit" },
  { key: "wellTankPump",   label: "Well tank / well pump" },
  { key: "waterTreatment", label: "Water treatment tanks" },
  { key: "fridgeFreezer",  label: "Refrigerator / freezer" },
  { key: "stove",          label: "Stove — wood / gas" },
  { key: "oilTankLines",   label: "Oil tank / oil lines above – below" },
  // Right column on paper
  { key: "toiletVanity",   label: "Toilet / vanity / sink" },
  { key: "showerTub",      label: "Shower stall / tub" },
  { key: "shelvesCabinets",label: "Shelves / cabinets" },
  { key: "benches",        label: "Benches — work-seating" },
  { key: "stairsLandings", label: "Stairs / landings" },
  { key: "raisedFloorsBar",label: "Raised floors / bar" },
  { key: "baseboardHeat",  label: "Baseboard heat — electric / water" },
  { key: "radiators",      label: "Radiators / space heater" },
];

const PREP_CHECKLIST_COPY = {
  version: "Ver. 12/06/23",
  itemsIntro1: "All customer items listed below are to be moved 5′ from the contracted area prior to the arrival of the BWN crew.",
  itemsIntro2: "If customer requests any item to stay in place, later access to these areas would be required and a service fee applicable for BWN to return and make necessary repairs.",
  wallsFloorsHeading: "BWN recommends walls and floors be made bare and accessible for the waterproofing installation.",
  walls: [
    { key: "noCoverings", label: "No wall coverings", desc: "Basement walls are bare and accessible in the contracted area." },
    { key: "floodCut",    label: "Flood cut",         desc: "Lower wall coverings and framing baseplate to be removed to provide access for waterproofing installation." },
    { key: "fullDemo",    label: "Full demo",         desc: "All wall coverings to be removed to provide access for vapor barrier installation." },
  ],
  wallStayNote: "Wall coverings that stay in place during waterproofing installation: customer understands later access to these areas would be required and a service fee applicable for BWN to return and make necessary repairs.",
  floors: [
    { key: "noCoverings", label: "No floor coverings",            desc: "Basement floors are bare and accessible in the contracted area." },
    { key: "carpet",      label: "Carpet",                        desc: "To be rolled back from contracted area a minimum of 5′ and covered with plastic." },
    { key: "tile",        label: "Tile and other floor coverings",desc: "To be removed a minimum of 2′ from wall in contracted area." },
  ],
  floorNote: "Replacement and reinstallation of all disturbed floor coverings is customer responsibility.",
  dustHeading: "Dust: customer should be prepared for a substantial amount of dust.",
  dustCustomer: [
    "All customer items should be moved to the center of the basement and covered with plastic.",
    "All rooms adjacent to contracted area should be protected against dust using plastic including doorways, vents, and open stairways.",
    "Furnace and A/C should be shut down during the jackhammering process.",
  ],
  dustBwn: [
    "Air Scrubber will be used to minimize dust in contracted area.",
    "BWN will cover floors with protective materials.",
    "Professional and responsible work practices in effect at all times.",
  ],
  sumpHeading: "Sump pump: sump pump is to be connected to a working electric outlet at all times.",
  sumpBullets: [
    "The supply of electric power to the sump pump is customer responsibility.",
    "New PVC discharge lines are to exit the wall and extend above grade up to 5′ with 4″ solid pipe.",
    "Customer understands BWN does not recommend connecting to existing buried drainage lines.",
    "In the event customer requests a new discharge line to be connected to an existing buried line, keeping the existing buried line free and clear of debris to protect sump pump operations is customer responsibility.",
  ],
  sumpLocations: [
    { key: "frontRight", label: "Front right" },
    { key: "frontLeft",  label: "Front left" },
    { key: "rearRight",  label: "Rear right" },
    { key: "rearLeft",   label: "Rear left" },
    { key: "existing",   label: "Existing location" },
    { key: "specified",  label: "Specified location" },
    { key: "leaveAsIs",  label: "Leave as-is" },
  ],
  fireplaces: "Fireplaces and chimneys: any water seepage in the firebox, hearth, mantle, cleanout box, and flu liner areas are excluded from BWN's scope of work. BWN will install the below floor drainage system up to each side of the fireplace.",
  radon: "Radon systems: any testing or adjustments to existing radon systems following the waterproofing installation is customer responsibility.",
  acknowledgment: "I acknowledge that I have read and understand all of the necessary preparations for my waterproofing installation.",
};

// Default checklist state seeded onto a new estimate (3 items pre-set to "stay"
// to demonstrate the service-fee flag; everything else defaults to "move").
const makeDefaultPrepChecklist = () => ({
  contractDate: "2026-06-26",
  items: Object.fromEntries(
    PREP_CHECKLIST_ITEMS.map((it) => [
      it.key,
      ["furnaceBoiler", "shelvesCabinets", "stairsLandings"].includes(it.key) ? "stay" : "move",
    ])
  ),
  itemsNotes: "",
  walls: "noCoverings",
  floors: "noCoverings",
  sumpLocations: ["frontLeft"],
  sumpSpecified: "",
  acks: { dust: true, sumpPower: true, wallStayFee: true, floorReplace: true, fireplaces: false, radon: false },
});

const LEAD_QUEUE = [
  {
    id: "LEAD-2026-0411",
    name: "John & Sarah Chrisler",
    contact: "John Chrisler",
    address: "1234 Maple Lane",
    city: "Baltimore", state: "MD", zip: "21218",
    phone: "(410) 555-0142",
    email: "jchrisler@email.com",
    yearBuilt: 1968, // <1978 → RRP form triggers
    is65OrOlder: true,
    occupancy: "owner",
    leadSource: "Google Ads",
    inspectedBy: "Mike Davis",
    inspectionDate: "2026-05-08",
  },
  {
    id: "LEAD-2026-0418",
    name: "Marcus & Elena Patel",
    contact: "Elena Patel",
    address: "78 Brandywine Court",
    city: "Wilmington", state: "DE", zip: "19803",
    phone: "(302) 555-0188",
    email: "epatel@email.com",
    yearBuilt: 1992, // ≥1978 → RRP form optional
    is65OrOlder: false,
    occupancy: "owner",
    leadSource: "Referral — Cleary Family",
    inspectedBy: "Tony Romano",
    inspectionDate: "2026-05-10",
  },
  {
    id: "LEAD-2026-0422",
    name: "Diane Whitford",
    contact: "Diane Whitford",
    address: "421 Old Frederick Rd",
    city: "Ellicott City", state: "MD", zip: "21043",
    phone: "(443) 555-0167",
    email: "dwhitford@email.com",
    yearBuilt: 1958,
    is65OrOlder: false,
    occupancy: "tenant",
    leadSource: "Facebook Ad",
    inspectedBy: "Mike Davis",
    inspectionDate: "2026-05-11",
  },
];

// Existing quotes on list screen
const QUOTE_LIST = [
  { id: "BWN0000011", customerName: "John & Sarah Chrisler",   address: "1234 Maple Lane, Baltimore, MD",        contact: "John Chrisler",  phone: "(410) 555-0142", status: "DRAFT",     items: 3, total: 14895, state: "MD", date: "2026-05-12", createdBy: "Mike R." },
  { id: "BWN0000010", customerName: "Marcus & Elena Patel",    address: "78 Brandywine Ct, Wilmington, DE",      contact: "Elena Patel",    phone: "(302) 555-0188", status: "SENT",      items: 4, total: 21470, state: "DE", date: "2026-05-10", createdBy: "Tony Romano" },
  { id: "BWN0000009", customerName: "Diane Whitford",          address: "421 Old Frederick Rd, Ellicott City, MD", contact: "Diane Whitford", phone: "(443) 555-0167", status: "SIGNED",    items: 5, total: 28250, state: "MD", date: "2026-05-09", createdBy: "Mike Davis" },
  { id: "BWN0000008", customerName: "Robert & Linda Kim",      address: "92 Cathedral St, Annapolis, MD",        contact: "Robert Kim",     phone: "(410) 555-0303", status: "DRAFT",     items: 2, total:  6890, state: "MD", date: "2026-05-07", createdBy: "Mike R." },
  { id: "BWN0000007", customerName: "Acme Property LLC",       address: "510 N Charles St, Baltimore, MD",       contact: "Karen Singh",    phone: "(410) 555-0911", status: "CANCELLED", items: 1, total: 12000, state: "MD", date: "2026-05-05", createdBy: "Mike R." },
  { id: "BWN0000006", customerName: "Stephen Holloway",        address: "1428 Sycamore Ave, Towson, MD",         contact: "Stephen Holloway", phone: "(410) 555-0427", status: "CANCELLED", items: 0, total: 0,    state: "MD", date: "2026-05-04", createdBy: "Tony Romano" },
];

// ============================================================================
// HELPERS
// ============================================================================
const fmt$ = (n) => "$" + (n ?? 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const fmt$0 = (n) => "$" + (n ?? 0).toLocaleString("en-US", { maximumFractionDigits: 0 });

// Add N business days, skipping weekends AND US federal holidays (BWN-114). ISO out.
const isoFromDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addBizDays = (startISO, n) => {
  const d = new Date(startISO + "T00:00:00");
  let added = 0;
  while (added < n) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow === 0 || dow === 6) continue;
    if (FEDERAL_HOLIDAYS.has(isoFromDate(d))) continue;
    added++;
  }
  return isoFromDate(d);
};
// Today's ISO — used by expiry checks (BWN-120).
const todayISO = () => isoFromDate(new Date());
const fmtDateLong = (iso) => {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
};
const fmtDateShort = (iso) => {
  const d = new Date(iso + "T00:00:00");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${d.getFullYear()}`;
};

// Cancellation rule lookup
const cancellationRule = ({ state, is65OrOlder }) => {
  if (state === "MD" && is65OrOlder) return { variant: "B", days: 7, label: "Variant B — MD Homeowner 65+", color: T.warning };
  if (state === "MD") return { variant: "A", days: 5, label: "Variant A — MD Standard", color: T.info };
  return { variant: "C", days: 3, label: `Variant C — ${state} Standard`, color: T.textSecondary };
};

// ============================================================================
// UI ATOMS
// ============================================================================
const Pill = ({ children, bg, ink, className = "" }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${className}`}
    style={{ background: bg, color: ink }}
  >
    {children}
  </span>
);

const StatusBadge = ({ status }) => {
  const map = {
    DRAFT:     { bg: T.infoSoft,    ink: T.info,           label: "Draft" },
    SENT:      { bg: T.purpleSoft,  ink: T.purpleAccent,   label: "Sent" },
    SIGNED:    { bg: T.successSoft, ink: T.success,        label: "Signed" },
    CANCELLED: { bg: "#f3f4f6",     ink: T.textSecondary,  label: "Cancelled" },
    EXPIRED:   { bg: T.warningSoft, ink: T.warning,        label: "Expired" },
  };
  const c = map[status] || map.DRAFT;
  return (
    <span
      className="inline-flex items-center gap-1.5 pl-1.5 pr-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{ background: c.bg, color: c.ink }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.ink }} />
      {c.label}
    </span>
  );
};

const StoryBadge = ({ ids, onOpen }) => {
  if (!ids || !ids.length) return null;
  return (
    <button
      type="button"
      onClick={() => onOpen(ids)}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all active:scale-95"
      style={{
        background: T.purpleSoft,
        color: T.purpleAccent,
        border: `1px dashed ${T.purpleAccent}55`,
      }}
    >
      <Sparkles size={10} strokeWidth={2.5} />
      <span>{ids.length === 1 ? ids[0].replace("BWN-", "") : `${ids.length} stories`}</span>
    </button>
  );
};

const IconButton = ({ icon: Icon, onClick, label, className = "" }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className={`inline-flex items-center justify-center w-10 h-10 rounded-lg transition active:scale-95 ${className}`}
    style={{ background: T.surface, border: `1px solid ${T.border}` }}
  >
    <Icon size={18} color={T.text} />
  </button>
);

const PrimaryButton = ({ children, onClick, disabled, className = "", icon: Icon, size = "md" }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition active:scale-95 disabled:opacity-50 disabled:active:scale-100 ${
      size === "sm" ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
    } ${className}`}
    style={{ background: T.purple, color: "#fff" }}
  >
    {Icon && <Icon size={size === "sm" ? 14 : 16} />}
    {children}
  </button>
);

const SecondaryButton = ({ children, onClick, className = "", icon: Icon, size = "md" }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition active:scale-95 ${
      size === "sm" ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
    } ${className}`}
    style={{ background: T.surface, color: T.text, border: `1px solid ${T.border}` }}
  >
    {Icon && <Icon size={size === "sm" ? 14 : 16} />}
    {children}
  </button>
);

const FormField = ({ label, required, hint, children, badge }) => (
  <div className="mb-4">
    <div className="flex items-center justify-between mb-1.5">
      <label className="text-sm font-semibold" style={{ color: T.text }}>
        {label}
        {required && <span style={{ color: T.purpleAccent }}>*</span>}
      </label>
      {badge}
    </div>
    {children}
    {hint && <p className="mt-1 text-[11px]" style={{ color: T.textSecondary }}>{hint}</p>}
  </div>
);

const TextInput = ({ value, onChange, placeholder, readOnly, prefix, suffix, type = "text", style = {} }) => (
  <div
    className="flex items-center rounded-lg overflow-hidden"
    style={{
      background: readOnly ? T.surfaceAlt : T.surface,
      border: `1px solid ${T.border}`,
      ...style,
    }}
  >
    {prefix && <div className="pl-3 pr-1 text-sm" style={{ color: T.textSecondary }}>{prefix}</div>}
    <input
      type={type}
      value={value || ""}
      onChange={(e) => onChange && onChange(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      className="flex-1 px-3 py-3 bg-transparent outline-none text-sm"
      style={{ color: readOnly ? T.textSecondary : T.text }}
    />
    {suffix && <div className="pr-3 pl-1 text-xs" style={{ color: T.textSecondary }}>{suffix}</div>}
  </div>
);

const SelectField = ({ value, placeholder, onClick, locked }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={locked}
    className="w-full flex items-center justify-between rounded-lg px-3 py-3 text-left transition active:scale-[0.99]"
    style={{
      background: locked ? T.surfaceAlt : T.surface,
      border: `1px solid ${T.border}`,
    }}
  >
    <span className="text-sm" style={{ color: value ? T.text : T.textTertiary }}>{value || placeholder}</span>
    {locked ? <Lock size={14} color={T.textTertiary} /> : <ChevronDown size={16} color={T.textSecondary} />}
  </button>
);

// VoiceMicButton — voice-input affordance shown next to any editable description.
// Prototype: shows a brief "listening" pulse then calls onTranscribe with a
// representative transcription so demos can show the resulting text in-context.
const SAMPLE_TRANSCRIPTIONS = {
  basementPrep:  "Two-car garage tools and tubs on the south wall need to be moved before crew arrives.",
  itemsToMove:   "Two storage shelves, washer, and a deep-freeze along the south wall.",
  itemsToStay:   "HVAC unit, water heater, electrical panel.",
  sumpLocation:  "Northeast corner, beneath utility shelf near electrical panel.",
  otherNotes:    "Customer noted minor seepage along front wall after heavy rain in March.",
  customDesc:    "Reroute existing 3-inch ABS drain line around new sump basin, approximately 12 LF.",
  internalNotes: "Spoke with John — he prefers crew arrival between 8 and 9 AM. Daughter at home weekdays.",
  generic:       "Voice note transcribed.",
};

// InitialsAvatar — derives initials from a name and renders a colored chip.
// Color is deterministic so the same customer always gets the same chip color.
const AVATAR_COLORS = [
  { bg: T.tileBlue,   ink: T.tileBlueInk   },
  { bg: T.tilePurple, ink: T.tilePurpleInk },
  { bg: T.tileOrange, ink: T.tileOrangeInk },
  { bg: T.tileGreen,  ink: T.tileGreenInk  },
  { bg: T.tilePink,   ink: T.tilePinkInk   },
  { bg: T.tileCyan,   ink: T.tileCyanInk   },
  { bg: T.tileYellow, ink: T.tileYellowInk },
];
const InitialsAvatar = ({ name, size = 36 }) => {
  const initials = (name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) hash = (hash * 31 + (name.charCodeAt(i) || 0)) % 1000;
  const c = AVATAR_COLORS[hash % AVATAR_COLORS.length];
  const fontSize = size <= 28 ? 10 : size <= 36 ? 12 : 14;
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold flex-shrink-0"
      style={{ width: size, height: size, background: c.bg, color: c.ink, fontSize }}
    >
      {initials}
    </div>
  );
};

// CollapsibleCard — header (always visible) + optional summary line + expandable body.
const CollapsibleCard = ({ title, summary, defaultOpen = false, right, children, className = "" }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className={"overflow-hidden " + className}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 active:scale-[0.99]"
      >
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold" style={{ color: T.text }}>{title}</h3>
            {right}
          </div>
          {!open && summary && (
            <p className="text-[11px] mt-0.5 truncate" style={{ color: T.textSecondary }}>{summary}</p>
          )}
        </div>
        {open ? <ChevronUp size={16} color={T.textSecondary} /> : <ChevronDown size={16} color={T.textSecondary} />}
      </button>
      {open && (
        <div className="px-4 pb-4" style={{ borderTop: `1px solid ${T.borderSoft}` }}>
          {children}
        </div>
      )}
    </Card>
  );
};

const VoiceMicButton = ({ onTranscribe, sample = "generic", size = "sm" }) => {
  const [listening, setListening] = useState(false);
  const sz = size === "sm" ? 26 : 32;
  const icon = size === "sm" ? 13 : 15;
  const start = () => {
    if (listening) return;
    setListening(true);
    setTimeout(() => {
      setListening(false);
      onTranscribe && onTranscribe(SAMPLE_TRANSCRIPTIONS[sample] || SAMPLE_TRANSCRIPTIONS.generic);
    }, 1300);
  };
  return (
    <button
      type="button"
      onClick={start}
      title={listening ? "Listening…" : "Voice input"}
      className="inline-flex items-center justify-center rounded-full flex-shrink-0 active:scale-95 transition"
      style={{
        width: sz, height: sz,
        background: listening ? T.error : T.purpleSoft,
        color: listening ? "#fff" : T.purpleAccent,
        boxShadow: listening ? `0 0 0 4px ${T.error}33` : "none",
      }}
    >
      {listening ? <span className="text-[9px] font-bold">REC</span> : <Mic size={icon} />}
    </button>
  );
};

const Toggle = ({ on, onChange, disabled }) => (
  <button
    type="button"
    onClick={() => !disabled && onChange && onChange(!on)}
    className="relative w-11 h-6 rounded-full transition disabled:opacity-50"
    style={{ background: on ? T.purple : "#d1d5db" }}
    disabled={disabled}
  >
    <span
      className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
      style={{ transform: on ? "translateX(20px)" : "translateX(0)" }}
    />
  </button>
);

const Card = ({ children, className = "", style = {}, onClick, id }) => (
  <div
    id={id}
    onClick={onClick}
    className={`rounded-xl ${onClick ? "active:scale-[0.99] transition" : ""} ${className}`}
    style={{ background: T.surface, border: `1px solid ${T.border}`, ...style }}
  >
    {children}
  </div>
);

const SectionLabel = ({ children, right }) => (
  <div className="flex items-center justify-between mb-2">
    <h3 className="text-xs font-bold tracking-wider uppercase" style={{ color: T.textSecondary }}>{children}</h3>
    {right}
  </div>
);

// ============================================================================
// PHONE FRAME — wraps the whole prototype
// ============================================================================
const StatusBarMock = () => (
  <div className="relative h-9 flex items-center justify-between px-5 text-[13px] font-semibold" style={{ background: T.bg, color: T.text }}>
    <span>6:51</span>
    <div className="flex items-center gap-1.5">
      <span className="text-[10px]">●●●●●</span>
      <span className="text-[10px]">●●●</span>
      <Box size={11} style={{ transform: "rotate(90deg)" }} />
    </div>
  </div>
);

const PhoneFrame = ({ children, onOpenDevtools }) => (
  <div className="flex items-center justify-center min-h-screen p-3 md:p-8" style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)" }}>
    <div className="relative" style={{ width: 390, maxWidth: "100%" }}>
      <div
        className="relative overflow-hidden shadow-2xl"
        style={{
          background: T.bg,
          borderRadius: 36,
          height: 844,
          maxHeight: "calc(100vh - 64px)",
          border: `10px solid #111`,
          boxShadow: "0 50px 100px -20px rgba(0,0,0,0.5), 0 30px 60px -30px rgba(0,0,0,0.6), inset 0 0 0 1px #333",
        }}
      >
        <StatusBarMock />
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 left-0 w-1 h-12 bg-black rounded-r" />
        <div className="absolute inset-x-0 top-9 bottom-0 overflow-hidden">{children}</div>
        {/* Home indicator */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 rounded-full" style={{ background: "#111", opacity: 0.6 }} />
      </div>
      {/* Devtools button */}
      <button
        type="button"
        onClick={onOpenDevtools}
        className="absolute -right-2 top-20 md:-right-14 md:top-32 px-3 py-2 rounded-l-lg md:rounded-lg text-xs font-bold transition active:scale-95 shadow-lg"
        style={{ background: T.purpleAccent, color: "#fff", writingMode: "vertical-rl" }}
      >
        ⌘ SCENES
      </button>
    </div>
  </div>
);

const AppHeader = ({ title, onBack, right, subtitle }) => (
  <div className="px-4 pt-3 pb-2 flex items-center gap-3" style={{ background: T.bg }}>
    {onBack ? (
      <button onClick={onBack} className="p-1 -ml-1 active:scale-95">
        <ArrowLeft size={22} color={T.text} />
      </button>
    ) : (
      <div className="w-6" />
    )}
    <div className="flex-1">
      <h1 className="text-lg font-bold leading-tight" style={{ color: T.text }}>{title}</h1>
      {subtitle && <p className="text-xs" style={{ color: T.textSecondary }}>{subtitle}</p>}
    </div>
    {right}
  </div>
);

// FlowStepper — compact horizontal indicator showing where the rep is in the
// quote-creation journey. Same component placed on Detail / Preview / Signature
// / Ready so users see the whole flow at a glance.
const FLOW_STEPS = [
  { key: "setup",    label: "Setup" },
  { key: "build",    label: "Build" },
  { key: "review",   label: "Review" },
  { key: "sign",     label: "Sign" },
  { key: "done",     label: "Done" },
];
const FlowStepper = ({ activeKey }) => {
  const activeIdx = FLOW_STEPS.findIndex((s) => s.key === activeKey);
  return (
    <div className="px-4 py-2 flex items-center gap-1.5" style={{ background: T.bg }}>
      {FLOW_STEPS.map((s, i) => {
        const done = i < activeIdx;
        const cur = i === activeIdx;
        return (
          <React.Fragment key={s.key}>
            <div className="flex items-center gap-1.5">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                style={{
                  background: done ? T.success : cur ? T.purple : T.surface,
                  color: done || cur ? "#fff" : T.textSecondary,
                  border: `1px solid ${done ? T.success : cur ? T.purple : T.border}`,
                }}
              >
                {done ? <Check size={11} /> : i + 1}
              </div>
              <span
                className="text-[10px] font-semibold"
                style={{ color: cur ? T.purpleAccent : done ? T.text : T.textTertiary }}
              >
                {s.label}
              </span>
            </div>
            {i < FLOW_STEPS.length - 1 && (
              <div className="flex-1 h-px" style={{ background: done ? T.success : T.border }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ============================================================================
// 1. HOME SCREEN — mini action grid (the entry point the user already has)
// ============================================================================
const HOME_ACTIONS = [
  { key: "timesheet",     label: "Time Sheet",      icon: Calendar,     bg: T.tileBlue,   ink: T.tileBlueInk },
  { key: "po",            label: "Purchase Orders", icon: Package,      bg: T.tilePurple, ink: T.tilePurpleInk },
  { key: "work",          label: "Work Orders",     icon: Briefcase,    bg: T.tileOrange, ink: T.tileOrangeInk },
  { key: "stock",         label: "Stock Take",      icon: ClipboardList,bg: T.tileGreen,  ink: T.tileGreenInk },
  { key: "transfer",      label: "Bin To Bin",      icon: Repeat,       bg: T.tilePink,   ink: T.tilePinkInk },
  { key: "receipts",      label: "Receipts",        icon: Receipt,      bg: T.tileCyan,   ink: T.tileCyanInk },
  { key: "delivery",      label: "Delivery",        icon: Truck,        bg: T.tileYellow, ink: T.tileYellowInk },
  { key: "quote",         label: "Quote",           icon: FileText,     bg: T.tilePurple, ink: T.tilePurpleInk, primary: true },
  { key: "contacts",      label: "Contact Book",    icon: BookOpen,     bg: T.tileRed,    ink: T.tileRedInk },
];

const HomeScreen = ({ onGoQuote }) => (
  <div className="flex flex-col h-full overflow-y-auto pb-12">
    <div className="px-4 pt-3 pb-3 flex items-center justify-between" style={{ background: T.bg }}>
      <div className="flex items-center gap-2.5">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
          style={{ background: T.purpleSoft, color: T.purpleAccent }}
        >
          MR
        </div>
        <h1 className="text-lg font-bold" style={{ color: T.text }}>Hi, Mike R.</h1>
      </div>
      <div className="flex items-center gap-3">
        <Globe size={20} color={T.textSecondary} />
        <Headphones size={20} color={T.textSecondary} />
        <Bell size={20} color={T.textSecondary} />
      </div>
    </div>

    <div className="px-4 mt-2">
      <Card className="px-3 py-2.5 flex items-center gap-3" style={{ background: T.surfaceAlt }}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#e5e7eb" }}>
          <Clock size={16} color={T.textSecondary} />
        </div>
        <span className="flex-1 text-sm" style={{ color: T.text }}>You haven't checked in yet</span>
        <PrimaryButton size="sm">Check In</PrimaryButton>
      </Card>
    </div>

    <div className="px-4 mt-3">
      <Card className="p-3 flex items-center gap-3">
        <div className="w-12 h-12 rounded-md flex flex-col items-center justify-center" style={{ background: T.info }}>
          <span className="text-[8px] font-bold text-white tracking-wider">MAY</span>
          <span className="text-base font-bold text-white -mt-0.5">12</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-bold" style={{ color: T.text }}>Calendar</h2>
            <Pill bg={T.infoSoft} ink={T.info}>Tuesday</Pill>
          </div>
          <p className="text-xs" style={{ color: T.textSecondary }}>View your schedule and events</p>
        </div>
        <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: T.infoSoft }}>
          <ArrowRight size={16} color={T.info} />
        </div>
      </Card>
    </div>

    <div className="px-4 mt-5">
      <div className="flex items-center gap-2 mb-2.5">
        <div className="grid grid-cols-2 gap-0.5">
          <div className="w-1.5 h-1.5 rounded-sm" style={{ background: T.text }} />
          <div className="w-1.5 h-1.5 rounded-sm" style={{ background: T.text }} />
          <div className="w-1.5 h-1.5 rounded-sm" style={{ background: T.text }} />
          <div className="w-1.5 h-1.5 rounded-sm" style={{ background: T.text }} />
        </div>
        <span className="text-[11px] font-bold tracking-widest" style={{ color: T.textSecondary }}>ACTIONS</span>
      </div>
      <Card className="p-3">
        <div className="grid grid-cols-3 gap-3">
          {HOME_ACTIONS.map((a) => (
            <button
              key={a.key}
              onClick={() => a.key === "quote" && onGoQuote()}
              className={`relative flex flex-col items-center gap-2 p-2 transition active:scale-95 ${a.primary ? "ring-2 ring-offset-2" : ""}`}
              style={a.primary ? { borderRadius: 12, boxShadow: `0 0 0 2px ${T.purpleAccent}` } : {}}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: a.bg }}
              >
                <a.icon size={26} color={a.ink} strokeWidth={2} />
              </div>
              <span className="text-[11px] text-center leading-tight font-medium" style={{ color: T.text }}>
                {a.label}
              </span>
            </button>
          ))}
        </div>
      </Card>
    </div>

    <div className="px-4 mt-4">
      <p className="text-[11px] text-center" style={{ color: T.textTertiary }}>
        Tap <span className="font-bold" style={{ color: T.purpleAccent }}>Quote</span> to start a new estimate →
      </p>
    </div>
  </div>
);

// ============================================================================
// 2. QUOTE LIST SCREEN (BWN-22)
// ============================================================================
const SORT_OPTIONS = [
  { key: "dateDesc", label: "Quote Date · newest first" },
  { key: "dateAsc",  label: "Quote Date · oldest first" },
  { key: "nameAsc",  label: "Customer Name · A → Z" },
  { key: "nameDesc", label: "Customer Name · Z → A" },
];

const QuoteListScreen = ({ onBack, onOpenCreate, onOpenFilter, onOpenQuote, onOpenStory, filterState }) => {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("dateDesc");
  const [showSort, setShowSort] = useState(false);

  // Normalize digits-only search so "(410) 555-0142" matches "4105550142" and "4105550"
  const onlyDigits = (s) => (s || "").replace(/\D+/g, "");

  const filtered = useMemo(() => {
    const list = QUOTE_LIST.filter((e) => {
      if (filterState.status    && e.status    !== filterState.status)    return false;
      if (filterState.createdBy && e.createdBy !== filterState.createdBy) return false;
      if (search) {
        const q = search.toLowerCase();
        const qDigits = onlyDigits(search);
        const inName    = e.customerName.toLowerCase().includes(q);
        const inAddress = e.address.toLowerCase().includes(q);
        const inId      = e.id.toLowerCase().includes(q);
        const inPhone   = qDigits.length > 0 && onlyDigits(e.phone).includes(qDigits);
        return inName || inAddress || inId || inPhone;
      }
      return true;
    });

    const sorted = [...list].sort((a, b) => {
      switch (sortKey) {
        case "dateAsc":  return a.date.localeCompare(b.date);
        case "nameAsc":  return a.customerName.localeCompare(b.customerName);
        case "nameDesc": return b.customerName.localeCompare(a.customerName);
        case "dateDesc":
        default:         return b.date.localeCompare(a.date);
      }
    });
    return sorted;
  }, [search, filterState, sortKey]);

  const activeFilterCount = (filterState.status ? 1 : 0) + (filterState.createdBy ? 1 : 0);
  const currentSortLabel = SORT_OPTIONS.find((o) => o.key === sortKey)?.label || "";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <FlowStepper activeKey="setup" />
      <AppHeader
        title="Quotes"
        onBack={onBack}
        right={
          <div className="flex items-center gap-2">
            <button className="p-1 active:scale-95"><Headphones size={20} color={T.text} /></button>
            <IconButton icon={Plus} label="New Quote" onClick={onOpenCreate} />
          </div>
        }
      />
      <div className="px-4 pt-2 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: T.textSecondary }}>All Quotes</span>
          <StoryBadge ids={["BWN-22", "BWN-106"]} onOpen={onOpenStory} />
        </div>
        <span className="text-[10px]" style={{ color: T.textTertiary }}>Tap <Plus size={10} className="inline" /> above to start a new quote</span>
      </div>

      <div className="px-4 flex items-center gap-2 mb-2">
        <div
          className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg"
          style={{ background: T.surface, border: `1px solid ${T.border}` }}
        >
          <Search size={16} color={T.textSecondary} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, address, phone, #ID"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: T.text }}
          />
        </div>
        <button
          onClick={() => setShowSort(true)}
          className="w-10 h-10 rounded-lg active:scale-95"
          style={{ background: T.surface, border: `1px solid ${T.border}` }}
          aria-label="Sort"
        >
          <ArrowUpDown size={18} color={T.text} className="mx-auto" />
        </button>
        <button
          onClick={onOpenFilter}
          className="relative w-10 h-10 rounded-lg active:scale-95"
          style={{ background: T.surface, border: `1px solid ${T.border}` }}
        >
          <Filter size={18} color={T.text} className="mx-auto" />
          {activeFilterCount > 0 && (
            <span
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
              style={{ background: T.purpleAccent, color: "#fff" }}
            >
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>
      <div className="px-4 mb-2 flex items-center gap-1.5 text-[10px]" style={{ color: T.textTertiary }}>
        <ArrowUpDown size={10} />
        <span>{currentSortLabel}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2.5">
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: T.textSecondary }}>No quotes match your filters.</p>
          </div>
        )}
        {filtered.map((e) => (
          <Card
            key={e.id}
            onClick={() => onOpenQuote(e.id)}
            className="p-3.5 active:scale-[0.98] cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <InitialsAvatar name={e.customerName} size={40} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-0.5">
                  <h3 className="font-bold leading-snug truncate" style={{ color: T.text }}>
                    {e.customerName}
                  </h3>
                  <ChevronRight size={16} color={T.textTertiary} className="flex-shrink-0 mt-0.5" />
                </div>
                <p className="text-[11px] mb-1.5 truncate" style={{ color: T.textTertiary }}>
                  #{e.id}
                </p>
                <div className="space-y-0.5 mb-2">
                  <div className="flex items-center gap-1.5 text-[11px]" style={{ color: T.textSecondary }}>
                    <MapPin size={11} className="flex-shrink-0" />
                    <span className="truncate">{e.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]" style={{ color: T.textSecondary }}>
                    <Phone size={11} className="flex-shrink-0" />
                    <span>{e.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]" style={{ color: T.textSecondary }}>
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar size={11} />
                      {fmtDateShort(e.date)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <User size={11} />
                      {e.createdBy}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={e.status} />
                    <span className="text-[11px]" style={{ color: T.textSecondary }}>{e.items} item{e.items !== 1 ? "s" : ""}</span>
                  </div>
                  <span className="text-base font-bold" style={{ color: T.text }}>{fmt$0(e.total)}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Sort modal */}
      {showSort && (
        <ModalOverlay onClose={() => setShowSort(false)} align="bottom">
          <Card className="w-full" style={{ borderRadius: "16px 16px 0 0" }}>
            <div className="px-4 pt-4 pb-2 flex items-center justify-between border-b" style={{ borderColor: T.border }}>
              <h2 className="text-base font-bold" style={{ color: T.text }}>Sort Quotes</h2>
              <button onClick={() => setShowSort(false)} className="p-1 active:scale-95">
                <X size={18} color={T.textSecondary} />
              </button>
            </div>
            <div className="p-3 space-y-1.5">
              {SORT_OPTIONS.map((o) => {
                const active = sortKey === o.key;
                return (
                  <button
                    key={o.key}
                    onClick={() => { setSortKey(o.key); setShowSort(false); }}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-lg active:scale-[0.99]"
                    style={{
                      background: active ? T.purpleSoft : T.surface,
                      border: `1px solid ${active ? T.purpleAccent : T.border}`,
                    }}
                  >
                    <span className="text-sm" style={{ color: active ? T.purpleAccent : T.text }}>{o.label}</span>
                    {active && <Check size={14} color={T.purpleAccent} />}
                  </button>
                );
              })}
            </div>
          </Card>
        </ModalOverlay>
      )}
    </div>
  );
};

// ============================================================================
// FILTER MODAL (overlay)
// ============================================================================
const FilterModal = ({ open, onClose, value, onApply }) => {
  const [draft, setDraft] = useState(value);
  useEffect(() => { if (open) setDraft(value); }, [open, value]);
  if (!open) return null;
  return (
    <ModalOverlay onClose={onClose} align="center">
      <Card className="w-full p-5 mx-4" style={{ maxWidth: 340 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold" style={{ color: T.text }}>Filter</h2>
          <button
            onClick={() => setDraft({})}
            className="px-3 py-1.5 rounded-lg text-sm font-semibold active:scale-95"
            style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.text }}
          >
            Clear
          </button>
        </div>
        <FormField label="Select Status">
          <SelectField
            value={draft.status}
            placeholder="Select"
            onClick={() => {
              const opts = ["DRAFT", "SENT", "SIGNED", "CANCELLED", "EXPIRED"];
              const idx = opts.indexOf(draft.status);
              setDraft({ ...draft, status: opts[(idx + 1) % opts.length] });
            }}
          />
        </FormField>
        <FormField label="Created By">
          <SelectField
            value={draft.createdBy}
            placeholder="Any rep"
            onClick={() => {
              const opts = ["Mike R.", "Tony Romano", "Mike Davis", undefined];
              const idx = opts.indexOf(draft.createdBy);
              setDraft({ ...draft, createdBy: opts[(idx + 1) % opts.length] });
            }}
          />
        </FormField>
        <FormField label="Date Range" badge={<Pill bg={T.purpleSoft} ink={T.purpleAccent}>Enrich</Pill>}>
          <SelectField value="" placeholder="Any date" onClick={() => {}} />
        </FormField>
        <div className="border-t pt-4 mt-1 flex gap-2" style={{ borderColor: T.border }}>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-lg text-sm font-semibold active:scale-95"
            style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.text }}
          >
            Cancel
          </button>
          <button
            onClick={() => { onApply(draft); onClose(); }}
            className="flex-1 py-3 rounded-lg text-sm font-semibold active:scale-95"
            style={{ background: T.purple, color: "#fff" }}
          >
            Apply
          </button>
        </div>
      </Card>
    </ModalOverlay>
  );
};

// Modal/sheet base
const ModalOverlay = ({ children, onClose, align = "center" }) => (
  <div
    className="absolute inset-0 z-50 flex justify-center"
    style={{
      background: "rgba(31, 41, 55, 0.5)",
      alignItems: align === "bottom" ? "flex-end" : "center",
    }}
    onClick={onClose}
  >
    {/*
      Inner wrapper. align-self: stretch gives it the overlay's full height so
      percentage max-heights on the Card resolve correctly (fixes Generate Quote
      modal trim). flex justify-center horizontally centers the Card; align-items
      centers (or bottom-aligns) it vertically.

      stopPropagation only fires when the click is on a *descendant* (the modal
      itself) — clicks landing on the wrapper directly (the empty backdrop area
      around a narrower modal) still bubble up to onClose.
    */}
    <div
      className="w-full flex justify-center"
      style={{
        alignSelf: "stretch",
        alignItems: align === "bottom" ? "flex-end" : "center",
      }}
      onClick={(e) => { if (e.target !== e.currentTarget) e.stopPropagation(); }}
    >
      {children}
    </div>
  </div>
);

// ============================================================================
// 3. CREATE NEW QUOTE MODAL — with lead auto-fill (BWN-22, BWN-115)
// ============================================================================
// Form of Payment options (BWN-117). Financed has special behavior: deposit auto-$0.
// Cash & Other added per BWN onboarding feedback (2026-05-13).
const FOP_OPTIONS = ["Check", "Credit Card", "Cash", "Financed", "Other"];
const OCCUPANCY_OPTIONS = ["owner", "tenant"];

// LeadPicker — dedicated screen-like sheet with search + denser cards.
const LeadPicker = ({ onClose, onPick, onOpenStory }) => {
  const [search, setSearch] = useState("");
  const onlyDigits = (s) => (s || "").replace(/\D+/g, "");
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return LEAD_QUEUE;
    const qDigits = onlyDigits(search);
    return LEAD_QUEUE.filter((l) => (
      l.name.toLowerCase().includes(q) ||
      l.address.toLowerCase().includes(q) ||
      l.city.toLowerCase().includes(q) ||
      l.state.toLowerCase().includes(q) ||
      l.leadSource.toLowerCase().includes(q) ||
      (qDigits.length > 0 && onlyDigits(l.phone).includes(qDigits))
    ));
  }, [search]);

  return (
    <ModalOverlay onClose={onClose} align="bottom">
      <Card className="w-full max-h-[88%] flex flex-col" style={{ borderRadius: "16px 16px 0 0" }}>
        <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b" style={{ borderColor: T.border }}>
          <h2 className="text-lg font-bold" style={{ color: T.text }}>Select Lead / Inspection</h2>
          <button onClick={onClose} className="p-1 active:scale-95">
            <X size={20} color={T.textSecondary} />
          </button>
        </div>
        <div className="px-4 py-2 flex items-center gap-2 border-b" style={{ background: T.purpleSofter, borderColor: T.border }}>
          <Sparkles size={14} color={T.purpleAccent} />
          <span className="text-xs flex-1" style={{ color: T.purpleAccent }}>Auto-fills 9 fields from lead record</span>
          <StoryBadge ids={["BWN-22"]} onOpen={onOpenStory} />
        </div>
        <div className="px-4 pt-3 pb-2">
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
            style={{ background: T.surface, border: `1px solid ${T.border}` }}
          >
            <Search size={16} color={T.textSecondary} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, address, phone, source"
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: T.text }}
            />
            {search && (
              <button onClick={() => setSearch("")} className="p-0.5 active:scale-95">
                <X size={14} color={T.textSecondary} />
              </button>
            )}
          </div>
          <p className="text-[10px] mt-1.5" style={{ color: T.textTertiary }}>
            {filtered.length} of {LEAD_QUEUE.length} lead{LEAD_QUEUE.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
          {filtered.length === 0 && (
            <div className="text-center py-10">
              <p className="text-xs" style={{ color: T.textSecondary }}>No leads match "{search}".</p>
            </div>
          )}
          {filtered.map((l) => {
            const tenantPre1978 = l.occupancy === "tenant" && l.yearBuilt < 1978;
            return (
            <Card
              key={l.id}
              onClick={() => onPick(l)}
              className="p-3 active:scale-[0.98] cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <InitialsAvatar name={l.name} size={40} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h3 className="font-bold leading-tight truncate" style={{ color: T.text }}>{l.name}</h3>
                    <Pill bg={T.infoSoft} ink={T.info}>{l.state}</Pill>
                  </div>
                  <p className="text-[11px] truncate mb-1.5" style={{ color: T.textSecondary }}>
                    {l.address}, {l.city}, {l.state} {l.zip}
                  </p>
                  {tenantPre1978 && (
                    <div className="mb-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: T.warningSoft, color: T.warning, border: `1px solid ${T.warning}55` }}>
                      <AlertTriangle size={10} /> Tenant · pre-1978 · extra forms
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]" style={{ color: T.textSecondary }}>
                    <span className="inline-flex items-center gap-1.5">
                      <Phone size={10} /> {l.phone}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <User size={10} /> {l.occupancy === "tenant" ? "Tenant" : "Owner"}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar size={10} />
                      <span style={{ color: l.yearBuilt < 1978 ? T.warning : T.textSecondary, fontWeight: l.yearBuilt < 1978 ? 600 : 400 }}>
                        {l.yearBuilt}{l.yearBuilt < 1978 ? " · RRP" : ""}
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Eye size={10} /> {l.inspectedBy}
                    </span>
                  </div>
                  <p className="text-[10px] mt-1.5" style={{ color: T.textTertiary }}>
                    Source: {l.leadSource}
                  </p>
                </div>
              </div>
            </Card>
            );
          })}
        </div>
      </Card>
    </ModalOverlay>
  );
};

const CreateQuoteModal = ({ open, onClose, onCreate, onOpenStory, orgConfig }) => {
  const [selectedLead, setSelectedLead] = useState(null);
  const [showLeadPicker, setShowLeadPicker] = useState(false);
  const [yearBuilt, setYearBuilt] = useState("");
  const [occupancy, setOccupancy] = useState("owner");
  const [formOfPayment, setFormOfPayment] = useState("Check");

  useEffect(() => {
    if (!open) {
      setSelectedLead(null);
      setShowLeadPicker(false);
      setYearBuilt("");
      setOccupancy("owner");
      setFormOfPayment("Check");
    }
  }, [open]);

  useEffect(() => {
    if (selectedLead) {
      setYearBuilt(String(selectedLead.yearBuilt));
      setOccupancy(selectedLead.occupancy || "owner");
    }
  }, [selectedLead]);

  if (!open) return null;
  const triggersRrp = selectedLead && selectedLead.yearBuilt < 1978;
  const triggersTenantSelfCert = triggersRrp && occupancy === "tenant";
  const canCreate = !!selectedLead && !!yearBuilt && !!formOfPayment;
  const cycleFop = () => setFormOfPayment(FOP_OPTIONS[(FOP_OPTIONS.indexOf(formOfPayment) + 1) % FOP_OPTIONS.length]);
  const cycleOccupancy = () => setOccupancy(OCCUPANCY_OPTIONS[(OCCUPANCY_OPTIONS.indexOf(occupancy) + 1) % OCCUPANCY_OPTIONS.length]);

  if (showLeadPicker) {
    return <LeadPicker
      onClose={() => setShowLeadPicker(false)}
      onPick={(l) => { setSelectedLead(l); setShowLeadPicker(false); }}
      onOpenStory={onOpenStory}
    />;
  }

  return (
    <ModalOverlay onClose={onClose} align="center">
      <Card className="w-full mx-3 flex flex-col" style={{ maxWidth: 360, maxHeight: "calc(100% - 24px)" }}>
        <div className="px-5 pt-5 pb-2 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold" style={{ color: T.text }}>Create New Quote</h2>
          </div>
          <StoryBadge ids={["BWN-22", "BWN-115"]} onOpen={onOpenStory} />
        </div>

        <div className="px-5 pb-3 overflow-y-auto flex-1 min-h-0">
          {/* ─── Auto-filled from Lead (section 1) ─────────────────── */}
          <div className="flex items-center justify-between mt-1 mb-2">
            <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: T.textSecondary }}>Auto-filled from Lead</span>
            <StoryBadge ids={["BWN-22"]} onOpen={onOpenStory} />
          </div>

          {!selectedLead ? (
            <button
              onClick={() => setShowLeadPicker(true)}
              className="w-full flex items-center justify-between rounded-lg px-3 py-3.5 mb-4 text-left active:scale-[0.99]"
              style={{ background: T.surface, border: `1px dashed ${T.purpleAccent}88` }}
            >
              <div className="flex items-center gap-2">
                <Sparkles size={16} color={T.purpleAccent} />
                <span className="text-sm" style={{ color: T.purpleAccent }}>Select a lead to auto-fill 9 fields</span>
              </div>
              <ChevronRight size={16} color={T.purpleAccent} />
            </button>
          ) : (
            <Card className="p-3 mb-4" style={{ background: T.purpleSofter, borderColor: `${T.purpleAccent}55` }}>
              <div className="flex items-start gap-3">
                <InitialsAvatar name={selectedLead.name} size={36} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold truncate" style={{ color: T.text }}>{selectedLead.name}</p>
                    <button onClick={() => setSelectedLead(null)} className="p-0.5 flex-shrink-0">
                      <X size={14} color={T.textSecondary} />
                    </button>
                  </div>
                  <p className="text-[11px] truncate" style={{ color: T.textSecondary }}>
                    {selectedLead.address}, {selectedLead.city}, {selectedLead.state} {selectedLead.zip}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    <Pill bg={T.surface} ink={T.textSecondary}>{selectedLead.contact}</Pill>
                    <Pill bg={T.surface} ink={T.textSecondary}>{selectedLead.phone}</Pill>
                    <Pill bg={T.surface} ink={T.textSecondary}>{selectedLead.leadSource}</Pill>
                  </div>
                  <p className="text-[10px] mt-1.5" style={{ color: T.textTertiary }}>
                    Inspected by {selectedLead.inspectedBy} on {selectedLead.inspectionDate}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLeadPicker(true)}
                className="w-full mt-2.5 py-1.5 rounded-md text-[11px] font-semibold active:scale-95"
                style={{ background: T.surface, border: `1px solid ${T.purpleAccent}44`, color: T.purpleAccent }}
              >
                Change lead
              </button>
            </Card>
          )}

          {/* ─── Quote Setup (section 2) ──────────────────────────── */}
          <div className="flex items-center justify-between mt-2 mb-2">
            <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: T.textSecondary }}>Quote Setup</span>
          </div>

          <FormField
            label="Year Built"
            required
            hint={
              triggersRrp
                ? "⚠ Pre-1978 home → Federal RRP Lead Form will be required on this contract."
                : selectedLead && yearBuilt
                ? "✓ Built after 1978 → Lead Form optional."
                : "Drives Pre-Renovation Lead Form trigger. Required for residential contracts."
            }
          >
            <TextInput
              value={yearBuilt}
              onChange={setYearBuilt}
              placeholder="e.g. 1968"
              type="number"
              style={triggersRrp ? { borderColor: T.warning, borderWidth: 2 } : {}}
            />
          </FormField>

          <FormField
            label="Occupancy"
            required
            hint={triggersTenantSelfCert
              ? "⚠ Tenant + pre-1978 → Pre-Renovation Lead Form will include tenant self-cert section."
              : "Owner vs Tenant. Drives RRP Lead Form tenant self-cert visibility."
            }
          >
            <SelectField value={occupancy === "tenant" ? "Tenant" : "Owner"} onClick={cycleOccupancy} />
          </FormField>

          <FormField
            label="Form of Payment"
            required
            hint={formOfPayment === "Financed"
              ? "Financed → deposit will be auto-zeroed; balance due on completion."
              : "Check / Credit Card / Cash / Financed / Other. Carries into Payment Schedule."
            }
          >
            <SelectField value={formOfPayment} onClick={cycleFop} />
          </FormField>

          <p className="text-[11px] mt-1 px-1" style={{ color: T.textTertiary }}>
            <Info size={10} className="inline mr-1" />
            Quote total will appear after line items are added on the Quote Detail screen.
          </p>
        </div>

        <div className="border-t px-5 py-3 flex gap-2 sticky bottom-0" style={{ background: T.surface, borderColor: T.border }}>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-lg text-sm font-semibold active:scale-95"
            style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.text }}
          >
            Cancel
          </button>
          <button
            disabled={!canCreate}
            onClick={() => onCreate({ lead: selectedLead, yearBuilt, occupancy, formOfPayment })}
            className="flex-1 py-3 rounded-lg text-sm font-semibold active:scale-95 disabled:opacity-50"
            style={{ background: T.purple, color: "#fff" }}
          >
            Create
          </button>
        </div>
      </Card>
    </ModalOverlay>
  );
};

// ============================================================================
// 4. QUOTE DETAIL SCREEN — Contract Terms + sections of line items (BWN-22)
// ============================================================================
const QuoteDetailScreen = ({ estimate, onBack, onOpenLineItem, onEditLineItem, onUpdateLineItem, onRemoveLineItem, onRemovePackage, onOpenMenus, onOpenBasement, onOpenChecklist, onOpenNotes, onOpenGenerate, onOpenStory, onReissue, onPatchEstimate }) => {
  // Per-row description expansion (view more)
  const [expandedRows, setExpandedRows] = useState(() => new Set());
  const toggleRow = (id) => setExpandedRows((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  // Inline edit for Final Contract Total
  const [editingFinal, setEditingFinal] = useState(false);
  const [draftFinal, setDraftFinal] = useState("");
  const startEditFinal = () => {
    setDraftFinal(String(estimate.totalOverride ?? ""));
    setEditingFinal(true);
  };
  const commitFinal = () => {
    const trimmed = draftFinal.trim();
    const next = trimmed === "" ? null : Number(trimmed);
    onPatchEstimate && onPatchEstimate({ totalOverride: Number.isFinite(next) ? next : null });
    setEditingFinal(false);
  };
  const cancelEditFinal = () => { setEditingFinal(false); setDraftFinal(""); };
  // Line items split into (a) package groups (rendered as a single Package
  // Card showing the priced anchor + included satellites) and (b) regular
  // category sections (rendered as today). Package items are excluded from
  // category sections so they live only inside their Package Card.
  const { packageGroups, sections } = useMemo(() => {
    const pkgMap = {}; // packageInstanceId → group
    const cat = {};    // category → { display, items }

    estimate.lineItems.forEach((li) => {
      const sku = CATALOG.find((s) => s.sku === li.sku);
      if (!sku) return;
      if (li.packageInstanceId) {
        if (!pkgMap[li.packageInstanceId]) {
          pkgMap[li.packageInstanceId] = {
            id: li.packageInstanceId,
            label: li.packageLabel,
            config: PACKAGES.find((p) => p.key === li.packageKey) || null,
            anchor: null,
            satellites: [],
          };
        }
        const enriched = { ...li, sku };
        if (li.bundled) pkgMap[li.packageInstanceId].satellites.push(enriched);
        else pkgMap[li.packageInstanceId].anchor = enriched;
      } else {
        if (!cat[sku.category]) cat[sku.category] = { display: sku.categoryDisplay, items: [] };
        cat[sku.category].items.push({ ...li, sku });
      }
    });
    return { packageGroups: Object.values(pkgMap), sections: Object.values(cat) };
  }, [estimate]);

  const computedTotal = useMemo(() => {
    return estimate.lineItems.reduce((sum, li) => {
      const sku = CATALOG.find((s) => s.sku === li.sku);
      if (!sku) return sum;
      const price = li.customPrice ?? (sku.unitPrice * li.qty);
      return sum + price;
    }, 0);
  }, [estimate]);

  // Dual totals (BWN-121): subtotalFromLineItems (computed) + finalContractTotal (rep override)
  const subtotalFromLineItems = computedTotal;
  const finalContractTotal = estimate.totalOverride ?? subtotalFromLineItems;
  const overrideDelta = (estimate.totalOverride ?? subtotalFromLineItems) - subtotalFromLineItems;
  const overridden = estimate.totalOverride != null && estimate.totalOverride !== subtotalFromLineItems;
  const finalTotal = finalContractTotal; // legacy alias

  // Expiry (BWN-120): unsigned quote past validUntil → effectiveStatus = EXPIRED
  const isExpired = estimate.status !== "SIGNED" && estimate.status !== "CANCELLED" && todayISO() > estimate.validUntil;
  const effectiveStatus = isExpired ? "EXPIRED" : estimate.status;

  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef(null);
  const onScroll = (e) => setScrolled((e.target.scrollTop || 0) > 80);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <FlowStepper activeKey="build" />
      <div
        className="px-3 pt-2 pb-2 flex items-center justify-between gap-2 transition-shadow"
        style={{
          background: T.bg,
          boxShadow: scrolled ? "0 2px 6px rgba(17,24,39,0.06)" : "none",
        }}
      >
        <button onClick={onBack} className="p-1.5 -ml-1 active:scale-95" aria-label="Back">
          <ArrowLeft size={20} color={T.text} />
        </button>
        {/* Sticky compact summary when scrolled */}
        {scrolled ? (
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <InitialsAvatar name={estimate.customer.name} size={28} />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold truncate" style={{ color: T.text }}>{estimate.customer.name}</p>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px]" style={{ color: T.textTertiary }}>#{estimate.id}</span>
                <span className="text-[10px] font-bold" style={{ color: T.text }}>{fmt$0(finalContractTotal)}</span>
                <StatusBadge status={effectiveStatus} />
              </div>
            </div>
          </div>
        ) : <div className="flex-1" />}
        <button
          onClick={onOpenGenerate}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg active:scale-95"
          style={{ background: T.purple, color: "#fff" }}
        >
          <PenTool size={14} />
          <span className="text-sm font-semibold">{scrolled ? "Quote" : "Generate Quote"}</span>
        </button>
      </div>

      <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto pb-28">
        <div
          className="mx-4 mt-2 mb-3 px-4 py-3 rounded-xl"
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderLeft: estimate.customer.yearBuilt < 1978 ? `4px solid ${T.warning}` : `1px solid ${T.border}`,
          }}
        >
          <h1 className="text-2xl font-bold leading-tight" style={{ color: T.text }}>
            {estimate.customer.name}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: T.textSecondary }}>
            {estimate.customer.address}, {estimate.customer.city}, {estimate.customer.state}
          </p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Pill bg={T.infoSoft} ink={T.info}>#{estimate.id}</Pill>
            <StatusBadge status={effectiveStatus} />
            <Pill bg={T.purpleSoft} ink={T.purpleAccent}>
              {TENANT.licenses[estimate.customer.state]?.displayLabel || estimate.customer.state} #{TENANT.licenses[estimate.customer.state]?.number || "—"}
            </Pill>
            {estimate.customer.yearBuilt < 1978 && (
              <Pill bg={T.warningSoft} ink={T.warning}>Pre-1978 · RRP</Pill>
            )}
            {estimate.customer.occupancy === "tenant" && (
              <Pill bg={T.warningSoft} ink={T.warning}>Tenant</Pill>
            )}
          </div>
          {isExpired && (
            <div className="mt-2 p-2.5 rounded-lg flex items-center justify-between gap-2" style={{ background: T.warningSoft, border: `1px dashed ${T.warning}66` }}>
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} color={T.warning} />
                <div>
                  <p className="text-xs font-bold" style={{ color: T.warning }}>Quote Expired</p>
                  <p className="text-[10px]" style={{ color: T.warning, opacity: 0.85 }}>
                    Valid Until {fmtDateShort(estimate.validUntil)} · re-issue to enable signing
                  </p>
                </div>
              </div>
              <button onClick={onReissue} className="px-3 py-1.5 rounded-md text-[11px] font-bold active:scale-95" style={{ background: T.warning, color: "#fff" }}>
                Re-issue
              </button>
            </div>
          )}
        </div>

        <div className="px-4 mb-3">
          <CollapsibleCard
            title="Contract Terms"
            summary={`Valid until ${fmtDateShort(estimate.validUntil)} · Deposit ${fmt$0(estimate.deposit)} · ${estimate.formOfPayment} · ${estimate.customer.is65OrOlder ? "65+" : "Under 65"}`}
            right={<StoryBadge ids={["BWN-106"]} onOpen={onOpenStory} />}
          >
            <div className="space-y-2.5 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: T.textSecondary }}>Valid Until</span>
                <span className="text-sm font-semibold" style={{ color: T.text }}>{fmtDateShort(estimate.validUntil)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: T.textSecondary }}>Deposit Amount</span>
                <span className="text-sm font-semibold" style={{ color: T.text }}>{fmt$0(estimate.deposit)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: T.textSecondary }}>Homeowner 65+</span>
                <span className="text-sm font-semibold" style={{ color: estimate.customer.is65OrOlder ? T.warning : T.text }}>
                  {estimate.customer.is65OrOlder ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: T.textSecondary }}>Year Built</span>
                <span className="text-sm font-semibold" style={{ color: estimate.customer.yearBuilt < 1978 ? T.warning : T.text }}>
                  {estimate.customer.yearBuilt}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: T.textSecondary }}>Form of Payment</span>
                <span className="text-sm font-semibold" style={{ color: T.text }}>{estimate.formOfPayment}</span>
              </div>
            </div>
          </CollapsibleCard>
        </div>

        {/* Package groups — each package renders as a single grouped card with
            the priced anchor on top + a collapsed list of "Included" satellites. */}
        {packageGroups.map((grp) => {
          const PkgIcon = grp.config?.icon || Package;
          const pkgAccent = grp.config?.accent || T.tilePurple;
          const pkgAccentInk = grp.config?.accentInk || T.tilePurpleInk;
          const anchor = grp.anchor;
          const anchorSku = anchor?.sku;
          const anchorPrice = anchor && anchorSku
            ? (anchor.customPrice ?? anchorSku.unitPrice * anchor.qty)
            : 0;
          const decAnchorQty = (e) => {
            e.stopPropagation();
            if (!anchor) return;
            onUpdateLineItem && onUpdateLineItem(anchor.id, { qty: Math.max(1, (anchor.qty || 1) - 1) });
          };
          const incAnchorQty = (e) => {
            e.stopPropagation();
            if (!anchor) return;
            onUpdateLineItem && onUpdateLineItem(anchor.id, { qty: (anchor.qty || 0) + 1 });
          };
          return (
            <div key={grp.id} className="px-4 mb-3">
              <Card className="overflow-hidden" style={{ background: T.purpleSofter, borderColor: `${T.purpleAccent}44` }}>
                {/* Package header */}
                <div className="px-4 pt-3 pb-2.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: pkgAccent }}>
                    <PkgIcon size={18} color={pkgAccentInk} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Package size={11} color={T.purpleAccent} />
                      <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: T.purpleAccent }}>Package</span>
                    </div>
                    <h3 className="text-sm font-bold leading-tight" style={{ color: T.text }}>{grp.label}</h3>
                    <p className="text-[10px]" style={{ color: T.textSecondary }}>
                      1 priced item · {grp.satellites.length} included
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[9px] font-bold tracking-wider uppercase" style={{ color: T.textSecondary }}>Pkg total</p>
                    <p className="text-base font-extrabold" style={{ color: T.purpleAccent }}>{fmt$0(anchorPrice)}</p>
                  </div>
                  <button
                    onClick={() => onRemovePackage && onRemovePackage(grp.id)}
                    className="p-1.5 -mr-1 active:scale-95 flex-shrink-0 rounded"
                    style={{ background: T.surface, border: `1px solid ${T.border}` }}
                    aria-label="Remove package"
                    title="Remove entire package"
                  >
                    <Trash2 size={13} color={T.error} />
                  </button>
                </div>

                {/* Anchor row — full-width, white surface, prominent */}
                {anchor && anchorSku && (
                  <button
                    onClick={() => onEditLineItem && onEditLineItem(anchor.id)}
                    className="w-full text-left px-4 py-3 active:bg-slate-50"
                    style={{ background: T.surface, borderTop: `1px solid ${T.purpleAccent}33`, borderBottom: `1px solid ${T.borderSoft}` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: anchorSku.accent }}>
                        <anchorSku.icon size={18} color={anchorSku.accentInk} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="text-sm font-bold leading-tight" style={{ color: T.text }}>{anchorSku.title}</h4>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold flex-shrink-0" style={{ background: T.purpleSoft, color: T.purpleAccent }}>
                            <DollarSign size={9} /> PRICED ANCHOR
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed line-clamp-2 mb-2" style={{ color: T.textSecondary }}>
                          {anchor.customDescription || anchorSku.description}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <div
                            className="inline-flex items-center rounded-lg overflow-hidden"
                            style={{ background: T.surface, border: `1px solid ${T.border}` }}
                          >
                            <span onClick={decAnchorQty} role="button" tabIndex={0}
                              className="w-7 h-7 inline-flex items-center justify-center active:scale-95"
                              style={{ color: T.text }} aria-label="Decrease LF">−</span>
                            <span className="px-2 text-xs font-bold tabular-nums" style={{ color: T.text, minWidth: 44, textAlign: "center" }}>
                              {anchor.qty} {anchorSku.uom}
                            </span>
                            <span onClick={incAnchorQty} role="button" tabIndex={0}
                              className="w-7 h-7 inline-flex items-center justify-center active:scale-95"
                              style={{ color: T.text }} aria-label="Increase LF">+</span>
                          </div>
                          <span className="text-[11px] font-semibold tabular-nums" style={{ color: T.textSecondary }}>
                            × {fmt$(anchorSku.unitPrice)} = <span className="font-extrabold" style={{ color: T.purpleAccent }}>{fmt$(anchorPrice)}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                )}

                {/* Satellites — compact rows, "Included" badge */}
                {grp.satellites.length > 0 && (
                  <>
                    <div className="px-4 py-1.5 flex items-center gap-2" style={{ background: T.surfaceAlt }}>
                      <Check size={10} color={T.success} />
                      <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: T.textSecondary }}>
                        Included with this package
                      </span>
                    </div>
                    {grp.satellites.map((sat, idx) => (
                      <button
                        key={sat.id}
                        onClick={() => onEditLineItem && onEditLineItem(sat.id)}
                        className="w-full text-left px-4 py-2 active:bg-slate-50"
                        style={{ background: T.surface, borderTop: idx === 0 ? `1px solid ${T.borderSoft}` : `1px solid ${T.borderSoft}` }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: sat.sku.accent }}>
                            <sat.sku.icon size={13} color={sat.sku.accentInk} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold leading-tight truncate" style={{ color: T.text }}>{sat.sku.title}</p>
                            <p className="text-[10px] truncate" style={{ color: T.textTertiary }}>{sat.sku.categoryDisplay}</p>
                          </div>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold flex-shrink-0" style={{ background: T.successSoft, color: T.success }}>
                            <Check size={9} /> Included
                          </span>
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </Card>
            </div>
          );
        })}

        {/* Sections of line items */}
        {sections.map((section) => (
          <div key={section.display} className="px-4 mb-3">
            <Card className="overflow-hidden">
              <div className="px-4 pt-3.5 pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold" style={{ color: T.text }}>{section.display}</h3>
                  <Lock size={11} color={T.textTertiary} />
                  <StoryBadge ids={["BWN-21", "BWN-22"]} onOpen={onOpenStory} />
                </div>
                <span className="text-xs" style={{ color: T.textSecondary }}>
                  {section.items.length} item{section.items.length !== 1 ? "s" : ""}
                </span>
              </div>
              {section.items.map((it) => {
                const text = it.customDescription || it.sku.description || "";
                const isLong = text.length > 140;
                const isExpanded = expandedRows.has(it.id);
                const decQty = (e) => {
                  e.stopPropagation();
                  const next = Math.max(1, (it.qty || 1) - 1);
                  onUpdateLineItem && onUpdateLineItem(it.id, { qty: next });
                };
                const incQty = (e) => {
                  e.stopPropagation();
                  const next = (it.qty || 0) + 1;
                  onUpdateLineItem && onUpdateLineItem(it.id, { qty: next });
                };
                const remove = (e) => {
                  e.stopPropagation();
                  onRemoveLineItem && onRemoveLineItem(it.id);
                };
                return (
                  <button
                    key={it.id}
                    onClick={() => onEditLineItem && onEditLineItem(it.id)}
                    className="w-full text-left px-4 py-3 active:bg-slate-50 transition-colors"
                    style={{ borderTop: `1px solid ${T.borderSoft}`, background: "transparent" }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: it.sku.accent }}
                      >
                        <it.sku.icon size={18} color={it.sku.accentInk} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="text-sm font-bold leading-tight" style={{ color: T.text }}>
                            {it.sku.title}
                          </h4>
                          <span
                            onClick={remove}
                            role="button"
                            tabIndex={0}
                            className="flex-shrink-0 p-1 -mr-1 active:scale-95 inline-flex"
                            aria-label="Remove"
                          >
                            <Trash2 size={14} color={T.error} />
                          </span>
                        </div>
                        <p
                          className={`text-xs leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`}
                          style={{ color: T.textSecondary }}
                        >
                          {text}
                        </p>
                        {isLong && (
                          <span
                            onClick={(e) => { e.stopPropagation(); toggleRow(it.id); }}
                            role="button"
                            tabIndex={0}
                            className="inline-block text-[11px] font-semibold mt-1 active:scale-95"
                            style={{ color: T.purpleAccent }}
                          >
                            {isExpanded ? "View less" : "View more"}
                          </span>
                        )}
                        {/* Inline qty stepper + (optional) bundled-included pill */}
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <div
                            className="inline-flex items-center rounded-lg overflow-hidden"
                            style={{ background: T.surface, border: `1px solid ${T.border}` }}
                          >
                            <span
                              onClick={decQty}
                              role="button"
                              tabIndex={0}
                              className="w-7 h-7 inline-flex items-center justify-center active:scale-95"
                              style={{ color: T.text }}
                              aria-label="Decrease quantity"
                            >
                              −
                            </span>
                            <span
                              className="px-2 text-xs font-bold tabular-nums"
                              style={{ color: T.text, minWidth: 36, textAlign: "center" }}
                            >
                              {it.qty} {it.sku.uom}
                            </span>
                            <span
                              onClick={incQty}
                              role="button"
                              tabIndex={0}
                              className="w-7 h-7 inline-flex items-center justify-center active:scale-95"
                              style={{ color: T.text }}
                              aria-label="Increase quantity"
                            >
                              +
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </Card>
          </div>
        ))}

        {/* Basement Preparations card */}
        <div className="px-4 mb-3">
          <Card className="overflow-hidden">
            <button
              onClick={onOpenBasement}
              className="w-full px-4 py-3.5 flex items-center justify-between active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: T.tileYellow }}>
                  <ClipboardList size={18} color={T.tileYellowInk} />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm" style={{ color: T.text }}>Basement Preparations & Notes</h3>
                  </div>
                  <p className="text-xs" style={{ color: T.textSecondary }}>
                    {estimate.basementPrep.filter((b) => b.selected).length} of 11 items selected
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StoryBadge ids={["BWN-111"]} onOpen={onOpenStory} />
                <ChevronRight size={18} color={T.textSecondary} />
              </div>
            </button>
          </Card>
        </div>

        {/* Customer Preparation Checklist card (BWN-130) — digitized Pre-Inspect form */}
        {(() => {
          const pc = estimate.prepChecklist || makeDefaultPrepChecklist();
          const stayCount = PREP_CHECKLIST_ITEMS.filter((it) => pc.items[it.key] === "stay").length;
          return (
            <div className="px-4 mb-3">
              <Card className="overflow-hidden">
                <button
                  onClick={onOpenChecklist}
                  className="w-full px-4 py-3.5 flex items-center justify-between active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: T.tileGreen }}>
                      <ListChecks size={18} color={T.tileGreenInk} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-sm" style={{ color: T.text }}>Customer Preparation Checklist</h3>
                      <p className="text-xs" style={{ color: T.textSecondary }}>
                        6 of 6 sections
                        {stayCount > 0 && (
                          <> · <span style={{ color: T.warning, fontWeight: 700 }}>{stayCount} item{stayCount !== 1 ? "s" : ""} staying</span></>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StoryBadge ids={["BWN-130"]} onOpen={onOpenStory} />
                    <ChevronRight size={18} color={T.textSecondary} />
                  </div>
                </button>
              </Card>
            </div>
          );
        })()}

        {/* Notes card */}
        <div className="px-4 mb-3">
          <Card className="overflow-hidden">
            <button
              onClick={onOpenNotes}
              className="w-full px-4 py-3.5 flex items-center justify-between active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: T.tilePurple }}>
                  <FileText size={18} color={T.tilePurpleInk} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-sm" style={{ color: T.text }}>Internal Notes</h3>
                  <p className="text-xs" style={{ color: T.textSecondary }}>
                    {estimate.notes ? `${estimate.notes.slice(0, 36)}…` : "Add notes for your team"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StoryBadge ids={["BWN-112"]} onOpen={onOpenStory} />
                <ChevronRight size={18} color={T.textSecondary} />
              </div>
            </button>
          </Card>
        </div>


        {/* Dual Totals (BWN-121, BWN-22) — Subtotal · Final · Δ */}
        <div className="px-4 mt-4 mb-3" id="quote-total-card">
          <Card className="p-4" style={{ background: T.purpleSofter, borderColor: `${T.purpleAccent}33` }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold tracking-wider uppercase" style={{ color: T.purpleAccent }}>Quote Total</span>
              <StoryBadge ids={["BWN-121", "BWN-22"]} onOpen={onOpenStory} />
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="p-2.5 rounded-lg" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                <p className="text-[10px] font-bold tracking-wider uppercase" style={{ color: T.textSecondary }}>Subtotal · auto</p>
                <p className="text-lg font-extrabold" style={{ color: T.text }}>{fmt$(subtotalFromLineItems)}</p>
                <p className="text-[9px] mt-0.5" style={{ color: T.textTertiary }}>Σ(unitPrice × qty)</p>
              </div>
              <div className="p-2.5 rounded-lg" style={{ background: overridden ? T.warningSoft : T.successSoft, border: `1px solid ${overridden ? T.warning + "55" : T.success + "55"}` }}>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold tracking-wider uppercase" style={{ color: overridden ? T.warning : T.success }}>Final · contract</p>
                  {!editingFinal && (
                    <button onClick={startEditFinal} className="p-0.5 -mr-0.5 active:scale-95" aria-label="Edit final total">
                      <Pencil size={11} color={overridden ? T.warning : T.success} />
                    </button>
                  )}
                </div>
                {editingFinal ? (
                  <div className="mt-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-base font-bold" style={{ color: T.text }}>$</span>
                      <input
                        autoFocus
                        type="number"
                        value={draftFinal}
                        onChange={(e) => setDraftFinal(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitFinal();
                          if (e.key === "Escape") cancelEditFinal();
                        }}
                        placeholder={String(subtotalFromLineItems)}
                        className="flex-1 text-lg font-extrabold rounded px-1.5 py-0.5 outline-none w-0"
                        style={{ background: "#fff", border: `1px solid ${T.warning}88`, color: T.text }}
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={commitFinal}
                        className="flex-1 py-1 rounded text-[10px] font-bold active:scale-95"
                        style={{ background: T.purple, color: "#fff" }}
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditFinal}
                        className="flex-1 py-1 rounded text-[10px] font-bold active:scale-95"
                        style={{ background: T.surface, color: T.text, border: `1px solid ${T.border}` }}
                      >
                        Cancel
                      </button>
                      {overridden && (
                        <button
                          onClick={() => { onPatchEstimate && onPatchEstimate({ totalOverride: null }); cancelEditFinal(); }}
                          className="px-1.5 py-1 rounded text-[10px] font-bold active:scale-95"
                          style={{ background: T.errorSoft, color: T.error }}
                          title="Reset to subtotal"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-lg font-extrabold" style={{ color: overridden ? T.warning : T.success }}>{fmt$(finalContractTotal)}</p>
                    <p className="text-[9px] mt-0.5" style={{ color: overridden ? T.warning : T.success, opacity: 0.85 }}>
                      {overridden ? "rep override · total-level" : "tap pencil to edit"}
                    </p>
                  </>
                )}
              </div>
            </div>
            {overridden && (
              <div className="flex items-center justify-between p-2 rounded-md mb-2" style={{ background: T.surfaceAlt }}>
                <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: T.textSecondary }}>Δ Override (office report)</span>
                <span className="text-sm font-bold" style={{ color: overrideDelta >= 0 ? T.success : T.error }}>
                  {overrideDelta >= 0 ? "+" : ""}{fmt$(overrideDelta)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: T.textSecondary }}>
                {estimate.lineItems.length} items
              </span>
              <span className="text-[11px] font-medium" style={{ color: T.textTertiary }}>
                Line pricing hidden on PDF
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* Floating actions: Add Product (primary, bottom-right) · All Menus (secondary, bottom-left) */}
      <div className="absolute bottom-4 left-0 right-0 px-4 flex justify-between items-end pointer-events-none">
        <button
          onClick={onOpenMenus}
          className="pointer-events-auto px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 active:scale-95"
          style={{ background: T.surface, color: T.text, border: `1px solid ${T.border}` }}
        >
          <Layers size={14} />
          <span className="text-xs font-semibold">All Menus</span>
        </button>
        <button
          onClick={onOpenLineItem}
          className="pointer-events-auto px-5 py-3 rounded-full shadow-xl flex items-center gap-2 active:scale-95"
          style={{ background: T.purple, color: "#fff", boxShadow: "0 12px 28px -8px rgba(91,45,142,0.55), 0 6px 14px -4px rgba(0,0,0,0.2)" }}
        >
          <Plus size={18} />
          <span className="text-sm font-bold">Add Product</span>
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// 5. LINE ITEM PICKER (Sale Item picker, bottom sheet)
// ============================================================================
const LineItemPicker = ({ open, onClose, onAdd, onAddPackage, onSaveEdit, editItem, onOpenStory }) => {
  const isEditing = !!editItem;
  const [selected, setSelected] = useState(null);
  const [qty, setQty] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [search, setSearch] = useState("");
  // Drill-down: pick a sub-category from the Pricing Guide first, then an item.
  const [selectedCategory, setSelectedCategory] = useState(null);
  // Packages drill-down: when user taps the "Packages" chip
  const [showingPackages, setShowingPackages] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  // Voice transcription review affordance — flashes the textarea yellow briefly
  const [justTranscribed, setJustTranscribed] = useState(false);
  const transcribeTimer = useRef(null);
  const flashTranscribed = () => {
    setJustTranscribed(true);
    if (transcribeTimer.current) clearTimeout(transcribeTimer.current);
    transcribeTimer.current = setTimeout(() => setJustTranscribed(false), 4500);
  };

  useEffect(() => {
    if (!open) {
      setSelected(null); setQty(""); setCustomDesc(""); setSearch("");
      setSelectedCategory(null); setShowingPackages(false); setSelectedPackage(null);
      setJustTranscribed(false);
      if (transcribeTimer.current) clearTimeout(transcribeTimer.current);
    } else if (isEditing) {
      // Preload from existing line item
      const sku = CATALOG.find((s) => s.sku === editItem.sku);
      if (sku) {
        setSelected(sku);
        setQty(String(editItem.qty || ""));
        setCustomDesc(editItem.customDescription || "");
        setSelectedCategory({ key: sku.category, label: sku.categoryDisplay });
      }
    }
  }, [open, isEditing, editItem]);

  // Build category list from CATALOG (preserves order), with item counts.
  const categories = useMemo(() => {
    const seen = new Map();
    CATALOG.forEach((s) => {
      if (!seen.has(s.category)) {
        seen.set(s.category, { key: s.category, label: s.categoryDisplay, count: 0, icon: s.icon, accent: s.accent, accentInk: s.accentInk });
      }
      seen.get(s.category).count += 1;
    });
    return Array.from(seen.values());
  }, []);

  // Items inside the selected category
  const categoryItems = useMemo(() => {
    if (!selectedCategory) return [];
    return CATALOG.filter((s) => s.category === selectedCategory.key);
  }, [selectedCategory]);

  // Global search results (across all categories) — only used when search is active.
  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return CATALOG.filter((s) => (
      s.title.toLowerCase().includes(q) ||
      (s.description || "").toLowerCase().includes(q) ||
      s.sku.toLowerCase().includes(q) ||
      s.categoryDisplay.toLowerCase().includes(q)
    ));
  }, [search]);

  if (!open) return null;

  const canConfirm = selected && qty && Number(qty) > 0 && (!selected.isFreeText || customDesc.trim());
  const isSearching = search.trim().length > 0;
  // Drill-down level: detail > pkgDetail > pkgList > items > search > categories
  const level = selected
    ? "detail"
    : selectedPackage
      ? "pkgDetail"
      : showingPackages
        ? "pkgList"
        : isSearching
          ? "search"
          : selectedCategory
            ? "items"
            : "categories";

  const headerTitle = (
    level === "detail"     ? (isEditing ? "Edit Line Item" : "Add Line Item") :
    level === "pkgDetail"  ? selectedPackage.title :
    level === "pkgList"    ? "Packages" :
    level === "search"     ? "Search Catalog" :
    level === "items"      ? selectedCategory.label :
                             "Select Product"
  );
  const backToCategories = () => {
    setSelectedCategory(null); setSearch("");
    setShowingPackages(false); setSelectedPackage(null);
  };

  return (
    <ModalOverlay onClose={onClose} align="bottom">
      <Card className="w-full max-h-[92%] flex flex-col" style={{ borderRadius: "16px 16px 0 0" }}>
        <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b" style={{ borderColor: T.border }}>
          <div className="flex items-center gap-2 min-w-0">
            {(level === "items" || level === "search" || level === "pkgList") && (
              <button onClick={backToCategories} className="p-0.5 active:scale-95" aria-label="Back">
                <ChevronLeft size={20} color={T.text} />
              </button>
            )}
            {level === "pkgDetail" && (
              <button onClick={() => setSelectedPackage(null)} className="p-0.5 active:scale-95" aria-label="Back">
                <ChevronLeft size={20} color={T.text} />
              </button>
            )}
            <h2 className="text-lg font-bold truncate" style={{ color: T.text }}>{headerTitle}</h2>
            <StoryBadge ids={["BWN-21", "BWN-113", "BWN-121"]} onOpen={onOpenStory} />
          </div>
          <button onClick={onClose} className="p-1 active:scale-95 flex-shrink-0"><X size={20} color={T.textSecondary} /></button>
        </div>

        {!selected ? (
          <>
            <div className="px-4 py-2 flex items-center gap-2 border-b" style={{ background: T.purpleSofter, borderColor: T.border }}>
              <Lock size={12} color={T.purpleAccent} />
              <span className="text-[11px]" style={{ color: T.purpleAccent }}>
                Office-managed catalog · Descriptions locked · Qty editable
              </span>
            </div>

            {/* Search (always available) */}
            <div className="px-4 pt-3 pb-2">
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
                style={{ background: T.surface, border: `1px solid ${T.border}` }}
              >
                <Search size={16} color={T.textSecondary} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search across all categories"
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: T.text }}
                />
                {search && (
                  <button onClick={() => setSearch("")} className="p-0.5 active:scale-95">
                    <X size={14} color={T.textSecondary} />
                  </button>
                )}
              </div>
            </div>

            {/* Breadcrumb (items level only) */}
            {level === "items" && (
              <div className="px-4 pb-2 flex items-center gap-1 text-[11px]" style={{ color: T.textSecondary }}>
                <button onClick={backToCategories} className="active:scale-95" style={{ color: T.purpleAccent }}>Catalog</button>
                <ChevronRight size={11} />
                <span className="font-semibold" style={{ color: T.text }}>{selectedCategory.label}</span>
                <span className="ml-auto text-[10px]" style={{ color: T.textTertiary }}>
                  {categoryItems.length} item{categoryItems.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}

            {/* ─── Level: Categories ─────────────────────────── */}
            {level === "categories" && (
              <div className="flex-1 overflow-y-auto px-3 pb-3">
                {/* Packages chip — one-tap multi-item bundles */}
                <button
                  onClick={() => setShowingPackages(true)}
                  className="w-full mb-3 p-3 rounded-xl text-left active:scale-[0.99] transition flex items-center gap-3"
                  style={{ background: T.purpleSofter, border: `1px dashed ${T.purpleAccent}88` }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: T.purple }}
                  >
                    <Package size={18} color="#fff" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: T.purpleAccent }}>Packages</p>
                    <p className="text-[11px]" style={{ color: T.purpleAccent, opacity: 0.85 }}>
                      One-tap bundles · {PACKAGES.length} preset{PACKAGES.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <ChevronRight size={16} color={T.purpleAccent} />
                </button>

                <p className="px-1 pb-2 text-[10px] font-bold tracking-wider uppercase" style={{ color: T.textTertiary }}>
                  Or pick a single sub-category
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => setSelectedCategory(c)}
                      className="p-3 rounded-xl text-left active:scale-[0.98] transition"
                      style={{ background: T.surface, border: `1px solid ${T.border}` }}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center mb-2"
                        style={{ background: c.accent }}
                      >
                        <c.icon size={18} color={c.accentInk} />
                      </div>
                      <p className="text-sm font-bold leading-tight" style={{ color: T.text }}>{c.label}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: T.textSecondary }}>
                        {c.count} item{c.count !== 1 ? "s" : ""}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ─── Level: Packages list ─────────────────────── */}
            {level === "pkgList" && (
              <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2 pt-2">
                <p className="px-1 pb-1 text-[11px]" style={{ color: T.textSecondary }}>
                  Tap a package to see what's included. You can adjust quantities after it's added.
                </p>
                {PACKAGES.map((p) => (
                  <Card
                    key={p.key}
                    onClick={() => setSelectedPackage(p)}
                    className="p-3 active:scale-[0.98] cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: p.accent }}>
                        <p.icon size={18} color={p.accentInk} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold leading-tight" style={{ color: T.text }}>{p.title}</h4>
                        <p className="text-[11px] leading-snug mt-0.5 mb-1.5" style={{ color: T.textSecondary }}>
                          {p.description}
                        </p>
                        <span
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold"
                          style={{ background: T.purpleSoft, color: T.purpleAccent }}
                        >
                          <Package size={10} /> {p.items.length} items
                        </span>
                      </div>
                      <ChevronRight size={16} color={T.textTertiary} className="flex-shrink-0 mt-0.5" />
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* ─── Level: Package detail ─────────────────────── */}
            {level === "pkgDetail" && (
              <div className="flex-1 overflow-y-auto px-3 pb-3 pt-2">
                <Card className="p-3 mb-3" style={{ background: T.purpleSofter, borderColor: `${T.purpleAccent}55` }}>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: selectedPackage.accent }}>
                      <selectedPackage.icon size={22} color={selectedPackage.accentInk} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold leading-tight" style={{ color: T.text }}>{selectedPackage.title}</h3>
                      <p className="text-[11px] mt-0.5" style={{ color: T.textSecondary }}>{selectedPackage.description}</p>
                    </div>
                  </div>
                </Card>
                <p className="px-1 pb-2 text-[10px] font-bold tracking-wider uppercase" style={{ color: T.textTertiary }}>
                  Included items ({selectedPackage.items.length})
                </p>
                <div className="space-y-1.5">
                  {selectedPackage.items.map((pi) => {
                    const sku = CATALOG.find((s) => s.sku === pi.sku);
                    if (!sku) return null;
                    return (
                      <div key={pi.sku} className="flex items-center gap-2.5 px-3 py-2 rounded-lg" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                        <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: sku.accent }}>
                          <sku.icon size={14} color={sku.accentInk} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold leading-tight" style={{ color: T.text }}>{sku.title}</p>
                          <p className="text-[10px]" style={{ color: T.textSecondary }}>{sku.categoryDisplay}</p>
                        </div>
                        {pi.bundled ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold flex-shrink-0" style={{ background: T.successSoft, color: T.success }}>
                            Included · $0
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold flex-shrink-0" style={{ background: T.purpleSoft, color: T.purpleAccent }}>
                            {fmt$(sku.unitPrice)} / {sku.uom}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 p-2.5 rounded-md" style={{ background: T.infoSoft, border: `1px dashed ${T.info}55` }}>
                  <p className="text-[11px] font-semibold" style={{ color: T.info }}>
                    <Info size={11} className="inline mr-1" />
                    Price is driven by the drainage system's LF. Set its quantity on the Quote Detail screen after adding the package.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onAddPackage && onAddPackage(selectedPackage);
                    onClose();
                  }}
                  className="w-full mt-3 py-3 rounded-lg text-sm font-semibold active:scale-95"
                  style={{ background: T.purple, color: "#fff" }}
                >
                  Add all {selectedPackage.items.length} items
                </button>
              </div>
            )}

            {/* ─── Level: Items in a category ─────────────────── */}
            {level === "items" && (
              <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
                {categoryItems.map((s) => (
                  <Card
                    key={s.sku}
                    onClick={() => setSelected(s)}
                    className="p-3 active:scale-[0.98] cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: s.accent }}>
                        <s.icon size={18} color={s.accentInk} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-0.5">
                          <h4 className="text-sm font-bold leading-tight" style={{ color: T.text }}>{s.title}</h4>
                          {s.isFreeText ? (
                            <Pill bg={T.tilePink} ink={T.tilePinkInk}>CUSTOM</Pill>
                          ) : (
                            <Pill bg={T.purpleSoft} ink={T.purpleAccent}>{s.uom}</Pill>
                          )}
                        </div>
                        <p className="text-[11px] mb-1.5" style={{ color: T.textSecondary }}>
                          {s.sku}
                        </p>
                        <p className="text-[11px] leading-snug line-clamp-2" style={{ color: T.textSecondary }}>
                          {s.isFreeText ? "Free-text description — rep types description per job." : s.description}
                        </p>
                        {!s.isFreeText && (
                          <div className="mt-1.5">
                            <span
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold"
                              style={{ background: T.successSoft, color: T.success }}
                            >
                              {fmt$(s.unitPrice)}/{s.uom}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* ─── Level: Search results (flat across categories) ── */}
            {level === "search" && (
              <>
                <div className="px-4 pb-1.5 flex items-center justify-between">
                  <p className="text-[10px]" style={{ color: T.textTertiary }}>
                    {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} across all categories
                  </p>
                  <button
                    onClick={() => setSearch("")}
                    className="text-[10px] font-semibold active:scale-95"
                    style={{ color: T.purpleAccent }}
                  >
                    Clear search
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
                  {searchResults.length === 0 && (
                    <div className="text-center py-10">
                      <p className="text-xs" style={{ color: T.textSecondary }}>No products match "{search}".</p>
                    </div>
                  )}
                  {searchResults.map((s) => (
                    <Card
                      key={s.sku}
                      onClick={() => setSelected(s)}
                      className="p-3 active:scale-[0.98] cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: s.accent }}>
                          <s.icon size={18} color={s.accentInk} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-0.5">
                            <h4 className="text-sm font-bold leading-tight" style={{ color: T.text }}>{s.title}</h4>
                            {s.isFreeText ? (
                              <Pill bg={T.tilePink} ink={T.tilePinkInk}>CUSTOM</Pill>
                            ) : (
                              <Pill bg={T.purpleSoft} ink={T.purpleAccent}>{s.uom}</Pill>
                            )}
                          </div>
                          <p className="text-[11px] mb-1.5" style={{ color: T.textSecondary }}>
                            {s.sku} · {s.categoryDisplay}
                          </p>
                          <p className="text-[11px] leading-snug line-clamp-2" style={{ color: T.textSecondary }}>
                            {s.isFreeText ? "Free-text description — rep types description per job." : s.description}
                          </p>
                          {!s.isFreeText && (
                            <div className="mt-1.5 flex items-center gap-2">
                              <span
                                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold"
                                style={{ background: T.successSoft, color: T.success }}
                              >
                                {fmt$(s.unitPrice)}/{s.uom}
                              </span>
                              <span className="text-[10px]" style={{ color: T.textTertiary }}>
                                hidden from customer
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex-1 overflow-y-auto p-4">
            {!isEditing && (
              <button
                onClick={() => setSelected(null)}
                className="flex items-center gap-1 text-xs font-semibold mb-3 active:scale-95"
                style={{ color: T.purpleAccent }}
              >
                <ChevronLeft size={14} /> Back to {selectedCategory ? selectedCategory.label : "search"}
              </button>
            )}
            <Card className="p-3 mb-3" style={{ background: T.surfaceAlt }}>
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: selected.accent }}>
                  <selected.icon size={32} color={selected.accentInk} strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold leading-tight" style={{ color: T.text }}>{selected.title}</h3>
                  <p className="text-[11px] mt-0.5" style={{ color: T.textSecondary }}>{selected.sku} · {selected.categoryDisplay}</p>
                  {!selected.isFreeText && (
                    <span
                      className="inline-flex items-center mt-2 px-1.5 py-0.5 rounded text-[10px] font-bold"
                      style={{ background: T.successSoft, color: T.success }}
                    >
                      {fmt$(selected.unitPrice)}/{selected.uom}
                    </span>
                  )}
                </div>
              </div>
            </Card>

            {selected.isFreeText ? (
              <FormField label="Description" required>
                <div className="relative">
                  <textarea
                    value={customDesc}
                    onChange={(e) => { setCustomDesc(e.target.value); if (justTranscribed) setJustTranscribed(false); }}
                    placeholder="Type the custom work description for this line item…"
                    rows={4}
                    className="w-full px-3 pr-12 py-2.5 rounded-lg outline-none text-sm resize-none transition-colors"
                    style={{
                      background: justTranscribed ? "#fef9c3" : T.surface,
                      border: `1px solid ${justTranscribed ? "#f59e0b" : T.border}`,
                      color: T.text,
                    }}
                  />
                  <div className="absolute right-2 bottom-2">
                    <VoiceMicButton
                      sample="customDesc"
                      onTranscribe={(t) => { setCustomDesc(customDesc ? `${customDesc} ${t}` : t); flashTranscribed(); }}
                    />
                  </div>
                </div>
                {justTranscribed && (
                  <button
                    onClick={() => setJustTranscribed(false)}
                    className="mt-1.5 text-[11px] font-semibold active:scale-95"
                    style={{ color: "#b45309" }}
                  >
                    <Pencil size={10} className="inline mr-1" /> Review transcription · tap text to edit
                  </button>
                )}
              </FormField>
            ) : (
              <FormField label="Description">
                <div className="px-3 py-3 rounded-lg text-xs leading-relaxed" style={{ background: T.surfaceAlt, color: T.textSecondary, border: `1px solid ${T.border}` }}>
                  <Lock size={11} className="inline mr-1" /> {selected.description}
                </div>
              </FormField>
            )}

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Quantity" required>
                <TextInput value={qty} onChange={setQty} placeholder="64" type="number" />
              </FormField>
              <FormField label="Unit (UoM)">
                <TextInput value={selected.uom} readOnly />
              </FormField>
            </div>

            {!selected.isFreeText && qty && Number(qty) > 0 && (
              <Card className="p-3 mb-3" style={{ background: T.successSoft, borderColor: `${T.success}33` }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: T.success }}>
                    {qty} {selected.uom} × {fmt$(selected.unitPrice)}
                  </span>
                  <span className="text-base font-extrabold" style={{ color: T.success }}>
                    {fmt$(Number(qty) * selected.unitPrice)}
                  </span>
                </div>
              </Card>
            )}

            <button
              disabled={!canConfirm}
              onClick={() => {
                if (isEditing) {
                  onSaveEdit && onSaveEdit(editItem.id, { qty: Number(qty), customDescription: customDesc || null });
                } else {
                  onAdd && onAdd({ sku: selected.sku, qty: Number(qty), customDescription: customDesc || null });
                }
              }}
              className="w-full py-3 rounded-lg text-sm font-semibold active:scale-95 disabled:opacity-50"
              style={{ background: T.purple, color: "#fff" }}
            >
              {isEditing ? "Save changes" : "Add to Quote"}
            </button>
          </div>
        )}
      </Card>
    </ModalOverlay>
  );
};

// ============================================================================
// 6. ALL MENUS BOTTOM SHEET (Image 6 bottom half)
// ============================================================================
const AllMenusSheet = ({ open, onClose, onOpenNotes, onOpenLineItem, onOpenActivity, onOpenEmails, onOpenMessages, onOpenGallery, onOpenStory }) => {
  if (!open) return null;
  const items = [
    { key: "line",       label: "Line Item",  icon: Plus,           onClick: onOpenLineItem },
    { key: "note",       label: "Add Note",   icon: FileText,       onClick: onOpenNotes },
    { key: "activities", label: "Activities", icon: Clock,          onClick: onOpenActivity },
    { key: "emails",     label: "Emails",     icon: Mail,           onClick: onOpenEmails },
    { key: "messages",   label: "Messages",   icon: MessageSquare,  onClick: onOpenMessages },
    { key: "gallery",    label: "Gallery",    icon: Camera,         onClick: onOpenGallery },
  ];
  return (
    <ModalOverlay onClose={onClose} align="bottom">
      <Card className="w-full px-5 pt-5 pb-8" style={{ borderRadius: "16px 16px 0 0" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold" style={{ color: T.text }}>All Menus</h2>
            <StoryBadge ids={["BWN-22"]} onOpen={onOpenStory} />
          </div>
          <button onClick={onClose} className="p-1 active:scale-95">
            <X size={22} color={T.text} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {items.map((it) => (
            <button
              key={it.key}
              onClick={() => { onClose(); it.onClick && it.onClick(); }}
              className="relative flex items-center gap-3 px-3.5 py-3 rounded-xl active:scale-95 transition"
              style={{
                background: T.purpleSoft,
                border: `1px solid ${T.purpleAccent}33`,
                boxShadow: "0 1px 0 rgba(91,45,142,0.05)",
              }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: T.purple }}>
                <it.icon size={18} color="#fff" />
              </div>
              <span className="text-sm font-semibold text-left flex-1" style={{ color: T.purpleDark }}>
                {it.label}
              </span>
            </button>
          ))}
        </div>
      </Card>
    </ModalOverlay>
  );
};

// ============================================================================
// 7. BASEMENT PREP SCREEN — 11 sub-items (BWN-111, D9)
// ============================================================================
const BasementPrepScreen = ({ items, onBack, onSave, onOpenStory }) => {
  const [state, setState] = useState(items);
  const [recentTranscribed, setRecentTranscribed] = useState(null);
  const transcribeTimer = useRef(null);
  const flashTranscribed = (key) => {
    setRecentTranscribed(key);
    if (transcribeTimer.current) clearTimeout(transcribeTimer.current);
    transcribeTimer.current = setTimeout(() => setRecentTranscribed(null), 4500);
  };
  useEffect(() => () => { if (transcribeTimer.current) clearTimeout(transcribeTimer.current); }, []);
  const update = (key, patch) => setState((s) => s.map((it) => (it.key === key ? { ...it, ...patch } : it)));
  const groups = useMemo(() => {
    const order = ["Customer Responsibilities", "BWN Responsibilities", "Specified Location"];
    const out = {};
    state.forEach((it) => { (out[it.group] = out[it.group] || []).push(it); });
    return order.filter((g) => out[g]).map((g) => ({ group: g, items: out[g] }));
  }, [state]);
  const selectedCount = state.filter((s) => s.selected).length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <AppHeader
        title="Basement Preparations"
        subtitle={`${selectedCount} of 11 items selected`}
        onBack={onBack}
        right={<StoryBadge ids={["BWN-111"]} onOpen={onOpenStory} />}
      />
      <div className="flex-1 overflow-y-auto px-4 pb-32">
        <div className="mt-1 mb-3 p-3 rounded-lg" style={{ background: T.purpleSofter, border: `1px dashed ${T.purpleAccent}55` }}>
          <p className="text-[12px] leading-relaxed" style={{ color: T.purpleAccent }}>
            <Info size={12} className="inline mr-1" />
            Tap items the customer is responsible for or that affect the work. Edit the default text per job, or dictate with the mic.
          </p>
        </div>
        {groups.map((g) => {
          const groupSelected = g.items.filter((i) => i.selected).length;
          return (
          <div key={g.group} className="mb-4">
            <SectionLabel right={
              <span className="text-[10px] font-bold" style={{ color: groupSelected > 0 ? T.purpleAccent : T.textTertiary }}>
                {groupSelected} of {g.items.length}
              </span>
            }>{g.group}</SectionLabel>
            <Card className="overflow-hidden">
              {g.items.map((it, idx) => (
                <div
                  key={it.key}
                  className="px-3 py-3 transition-colors"
                  style={{
                    borderTop: idx === 0 ? "none" : `1px solid ${T.borderSoft}`,
                    background: it.selected ? T.purpleSofter : "transparent",
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <button
                        onClick={() => update(it.key, { selected: !it.selected })}
                        className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 active:scale-95"
                        style={{
                          background: it.selected ? T.purple : T.surface,
                          border: `1px solid ${it.selected ? T.purple : T.border}`,
                        }}
                      >
                        {it.selected && <Check size={12} color="#fff" />}
                      </button>
                      <span className="text-sm font-semibold leading-tight" style={{ color: T.text }}>
                        {it.label}
                      </span>
                    </div>
                  </div>
                  {it.selected && (
                    <>
                      <div className="relative">
                        <textarea
                          value={it.boilerplate}
                          onChange={(e) => { update(it.key, { boilerplate: e.target.value }); if (recentTranscribed === it.key) setRecentTranscribed(null); }}
                          rows={2}
                          className="w-full pl-3 pr-10 py-2 rounded-md text-xs leading-relaxed outline-none resize-none transition-colors"
                          style={{
                            background: recentTranscribed === it.key ? "#fef9c3" : T.surfaceAlt,
                            border: `1px solid ${recentTranscribed === it.key ? "#f59e0b" : T.borderSoft}`,
                            color: T.textSecondary,
                          }}
                        />
                        <div className="absolute right-1.5 top-1.5">
                          <VoiceMicButton
                            sample={
                              it.key === "itemsToMove" ? "itemsToMove" :
                              it.key === "itemsToStay" ? "itemsToStay" :
                              it.key === "sumpPumpLocation" ? "sumpLocation" :
                              it.key === "otherNotes" ? "otherNotes" : "basementPrep"
                            }
                            onTranscribe={(text) => { update(it.key, { boilerplate: it.boilerplate ? `${it.boilerplate} ${text}` : text }); flashTranscribed(it.key); }}
                          />
                        </div>
                      </div>
                      {recentTranscribed === it.key && (
                        <button
                          onClick={() => setRecentTranscribed(null)}
                          className="mt-1 text-[10px] font-semibold active:scale-95"
                          style={{ color: "#b45309" }}
                        >
                          <Pencil size={9} className="inline mr-1" /> Review transcription · tap text to edit
                        </button>
                      )}
                    </>
                  )}
                </div>
              ))}
            </Card>
          </div>
          );
        })}
      </div>
      <div className="absolute bottom-0 left-0 right-0 px-4 py-3 border-t" style={{ background: T.surface, borderColor: T.border }}>
        <button
          onClick={() => onSave(state)}
          className="w-full py-3 rounded-lg text-sm font-semibold active:scale-95"
          style={{ background: T.purple, color: "#fff" }}
        >
          Save · {selectedCount} item{selectedCount !== 1 ? "s" : ""} selected
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// 7b. CUSTOMER PREPARATION CHECKLIST SCREEN (BWN-130)
//     Verbatim digitization of the BWN paper "Customer Preparation Checklist".
// ============================================================================
const DISPOSITIONS = [
  { v: "move", label: "Move", ink: "#166534", bg: T.successSoft, bd: "#86efac" },
  { v: "stay", label: "Stay", ink: "#c2410c", bg: T.warningSoft, bd: "#fdba74" },
  { v: "na",   label: "N/A",  ink: T.textSecondary, bg: "#f3f4f6", bd: "#d1d5db" },
];

const ChecklistAckRow = ({ icon: Icon, checked, onToggle, children }) => (
  <button
    onClick={onToggle}
    className="w-full flex items-start gap-2.5 p-2.5 rounded-lg text-left active:scale-[0.99] transition-colors mb-1.5"
    style={{ background: checked ? T.purpleSofter : T.surface, border: `1px solid ${checked ? `${T.purple}55` : T.border}` }}
  >
    <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
      style={{ background: checked ? T.purple : T.surface, border: `1px solid ${checked ? T.purple : T.border}` }}>
      {checked && <Check size={12} color="#fff" />}
    </div>
    <span className="text-[11px] leading-relaxed flex-1" style={{ color: T.textSecondary }}>
      {Icon && <Icon size={12} className="inline mr-1" style={{ verticalAlign: "-1px", color: T.textTertiary }} />}
      {children}
    </span>
  </button>
);

const PrepChecklistScreen = ({ value, customerName, onBack, onSave, onOpenStory }) => {
  const C = PREP_CHECKLIST_COPY;
  const [st, setSt] = useState(value || makeDefaultPrepChecklist());
  const [recent, setRecent] = useState(null);
  const timer = useRef(null);
  const flash = (k) => { setRecent(k); if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => setRecent(null), 4500); };
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const setItem = (k, v) => setSt((s) => ({ ...s, items: { ...s.items, [k]: v } }));
  const setField = (patch) => setSt((s) => ({ ...s, ...patch }));
  const setAck = (k) => setSt((s) => ({ ...s, acks: { ...s.acks, [k]: !s.acks[k] } }));
  const toggleSump = (k) => setSt((s) => ({ ...s, sumpLocations: s.sumpLocations.includes(k) ? s.sumpLocations.filter((x) => x !== k) : [...s.sumpLocations, k] }));

  const stayCount = PREP_CHECKLIST_ITEMS.filter((it) => st.items[it.key] === "stay").length;
  const naCount   = PREP_CHECKLIST_ITEMS.filter((it) => st.items[it.key] === "na").length;
  const moveCount = PREP_CHECKLIST_ITEMS.length - stayCount - naCount;
  const specifiedOn = st.sumpLocations.includes("specified");

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <AppHeader
        title="Customer Preparation Checklist"
        subtitle={`${moveCount} move · ${stayCount} stay · ${naCount} N/A · ${C.version}`}
        onBack={onBack}
        right={<StoryBadge ids={["BWN-130"]} onOpen={onOpenStory} />}
      />
      <div className="flex-1 overflow-y-auto px-4 pb-32">
        {/* Instructions */}
        <div className="mt-1 mb-3 p-3 rounded-lg" style={{ background: T.purpleSofter, border: `1px dashed ${T.purpleAccent}55` }}>
          <p className="text-[12px] leading-relaxed mb-1" style={{ color: T.purpleAccent }}>
            <Info size={12} className="inline mr-1" style={{ verticalAlign: "-1px" }} />
            {C.itemsIntro1}
          </p>
          <p className="text-[11px] leading-relaxed" style={{ color: T.textSecondary }}>{C.itemsIntro2}</p>
        </div>

        {/* Name + Contract Date */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="p-2.5 rounded-lg" style={{ background: T.surfaceAlt, border: `1px solid ${T.borderSoft}` }}>
            <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: T.textTertiary }}>Name</p>
            <p className="text-xs font-semibold truncate" style={{ color: T.text }}>{customerName}</p>
          </div>
          <div className="p-2.5 rounded-lg" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: T.textTertiary }}>Contract date</p>
            <input
              type="date"
              value={st.contractDate}
              onChange={(e) => setField({ contractDate: e.target.value })}
              className="text-xs font-semibold outline-none w-full bg-transparent"
              style={{ color: T.text }}
            />
          </div>
        </div>

        {/* Fee warning */}
        {stayCount > 0 && (
          <div className="mb-3 p-2.5 rounded-lg" style={{ background: T.warningSoft, border: `1px solid ${T.warning}66` }}>
            <p className="text-[11px] font-semibold leading-relaxed" style={{ color: T.warning }}>
              <AlertTriangle size={12} className="inline mr-1" style={{ verticalAlign: "-1px" }} />
              {stayCount} item{stayCount !== 1 ? "s" : ""} staying in place — later access is required and a service fee may apply for BWN to return.
            </p>
          </div>
        )}

        {/* Items grid */}
        <SectionLabel right={<span className="text-[10px] font-bold" style={{ color: T.purpleAccent }}>{PREP_CHECKLIST_ITEMS.length} items</span>}>
          Items in the work area
        </SectionLabel>
        <Card className="overflow-hidden mb-2">
          {PREP_CHECKLIST_ITEMS.map((it, idx) => (
            <div key={it.key} className="flex items-center gap-2 px-3 py-2.5" style={{ borderTop: idx === 0 ? "none" : `1px solid ${T.borderSoft}` }}>
              <span className="text-[12px] font-semibold leading-tight flex-1 min-w-0" style={{ color: T.text }}>{it.label}</span>
              <div className="flex gap-0.5 p-0.5 rounded-lg flex-shrink-0" style={{ background: T.surfaceAlt }}>
                {DISPOSITIONS.map((d) => {
                  const on = st.items[it.key] === d.v;
                  return (
                    <button
                      key={d.v}
                      onClick={() => setItem(it.key, d.v)}
                      className="text-[10px] font-bold rounded-md active:scale-95"
                      style={{
                        width: 42, padding: "5px 0",
                        background: on ? d.bg : "transparent",
                        color: on ? d.ink : T.textTertiary,
                        border: `1px solid ${on ? d.bd : "transparent"}`,
                      }}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </Card>

        {/* NOTES */}
        <div className="relative mb-5">
          <textarea
            value={st.itemsNotes}
            onChange={(e) => { setField({ itemsNotes: e.target.value }); if (recent === "itemsNotes") setRecent(null); }}
            rows={2}
            placeholder="Notes — anything the crew should know about these items…"
            className="w-full pl-3 pr-10 py-2 rounded-md text-xs leading-relaxed outline-none resize-none"
            style={{ background: recent === "itemsNotes" ? "#fef9c3" : T.surfaceAlt, border: `1px solid ${recent === "itemsNotes" ? "#f59e0b" : T.borderSoft}`, color: T.textSecondary }}
          />
          <div className="absolute right-1.5 top-1.5">
            <VoiceMicButton sample="basementPrep" onTranscribe={(t) => { setField({ itemsNotes: st.itemsNotes ? `${st.itemsNotes} ${t}` : t }); flash("itemsNotes"); }} />
          </div>
        </div>

        {/* Walls + Floors */}
        <div className="mb-3 p-2.5 rounded-lg" style={{ background: T.infoSoft, border: `1px solid ${T.info}33` }}>
          <p className="text-[11px] leading-relaxed" style={{ color: T.info }}>{C.wallsFloorsHeading}</p>
        </div>

        {[{ key: "walls", label: "Walls", opts: C.walls, note: C.wallStayNote, ack: "wallStayFee", ackLabel: "Customer understands wall coverings left in place require later access + possible service fee." },
          { key: "floors", label: "Floors", opts: C.floors, note: C.floorNote, ack: "floorReplace", ackLabel: "Customer understands replacement and reinstallation of disturbed floor coverings is their responsibility." }].map((grp) => (
          <div key={grp.key} className="mb-4">
            <SectionLabel>{grp.label}</SectionLabel>
            <Card className="overflow-hidden mb-2">
              {grp.opts.map((o, idx) => {
                const on = st[grp.key] === o.key;
                return (
                  <button key={o.key} onClick={() => setField({ [grp.key]: o.key })}
                    className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left active:scale-[0.99]"
                    style={{ borderTop: idx === 0 ? "none" : `1px solid ${T.borderSoft}`, background: on ? T.purpleSofter : "transparent" }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ border: `1.5px solid ${on ? T.purple : T.border}` }}>
                      {on && <div className="w-2.5 h-2.5 rounded-full" style={{ background: T.purple }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold" style={{ color: T.text }}>{o.label}</p>
                      <p className="text-[10px] leading-snug mt-0.5" style={{ color: T.textSecondary }}>{o.desc}</p>
                    </div>
                  </button>
                );
              })}
            </Card>
            <ChecklistAckRow icon={AlertCircle} checked={st.acks[grp.ack]} onToggle={() => setAck(grp.ack)}>{grp.ackLabel}</ChecklistAckRow>
          </div>
        ))}

        {/* Dust */}
        <SectionLabel>Dust</SectionLabel>
        <div className="mb-2 p-2.5 rounded-lg" style={{ background: T.surfaceAlt, border: `1px solid ${T.borderSoft}` }}>
          <p className="text-[11px] font-bold mb-2" style={{ color: T.text }}>{C.dustHeading}</p>
          <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: T.purpleAccent }}>Customer preparations</p>
          <ul className="mb-2 space-y-0.5">
            {C.dustCustomer.map((b, i) => <li key={i} className="text-[10px] leading-snug" style={{ color: T.textSecondary }}>• {b}</li>)}
          </ul>
          <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: T.purpleAccent }}>BWN preparations</p>
          <ul className="space-y-0.5">
            {C.dustBwn.map((b, i) => <li key={i} className="text-[10px] leading-snug" style={{ color: T.textSecondary }}>• {b}</li>)}
          </ul>
        </div>
        <ChecklistAckRow icon={Droplets} checked={st.acks.dust} onToggle={() => setAck("dust")}>
          Customer is prepared for a substantial amount of dust and will move items to the center and cover with plastic; furnace / AC shut down during jackhammering.
        </ChecklistAckRow>

        {/* Sump pump */}
        <div className="mt-3">
          <SectionLabel>Sump pump</SectionLabel>
          <div className="mb-2 p-2.5 rounded-lg" style={{ background: T.surfaceAlt, border: `1px solid ${T.borderSoft}` }}>
            <p className="text-[11px] font-bold mb-1.5" style={{ color: T.text }}>{C.sumpHeading}</p>
            <ul className="space-y-0.5">
              {C.sumpBullets.map((b, i) => <li key={i} className="text-[10px] leading-snug" style={{ color: T.textSecondary }}>• {b}</li>)}
            </ul>
          </div>
          <ChecklistAckRow icon={Info} checked={st.acks.sumpPower} onToggle={() => setAck("sumpPower")}>
            Sump pump will be connected to a working electric outlet at all times; supplying electric power is customer responsibility.
          </ChecklistAckRow>
          <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5 mt-2" style={{ color: T.textSecondary }}>Location</p>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {C.sumpLocations.map((loc) => {
              const on = st.sumpLocations.includes(loc.key);
              return (
                <button key={loc.key} onClick={() => toggleSump(loc.key)}
                  className="text-[11px] font-semibold px-3 py-1.5 rounded-full active:scale-95"
                  style={{ background: on ? T.purple : T.surface, color: on ? "#fff" : T.textSecondary, border: `1px solid ${on ? T.purple : T.border}` }}>
                  {loc.label}
                </button>
              );
            })}
          </div>
          {specifiedOn && (
            <div className="relative mb-2">
              <textarea
                value={st.sumpSpecified}
                onChange={(e) => { setField({ sumpSpecified: e.target.value }); if (recent === "sump") setRecent(null); }}
                rows={2}
                placeholder="Describe the specified sump pump location…"
                className="w-full pl-3 pr-10 py-2 rounded-md text-xs leading-relaxed outline-none resize-none"
                style={{ background: recent === "sump" ? "#fef9c3" : T.surfaceAlt, border: `1px solid ${recent === "sump" ? "#f59e0b" : T.borderSoft}`, color: T.textSecondary }}
              />
              <div className="absolute right-1.5 top-1.5">
                <VoiceMicButton sample="sumpLocation" onTranscribe={(t) => { setField({ sumpSpecified: st.sumpSpecified ? `${st.sumpSpecified} ${t}` : t }); flash("sump"); }} />
              </div>
            </div>
          )}
        </div>

        {/* Other items */}
        <div className="mt-3">
          <SectionLabel>Other items · special notes</SectionLabel>
          <ChecklistAckRow icon={Flame} checked={st.acks.fireplaces} onToggle={() => setAck("fireplaces")}>{C.fireplaces}</ChecklistAckRow>
          <ChecklistAckRow icon={Radiation} checked={st.acks.radon} onToggle={() => setAck("radon")}>{C.radon}</ChecklistAckRow>
        </div>

        {/* Acknowledgment */}
        <div className="mt-4 p-3 rounded-xl" style={{ background: T.purpleSofter, border: `1px solid ${T.border}` }}>
          <p className="text-[11px] leading-relaxed mb-2" style={{ color: T.text }}>“{C.acknowledgment}”</p>
          <div className="flex items-center gap-2 justify-center p-2.5 rounded-lg" style={{ background: T.surface, border: `1px dashed ${T.purpleAccent}66` }}>
            <PenTool size={14} color={T.purpleAccent} />
            <span className="text-[12px] font-semibold" style={{ color: T.purpleAccent }}>Signature point #3 · captured at Sign</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-4 py-3 border-t" style={{ background: T.surface, borderColor: T.border }}>
        <button
          onClick={() => onSave(st)}
          className="w-full py-3 rounded-lg text-sm font-semibold active:scale-95"
          style={{ background: T.purple, color: "#fff" }}
        >
          Save checklist{stayCount > 0 ? ` · ${stayCount} staying` : ""}
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// 8. NOTES SCREEN (BWN-112)
// ============================================================================
const NotesScreen = ({ value, includeInPdf, onBack, onSave, onOpenStory }) => {
  const [text, setText] = useState(value || "");
  const [include, setInclude] = useState(includeInPdf || false);
  const [justTranscribed, setJustTranscribed] = useState(false);
  const transcribeTimer = useRef(null);
  const flashTranscribed = () => {
    setJustTranscribed(true);
    if (transcribeTimer.current) clearTimeout(transcribeTimer.current);
    transcribeTimer.current = setTimeout(() => setJustTranscribed(false), 4500);
  };
  useEffect(() => () => { if (transcribeTimer.current) clearTimeout(transcribeTimer.current); }, []);
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <AppHeader
        title="Internal Notes"
        subtitle="Persisted notes for your team"
        onBack={onBack}
        right={<StoryBadge ids={["BWN-112"]} onOpen={onOpenStory} />}
      />
      <div className="flex-1 overflow-y-auto p-4">
        <Card className="p-4 mb-3" style={{ background: justTranscribed ? "#fef9c3" : T.surface, transition: "background-color 0.2s" }}>
          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); if (justTranscribed) setJustTranscribed(false); }}
            placeholder="Type or dictate your notes here. These persist on the quote record and are visible to your team."
            rows={7}
            className="w-full text-sm leading-relaxed outline-none resize-none bg-transparent"
            style={{ color: T.text }}
          />
          <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: `1px solid ${T.borderSoft}` }}>
            <div className="flex items-center gap-2">
              <VoiceMicButton
                sample="internalNotes"
                size="md"
                onTranscribe={(t) => { setText(text ? `${text}\n${t}` : t); flashTranscribed(); }}
              />
              <span className="text-[11px]" style={{ color: T.textSecondary }}>Tap to dictate</span>
            </div>
            <span className="text-[10px]" style={{ color: T.textTertiary }}>
              {text.length} character{text.length !== 1 ? "s" : ""} · {text.trim().split(/\s+/).filter(Boolean).length} word{text.trim().split(/\s+/).filter(Boolean).length !== 1 ? "s" : ""}
            </span>
          </div>
          {justTranscribed && (
            <button
              onClick={() => setJustTranscribed(false)}
              className="mt-2 text-[11px] font-semibold active:scale-95"
              style={{ color: "#b45309" }}
            >
              <Pencil size={10} className="inline mr-1" /> Review transcription · tap text to edit
            </button>
          )}
        </Card>

        <Card className="p-3 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold" style={{ color: T.text }}>Include in customer PDF</p>
              <p className="text-[11px] mt-0.5" style={{ color: T.textSecondary }}>
                Off by default · prints as 'Additional Information' on contract
              </p>
            </div>
            <Toggle on={include} onChange={setInclude} />
          </div>
        </Card>

        {include && (
          <Card className="p-3 mb-3" style={{ background: T.successSoft, borderColor: `${T.success}55` }}>
            <div className="flex items-center gap-2 mb-1.5">
              <Eye size={12} color={T.success} />
              <span className="text-[11px] font-bold tracking-wider uppercase" style={{ color: T.success }}>Will print on customer PDF</span>
            </div>
            <div className="px-3 py-2.5 rounded-md bg-white" style={{ border: `1px solid ${T.success}33` }}>
              <p className="text-[10px] font-bold mb-1" style={{ color: T.textSecondary }}>Additional Information</p>
              <p className="text-[11px] leading-relaxed whitespace-pre-wrap" style={{ color: T.text }}>
                {text || <span style={{ color: T.textTertiary, fontStyle: "italic" }}>(empty — add notes above)</span>}
              </p>
            </div>
          </Card>
        )}
      </div>
      <div className="px-4 py-3 border-t" style={{ background: T.surface, borderColor: T.border }}>
        <button
          onClick={() => onSave({ notes: text, notesIncludedInPdf: include })}
          className="w-full py-3 rounded-lg text-sm font-semibold active:scale-95"
          style={{ background: T.purple, color: "#fff" }}
        >
          Save Note
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// 9. GENERATE QUOTE MODAL (BWN-106)
// ============================================================================
const GenerateQuoteModal = ({ open, onClose, estimate, onGenerate, onOpenStory, orgConfig }) => {
  const [validUntil, setValidUntil] = useState(estimate?.validUntil || "2026-06-11");
  const [deposit, setDeposit] = useState(String(estimate?.deposit ?? 5000));
  const [homeowner65, setHomeowner65] = useState(estimate?.customer.is65OrOlder ?? false);
  const [includeBasementPrep, setIncludeBasementPrep] = useState(true);
  const [includeScopeOfWork, setIncludeScopeOfWork] = useState(orgConfig?.scopeOfWorkDefault ?? false);
  const [formOfPayment, setFormOfPayment] = useState(estimate?.formOfPayment || "Check");
  const triggersRrp = estimate?.customer.yearBuilt < 1978;
  const isFinanced = formOfPayment === "Financed";

  useEffect(() => {
    if (open && estimate) {
      setHomeowner65(estimate.customer.is65OrOlder);
      setDeposit(String(estimate.deposit ?? 5000));
      setValidUntil(estimate.validUntil);
      setFormOfPayment(estimate.formOfPayment || "Check");
      setIncludeScopeOfWork(orgConfig?.scopeOfWorkDefault ?? false);
    }
  }, [open, estimate, orgConfig]);

  // BWN-117: Financed → deposit auto-$0 (read-only)
  useEffect(() => { if (isFinanced) setDeposit("0"); }, [isFinanced]);

  const cycleFop = () => {
    const i = FOP_OPTIONS.indexOf(formOfPayment);
    setFormOfPayment(FOP_OPTIONS[(i + 1) % FOP_OPTIONS.length]);
  };

  if (!open || !estimate) return null;
  return (
    <ModalOverlay onClose={onClose} align="center">
      <Card className="w-full mx-3 flex flex-col" style={{ maxWidth: 360, maxHeight: "calc(100% - 24px)" }}>
        <div className="px-5 pt-5 pb-2 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-bold" style={{ color: T.text }}>Generate Quote</h2>
          <StoryBadge ids={["BWN-106"]} onOpen={onOpenStory} />
        </div>
        <div className="px-5 pb-3 overflow-y-auto flex-1 min-h-0">
          {/* ─── Money ────────────────────────────── */}
          <div className="flex items-center gap-1.5 mt-1 mb-2">
            <DollarSign size={11} color={T.textSecondary} />
            <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: T.textSecondary }}>Money</span>
          </div>

          <FormField label="Valid Until"
            hint={`Default = creation + ${orgConfig?.validUntilDefaultDays ?? 30} days · re-issue resets if expired`}>
            <TextInput value={validUntil} onChange={setValidUntil} type="date" />
          </FormField>

          <FormField label="Form of Payment"
            hint={isFinanced
              ? "Financed → deposit auto-$0, balance due on completion. Informational financing block prints on PDF."
              : "Check / Credit Card / Cash / Financed / Other."
            }>
            <SelectField value={formOfPayment} onClick={cycleFop} />
          </FormField>

          {isFinanced ? (
            <FormField label="Deposit Amount" hint="Auto-zeroed because Form of Payment = Financed.">
              <div className="flex items-center justify-between gap-2 px-3 py-3 rounded-lg" style={{ background: T.warningSoft, border: `1px solid ${T.warning}55` }}>
                <span className="inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: T.warning }}>
                  <Lock size={12} /> Locked → $0
                </span>
                <span className="text-[11px]" style={{ color: T.warning, opacity: 0.8 }}>Financed</span>
              </div>
            </FormField>
          ) : (
            <FormField label="Deposit Amount" hint="Customer deposit on signing.">
              <TextInput value={deposit} onChange={setDeposit} prefix="$" type="number" />
            </FormField>
          )}

          {/* ─── Customer ─────────────────────────── */}
          <div className="flex items-center gap-1.5 mt-4 mb-2">
            <User size={11} color={T.textSecondary} />
            <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: T.textSecondary }}>Customer</span>
          </div>

          <FormField
            label="Homeowner 65+"
            hint={homeowner65 && estimate.customer.state === "MD"
              ? "MD Homeowner 65+ → 7 business-day cancellation window"
              : estimate.customer.state === "MD" ? "MD Standard → 5 business-day cancellation window"
              : `${estimate.customer.state} → 3 business-day cancellation window`
            }
          >
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: T.surfaceAlt, border: `1px solid ${T.border}` }}>
              <span className="text-sm" style={{ color: T.text }}>{homeowner65 ? "Yes" : "No"}</span>
              <Toggle on={homeowner65} onChange={setHomeowner65} />
            </div>
          </FormField>

          {/* ─── PDF Options ──────────────────────── */}
          <div className="flex items-center gap-1.5 mt-4 mb-2">
            <FileText size={11} color={T.textSecondary} />
            <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: T.textSecondary }}>PDF Options</span>
          </div>

          <FormField label="Scope of Work" hint="Descriptions already include scope. AI scope summary is not available in this release.">
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, opacity: 0.6 }}>
              <span className="text-sm" style={{ color: T.textSecondary }}>Add AI scope summary</span>
              <Toggle on={false} disabled />
            </div>
          </FormField>

          {/* Pre-Renovation Lead Form auto-toggle (BWN-115) — only shown when relevant */}
          {triggersRrp && (
            <Card className="p-3 mb-3" style={{ background: T.warningSoft, borderColor: `${T.warning}55` }}>
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} color={T.warning} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold" style={{ color: T.warning }}>
                    Pre-Renovation Lead Form will auto-include
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: T.warning, opacity: 0.9 }}>
                    Year Built {estimate.customer.yearBuilt} &lt; 1978 → Federal RRP compliance required. Page 9 added automatically.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {triggersRrp && estimate.customer.occupancy === "tenant" && (
            <Card className="p-3 mb-3" style={{ background: T.warningSoft, borderColor: `${T.warning}55` }}>
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} color={T.warning} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold" style={{ color: T.warning }}>Tenant self-cert reveal</p>
                  <p className="text-[11px] mt-0.5" style={{ color: T.warning, opacity: 0.9 }}>
                    Occupancy = Tenant → Pre-Renovation Lead Form includes tenant self-cert section.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
        <div className="border-t px-5 py-3 flex gap-2 flex-shrink-0" style={{ background: T.surface, borderColor: T.border }}>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-lg text-sm font-semibold active:scale-95"
            style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.text }}
          >
            Cancel
          </button>
          <button
            onClick={() => onGenerate({
              validUntil,
              deposit: isFinanced ? 0 : Number(deposit),
              homeowner65,
              includeBasementPrep,
              includeScopeOfWork,
              formOfPayment,
            })}
            className="flex-1 py-3 rounded-lg text-sm font-semibold active:scale-95 inline-flex items-center justify-center gap-1.5"
            style={{ background: T.purple, color: "#fff" }}
          >
            Generate PDF <ChevronRight size={14} />
          </button>
        </div>
      </Card>
    </ModalOverlay>
  );
};

// ============================================================================
// 10. QUOTE PREVIEW — read-only preview of computed contract sections
//     Covers: Cancellation (BWN-114), Payment (BWN-117), Lead Form (BWN-115),
//     Multi-state license header (BWN-119), PDF render (BWN-24)
// ============================================================================
const QuotePreviewScreen = ({ estimate, onBack, onSign, onOpenStory, orgConfig, onPatchEstimate }) => {
  const cust = estimate.customer;
  const rule = cancellationRule({ state: cust.state, is65OrOlder: cust.is65OrOlder });
  const cancelBy = addBizDays(estimate.validUntil, rule.days);
  const computedTotal = useMemo(() => estimate.lineItems.reduce((s, li) => {
    const sku = CATALOG.find((x) => x.sku === li.sku); return sku ? s + (li.customPrice ?? sku.unitPrice * li.qty) : s;
  }, 0), [estimate]);
  const finalTotal = estimate.totalOverride ?? computedTotal;
  const balance = finalTotal - (estimate.deposit || 0);
  // License display per orgConfig.licenseDisplayMode (BWN-119)
  const licenseMode = orgConfig?.licenseDisplayMode || "state";
  const activeLicenses = Object.values(TENANT.licenses).filter((l) => l.active);
  const stateLicense = TENANT.licenses[cust.state];
  const headerLicenses = licenseMode === "all" ? activeLicenses : (stateLicense ? [stateLicense] : []);
  const triggersRrp = cust.yearBuilt < 1978;
  const tenantSelfCert = triggersRrp && cust.occupancy === "tenant";
  const isFinanced = estimate.formOfPayment === "Financed";
  const initialsPages = orgConfig?.perPageInitialsStates?.[cust.state] || [];
  const requiresPerPageInitials = initialsPages.length > 0;

  // Lines grouped by category for Scope of Work preview (PDF p2)
  const lineSections = useMemo(() => {
    const map = {};
    estimate.lineItems.forEach((li) => {
      const sku = CATALOG.find((s) => s.sku === li.sku);
      if (!sku) return;
      if (!map[sku.category]) map[sku.category] = { display: sku.categoryDisplay, items: [] };
      map[sku.category].items.push({ ...li, sku });
    });
    return Object.values(map);
  }, [estimate]);

  const selectedBasementPrep = (estimate.basementPrep || []).filter((b) => b.selected);

  // Page-jump chip rail (BWN-24). Only show pages that render for this customer.
  const pageJumps = useMemo(() => {
    const jumps = [
      { id: "page-1", label: "P1",  title: "Header" },
      { id: "page-2", label: "P2",  title: "Scope" },
      { id: "page-3", label: "P3-4", title: "Basement Prep" },
      { id: "page-4a", label: "P4a", title: "Prep Checklist" },
      { id: "page-5", label: "P5",  title: "Cancellation" },
      { id: "page-6", label: "P6",  title: "Payment" },
      { id: "page-7", label: "P7-8", title: "T&C" },
    ];
    if (triggersRrp) jumps.push({ id: "page-9", label: "P9", title: "Lead Form" });
    if (requiresPerPageInitials) jumps.push({ id: "page-init", label: "Init.", title: `${cust.state} initials` });
    return jumps;
  }, [triggersRrp, requiresPerPageInitials, cust.state]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <FlowStepper activeKey="review" />
      <AppHeader
        title="Quote Preview"
        subtitle={`PDF · 10 pages · ${cust.state}`}
        onBack={onBack}
        right={<StoryBadge ids={["BWN-24"]} onOpen={onOpenStory} />}
      />
      {/* Sticky page-jump chips */}
      <div className="px-3 py-2 flex items-center gap-1.5 overflow-x-auto" style={{ background: T.bg, borderBottom: `1px solid ${T.border}`, scrollbarWidth: "none" }}>
        <span className="text-[10px] font-bold tracking-wider flex-shrink-0 pr-1" style={{ color: T.textTertiary }}>JUMP</span>
        {pageJumps.map((p) => (
          <button
            key={p.id}
            onClick={() => scrollTo(p.id)}
            className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold active:scale-95"
            style={{ background: T.surface, color: T.text, border: `1px solid ${T.border}` }}
          >
            <span style={{ color: T.purpleAccent }}>{p.label}</span>
            <span style={{ color: T.textSecondary }}>· {p.title}</span>
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-28 pt-3 space-y-3">

        {/* Page 1 — Header preview */}
        <Card className="p-4" id="page-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest" style={{ color: T.textTertiary }}>PAGE 1 — HEADER</span>
              <StoryBadge ids={["BWN-119"]} onOpen={onOpenStory} />
            </div>
          </div>
          <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
            <div className="px-3 py-2.5 flex items-start justify-between gap-2" style={{ background: T.purpleDark, color: "#fff" }}>
              <div>
                <div className="text-sm font-extrabold">{TENANT.brand.name}</div>
                <div className="text-[10px] opacity-80">10410 Kettering Drive, Cockeysville, MD 21030</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] uppercase tracking-wider opacity-70">License{headerLicenses.length > 1 ? "s" : ""}</div>
                <div className="space-y-0.5">
                  {headerLicenses.length === 0 && <div className="text-[10px] opacity-70">No active license for {cust.state}</div>}
                  {headerLicenses.map((l) => (
                    <div key={l.state} className="text-[10px] font-bold">
                      {l.displayLabel} #{l.number}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-3 text-[11px] space-y-0.5" style={{ background: T.surface, color: T.text }}>
              <div className="font-bold">{cust.name}</div>
              <div style={{ color: T.textSecondary }}>{cust.address}</div>
              <div style={{ color: T.textSecondary }}>{cust.city}, {cust.state} {cust.zip}</div>
              <div className="grid grid-cols-2 gap-1 mt-1 text-[10px]" style={{ color: T.textSecondary }}>
                <div>Phone: {cust.phone}</div>
                <div>Date: {fmtDateShort(estimate.validUntil)}</div>
                <div>Year Built: <span style={{ color: triggersRrp ? T.warning : T.text }} className="font-semibold">{cust.yearBuilt}</span></div>
                <div>Inspected By: {cust.inspectedBy || "Mike Davis"}</div>
                <div>Occupancy: <span className="font-semibold capitalize">{cust.occupancy || "owner"}</span></div>
                <div>Valid Until: {fmtDateShort(estimate.validUntil)}</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Page 2 — Scope of Work (line items) */}
        <Card className="p-4" id="page-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-widest" style={{ color: T.textTertiary }}>PAGES 1–2 — SCOPE OF WORK</span>
            <StoryBadge ids={["BWN-22", "BWN-24"]} onOpen={onOpenStory} />
          </div>
          {lineSections.length === 0 ? (
            <p className="text-[11px] italic" style={{ color: T.textTertiary }}>
              No line items added yet.
            </p>
          ) : (
            <div className="space-y-3">
              {lineSections.map((section) => (
                <div key={section.display}>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: T.purpleAccent }}>
                    {section.display}
                  </p>
                  <div className="space-y-1.5">
                    {section.items.map((it) => (
                      <div key={it.id} className="p-2 rounded-md" style={{ background: T.surfaceAlt, border: `1px solid ${T.borderSoft}` }}>
                        <div className="flex items-start justify-between gap-2 mb-0.5">
                          <p className="text-[11px] font-bold leading-tight" style={{ color: T.text }}>{it.sku.title}</p>
                          <span className="text-[10px] font-bold flex-shrink-0" style={{ color: T.purpleAccent }}>
                            {it.qty} {it.sku.uom}
                          </span>
                        </div>
                        <p className="text-[10px] leading-snug" style={{ color: T.textSecondary }}>
                          {it.customDescription || it.sku.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-[10px] mt-3" style={{ color: T.textTertiary }}>
            Customer reviews and signs this section (signature point #1 on page 2).
          </p>
        </Card>

        {/* Pages 3–4 — Basement Preparations & Notes */}
        <Card className="p-4" id="page-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-widest" style={{ color: T.textTertiary }}>PAGES 3–4 — BASEMENT PREPARATIONS & NOTES</span>
            <StoryBadge ids={["BWN-111"]} onOpen={onOpenStory} />
          </div>
          {selectedBasementPrep.length === 0 ? (
            <p className="text-[11px] italic" style={{ color: T.textTertiary }}>
              No basement prep items selected. Tap "Basement Preparations & Notes" on the Quote Detail screen to choose what applies.
            </p>
          ) : (
            <div className="space-y-2">
              {["Customer Responsibilities", "BWN Responsibilities", "Basement Notes"].map((groupName) => {
                const items = selectedBasementPrep.filter((b) => b.group === groupName);
                if (items.length === 0) return null;
                return (
                  <div key={groupName}>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: T.purpleAccent }}>
                      {groupName}
                    </p>
                    <div className="space-y-1.5">
                      {items.map((it) => (
                        <div key={it.key} className="p-2 rounded-md" style={{ background: T.surfaceAlt, border: `1px solid ${T.borderSoft}` }}>
                          <p className="text-[11px] font-bold mb-0.5" style={{ color: T.text }}>{it.label}</p>
                          <p className="text-[10px] leading-snug" style={{ color: T.textSecondary }}>
                            {it.boilerplate || <span style={{ fontStyle: "italic", color: T.textTertiary }}>(no notes)</span>}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <p className="text-[10px] mt-3" style={{ color: T.textTertiary }}>
            Signature point #2 captured on page 4.
          </p>
        </Card>

        {/* Page 4a — Customer Preparation Checklist (BWN-130) */}
        {(() => {
          const pc = estimate.prepChecklist || makeDefaultPrepChecklist();
          const C = PREP_CHECKLIST_COPY;
          const dispMeta = { move: { label: "Move", color: T.success }, stay: { label: "Stay", color: T.warning }, na: { label: "N/A", color: T.textTertiary } };
          const stayCount = PREP_CHECKLIST_ITEMS.filter((it) => pc.items[it.key] === "stay").length;
          const wall = C.walls.find((w) => w.key === pc.walls);
          const floor = C.floors.find((f) => f.key === pc.floors);
          const locs = C.sumpLocations.filter((l) => pc.sumpLocations.includes(l.key)).map((l) => l.label);
          const otherAcks = [pc.acks.fireplaces && "Fireplaces / chimneys", pc.acks.radon && "Radon system"].filter(Boolean);
          return (
            <Card className="p-4" id="page-4a">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold tracking-widest" style={{ color: T.textTertiary }}>PAGE 4a — CUSTOMER PREPARATION CHECKLIST</span>
                <StoryBadge ids={["BWN-130"]} onOpen={onOpenStory} />
              </div>
              <p className="text-[9px] mb-2" style={{ color: T.textTertiary }}>{cust.name} · Contract date {fmtDateShort(pc.contractDate)} · {C.version}</p>

              {stayCount > 0 && (
                <div className="mb-2 p-2 rounded-md" style={{ background: T.warningSoft, border: `1px solid ${T.warning}55` }}>
                  <p className="text-[10px] font-bold" style={{ color: T.warning }}>{stayCount} item{stayCount !== 1 ? "s" : ""} staying in place — later access + service fee may apply.</p>
                </div>
              )}

              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: T.purpleAccent }}>Items in work area</p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mb-2">
                {PREP_CHECKLIST_ITEMS.map((it) => {
                  const m = dispMeta[pc.items[it.key]];
                  return (
                    <div key={it.key} className="flex items-center justify-between gap-1">
                      <span className="text-[9px] truncate" style={{ color: T.text }}>{it.label}</span>
                      <span className="text-[9px] font-bold flex-shrink-0" style={{ color: m.color }}>{m.label}</span>
                    </div>
                  );
                })}
              </div>
              {pc.itemsNotes && <p className="text-[9px] italic mb-2" style={{ color: T.textSecondary }}>Notes: {pc.itemsNotes}</p>}

              <div className="grid grid-cols-2 gap-2 mb-2">
                <div><p className="text-[9px] font-bold uppercase" style={{ color: T.purpleAccent }}>Walls</p><p className="text-[9px]" style={{ color: T.text }}>{wall?.label}</p></div>
                <div><p className="text-[9px] font-bold uppercase" style={{ color: T.purpleAccent }}>Floors</p><p className="text-[9px]" style={{ color: T.text }}>{floor?.label}</p></div>
                <div><p className="text-[9px] font-bold uppercase" style={{ color: T.purpleAccent }}>Sump location</p><p className="text-[9px]" style={{ color: T.text }}>{locs.length ? locs.join(", ") : "—"}{pc.sumpSpecified ? ` · ${pc.sumpSpecified}` : ""}</p></div>
                <div><p className="text-[9px] font-bold uppercase" style={{ color: T.purpleAccent }}>Acknowledged</p><p className="text-[9px]" style={{ color: T.text }}>{[pc.acks.dust && "Dust", pc.acks.sumpPower && "Sump power", ...otherAcks].filter(Boolean).join(", ") || "—"}</p></div>
              </div>

              <p className="text-[9px] leading-snug pt-1.5 mb-2" style={{ color: T.textSecondary, borderTop: `1px solid ${T.borderSoft}` }}>“{C.acknowledgment}”</p>
              <p className="text-[10px]" style={{ color: T.textTertiary }}>Signature point #3 captured on page 4a.</p>
            </Card>
          );
        })()}

        {/* Page 5 — Cancellation */}
        <Card className="p-4" id="page-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-widest" style={{ color: T.textTertiary }}>PAGE 5 — NOTICE OF CANCELLATION</span>
            <StoryBadge ids={["BWN-114"]} onOpen={onOpenStory} />
          </div>
          <div className="rounded-lg p-3" style={{ background: rule.color === T.warning ? T.warningSoft : rule.color === T.info ? T.infoSoft : T.surfaceAlt, border: `1px solid ${T.border}` }}>
            <div className="flex items-center gap-2 mb-2">
              <Shield size={14} color={rule.color} />
              <span className="text-xs font-bold" style={{ color: rule.color }}>{rule.label}</span>
            </div>
            <p className="text-[11px] leading-relaxed" style={{ color: T.text }}>
              You, the buyer, may cancel this transaction at any time prior to <span className="font-bold">midnight of the {rule.days === 5 ? "fifth" : rule.days === 7 ? "seventh" : "third"} business day</span> after the date of this transaction.
            </p>
            <div className="mt-2 pt-2 border-t" style={{ borderColor: `${rule.color}33` }}>
              <p className="text-[10px]" style={{ color: T.textSecondary }}>NOT LATER THAN MIDNIGHT OF</p>
              <p className="text-sm font-extrabold" style={{ color: T.text }}>{fmtDateLong(cancelBy)}</p>
              <p className="text-[9px] mt-0.5" style={{ color: T.textTertiary }}>auto-computed · {rule.days} biz days from {fmtDateShort(estimate.validUntil)} · weekends + US federal holidays skipped</p>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {[
              { variant: "A", days: 5, label: "MD <65", active: rule.variant === "A" },
              { variant: "B", days: 7, label: "MD 65+", active: rule.variant === "B" },
              { variant: "C", days: 3, label: "Other", active: rule.variant === "C" },
            ].map((v) => (
              <div
                key={v.variant}
                className="p-2 rounded text-center"
                style={{
                  background: v.active ? T.purpleSoft : T.surfaceAlt,
                  border: `1px solid ${v.active ? T.purpleAccent : T.border}`,
                }}
              >
                <div className="text-[9px] font-bold" style={{ color: v.active ? T.purpleAccent : T.textSecondary }}>
                  Variant {v.variant}
                </div>
                <div className="text-[10px] mt-0.5" style={{ color: T.text }}>{v.label}</div>
                <div className="text-[9px]" style={{ color: T.textSecondary }}>{v.days} days</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Page 6 — Payment Schedule (BWN-117) */}
        <Card className="p-4" id="page-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-widest" style={{ color: T.textTertiary }}>PAGE 6 — PAYMENT SCHEDULE</span>
            <StoryBadge ids={["BWN-117"]} onOpen={onOpenStory} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-1.5" style={{ borderBottom: `1px solid ${T.borderSoft}` }}>
              <span className="text-xs font-bold" style={{ color: T.textSecondary }}>Total Contract Amount</span>
              <span className="text-sm font-extrabold" style={{ color: T.text }}>{fmt$(finalTotal)}</span>
            </div>
            <div className="flex items-center justify-between py-1.5" style={{ borderBottom: `1px solid ${T.borderSoft}` }}>
              <div className="flex items-center gap-1.5">
                <span className="text-xs" style={{ color: T.textSecondary }}>Deposit</span>
                {isFinanced && <Pill bg={T.warningSoft} ink={T.warning}>FINANCED · $0</Pill>}
              </div>
              <span className="text-sm font-semibold" style={{ color: T.text }}>{fmt$(estimate.deposit)}</span>
            </div>
            <div className="flex items-center justify-between py-1.5" style={{ borderBottom: `1px solid ${T.borderSoft}` }}>
              <span className="text-xs" style={{ color: T.textSecondary }}>Form of Payment</span>
              <span className="text-sm font-semibold" style={{ color: T.text }}>{estimate.formOfPayment}</span>
            </div>
            <div className="flex items-center justify-between py-1.5" style={{ borderBottom: `1px solid ${T.borderSoft}` }}>
              <span className="text-xs" style={{ color: T.textSecondary }}>
                {isFinanced ? "Balance Due on Completion (full)" : "Balance Due on Completion"}
              </span>
              <span className="text-sm font-extrabold" style={{ color: T.success }}>{fmt$(isFinanced ? finalTotal : balance)}</span>
            </div>
            {/* Editable late rate */}
            <div className="flex items-center justify-between py-1.5" style={{ borderBottom: `1px solid ${T.borderSoft}` }}>
              <span className="text-xs" style={{ color: T.textSecondary }}>Late Payment Rate</span>
              <input
                type="text"
                value={estimate.latePaymentRate || "2% per month"}
                onChange={(e) => onPatchEstimate && onPatchEstimate({ latePaymentRate: e.target.value })}
                className="w-28 text-right text-sm font-semibold rounded px-2 py-1 outline-none"
                style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.text }}
              />
            </div>
            {/* Editable service charge */}
            <div className="flex items-center justify-between py-1.5">
              <span className="text-xs" style={{ color: T.textSecondary }}>Off-contract Service Charge</span>
              <div className="flex items-center gap-1">
                <span className="text-xs" style={{ color: T.textSecondary }}>$</span>
                <input
                  type="number"
                  value={estimate.serviceCharge ?? 250}
                  onChange={(e) => onPatchEstimate && onPatchEstimate({ serviceCharge: Number(e.target.value) })}
                  className="w-16 text-right text-sm font-semibold rounded px-2 py-1 outline-none"
                  style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.text }}
                />
              </div>
            </div>
          </div>
          {/* Financed informational block (BWN-117) */}
          {isFinanced && (
            <div className="mt-3 p-3 rounded-lg" style={{ background: T.infoSoft, border: `1px dashed ${T.info}55` }}>
              <p className="text-[11px] font-bold mb-1" style={{ color: T.info }}>
                <Banknote size={11} className="inline mr-1" />
                Financing informational block · prints on PDF
              </p>
              <ul className="text-[10px] space-y-0.5" style={{ color: T.info, opacity: 0.95 }}>
                <li>• Financing is arranged by customer through their own lender.</li>
                <li>• Balance due upon completion · BWN does not process or hold financing terms.</li>
                <li>• Deposit auto-zeroed; full contract amount payable at substantial completion.</li>
              </ul>
            </div>
          )}
        </Card>

        {/* Pages 7–8 — Terms & Conditions (BWN-116) */}
        <Card className="p-4" id="page-7">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-widest" style={{ color: T.textTertiary }}>PAGES 7–8 — TERMS & CONDITIONS</span>
            <StoryBadge ids={["BWN-116"]} onOpen={onOpenStory} />
          </div>
          <div className="space-y-2 text-[11px]" style={{ color: T.text }}>
            <div className="p-2 rounded" style={{ background: T.surfaceAlt }}>
              <p className="font-bold mb-1">Always print · 4 warranty blocks</p>
              <ul className="text-[10px] space-y-0.5" style={{ color: T.textSecondary }}>
                <li>1. Interior Drainage System · Lifetime Transferable</li>
                <li>2. Sump Pump · 5-year manufacturer term</li>
                <li>3. Wall System / Crack Repair · Lifetime</li>
                <li>4. General Workmanship</li>
                <li>+ Arbitration clause + $250 service charge + Late Payment terms</li>
              </ul>
            </div>
            {cust.state === "MD" && (
              <div className="p-2 rounded" style={{ background: T.infoSoft, border: `1px solid ${T.info}44` }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Shield size={11} color={T.info} />
                  <p className="font-bold" style={{ color: T.info }}>Maryland · state-conditional</p>
                </div>
                <ul className="text-[10px] space-y-0.5" style={{ color: T.info, opacity: 0.95 }}>
                  <li>• <span className="font-semibold">MHIC Guaranty Fund disclosure</span> — MD Home Improvement Commission consumer recovery info.</li>
                  <li>• <span className="font-semibold">§8-405(c) clause</span> inside Arbitration block — MD HIC-specific carve-out.</li>
                </ul>
              </div>
            )}
            {cust.state === "DE" && (
              <div className="p-2 rounded" style={{ background: T.errorSoft, border: `1px solid ${T.error}44` }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Shield size={11} color={T.error} />
                  <p className="font-bold" style={{ color: T.error }}>Delaware · state-conditional</p>
                </div>
                <ul className="text-[10px] space-y-0.5" style={{ color: T.error, opacity: 0.95 }}>
                  <li>• <span className="font-semibold">DE Consumer Rights Summary</span> — required disclaimer block.</li>
                  <li>• <span className="font-semibold">Per-page initials</span> on pages {(initialsPages || []).join(", ") || "7, 8"}.</li>
                </ul>
              </div>
            )}
            {cust.state !== "MD" && cust.state !== "DE" && (
              <div className="p-2 rounded" style={{ background: T.surfaceAlt, border: `1px dashed ${T.border}` }}>
                <p className="text-[10px]" style={{ color: T.textSecondary }}>
                  <Info size={10} className="inline mr-1" />
                  No state-conditional T&C blocks render for {cust.state}.
                </p>
              </div>
            )}
            <p className="text-[10px] mt-1" style={{ color: T.textTertiary }}>Signature point #5 on page 8.</p>
          </div>
        </Card>

        {/* Page 9 — Lead Form (conditional) */}
        {triggersRrp ? (
          <Card className="p-4" id="page-9" style={{ background: T.warningSoft, borderColor: `${T.warning}55` }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold tracking-widest" style={{ color: T.warning }}>PAGE 9 — PRE-RENOVATION LEAD FORM</span>
              <StoryBadge ids={["BWN-115"]} onOpen={onOpenStory} />
            </div>
            <div className="flex items-start gap-2 mb-3">
              <AlertTriangle size={16} color={T.warning} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold" style={{ color: T.warning }}>
                  Auto-included · Year Built {cust.yearBuilt}
                </p>
                <p className="text-[11px]" style={{ color: T.warning, opacity: 0.85 }}>
                  Federal RRP rule: built before 1978
                </p>
              </div>
            </div>
            <div className="bg-white rounded p-3 text-[11px] space-y-1.5" style={{ border: `1px solid ${T.warning}33` }}>
              <div><span style={{ color: T.textSecondary }}>Owner-Occupant: </span><span className="font-semibold">{cust.contact}</span></div>
              <div><span style={{ color: T.textSecondary }}>Unit Address: </span>{cust.address}</div>
              <div className="flex items-center gap-1.5 pt-1">
                <div className="w-3 h-3 rounded-sm flex items-center justify-center" style={{ background: T.purple }}>
                  <Check size={9} color="#fff" />
                </div>
                <span>Lead Hazard Information Pamphlet received</span>
              </div>
              {tenantSelfCert ? (
                <div className="mt-2 pt-2" style={{ borderTop: `1px dashed ${T.warning}55` }}>
                  <p className="font-bold text-[11px]" style={{ color: T.warning }}>Tenant self-certification (occupancy = tenant)</p>
                  <ul className="text-[10px] space-y-0.5 mt-1" style={{ color: T.textSecondary }}>
                    <li>• Tenant attests no child &lt;6 resides at unit (or pamphlet given).</li>
                    <li>• Tenant signature + date captured below.</li>
                  </ul>
                </div>
              ) : (
                <p className="text-[10px] italic mt-1" style={{ color: T.textTertiary }}>
                  Tenant self-cert hidden — occupancy = owner
                </p>
              )}
            </div>
          </Card>
        ) : (
          <Card className="p-3" style={{ background: T.surfaceAlt }}>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} color={T.success} />
              <span className="text-[11px]" style={{ color: T.textSecondary }}>
                <span className="font-semibold" style={{ color: T.text }}>Lead Form skipped</span> — Year Built ≥ 1978
              </span>
              <StoryBadge ids={["BWN-115"]} onOpen={onOpenStory} />
            </div>
          </Card>
        )}

        {/* T&C — per-page initials note (BWN-118), config-driven */}
        {requiresPerPageInitials && (
          <Card className="p-3" id="page-init" style={{ background: T.errorSoft, borderColor: `${T.error}55` }}>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={14} color={T.error} />
              <span className="text-xs font-bold" style={{ color: T.error }}>{cust.state} per-page initials required</span>
              <StoryBadge ids={["BWN-118"]} onOpen={onOpenStory} />
            </div>
            <p className="text-[11px]" style={{ color: T.error, opacity: 0.9 }}>
              Customer initials pages {initialsPages.join(", ")} on the signature flow.
            </p>
          </Card>
        )}

      </div>
      <div className="absolute bottom-0 left-0 right-0 px-4 py-3 border-t flex gap-2" style={{ background: T.surface, borderColor: T.border }}>
        <button
          onClick={onBack}
          className="px-4 py-3 rounded-lg text-sm font-semibold active:scale-95"
          style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.text }}
        >
          Back
        </button>
        <button
          onClick={onSign}
          className="flex-1 py-3 rounded-lg text-sm font-semibold active:scale-95 inline-flex items-center justify-center gap-2"
          style={{ background: T.purple, color: "#fff" }}
        >
          <PenTool size={14} /> Send for Signature
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// 11. SIGNATURE SCREEN (BWN-23) — Touch + DocuSign, 6 points, DE per-page initials (BWN-118)
//     6 signature points per BWN-110: Scope p2, Basement Prep p4, Cancellation p5,
//     Payment p6, T&C p8, Lead Form p9 (last only if yearBuilt<1978).
// ============================================================================
const SIG_POINTS_BASE = [
  { idx: 1, page: 2, label: "Scope of Work",            note: "Customer accepts scope, line items, qty",   storyIds: ["BWN-23"] },
  { idx: 2, page: 4, label: "Basement Preparations",    note: "Customer responsibilities + BWN notes",     storyIds: ["BWN-23", "BWN-111"] },
  { idx: 3, page: 4, label: "Preparation Checklist",    note: "Move/Stay grid, walls, floors, sump, acks", storyIds: ["BWN-23", "BWN-130"] },
  { idx: 4, page: 5, label: "Notice of Cancellation",   note: "Buyer copy · state × age cancel-by date",   storyIds: ["BWN-23", "BWN-114"] },
  { idx: 5, page: 6, label: "Payment Schedule",         note: "Total, deposit, Form of Payment, balance",  storyIds: ["BWN-23", "BWN-117"] },
  { idx: 6, page: 8, label: "Terms & Conditions",       note: "All 4 warranty blocks + state-conditional", storyIds: ["BWN-23", "BWN-116"] },
  { idx: 7, page: 9, label: "Pre-Renovation Lead Form", note: "Federal RRP · pre-1978 only",               storyIds: ["BWN-23", "BWN-115"] },
];

const SignatureCanvas = ({ onChange, height = 180 }) => {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const [hasInk, setHasInk] = useState(false);

  const point = (e) => {
    const c = canvasRef.current; if (!c) return null;
    const r = c.getBoundingClientRect();
    const x = (e.clientX ?? e.touches?.[0]?.clientX) - r.left;
    const y = (e.clientY ?? e.touches?.[0]?.clientY) - r.top;
    return { x, y };
  };
  const down = (e) => {
    drawingRef.current = true;
    const p = point(e); if (!p) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.strokeStyle = T.text; ctx.lineWidth = 2; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(p.x, p.y);
  };
  const move = (e) => {
    if (!drawingRef.current) return;
    const p = point(e); if (!p) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(p.x, p.y); ctx.stroke();
    if (!hasInk) { setHasInk(true); onChange && onChange(true); }
  };
  const up = () => { drawingRef.current = false; };
  const clear = () => {
    const c = canvasRef.current; if (!c) return;
    c.getContext("2d").clearRect(0, 0, c.width, c.height);
    setHasInk(false); onChange && onChange(false);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={310} height={height}
        onMouseDown={down} onMouseMove={move} onMouseUp={up} onMouseLeave={up}
        onTouchStart={down} onTouchMove={move} onTouchEnd={up}
        style={{ background: T.surfaceAlt, borderRadius: 8, width: "100%", touchAction: "none" }}
      />
      <div className="flex items-center justify-between mt-2 px-1">
        <span className="text-[10px]" style={{ color: T.textTertiary }}>X ____________________</span>
        <button onClick={clear} className="text-[11px] font-semibold" style={{ color: T.purpleAccent }}>Clear</button>
      </div>
    </div>
  );
};

const SignatureScreen = ({ estimate, orgConfig, onBack, onComplete, onOpenStory }) => {
  const [mode, setMode] = useState(null);     // 'touch' | 'docusign'
  const [stepIdx, setStepIdx] = useState(0);  // 0..N-1 for touch flow
  const [inkOk, setInkOk] = useState(false);
  const [collected, setCollected] = useState([]); // [{ idx, page, label, ts }]
  const [phase, setPhase] = useState("sigs"); // "sigs" → "initials" → "done"
  const [initIdx, setInitIdx] = useState(0);
  const [initOk, setInitOk] = useState(false);
  const [initialsLog, setInitialsLog] = useState([]);

  // Filter signature points: drop Lead Form when not pre-1978
  const triggersRrp = estimate.customer.yearBuilt < 1978;
  const SIG_POINTS = SIG_POINTS_BASE.filter((p) => p.idx !== 7 || triggersRrp);
  const totalSigs = SIG_POINTS.length;

  const cust = estimate.customer;
  const initialsPages = orgConfig?.perPageInitialsStates?.[cust.state] || [];
  const requiresInitials = initialsPages.length > 0;

  const finishCurrentSig = () => {
    const cur = SIG_POINTS[stepIdx];
    const next = [...collected, { ...cur, ts: new Date().toISOString() }];
    setCollected(next);
    setInkOk(false);
    if (stepIdx < totalSigs - 1) {
      setStepIdx(stepIdx + 1);
    } else if (requiresInitials) {
      setPhase("initials");
    } else {
      onComplete({ mode: "touch", signatures: next, initials: [] });
    }
  };

  const finishCurrentInitial = () => {
    const page = initialsPages[initIdx];
    const log = [...initialsLog, { page, ts: new Date().toISOString() }];
    setInitialsLog(log);
    setInitOk(false);
    if (initIdx < initialsPages.length - 1) {
      setInitIdx(initIdx + 1);
    } else {
      onComplete({ mode: "touch", signatures: collected, initials: log });
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <FlowStepper activeKey="sign" />
      <AppHeader
        title="Signature Capture"
        subtitle={mode === "touch"
          ? phase === "initials"
            ? `${cust.state} per-page initials · ${initIdx + 1} of ${initialsPages.length}`
            : `Signature ${stepIdx + 1} of ${totalSigs}`
          : `${totalSigs} signature points · ${requiresInitials ? `+ ${initialsPages.length} initials (${cust.state})` : "no extra initials"}`}
        onBack={onBack}
        right={<StoryBadge ids={requiresInitials ? ["BWN-23", "BWN-118"] : ["BWN-23"]} onOpen={onOpenStory} />}
      />
      <div className="flex-1 overflow-y-auto p-4">
        {!mode && (
          <>
            <p className="text-sm mb-4" style={{ color: T.textSecondary }}>
              Choose how the customer will sign. Both options are supported.
            </p>
            <Card onClick={() => setMode("touch")} className="p-4 mb-3 active:scale-[0.98] cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: T.purpleSoft }}>
                  <PenTool size={22} color={T.purpleAccent} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-base" style={{ color: T.text }}>Touch Signature</h3>
                  <p className="text-xs mt-0.5" style={{ color: T.textSecondary }}>
                    Walk through all {totalSigs} signature points on this device{requiresInitials ? `, then ${initialsPages.length} per-page initials (${cust.state})` : ""}.
                  </p>
                  <Pill bg={T.successSoft} ink={T.success} className="mt-2">In-person · fastest close</Pill>
                </div>
                <ChevronRight size={18} color={T.textSecondary} />
              </div>
            </Card>
            <Card onClick={() => setMode("docusign")} className="p-4 mb-3 active:scale-[0.98] cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: T.infoSoft }}>
                  <Send size={22} color={T.info} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-base" style={{ color: T.text }}>DocuSign Email Link</h3>
                  <p className="text-xs mt-0.5" style={{ color: T.textSecondary }}>
                    Email a DocuSign envelope to <span className="font-medium">{cust.email}</span> · all {totalSigs} signature points + {initialsPages.length} initial fields pre-tagged.
                  </p>
                  <Pill bg={T.infoSoft} ink={T.info} className="mt-2">Remote · async close</Pill>
                </div>
                <ChevronRight size={18} color={T.textSecondary} />
              </div>
            </Card>
            <div className="p-3 rounded-lg" style={{ background: T.purpleSofter, border: `1px dashed ${T.purpleAccent}55` }}>
              <p className="text-[11px]" style={{ color: T.purpleAccent }}>
                <Info size={11} className="inline mr-1" />
                Every signature timestamped + IP-stamped. Status → Signed only when all {totalSigs}{requiresInitials ? ` + ${initialsPages.length} initials` : ""} captured. Quote locks at sign.
              </p>
            </div>
          </>
        )}

        {mode === "touch" && phase === "sigs" && (
          <>
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => setMode(null)} className="text-xs font-semibold flex items-center gap-1 active:scale-95" style={{ color: T.purpleAccent }}>
                <ChevronLeft size={14} /> Back to options
              </button>
              <button
                onClick={() => setMode("docusign")}
                className="inline-flex items-center gap-1 text-[11px] font-semibold active:scale-95"
                style={{ color: T.info }}
                title="Send the rest by DocuSign instead"
              >
                <Send size={12} /> Send to DocuSign instead
              </button>
            </div>
            {/* Progress dots */}
            <div className="flex items-center gap-1.5 mb-2">
              {SIG_POINTS.map((p, i) => (
                <div
                  key={p.idx}
                  className="flex-1 h-1.5 rounded-full"
                  style={{ background: i < stepIdx ? T.success : i === stepIdx ? T.purple : T.borderSoft }}
                />
              ))}
              {requiresInitials && (
                <div className="flex items-center gap-0.5 ml-1">
                  {initialsPages.map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: T.borderSoft }} />
                  ))}
                </div>
              )}
            </div>
            {/* Completed signatures strip — checked items + current pending */}
            <div className="flex items-center gap-1 overflow-x-auto mb-3 pb-1" style={{ scrollbarWidth: "none" }}>
              {SIG_POINTS.map((p, i) => {
                const done = i < stepIdx;
                const cur = i === stepIdx;
                return (
                  <span
                    key={p.idx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold flex-shrink-0"
                    style={{
                      background: done ? T.successSoft : cur ? T.purpleSoft : T.surfaceAlt,
                      color: done ? T.success : cur ? T.purpleAccent : T.textTertiary,
                    }}
                  >
                    {done ? <Check size={9} /> : cur ? <PenTool size={9} /> : <Clock size={9} />}
                    {p.label}
                  </span>
                );
              })}
            </div>
            <div className="mb-3">
              <p className="text-[11px] font-bold tracking-wider uppercase mb-1" style={{ color: T.textSecondary }}>
                Signature {SIG_POINTS[stepIdx].idx} of {totalSigs} · {SIG_POINTS[stepIdx].label}
              </p>
              <p className="text-xs" style={{ color: T.textSecondary }}>
                PDF page {SIG_POINTS[stepIdx].page} · {SIG_POINTS[stepIdx].note}
              </p>
              <p className="text-xs mt-1" style={{ color: T.textSecondary }}>
                Customer: <span className="font-bold" style={{ color: T.text }}>{cust.contact}</span>
              </p>
            </div>
            <Card className="p-2 mb-3">
              <SignatureCanvas key={`sig-${stepIdx}`} onChange={setInkOk} />
            </Card>
            <div className="text-center text-[11px] mb-3" style={{ color: T.textSecondary }}>
              <Clock size={10} className="inline mr-1" />
              {new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })} · IP captured
            </div>
            <button
              disabled={!inkOk}
              onClick={finishCurrentSig}
              className="w-full py-3 rounded-lg text-sm font-semibold active:scale-95 disabled:opacity-50"
              style={{ background: T.purple, color: "#fff" }}
            >
              {!inkOk
                ? "Sign above to continue"
                : stepIdx < totalSigs - 1
                  ? `Confirm & Continue (Sig ${stepIdx + 2}/${totalSigs} →)`
                  : requiresInitials
                    ? `Confirm · proceed to ${cust.state} initials →`
                    : "Confirm & Finish"}
            </button>
          </>
        )}

        {mode === "touch" && phase === "initials" && (
          <>
            <Card className="p-3 mb-3" style={{ background: T.successSoft, borderColor: `${T.success}55` }}>
              <div className="flex items-center gap-2 mb-0.5">
                <CheckCircle2 size={14} color={T.success} />
                <span className="text-sm font-bold" style={{ color: T.success }}>
                  Almost done — {initialsPages.length} quick initial{initialsPages.length !== 1 ? "s" : ""} for {cust.state}
                </span>
              </div>
              <p className="text-[11px]" style={{ color: T.success, opacity: 0.85 }}>
                All {totalSigs} signatures captured. Now customer initials pages {initialsPages.join(", ")} to acknowledge {cust.state} T&C disclosure.
              </p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <StoryBadge ids={["BWN-118"]} onOpen={onOpenStory} />
              </div>
            </Card>
            <div className="flex items-center gap-1.5 mb-3">
              {initialsPages.map((p, i) => (
                <div
                  key={p}
                  className="flex-1 h-1.5 rounded-full"
                  style={{ background: i < initIdx ? T.success : i === initIdx ? T.error : T.borderSoft }}
                />
              ))}
            </div>
            <div className="mb-3">
              <p className="text-[11px] font-bold tracking-wider uppercase mb-1" style={{ color: T.textSecondary }}>
                Initial {initIdx + 1} of {initialsPages.length} · PDF page {initialsPages[initIdx]}
              </p>
              <p className="text-xs" style={{ color: T.textSecondary }}>
                Customer initials confirm review of T&C page {initialsPages[initIdx]}.
              </p>
            </div>
            <Card className="p-2 mb-3">
              <SignatureCanvas key={`init-${initIdx}`} onChange={setInitOk} height={110} />
            </Card>
            <button
              disabled={!initOk}
              onClick={finishCurrentInitial}
              className="w-full py-3 rounded-lg text-sm font-semibold active:scale-95 disabled:opacity-50"
              style={{ background: T.error, color: "#fff" }}
            >
              {!initOk
                ? "Initial above to continue"
                : initIdx < initialsPages.length - 1
                  ? `Confirm initial · page ${initialsPages[initIdx + 1]} →`
                  : "Confirm & Finish"}
            </button>
          </>
        )}

        {mode === "docusign" && (
          <>
            <button onClick={() => setMode(null)} className="text-xs font-semibold mb-3 flex items-center gap-1 active:scale-95" style={{ color: T.purpleAccent }}>
              <ChevronLeft size={14} /> Back to options
            </button>
            <Card className="p-4 text-center">
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3" style={{ background: T.infoSoft }}>
                <Send size={28} color={T.info} />
              </div>
              <h3 className="font-bold text-base mb-1" style={{ color: T.text }}>Send via DocuSign</h3>
              <p className="text-xs mb-4" style={{ color: T.textSecondary }}>
                Customer will receive a link at <span className="font-semibold">{cust.email}</span> with all {totalSigs} signature points{requiresInitials ? ` and ${initialsPages.length} per-page initial fields` : ""} pre-tagged.
              </p>
              <ul className="text-[11px] text-left mb-4 space-y-1" style={{ color: T.textSecondary }}>
                {SIG_POINTS.map((p) => (
                  <li key={p.idx} className="flex items-center gap-1.5">
                    <CheckCircle2 size={11} color={T.success} />
                    p.{p.page} · {p.label}
                  </li>
                ))}
                {requiresInitials && initialsPages.map((p) => (
                  <li key={`init-${p}`} className="flex items-center gap-1.5">
                    <CheckCircle2 size={11} color={T.error} />
                    p.{p} · initials ({cust.state})
                  </li>
                ))}
              </ul>
              <button
                onClick={() => onComplete({ mode: "docusign", signatures: SIG_POINTS, initials: initialsPages.map((p) => ({ page: p })) })}
                className="w-full py-3 rounded-lg text-sm font-semibold active:scale-95"
                style={{ background: T.purple, color: "#fff" }}
              >
                Send DocuSign Envelope
              </button>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 12. SUCCESS / PDF READY SCREEN
// ============================================================================
const PdfReadyScreen = ({ estimate, signMode, onDone, onOpenStory }) => {
  const cust = estimate.customer;
  const rule = cancellationRule({ state: cust.state, is65OrOlder: cust.is65OrOlder });
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <FlowStepper activeKey="done" />
      <AppHeader title="Quote Generated" subtitle={`#${estimate.id} · ${cust.state}`} onBack={onDone} />
      <div className="flex-1 overflow-y-auto p-4">
        <Card className="p-5 text-center mb-4" style={{ background: T.successSoft, borderColor: `${T.success}33` }}>
          <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3" style={{ background: T.success }}>
            <CheckCircle2 size={32} color="#fff" />
          </div>
          <h2 className="text-xl font-extrabold mb-1" style={{ color: T.text }}>
            {signMode === "touch" ? "Contract Signed" : signMode === "docusign" ? "Envelope Sent" : "PDF Ready"}
          </h2>
          <p className="text-sm" style={{ color: T.textSecondary }}>
            10-page PDF generated · {cust.name}
          </p>
        </Card>

        {/* Hero actions */}
        <div className="space-y-2 mb-3">
          <button
            className="w-full py-3.5 rounded-lg text-sm font-bold inline-flex items-center justify-center gap-2 active:scale-95"
            style={{ background: T.purple, color: "#fff" }}
          >
            <Eye size={16} /> View PDF
          </button>
          <button
            className="w-full py-3 rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-2 active:scale-95"
            style={{ background: T.surface, color: T.text, border: `1px solid ${T.border}` }}
          >
            <Send size={14} /> Email Customer
          </button>
        </div>

        <CollapsibleCard
          title="PDF Composition"
          summary={`11 pages · ${cust.yearBuilt < 1978 ? "RRP Lead Form included" : "Lead Form skipped"}`}
          right={<StoryBadge ids={["BWN-24"]} onOpen={onOpenStory} />}
          className="mb-3"
        >
          <div className="pt-2">
            {[
              { p: "1–2", label: "Scope of Work · 5 sections", icon: FileText },
              { p: "3",   label: "Basement Preparations · 11 sub-items", icon: ClipboardList },
              { p: "4",   label: "Basement Prep signatures", icon: PenTool },
              { p: "4a",  label: "Customer Preparation Checklist · 16 items", icon: ListChecks },
              { p: "5",   label: `Notice of Cancellation · ${rule.days} biz days`, icon: Shield, accent: rule.color },
              { p: "6",   label: "Payment Schedule · " + estimate.formOfPayment, icon: Banknote },
              { p: "7–8", label: "Terms & Conditions · 4 warranty blocks", icon: ScrollText },
              { p: "9",   label: cust.yearBuilt < 1978 ? "RRP Lead Form · included" : "RRP Lead Form · skipped", icon: AlertTriangle, accent: cust.yearBuilt < 1978 ? T.warning : T.success },
              { p: "10",  label: "Mailing alternative note", icon: MailIcon },
            ].map((p, i) => (
              <div key={i} className="flex items-center gap-3 py-2" style={{ borderTop: i === 0 ? "none" : `1px solid ${T.borderSoft}` }}>
                <span className="text-[10px] font-bold w-8 text-center" style={{ color: T.textTertiary }}>p.{p.p}</span>
                <p.icon size={14} color={p.accent || T.textSecondary} />
                <span className="text-xs flex-1" style={{ color: T.text }}>{p.label}</span>
                <CheckCircle2 size={12} color={T.success} />
              </div>
            ))}
          </div>
        </CollapsibleCard>

        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            onClick={onDone}
            className="flex-1 py-2.5 rounded-lg text-[12px] font-semibold active:scale-95"
            style={{ background: T.surface, color: T.text, border: `1px solid ${T.border}` }}
          >
            ← Back to Quotes
          </button>
          <button
            onClick={onDone}
            className="flex-1 py-2.5 rounded-lg text-[12px] font-semibold inline-flex items-center justify-center gap-1 active:scale-95"
            style={{ background: T.purpleSoft, color: T.purpleAccent, border: `1px solid ${T.purpleAccent}55` }}
          >
            Open Quote <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PLACEHOLDER SCREEN — used for menu items that don't have a destination yet
// ============================================================================
const PLACEHOLDER_CONFIG = {
  emails: {
    title: "Emails",
    icon: Mail,
    accent: T.tileBlue,
    accentInk: T.tileBlueInk,
    description: "Email thread between rep and customer. View past correspondence and send new messages.",
    items: [
      { from: "Mike R.",        date: "May 11", subject: "Following up on your estimate",   preview: "Hi John, just confirming our appointment for Wednesday…" },
      { from: "John Chrisler",  date: "May 09", subject: "Re: Basement inspection",         preview: "Thanks for coming by. The quote looks good. We have one question…" },
      { from: "Mike R.",        date: "May 08", subject: "Your basement waterproofing quote", preview: "Attached is the formal quote from your inspection on May 8…" },
    ],
  },
  messages: {
    title: "Messages",
    icon: MessageSquare,
    accent: T.tileGreen,
    accentInk: T.tileGreenInk,
    description: "SMS thread with customer · quick reminders, photos, scheduling.",
    items: [
      { from: "Mike R.",        date: "Today 9:14",  subject: "Reminder",                 preview: "Crew is en route, ETA 7:45 AM. See you shortly!" },
      { from: "John Chrisler",  date: "Yesterday",   subject: "Question",                 preview: "Are we still on for Wednesday?" },
      { from: "Mike R.",        date: "May 10",      subject: "Photo confirmation",       preview: "Sent 3 photos · please confirm the work area is clear" },
    ],
  },
  gallery: {
    title: "Gallery",
    icon: Camera,
    accent: T.tilePink,
    accentInk: T.tilePinkInk,
    description: "Photos and videos from the inspection and job site.",
    items: [
      { from: "Inspection",     date: "May 08", subject: "Basement · NE corner",  preview: "Existing sump basin and discharge — used to size new pump" },
      { from: "Inspection",     date: "May 08", subject: "Foundation crack",      preview: "Hairline crack along south wall · noted in scope" },
      { from: "Inspection",     date: "May 08", subject: "Egress window well",    preview: "Need to maintain access — discharge routed clear of well" },
    ],
  },
};

const PlaceholderScreen = ({ kind, onBack }) => {
  const cfg = PLACEHOLDER_CONFIG[kind] || PLACEHOLDER_CONFIG.emails;
  const Icon = cfg.icon;
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <AppHeader title={cfg.title} subtitle={cfg.description} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <Card className="p-3 mt-2 mb-3" style={{ background: T.purpleSofter, borderColor: `${T.purpleAccent}33` }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: cfg.accent }}>
              <Icon size={20} color={cfg.accentInk} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: T.text }}>{cfg.title} for this quote</p>
              <p className="text-[11px]" style={{ color: T.textSecondary }}>{cfg.description}</p>
            </div>
          </div>
        </Card>
        <SectionLabel right={<span className="text-[10px]" style={{ color: T.textTertiary }}>
          {cfg.items.length} item{cfg.items.length !== 1 ? "s" : ""}
        </span>}>Recent</SectionLabel>
        <Card className="overflow-hidden">
          {cfg.items.map((it, i) => (
            <div key={i} className="px-3 py-3" style={{ borderTop: i === 0 ? "none" : `1px solid ${T.borderSoft}` }}>
              <div className="flex items-start justify-between gap-2 mb-0.5">
                <p className="text-xs font-bold leading-tight" style={{ color: T.text }}>{it.subject}</p>
                <span className="text-[10px] flex-shrink-0" style={{ color: T.textTertiary }}>{it.date}</span>
              </div>
              <p className="text-[10px] mb-1" style={{ color: T.textSecondary }}>From: {it.from}</p>
              <p className="text-[11px] leading-snug" style={{ color: T.textSecondary }}>{it.preview}</p>
            </div>
          ))}
        </Card>
        <p className="text-[10px] text-center mt-4" style={{ color: T.textTertiary }}>
          Compose / reply coming in a future release.
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// STORY DRAWER — opens to show JIRA ticket detail
// ============================================================================
const StoryDrawer = ({ open, ids, onClose }) => {
  if (!open) return null;
  return (
    <ModalOverlay onClose={onClose} align="bottom">
      <Card className="w-full max-h-[85%] flex flex-col" style={{ borderRadius: "16px 16px 0 0" }}>
        <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b" style={{ borderColor: T.border }}>
          <div className="flex items-center gap-2">
            <Sparkles size={16} color={T.purpleAccent} />
            <h2 className="text-base font-bold" style={{ color: T.text }}>
              Linked JIRA {ids.length === 1 ? "Story" : `Stories (${ids.length})`}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 active:scale-95"><X size={20} color={T.textSecondary} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {ids.map((id) => {
            const s = STORIES[id]; if (!s) return null;
            const priorityColor = s.priority === "M" ? T.error : s.priority === "S" ? T.warning : T.info;
            return (
              <Card key={id} className="p-3.5">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-[11px] font-bold tracking-wider" style={{ color: T.purpleAccent }}>{id}</span>
                  <div className="flex items-center gap-1.5">
                    <Pill bg={`${priorityColor}22`} ink={priorityColor}>{s.priority === "M" ? "MUST" : s.priority === "S" ? "SHOULD" : "COULD"}</Pill>
                  </div>
                </div>
                <h3 className="font-bold text-sm leading-tight mb-1" style={{ color: T.text }}>{s.title}</h3>
                <p className="text-[11px] mb-2" style={{ color: T.textSecondary }}>{s.note}</p>
                <div className="flex items-center gap-1.5 pt-2 mt-1 border-t" style={{ borderColor: T.borderSoft }}>
                  <CircleDot size={10} color={s.status.includes("Blocked") ? T.error : s.status.includes("Done") ? T.success : T.info} />
                  <span className="text-[10px]" style={{ color: T.textSecondary }}>{s.status}</span>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>
    </ModalOverlay>
  );
};

// ============================================================================
// SCENE NAVIGATOR — jump between scenes for demos
// ============================================================================
const SCENES = [
  { key: "home",         label: "Home — Action Grid",             num: "1",  group: "Setup" },
  { key: "list",         label: "Quote List",                      num: "2",  group: "Setup" },
  { key: "filter",       label: "Filter Modal",                    num: "2a", group: "Setup" },
  { key: "create",       label: "Create New Quote",                num: "3",  group: "Setup" },
  { key: "detail",       label: "Quote Detail",                    num: "4",  group: "Builder" },
  { key: "addItem",      label: "Add Line Item · Catalog",         num: "5",  group: "Builder" },
  { key: "basement",     label: "Basement Preparations",           num: "6",  group: "Builder" },
  { key: "notes",        label: "Internal Notes",                  num: "7",  group: "Builder" },
  { key: "activity",     label: "Quote Activity",                  num: "8",  group: "Builder" },
  { key: "menus",        label: "All Menus Tray",                  num: "9",  group: "Builder" },
  { key: "generate",     label: "Generate Quote Modal",            num: "10", group: "Compliance & PDF" },
  { key: "preview",      label: "Quote Preview · PDF Pages",       num: "11", group: "Compliance & PDF" },
  { key: "signature",    label: "Signature Capture",               num: "12", group: "Sign" },
  { key: "ready",        label: "Quote Generated · Success",       num: "13", group: "Sign" },
];

const SceneNavigator = ({ open, current, onPick, onClose }) => {
  if (!open) return null;
  const currentIdx = SCENES.findIndex((s) => s.key === current);
  return (
    <ModalOverlay onClose={onClose} align="bottom">
      <Card className="w-full flex flex-col" style={{ borderRadius: "16px 16px 0 0", maxHeight: "85%" }}>
        <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b flex-shrink-0" style={{ borderColor: T.border }}>
          <div>
            <h2 className="text-sm font-bold" style={{ color: T.text }}>Scene Navigator</h2>
            <p className="text-[10px]" style={{ color: T.textSecondary }}>
              {SCENES.length} screens · currently on {currentIdx >= 0 ? `#${SCENES[currentIdx].num} ${SCENES[currentIdx].label.split("—")[0].trim()}` : "—"}
            </p>
          </div>
          <button onClick={onClose} className="p-1 active:scale-95"><X size={18} color={T.textSecondary} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-2 min-h-0">
          {SCENES.map((s, i) => {
            const prev = SCENES[i - 1];
            const isFirstInGroup = !prev || prev.group !== s.group;
            const isCurrent = current === s.key;
            return (
              <div key={s.key}>
                {isFirstInGroup && (
                  <p className="text-[9px] font-bold tracking-widest uppercase mt-2 mb-1 px-1" style={{ color: T.purpleAccent }}>
                    {s.group}
                  </p>
                )}
                <button
                  onClick={() => { onPick(s.key); onClose(); }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 mb-1 rounded-md text-left active:scale-[0.99]"
                  style={{
                    background: isCurrent ? T.purpleSoft : T.surface,
                    border: `1px solid ${isCurrent ? T.purpleAccent : T.border}`,
                  }}
                >
                  <div
                    className="w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{
                      background: isCurrent ? T.purple : T.surfaceAlt,
                      color: isCurrent ? "#fff" : T.textSecondary,
                    }}
                  >
                    {s.num}
                  </div>
                  <span className="text-[12px] flex-1" style={{ color: T.text }}>{s.label}</span>
                  {isCurrent
                    ? <Check size={13} color={T.purpleAccent} />
                    : <ChevronRight size={12} color={T.textTertiary} />}
                </button>
              </div>
            );
          })}
        </div>
      </Card>
    </ModalOverlay>
  );
};

// ============================================================================
// 13. QUOTE ACTIVITY & LIFECYCLE SCREEN (BWN-107, BWN-112)
//     Activity progresses through Working → Net → Paid in Full → Final as
//     quotes are issued, signed, paid.
// ============================================================================
const ActivityScreen = ({ estimate, onBack, onOpenStory }) => {
  const cust = estimate.customer || {};

  const [filter, setFilter] = useState("all");
  const FILTERS = [
    { key: "all",       label: "All" },
    { key: "lead",      label: "Lead" },
    { key: "inspection",label: "Inspection" },
    { key: "quote",     label: "Quote" },
    { key: "sign",      label: "Sign" },
  ];
  const matchFilter = (a) => {
    if (filter === "all") return true;
    if (filter === "lead") return a.kind === "lead";
    if (filter === "inspection") return a.kind === "inspection";
    if (filter === "quote") return a.kind === "create" || a.kind === "edit" || a.kind === "reissue" || a.kind === "note";
    if (filter === "sign") return a.kind === "sign";
    return true;
  };

  // Group activities by yyyy-mm-dd (newest-first); list activities should already be newest-first.
  const grouped = useMemo(() => {
    const out = [];
    let curKey = null;
    let curList = null;
    (estimate.activity || []).filter(matchFilter).forEach((a) => {
      const dateKey = (a.ts || "").slice(0, 10);
      if (dateKey !== curKey) {
        curKey = dateKey;
        curList = [];
        out.push({ dateKey, items: curList });
      }
      curList.push(a);
    });
    return out;
  }, [estimate.activity, filter]);

  // Friendly day label ("Today", "Yesterday", or full date).
  const todayKey = new Date().toISOString().slice(0, 10);
  const yKey = (() => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10); })();
  const dayLabel = (key) => {
    if (key === todayKey) return "Today";
    if (key === yKey) return "Yesterday";
    const d = new Date(key + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <AppHeader
        title="Quote Activity"
        subtitle={`#${estimate.id || "—"} · ${cust.name || "—"}`}
        onBack={onBack}
        right={<StoryBadge ids={["BWN-112"]} onOpen={onOpenStory} />}
      />
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {/* Lead context strip */}
        <Card className="p-3 mt-2 mb-3" style={{ background: T.purpleSofter, borderColor: `${T.purpleAccent}33` }}>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: T.purple, color: "#fff" }}>
              <User size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold" style={{ color: T.text }}>{cust.name}</p>
              <p className="text-[11px]" style={{ color: T.textSecondary }}>
                {cust.address}, {cust.city}, {cust.state} · {cust.leadSource}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: T.textTertiary }}>
                Inspected by {cust.inspectedBy} on {cust.inspectionDate}
              </p>
            </div>
          </div>
        </Card>

        {/* Filter chips */}
        <div className="flex items-center gap-1.5 mb-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className="flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold active:scale-95"
                style={{
                  background: active ? T.purple : T.surface,
                  color: active ? "#fff" : T.text,
                  border: `1px solid ${active ? T.purple : T.border}`,
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Activity timeline — grouped by day */}
        <SectionLabel right={<span className="text-[10px]" style={{ color: T.textTertiary }}>
          {grouped.reduce((s, g) => s + g.items.length, 0)} event{grouped.reduce((s, g) => s + g.items.length, 0) !== 1 ? "s" : ""}
        </span>}>Quote Activity</SectionLabel>

        {grouped.length === 0 && (
          <Card className="px-3 py-6 text-center">
            <p className="text-xs" style={{ color: T.textSecondary }}>No activity matches this filter.</p>
          </Card>
        )}
        {grouped.map((g) => {
          const kindMap = {
            lead:      { icon: User,         bg: T.tileBlue,   ink: T.tileBlueInk   },
            inspection:{ icon: Eye,          bg: T.tileCyan,   ink: T.tileCyanInk   },
            create:    { icon: Plus,         bg: T.tileBlue,   ink: T.tileBlueInk   },
            edit:      { icon: Pencil,       bg: T.tilePurple, ink: T.tilePurpleInk },
            note:      { icon: FileText,     bg: T.tileCyan,   ink: T.tileCyanInk   },
            sign:      { icon: PenTool,      bg: T.tileGreen,  ink: T.tileGreenInk  },
            reissue:   { icon: Repeat,       bg: T.tileOrange, ink: T.tileOrangeInk },
            lifecycle: { icon: ChevronRight, bg: T.tilePink,   ink: T.tilePinkInk   },
            payment:   { icon: Banknote,     bg: T.tileGreen,  ink: T.tileGreenInk  },
          };
          return (
            <div key={g.dateKey} className="mb-3">
              <p className="text-[10px] font-bold tracking-wider uppercase mb-1.5 px-1" style={{ color: T.textTertiary }}>
                {dayLabel(g.dateKey)}
              </p>
              <Card className="overflow-hidden">
                {g.items.map((a, i) => {
                  const m = kindMap[a.kind] || kindMap.note;
                  const ts = new Date(a.ts);
                  return (
                    <div key={i} className="flex items-start gap-3 px-3 py-2.5" style={{ borderTop: i === 0 ? "none" : `1px solid ${T.borderSoft}` }}>
                      <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: m.bg }}>
                        <m.icon size={13} color={m.ink} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs" style={{ color: T.text }}>{a.text}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: T.textTertiary }}>
                          {a.actor} · {ts.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// APP SHELL — wires everything together
// ============================================================================
const STARTING_ESTIMATE = {
  id: "BWN0000011",
  version: 1,
  catalogVersion: CATALOG_VERSION,
  status: "DRAFT",
  lifecycleState: "working", // BWN-107 Working → Net → Paid in Full → Final
  customer: { ...LEAD_QUEUE[0], occupancy: LEAD_QUEUE[0].occupancy || "owner" },
  validUntil: "2026-06-11",
  deposit: 5000,
  formOfPayment: "Check",
  latePaymentRate: "2% per month",   // BWN-117 per-contract editable
  serviceCharge: 250,                 // BWN-116 per-contract editable
  notes: "",
  notesIncludedInPdf: false,
  totalOverride: null,
  basementPrep: BASEMENT_PREP_ITEMS.map((it) => ({
    ...it,
    selected: ["accessToWorkArea", "itemsToMove", "itemsToStay", "wallCoverings", "floorCoverings",
               "logistics", "dustProtection",
               "existingSumpDisposition", "sumpPumpLocation"].includes(it.key),
  })),
  prepChecklist: makeDefaultPrepChecklist(),
  lineItems: [
    { id: "li-1", sku: "BWN-FLR-001", qty: 64, customDescription: null },
    { id: "li-2", sku: "BWN-SMP-001", qty: 1,  customDescription: null },
    { id: "li-3", sku: "BWN-DIS-001", qty: 32, customDescription: null },
  ],
  // Lead activity timeline (BWN-107, BWN-112). Newest first.
  // Activity belongs to the LEAD — quotes are events within the lead's lifecycle.
  activity: [
    { ts: "2026-05-12T15:01:00", actor: "Mike R.",  kind: "note",       text: "Saved Basement Preparations · 9 items selected" },
    { ts: "2026-05-12T14:48:00", actor: "Mike R.",  kind: "edit",       text: "Quote #BWN0000011 · added IceGuard Discharge Line (32 LF)" },
    { ts: "2026-05-12T14:45:00", actor: "Mike R.",  kind: "edit",       text: "Quote #BWN0000011 · added TripleSafe Sump System" },
    { ts: "2026-05-12T14:42:00", actor: "Mike R.",  kind: "edit",       text: "Quote #BWN0000011 · added Floor System line (64 LF)" },
    { ts: "2026-05-12T14:30:00", actor: "Mike R.",  kind: "create",     text: "Quote #BWN0000011 created · status DRAFT" },
    { ts: "2026-05-08T13:15:00", actor: "Mike Davis", kind: "inspection", text: "On-site inspection completed · basement walked, photos taken" },
    { ts: "2026-05-08T09:00:00", actor: "system",   kind: "inspection", text: "Inspection scheduled with Mike Davis" },
    { ts: "2026-05-06T11:22:00", actor: "system",   kind: "lead",       text: "Lead created · Google Ads campaign · LEAD-2026-0411" },
  ],
};

export default function App() {
  const [scene, setScene] = useState("home");
  const [filter, setFilter] = useState({});
  const [estimate, setEstimate] = useState(STARTING_ESTIMATE);
  const [signMode, setSignMode] = useState(null);
  const [orgConfig, setOrgConfig] = useState(DEFAULT_ORG_CONFIG);

  // overlays
  const [showFilter, setShowFilter] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showLineItem, setShowLineItem] = useState(false);
  const [editingLineItemId, setEditingLineItemId] = useState(null);
  const [showMenus, setShowMenus] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);
  const [storyOpen, setStoryOpen] = useState(false);
  const [storyIds, setStoryIds] = useState([]);
  const [devOpen, setDevOpen] = useState(false);

  const openStory = (ids) => { setStoryIds(ids); setStoryOpen(true); };

  // Push a new activity entry (BWN-107, BWN-112)
  const logActivity = (entry) => setEstimate((e) => ({
    ...e,
    activity: [{ ts: new Date().toISOString(), actor: "Mike R.", ...entry }, ...(e.activity || [])],
  }));

  // Re-issue (BWN-120) — bumps version, resets Valid Until + 30 days, preserves history.
  const reissueQuote = () => {
    const next = new Date(); next.setDate(next.getDate() + orgConfig.validUntilDefaultDays);
    setEstimate((e) => ({
      ...e,
      version: (e.version || 1) + 1,
      status: "DRAFT",
      validUntil: isoFromDate(next),
      priorVersionId: e.id + "-v" + (e.version || 1),
      activity: [
        { ts: new Date().toISOString(), actor: "Mike R.", kind: "reissue", text: `Re-issued · v${(e.version || 1) + 1} · Valid Until reset to ${isoFromDate(next)}` },
        ...(e.activity || []),
      ],
    }));
  };

  // Scene routing helpers
  const goScene = (key) => {
    // close any overlays when jumping
    setShowFilter(false); setShowCreate(false); setShowLineItem(false);
    setShowMenus(false); setShowGenerate(false);
    setEditingLineItemId(null);
    // open scene-specific overlays — these scenes are really overlays on top of an underlying screen
    if (key === "filter")    { setScene("list");    setShowFilter(true);   return; }
    if (key === "create")    { setScene("list");    setShowCreate(true);   return; }
    if (key === "addItem")   { setScene("detail");  setShowLineItem(true); return; }
    if (key === "menus")     { setScene("detail");  setShowMenus(true);    return; }
    if (key === "generate")  { setScene("detail");  setShowGenerate(true); return; }
    setScene(key);
  };

  const addLineItem = ({ sku, qty, customDescription }) => {
    const id = "li-" + (estimate.lineItems.length + 1) + "-" + Date.now();
    setEstimate({ ...estimate, lineItems: [...estimate.lineItems, { id, sku, qty, customDescription }] });
    setShowLineItem(false);
  };

  const addPackage = (pkg) => {
    const stamp = Date.now();
    const packageInstanceId = `pkg-${stamp}`;
    const newItems = pkg.items.map((pi, idx) => ({
      id: `li-pkg-${stamp}-${idx}`,
      sku: pi.sku,
      qty: pi.qty,
      customDescription: null,
      // Bundled satellites ride along at $0 — they contribute nothing to the
      // total regardless of qty. The anchor (bundled: false) keeps unitPrice
      // and drives the package's contract value.
      customPrice: pi.bundled ? 0 : null,
      packageInstanceId,
      packageLabel: pkg.title,
      packageKey: pkg.key,
      bundled: !!pi.bundled,
    }));
    setEstimate((e) => ({ ...e, lineItems: [...e.lineItems, ...newItems] }));
    setShowLineItem(false);
  };

  const removePackage = (packageInstanceId) => {
    setEstimate((e) => ({
      ...e,
      lineItems: e.lineItems.filter((li) => li.packageInstanceId !== packageInstanceId),
    }));
  };

  const updateLineItem = (id, patch) => {
    setEstimate((e) => ({
      ...e,
      lineItems: e.lineItems.map((li) => (li.id === id ? { ...li, ...patch } : li)),
    }));
  };

  const removeLineItem = (id) => {
    setEstimate((e) => ({ ...e, lineItems: e.lineItems.filter((li) => li.id !== id) }));
  };

  const openEditLineItem = (id) => {
    setEditingLineItemId(id);
    setShowLineItem(true);
  };

  const saveEditLineItem = (id, patch) => {
    updateLineItem(id, patch);
    setEditingLineItemId(null);
    setShowLineItem(false);
  };

  const closeLineItem = () => {
    setShowLineItem(false);
    setEditingLineItemId(null);
  };

  const editingLineItem = editingLineItemId
    ? estimate.lineItems.find((li) => li.id === editingLineItemId)
    : null;

  return (
    <PhoneFrame onOpenDevtools={() => setDevOpen(true)}>
      <div className="relative h-full">
        {/* Active scene */}
        {scene === "home" && <HomeScreen onGoQuote={() => setScene("list")} />}

        {scene === "list" && (
          <QuoteListScreen
            onBack={() => setScene("home")}
            onOpenCreate={() => setShowCreate(true)}
            onOpenFilter={() => setShowFilter(true)}
            onOpenQuote={() => setScene("detail")}
            onOpenStory={openStory}
            filterState={filter}
          />
        )}

        {scene === "detail" && (
          <QuoteDetailScreen
            estimate={estimate}
            onBack={() => setScene("list")}
            onOpenLineItem={() => { setEditingLineItemId(null); setShowLineItem(true); }}
            onEditLineItem={openEditLineItem}
            onUpdateLineItem={updateLineItem}
            onRemoveLineItem={removeLineItem}
            onRemovePackage={removePackage}
            onOpenMenus={() => setShowMenus(true)}
            onOpenBasement={() => setScene("basement")}
            onOpenChecklist={() => setScene("checklist")}
            onOpenNotes={() => setScene("notes")}
            onOpenGenerate={() => setShowGenerate(true)}
            onOpenStory={openStory}
            onReissue={reissueQuote}
            onPatchEstimate={(patch) => setEstimate((e) => ({ ...e, ...patch }))}
          />
        )}

        {scene === "activity" && (
          <ActivityScreen
            estimate={estimate}
            onBack={() => setScene("detail")}
            onOpenStory={openStory}
          />
        )}

        {scene === "emails" && (
          <PlaceholderScreen kind="emails" onBack={() => setScene("detail")} />
        )}
        {scene === "messages" && (
          <PlaceholderScreen kind="messages" onBack={() => setScene("detail")} />
        )}
        {scene === "gallery" && (
          <PlaceholderScreen kind="gallery" onBack={() => setScene("detail")} />
        )}

        {scene === "basement" && (
          <BasementPrepScreen
            items={estimate.basementPrep}
            onBack={() => setScene("detail")}
            onSave={(items) => { setEstimate({ ...estimate, basementPrep: items }); setScene("detail"); }}
            onOpenStory={openStory}
          />
        )}

        {scene === "checklist" && (
          <PrepChecklistScreen
            value={estimate.prepChecklist || makeDefaultPrepChecklist()}
            customerName={estimate.customer?.name || "—"}
            onBack={() => setScene("detail")}
            onSave={(pc) => { setEstimate({ ...estimate, prepChecklist: pc }); setScene("detail"); }}
            onOpenStory={openStory}
          />
        )}

        {scene === "notes" && (
          <NotesScreen
            value={estimate.notes}
            includeInPdf={estimate.notesIncludedInPdf}
            onBack={() => setScene("detail")}
            onSave={(patch) => { setEstimate({ ...estimate, ...patch }); setScene("detail"); }}
            onOpenStory={openStory}
          />
        )}

        {scene === "preview" && (
          <QuotePreviewScreen
            estimate={estimate}
            orgConfig={orgConfig}
            onBack={() => setScene("detail")}
            onSign={() => setScene("signature")}
            onOpenStory={openStory}
            onPatchEstimate={(patch) => setEstimate({ ...estimate, ...patch })}
          />
        )}

        {scene === "signature" && (
          <SignatureScreen
            estimate={estimate}
            orgConfig={orgConfig}
            onBack={() => setScene("preview")}
            onComplete={({ mode, signatures, initials }) => {
              setSignMode(mode);
              setEstimate((e) => ({
                ...e,
                status: "SIGNED",
                signatures: signatures || [],
                initials: initials || [],
                signedAt: new Date().toISOString(),
                activity: [
                  { ts: new Date().toISOString(), actor: "Mike R.", kind: "sign", text: `Signed via ${mode} · ${(signatures || []).length} signatures${(initials || []).length ? `, ${initials.length} initials` : ""}` },
                  ...(e.activity || []),
                ],
              }));
              setScene("ready");
            }}
            onOpenStory={openStory}
          />
        )}

        {scene === "ready" && (
          <PdfReadyScreen
            estimate={estimate}
            signMode={signMode}
            onDone={() => { setSignMode(null); setScene("list"); }}
            onOpenStory={openStory}
          />
        )}

        {/* Overlays */}
        <FilterModal
          open={showFilter}
          onClose={() => setShowFilter(false)}
          value={filter}
          onApply={setFilter}
        />
        <CreateQuoteModal
          open={showCreate}
          onClose={() => setShowCreate(false)}
          onCreate={({ lead, yearBuilt, occupancy, formOfPayment }) => {
            setEstimate({
              ...estimate,
              customer: { ...lead, yearBuilt: Number(yearBuilt), occupancy: occupancy || lead.occupancy || "owner" },
              formOfPayment: formOfPayment || estimate.formOfPayment,
              deposit: (formOfPayment || estimate.formOfPayment) === "Financed" ? 0 : estimate.deposit,
            });
            setShowCreate(false);
            setScene("detail");
          }}
          onOpenStory={openStory}
        />
        <LineItemPicker
          open={showLineItem}
          onClose={closeLineItem}
          onAdd={addLineItem}
          onAddPackage={addPackage}
          onSaveEdit={saveEditLineItem}
          editItem={editingLineItem}
          onOpenStory={openStory}
        />
        <AllMenusSheet
          open={showMenus}
          onClose={() => setShowMenus(false)}
          onOpenNotes={() => setScene("notes")}
          onOpenLineItem={() => { setEditingLineItemId(null); setShowLineItem(true); }}
          onOpenActivity={() => setScene("activity")}
          onOpenEmails={() => setScene("emails")}
          onOpenMessages={() => setScene("messages")}
          onOpenGallery={() => setScene("gallery")}
          onOpenStory={openStory}
        />
        <GenerateQuoteModal
          open={showGenerate}
          onClose={() => setShowGenerate(false)}
          estimate={estimate}
          orgConfig={orgConfig}
          onGenerate={(patch) => {
            setEstimate({
              ...estimate,
              validUntil: patch.validUntil,
              deposit: patch.deposit,
              formOfPayment: patch.formOfPayment,
              customer: { ...estimate.customer, is65OrOlder: patch.homeowner65 },
            });
            setShowGenerate(false);
            setScene("preview");
          }}
          onOpenStory={openStory}
        />

        <StoryDrawer open={storyOpen} ids={storyIds} onClose={() => setStoryOpen(false)} />
        <SceneNavigator open={devOpen} current={scene} onPick={goScene} onClose={() => setDevOpen(false)} />
      </div>
    </PhoneFrame>
  );
}
