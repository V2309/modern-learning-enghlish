# UI Context

## Theme

Linguify fully supports dynamic theme switching (Light Mode and Dark Mode). Class-based toggling (`.dark`) translates root color tokens to create comfortable reading palettes for intense vocabulary reading.

All core tokens map directly to layout HSL scales, allowing immediate system transition without hardcoded hexes or flickering.

### Theme Colors

| Role | Light Theme (HSL) | Dark Theme (HSL) | Key Use Cases |
| :--- | :--- | :--- | :--- |
| Background | `0 0% 100%` | `222.2 84% 4.9%` | Core viewport body background |
| Foreground | `222.2 84% 4.9%` | `210 40% 98%` | Primary paragraph and body copy labels |
| Primary | `221.2 83.2% 53.3%` | `217.2 91.2% 59.8%` | Brand active buttons, progress borders, accents |
| Card | `0 0% 100%` | `222.2 84% 4.9%` | Main component backdrops and modals |
| Card Foreground | `222.2 84% 4.9%` | `210 40% 98%` | Header headings and description labels inside cards |
| Muted | `210 40% 96.1%` | `217.2 32.6% 17.5%` | Input fields background, non-active button rows |
| Muted Foreground| `215.4 16.3% 46.9%` | `215 20.2% 65.1%` | Small subheadings, tags, word pronunciation labels |
| Secondary | `210 40% 96.1%` | `217.2 32.6% 17.5%` | Subtle badges, status tags, inactive toggle blocks |
| Accent | `210 40% 96.1%` | `217.2 32.6% 17.5%` | Hover items highlighting, dropdown selection focus |
| Border | `214.3 31.8% 91.4%` | `217.2 32.6% 17.5%` | Divider lines and container outlines |

## Typography

- **UI Text Font**: Inter (sans-serif) or system default modern sans interface fonts. It ensures extreme readability on dense words lists.
- **Display Headings**: Bold leading styles paired with subtle italic tracking (`text-primary italic`) for decorative branded segments (e.g. *"Master Vocabulary with Linguify"*).
- **Phonetics (IPA)**: Clean, high-legibility monospace or adjusted display families keeping accent glyphs intact and clear.

## Border Radius

Design structure flows cleanly using consistent curved radius points:

- **Inline Elements**: `rounded-xl` / `12px` (Buttons, small inputs, badge tags).
- **Cards & Content Holders**: `rounded-2xl` / `16px` (Word details block, lesson selector row cards).
- **Outer Panels & Dialog Wrappers**: `rounded-3xl` / `24px` or `rounded-[2.5rem]` / `40px` (Main course cards, flashcards deck panels, modal overlay cards).

## Interactive Micro-animations

All user transitions are curated via `framer-motion` to keep flows intuitive and satisfying:

- **List Item staggered entry**: Staggered fades and slight upward translations animate newly populated elements.
- **Active Lesson highlights**: Dynamic glows with color expansions focus visual systems on current study tasks.
- **Card Flip Mechanics**: Built leveraging realistic CSS perspective layers:
  - `perspective-1000`: Set depth of view during transform.
  - `preserve-3d`: Keeps front and back layout entities on the same plane spatial coordinates.
  - `backface-hidden`: Keeps rear contents invisible until rotations hit 180 degrees.

## Layout Patterns

Linguify uses responsive fluid layouts with comfortable reading widths:

- **Standard Grid**: `grid md:grid-cols-2 lg:grid-cols-3 gap-8` spacing structures cards.
- **Modal layout**: Floating cards utilizing `max-h-[85vh]` and `overflow-y-auto` structures scrollable viewports correctly inside viewport overlays.
- **Horizontal split**: In core practice or player templates, viewport utilizes a split screen — primary content viewer on left/center-top, syllabus lists or word trackers in sidebar units.

## Icons

Sourced exclusively from `lucide-react` to keep visual systems cohesive:

- `Sparkles`: Represents AI-enabled capabilities (lookups, families).
- `BookOpen`: Vocabulary, lessons, definitions.
- `PlayCircle` / `Play`: Lessons progression and active video streaming.
- `CheckCircle2`: Complete status indicators.
- `Languages`: Multi-lingual interactions and phonology definitions.
- `X` / `Plus`: List modifications, close actions, and object insertions.
