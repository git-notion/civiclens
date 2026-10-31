---
name: CivicPulse Design System
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e4e2e1'
  on-surface: '#1b1c1c'
  on-surface-variant: '#4d444c'
  inverse-surface: '#303030'
  inverse-on-surface: '#f3f0ef'
  outline: '#7e747d'
  outline-variant: '#d0c3cd'
  surface-tint: '#79507f'
  primary: '#310d38'
  on-primary: '#ffffff'
  primary-container: '#48234f'
  on-primary-container: '#b88abd'
  inverse-primary: '#e8b6ec'
  secondary: '#645e52'
  on-secondary: '#ffffff'
  secondary-container: '#e8ded0'
  on-secondary-container: '#686256'
  tertiary: '#241b0a'
  on-tertiary: '#ffffff'
  tertiary-container: '#3a301d'
  on-tertiary-container: '#a6987f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#fed6ff'
  primary-fixed-dim: '#e8b6ec'
  on-primary-fixed: '#2f0b37'
  on-primary-fixed-variant: '#5f3866'
  secondary-fixed: '#ebe1d3'
  secondary-fixed-dim: '#cec5b7'
  on-secondary-fixed: '#1f1b12'
  on-secondary-fixed-variant: '#4c463b'
  tertiary-fixed: '#f2e0c5'
  tertiary-fixed-dim: '#d5c4aa'
  on-tertiary-fixed: '#231a09'
  on-tertiary-fixed-variant: '#504531'
  background: '#fcf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e1'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system establishes an authoritative, accessible, and dignified civic technology environment. Designed for community grievance redressing and municipal service tracking, it rejects both clinical bureaucratic grayness and over-hyped tech tropes.

The aesthetic fuses modern civic governance with warm, tactile architectural sensibilities. By contrasting an intentional dark charcoal outer framework with warm ivory and soft cream documentation layers, the interface communicates structural reliability, administrative transparency, and humane public service.

Key attributes:

- **Authoritative & Trustworthy:** Precision hierarchy, structured borders, and measured cadence create confidence in municipal processes.
- **Empathetic & Accessible:** High legibility, warm undertones, and generous touch targets reduce civic friction and user frustration during complaint filings.
- **Dignified Municipal Modernism:** Editorial clarity driven by deliberate framing, tactile surface distinction, and balanced restrained accents.

## Colors

The palette is engineered around deliberate functional roles:

- **Shell & Workspace Foundation (`#242424`):** Dark charcoal serves as the framing master console, side navigation, and overarching peripheral chrome. It carries a low-contrast micro-stipple or subtle raster texture (1-2% opacity) to evoke matte architectural slate.
- **Canvas Base (`#F2EEE6`):** Warm ivory anchors the central workplane, forms, tables, and document viewports, cutting eye strain during extended filing sessions while maintaining high contrast.
- **Content Surfaces & Containers (`#FAF7F0`):** Soft cream lifts interactive cards, grievance item rows, and modals cleanly off the warm ivory canvas.
- **Structural Lines & Dividers (`#C9B99F`):** Champagne beige provides architectural grounding. All borders, data dividers, and cell demarcations utilize this tone to maintain separation without clinical harshness.
- **Action & Focus Accent (`#48234F`):** Deep plum is reserved strictly for high-intent commitments: submission buttons, status confirmations, active timeline markers, and urgent status chips.
- **Typography Spectrum:** Core text executes in dark charcoal (`#242424`) ensuring WCAG AAA accessibility across light surfaces. Ancillary metadata, timeline timestamps, helper notes, and table headers render in muted taupe (`#777064`).

## Typography

Typographic scale is handled solely by Plus Jakarta Sans. Its humanist geometric apertures ensure legibility across dense administrative tracking boards and mobile grievance intake forms.

- **Headlines:** Use tight letter tracking (`-0.02em`) on sizes above 24px to instill decisive editorial structure.
- **Numbers & Metrics:** Utilize tabular lining numbers (`font-variant-numeric: tabular-nums`) across reference ticket IDs, municipal precinct tallies, SLA counters, and date stamps.
- **Labels & Microcopy:** Render field labels, section subheaders, and status indicators in semi-bold (`600`) with neutral tracking (`+0.01em`) to uphold legibility against low-contrast champagne boundaries.

## Layout & Spacing

The layout model employs a dual-plane hybrid structure:

1. **The Dark Shell:** An outer framework rendered in `#242424` housing municipal navigation, jurisdiction switchers, and operational telemetry. Desktop widths lock navigation to a persistent 280px vertical rail.
2. **The Document Viewport:** Contained dynamically within the shell, operating on a fluid 12-column grid over the warm ivory (`#F2EEE6`) surface, constrained to an inner maximum width of 1440px.

