---
name: Core Editorial
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#45464c'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#575e70'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#141b2b'
  on-primary-container: '#7d8497'
  inverse-primary: '#c0c6db'
  secondary: '#f17463'
  on-secondary: '#ffffff'
  secondary-container: '#f17463'
  on-secondary-container: '#ffffff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#261906'
  on-tertiary-container: '#968065'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce2f7'
  primary-fixed-dim: '#c0c6db'
  on-primary-fixed: '#141b2b'
  on-primary-fixed-variant: '#404758'
  secondary-fixed: '#fde8e5'
  secondary-fixed-dim: '#fbcbc5'
  on-secondary-fixed: '#5c170d'
  on-secondary-fixed-variant: '#8c2c1f'
  tertiary-fixed: '#f9debf'
  tertiary-fixed-dim: '#dcc2a4'
  on-tertiary-fixed: '#261906'
  on-tertiary-fixed-variant: '#55442d'
  background: '#ffffff'
  on-background: '#111827'
  surface-variant: '#f3f4f6'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  display-lg-mobile:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 0.5rem
  sm: 1rem
  md: 1.5rem
  lg: 3rem
  xl: 5rem
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
---

## Brand & Style
The design system is rooted in high-end editorial aesthetics, prioritizing clarity, intentionality, and a "quiet luxury" atmosphere. It targets a professional SaaS audience that values focus over flash. 

The design style is **Minimalist-Modern**. It relies on high-contrast typography and extreme whitespace rather than decorative elements. Surfaces are defined by thin, precise borders and a restrained use of depth. The emotional response should be one of competence, order, and calm, evoking the feeling of a premium printed journal adapted for a digital workspace.

## Colors
The palette is strictly functional and monochromatic, with coral (#f17463) reserved for brand identity, primary actions, and subtle indications of state.

- **Background:** Pure White (#FFFFFF) is the base for all main views.
- **Surface:** Off-white (#F9FAFB) is used for secondary containers or navigation sidebars to create subtle separation.
- **Primary Text:** Deep Charcoal (#111827) provides maximum legibility and a sharp, ink-on-paper feel.
- **Secondary Text:** Slate Gray (#6B7280) for metadata and supporting information.
- **Brand / Accent:** Coral (#f17463) is used for brand identity, primary buttons, and active indicators.
- **Border:** Light Gray (#E5E7EB) defines structure without adding visual noise.

## Typography
This design system utilizes **Geist** for its technical precision and clean, geometric letterforms. The hierarchy is driven by a massive contrast between bold headlines and smaller, understated body text.

- **Headlines:** Use tight letter spacing (-0.02em to -0.04em) for larger sizes to mimic professional typesetting.
- **Body:** Standard spacing with a generous line height (1.5 - 1.6) to ensure long-form readability.
- **Labels:** Small caps or uppercase are encouraged for secondary UI labels to create a distinct visual texture from body prose.

## Layout & Spacing
The layout follows a **Fluid Grid** model with strict adherence to a vertical rhythm based on a 4px baseline.

- **Generous Whitespace:** Elements are given room to breathe; use `lg` (48px) and `xl` (80px) spacing between major sections to emphasize the editorial feel.
- **Grid:** A 12-column grid for desktop with 24px gutters. On mobile, transition to a single-column layout with 20px side margins.
- **Alignment:** All text should align to the left to maintain a strong vertical axis, emphasizing the "columnar" feel of a newspaper or journal.

## Elevation & Depth
Depth is conveyed through **Tonal Layers** and extremely soft shadows. 

- **Level 0 (Base):** White background.
- **Level 1 (Card/Container):** Uses a thin 1px border (#E5E7EB). Shadows should be avoided here or kept to a "1px blur" to merely lift the edge.
- **Level 2 (Dropdowns/Modals):** A multi-layered shadow is used: one sharp 1px border and one diffused shadow (0px 12px 24px rgba(0,0,0,0.05)).
- **Contrast:** High contrast is achieved through black-on-white text rather than heavy shadows.

## Shapes
The design system uses **Rounded** geometry (0.5rem / 8px) for standard UI components like inputs and buttons, while larger containers like cards use **rounded-lg** (1rem / 16px). This creates a softened, approachable professional look that balances the starkness of the monochrome color palette.

## Components
- **Buttons:** Primary buttons are solid Coral (#f17463) or Deep Charcoal with white text. Secondary buttons are White with a thin border and Charcoal text. No gradients.
- **Input Fields:** Minimalist design with a 1px border. On focus, the border color shifts to Coral (#f17463) with no outer glow.
- **Chips:** Small, Pill-shaped (rounded-xl) with a light gray background and `label-sm` typography. Used for tags or status indicators.
- **Cards:** White background, 1px border (#E5E7EB), and 16px corner radius. No shadow unless hovering.
- **Lists:** Clean rows separated by 1px horizontal lines. High vertical padding (16px-24px) to maintain the layout rhythm.
- **Selection Controls:** Checkboxes and radios should be minimal, using the Coral accent color only when checked.