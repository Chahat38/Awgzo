# AWGZO — Owner Replacement & Launch Checklist

Keep this file internal (not linked in the public UI). Replace or verify each item below before production launch:

1. **Brand Logo Asset (`src/data/site.ts` → `logoUrl`)**
   - Provide a local WebP/SVG logo mark and/or lockup under `/public/assets/`.
   - Note: `AwgzoLogo` automatically avoids duplicate text if `logoIncludesWordmark: true`. Set `logoIncludesWordmark` in `src/data/site.ts` to match your final image.

2. **Hero & AR Try-On 3D Model (`/public/assets/awgzo-object.glb`)**
   - Replace the starter cube GLB with a Draco/meshopt-compressed GLB (`<= 1 MB`, KTX2 textures preferred) for `<model-viewer>` AR Quick-Look / Scene Viewer.

3. **360° Horizon Panorama (`src/assets/images/awgzo_studio_pano_1795169316872.jpg`)**
   - Integrated into `src/data/site.ts` and `src/components/xr/PanoViewer.tsx` (procedural horizon remains as fallback). Replace the image in `src/data/site.ts` anytime if you shoot a physical studio photo.

4. **Portfolio Videos (`src/data/projects.ts`)**
   - Self-host the 4 AR showcase videos on your CDN instead of hotlinking `awgzo.com`:
     - Export each clip at **720p H.264 MP4 + WebM (`<= 2 MB` each)**.
     - Supply local WebP/AVIF posters with explicit `width` and `height`.
   - Expand project overview, challenge, and solution narratives in `src/data/projects.ts` for `/work/:slug`.

5. **Verified VR Showcase Projects (`src/data/projects.ts`)**
   - Currently `AWGZO_PROJECTS` contains verified AR and Web items only, so the `VR` filter tab stays hidden automatically.
   - Add real `kind: 'VR'` project entries once VR case-study videos/imagery are ready; the `VR` filter chip will appear automatically.

6. **Real Team Members (`src/data/team.ts`)**
   - Populate `AWGZO_TEAM` with real team member names, roles, bios, photos, and social links.
   - While `AWGZO_TEAM` is empty, the Team section and Team navbar link stay hidden automatically (preview dummy members only via `?demo=1` during local development).

7. **Contact Form Endpoint (`.env` / `VITE_FORM_ENDPOINT`)**
   - Set `VITE_FORM_ENDPOINT` (e.g. `/api/contact` or a Formspree/Resend endpoint) in environment secrets before launch. Until configured, submitting the form directs visitors to `hello@awgzo.com` and Calendly.

8. **Teammate Testimonials Fix (`src/components/slots/TeammateSlots.tsx` consumer)**
   - Ensure Part B Testimonials fixes `"There strong"` → `"Their strong"` when merged.