### Breakpoints & Adaptability

- **Desktop (1024px+):** Full 12-column grid, 24px (`1.5rem`) gutters, 32px (`2rem`) margins. Side navigation remains anchored; content surfaces use 2-column or 3-column splits for form entry and side-by-side evidence inspection.
- **Tablet (768px – 1023px):** 8-column layout, 16px gutters, 24px margins. Navigation collapses to an icon rail or header drawer. Multi-step complaint intake flows transition to vertical stacking.
- **Mobile (< 768px):** 4-column layout, 12px gutters, 16px margins. Shell chrome converts to a top header with bottom action bar. Input fields expand to full fluid width.

## Elevation & Depth

Visual hierarchy does not rely on diffused drop shadows or generic floating effects. Depth is established through **architectural planes and crisp borders**:

- **Surface Layering:**
  - Base canvas: `#F2EEE6` (Ivory).
  - Raised interactive surfaces: `#FAF7F0` (Soft Cream).
  - Surface differentiation relies on a 1px solid border of Champagne Beige (`#C9B99F`).
- **Tactile Shadows:** When modals, contextual flyouts, or drag-and-drop file uploaders require physical lift, employ a hard, low-blur warm shadow:
  - `box-shadow: 0 4px 12px -2px rgba(36, 36, 36, 0.08), 0 2px 4px -1px rgba(36, 36, 36, 0.04);`
- **Shell Inset:** The main ivory workplane nests into the dark charcoal canvas with a 1px contour line (`rgba(201, 185, 159, 0.2)`), imparting a crafted administrative desk mat feel.

## Shapes

To mirror municipal precision and institutional stability, the shape system mandates a standardized corner radius:

- Standard components (buttons, input fields, cards, alerts, panels, modals) use an explicit `8px` (`rounded-lg` per scale token).
- Inner elements (nested badge tags, progress track bars, checkboxes) utilize `4px` (`rounded`).
- Avoid pill shapes or full rounds (`9999px`) entirely, except for discrete circular avatar nodes or numeric icon badges. This ensures the UI remains disciplined and civic-focused rather than consumer-casual.

## Components

### Buttons

- **Primary:** Deep plum (`#48234F`) background, pure white text, 8px corner radius. Padding: 12px 20px (Body Medium Semi-bold). Hover: `#371B3D`. Focus: outline 2px solid `#48234F` with 2px offset in `#FAF7F0`.
- **Secondary:** Soft cream (`#FAF7F0`) background, 1px solid `#C9B99F`, dark charcoal (`#242424`) text. Hover: `#F2EEE6` background with `#777064` border.
- **Destructive/Critical:** Transparent background, `#8A2C2C` text with 1px border `#E2B6B6`. Hover: `#FDF2F2`.

### Cards & Grievance Panels

- Built on soft cream (`#FAF7F0`) background with a 1px solid champagne beige (`#C9B99F`) perimeter and 8px border radius.
- Padding scales from 16px (mobile) to 24px (desktop).
- Header sections inside cards feature a bottom border using `#C9B99F` at 1px thickness.

### Input Fields & Controls

- **Text Inputs & Dropdowns:** Soft cream (`#FAF7F0`) background, 1px solid `#C9B99F`, 8px corner radius. Padding: 10px 14px. Text: `#242424`. Placeholder: `#777064`. Active focus shifts border to `#48234F` with a 1px inner ring.
- **Checkboxes & Radios:** 18px dimensions with 4px corner radius for checkboxes, circular for radios. 1.5px border `#C9B99F`. Checked state: filled with `#48234F` holding a white tick or inner pip.

### Status Chips & Badges

- 4px corner radius, padding: 4px 10px, typography: `label-sm`.
- **Under Review:** `#FAF7F0` surface, 1px solid `#C9B99F`, text `#777064`.
- **Escalated / Action Required:** `#48234F` background at 10% opacity, 1px solid `#48234F`, text `#48234F`.
- **Resolved:** `#EAF2EB` background, 1px solid `#B2D4B6`, text `#1B5E20`.

### Civic Timeline & Audit Log

- A continuous 2px vertical guide rule in `#C9B99F`.
- Milestone nodes: 12px dots; completed milestones filled in `#48234F`, pending items hollow with 2px `#C9B99F` outlines.
- Timestamps and officer identity badges set in `body-sm` using muted taupe (`#777064`).
