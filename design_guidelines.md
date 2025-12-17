# Mobile Legends Draft Assistant - Design Guidelines

## Design Approach
**Gaming Application with Arabic RTL Interface** - Inspired by modern gaming UIs with glassmorphism aesthetics and premium visual quality. This is a utility-focused gaming tool requiring clear hierarchy and efficient information display.

---

## Core Design Elements

### A. Typography
**Primary Font Family:** Cairo Bold (Google Fonts via CDN)
- **Default Size:** 20px for all body text
- **Heading Hierarchy:**
  - H1 (Hero titles): 32px, Cairo Bold
  - H2 (Section headers): 28px, Cairo Bold  
  - H3 (Component titles): 24px, Cairo Bold
  - Body text: 20px, Cairo Bold
  - Small text (tips/metadata): 16px, Cairo Bold

**RTL Configuration:** All text must be right-aligned with `dir="rtl"` and `lang="ar"` attributes on root HTML element.

### B. Layout System
**Spacing Units:** Tailwind spacing of 4, 6, and 8 (p-4, m-6, gap-8, etc.)
- Component padding: p-6 or p-8
- Section spacing: py-8 to py-12
- Gap between elements: gap-4 or gap-6

**RTL Layout:**
- All flex/grid layouts must reverse for RTL (flex-row-reverse where needed)
- Margins and padding mirror appropriately
- Navigation and UI elements flow right-to-left

**Container Structure:**
- Max width: max-w-6xl centered
- Responsive breakpoints: mobile-first approach
- Grid layouts: grid-cols-1 md:grid-cols-2 for dual-panel sections

### C. Visual Style: Glassmorphism with Neon Accents

**Background Layer:**
- **Canvas-based animated snow:** Full-screen canvas with falling snow particles (white/light blue), subtle and non-distracting
- **Dark base:** Very dark purple/blue gradient (e.g., from #0a0e27 to #1a1f3a)

**Glass Morphism Cards:**
- Background: `bg-white/10` or `bg-black/20` with `backdrop-blur-lg`
- Borders: 1px solid with `border-white/20` or neon accent borders
- Border radius: `rounded-2xl` for all major components
- Box shadows: Subtle glows using neon colors

**Neon Accent Colors:**
- Primary neon: Cyan/Electric Blue (#00f3ff or #0ff)
- Secondary neon: Magenta/Pink (#ff00ff or #f0f)
- Success/Counter: Neon Green (#00ff88)
- Warning: Neon Orange (#ff8800)

**Application:**
- Use neon colors for borders, text highlights, button outlines, and glow effects
- Avoid solid neon fills - prefer outlines and glows for premium look
- Neon glows: `shadow-[0_0_15px_rgba(0,243,255,0.5)]` style effects

### D. Component Library

#### 1. Draft Assistant Section (Main Feature)
**Layout:** Single column with clear step progression
- **Enemy Hero Input:** Glassmorphic input fields with neon border on focus, RTL placeholder text
- **Lane Selection:** Button group with neon outline on active state
- **Counter Suggestion Card:**
  - Large glassmorphic card with hero image (left side due to RTL)
  - Hero name in large text
  - Three sub-sections: Reasoning, Combat Tips, Build Recommendation
  - Each with neon-accented headers and clear content separation

#### 2. Gemini Coach Chat Section
**Layout:** Side panel or dedicated section
- **Chat Container:** Glassmorphic scrollable area with `max-h-96` or `h-[500px]`
- **Message Bubbles:**
  - User messages: Right-aligned (RTL), darker glass with cyan border
  - Coach responses: Left-aligned, lighter glass with magenta border
  - Small avatar or icon for coach messages
- **Input Area:** Fixed bottom input with neon glow on focus, send button with neon outline

#### 3. Hero Image Display
**When to Show Images:**
- Counter suggestion card: Medium-large hero portrait (300x300px or similar)
- Chat context: Small hero thumbnails (80x80px) next to relevant messages
- Lane selection: Optional small hero icons

**Image Treatment:**
- Rounded corners: `rounded-xl`
- Neon border glow: `border-2 border-cyan-400/50 shadow-[0_0_20px_rgba(0,243,255,0.3)]`
- Overlay gradient on hover (subtle)

#### 4. Navigation/Header
**Simple top bar:**
- App logo/title (right side for RTL)
- Navigation links if multiple sections (Draft Assistant / Gemini Coach)
- Glassmorphic background with neon bottom border

#### 5. Buttons & Interactive Elements
**Primary Buttons:**
- Glassmorphic with neon outline: `border-2 border-cyan-400 bg-cyan-400/10`
- Hover: Increase glow and background opacity
- Text: Cairo Bold, 20px

**Input Fields:**
- Dark glass background: `bg-black/30 backdrop-blur-md`
- Neon border on focus: `focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(0,243,255,0.5)]`
- RTL text alignment

### E. Animations
**Snow Animation:** Continuous canvas-based particle system - subtle and atmospheric
**UI Animations:** Minimal hover effects on buttons and cards (slight scale/glow increase)
**Avoid:** Excessive transitions - keep interface snappy and responsive

---

## Images

**Hero Images Required:**
- **Source:** Downloaded from Mobile Legends Wiki/Fandom during build
- **Storage:** Local `/public/images/heroes/` directory
- **Format:** PNG or WebP with transparent/consistent backgrounds
- **Sizes Needed:**
  - Large portraits: 300x300px (for counter suggestion cards)
  - Small thumbnails: 80x80px (for chat context)

**Where Images Appear:**
1. Counter Suggestion Card: Large hero portrait with neon glow treatment
2. Chat Messages: Small hero thumbnails when discussing specific heroes
3. Optional: Lane selection icons (can use Font Awesome game icons if hero images not suitable)

**No large hero section** - This is a tool-focused application, not a marketing page. Focus on functional layouts.

---

## Critical RTL Implementation Notes
- Use Tailwind RTL utilities: `text-right`, `mr-auto` instead of `ml-auto`, etc.
- Flex reverse: `flex-row-reverse` for horizontal layouts
- Icons and UI elements flow from right to left
- All Arabic text properly rendered with Cairo font