# AWGZO Website — Part A + Part B Merge Guide

This codebase implements **Part A ONLY** of the AWGZO website so **Part B (teammate scope)** can be merged cleanly without file collisions, duplicate smooth scrollers, or duplicate WebGL canvases.

---

## 1. Ownership Split

### Part A (Included in This Repository)
- **Navbar** (`src/sections/Navbar/Navbar.tsx`) — Velocity Glass Pill with scroll progress ring, compact `RealitySwitch`, Calendly CTA, section indicator dots, and mobile frosted drawer.
- **Hero** (`src/sections/Hero/Hero.tsx`) — Fly-Through Warp pinned headline split, `Specialised In AR Marketing`, AR/VR mode switcher, `Try AR` / `Enter VR` launchers, and warp speed driving `PersistentCanvas`.
- **Portfolio** (`src/sections/Portfolio/Portfolio.tsx` & `src/pages/ProjectDetailPage.tsx`) — Curved Cylinder Gallery, `All | AR | VR | Web` filters, centered-card muted video autoplay, `/work/:slug` case-study route.
- **RealityLab** (`src/sections/RealityLab/RealityLab.tsx`) — Placed cleanly **between Portfolio and Team** (`#reality-lab`), combining an opt-in local MediaPipe AR Mirror and interactive 360° VR Portal.
- **Team** (`src/sections/Team/Team.tsx`) — Rotating Helix Tower using strictly placeholder records from `src/data/team.ts`, switching from AR outer helix to VR inside-out ring.
- **Contact** (`src/sections/Contact/Contact.tsx`) — Iris Reveal Portal with verified studio info, validation, honeypot `_gotcha`, and honest `VITE_FORM_ENDPOINT` submission handling.
- **Chatbot** (`src/sections/Chatbot/Chatbot.tsx`) — Scroll-Aware Glass Orb reading verified facts from `src/data/chatbotKnowledge.ts`, automatically suppressing when Contact form inputs are focused.
- **Inspection & Utilities** — `/preview` (`src/pages/PreviewPage.tsx`), Global Glass UI (`src/components/ui/Glass.tsx`), Global `AR | MIX | VR` State (`src/context/RealityContext.tsx`), and lazy XR modals (`src/components/xr/*`).

### Part B (Teammate Slots — Left Empty in `src/components/slots/TeammateSlots.tsx`)
Replace the placeholder shell exports inside `src/components/slots/TeammateSlots.tsx` (or re-export your section components directly from there):

1. `<ServicesSlot />` (`id="services"`, mounted directly after Hero)
2. `<ModelSlot />` (`id="model"`, mounted between RealityLab and Team)
3. `<TestimonialsSlot />` (`id="testimonials"`, mounted after Team)
4. `<FooterSlot />` (`id="footer"`, mounted at page bottom below Contact)

> **Note:** Check `HomePage.tsx` for exact order: Hero → `<ServicesSlot />` → Portfolio → RealityLab → `<ModelSlot />` → Team → `<TestimonialsSlot />` → Contact → `<FooterSlot />`.

---

## 2. Shared Rules When Merging Part B

1. **Brand Tokens (`src/styles/tokens.css`)**:
   - Do not redefine `:root` variables or add conflicting CSS resets.
   - Reuse `.awgzo-glass` / `<GlassCard />` (`src/components/ui/Glass.tsx`) and `--awgzo-orange` (`#E86C22`), `--awgzo-black` (`#080808`), `--awgzo-charcoal` (`#111111`), `--awgzo-dark-grey` (`#1A1A1A`), `--awgzo-white` (`#FFFFFF`), `--awgzo-muted` (`#A0A0A0`).
2. **Single Lenis + GSAP Instance (`src/lib/scroll.ts`)**:
   - Never initialize a second `new Lenis()` or call duplicate `gsap.ticker` loops in Part B.
   - Import `{ gsap, ScrollTrigger, SplitText, scrollToSection } from '../../lib/scroll'` and wrap each Part B section in its own `gsap.context(() => ..., el)` with `ctx.revert()` on unmount.
3. **Single Fixed WebGL Canvas (`src/components/canvas/PersistentCanvas.tsx`)**:
   - Never mount a second full-screen `<Canvas>` over `<PersistentCanvas />`.
   - Use `useReality()` from `src/context/RealityContext.tsx`: set `sceneStateRef.current.modelSlotBoost = 1` while `<ModelSlot />` is visible (or register custom meshes inside `PersistentCanvas`) so camera FOV, AR/VR lighting (`targetVrMix`), and core geometry react smoothly together.
4. **VR Confirmation Flag (`src/data/site.ts`)**:
   - `AWGZO_SITE.vrConfirmed` is `false` until the business owner verifies VR deliverables. Keep VR copy labeled `[VR — owner to confirm]` or flip `vrConfirmed: true` once verified.
