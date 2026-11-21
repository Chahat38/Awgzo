export type ProjectKind = 'AR' | 'VR' | 'Web';

export interface AwgzoProject {
  slug: string;
  indexLabel: string;
  title: string;
  category: string;
  kind: ProjectKind;
  shortDescription: string;
  altText: string;
  overview: string;
  challenge: string;
  solution: string;
  technologies: string[];
  poster: string;
  fallbackPoster: string;
  posterWidth: number;
  posterHeight: number;
  videoUrl?: string;
  videoTitle?: string;
  videoDescription?: string;
  gallery: string[];
  hasArLaunch?: boolean;
  has360View?: boolean;
}

export const AWGZO_PROJECTS: AwgzoProject[] = [
  {
    slug: '3d-ar-ecommerce',
    indexLabel: '01',
    title: '3D AR E-Commerce Showcase',
    category: 'AR Development · E-Commerce',
    kind: 'AR',
    shortDescription: 'Let shoppers inspect products in 3D and place them in their space with WebAR before buying.',
    altText: '3D AR product viewer showing a product placed in a room via WebAR',
    overview:
      'AWGZO built a browser-based 3D product viewer for an online storefront, combining interactive WebGL models with mobile AR placement. Shoppers can rotate items, zoom into finishes and preview scale in their own room without installing an app. The experience is designed to load quickly on everyday phones while keeping the product story clear from first tap to add-to-cart. It suits brands testing AR try-on for e-commerce.',
    challenge:
      'Flat gallery images make it hard to judge size, texture and how a product fits a real space. Mobile shoppers often leave before they understand the details, and app-based AR adds friction that many customers will not accept. The goal was to make inspection feel immediate, familiar and useful inside the existing buying journey. AWGZO needed a lightweight path that worked on both web and phone cameras.',
    solution:
      'We created compact 3D assets with practical PBR materials, then wrapped them in a clean WebAR viewer with tap, rotate and place controls. The interface guides users from product detail to camera view in a few steps, with fallback images for devices that cannot launch AR. Every interaction is built to support product understanding, not distract from it. The same viewer can be reused across product ranges.',
    technologies: ['WebAR', 'Three.js / WebGL', '3D PBR Assets', 'AR Try-On'],
    poster: '/src/assets/images/project_ar_ecommerce_1795151334397.jpg',
    fallbackPoster: '/src/assets/images/project_ar_ecommerce_1795151334397.jpg',
    posterWidth: 800,
    posterHeight: 600,
    videoUrl: 'https://awgzo.com/wp-content/uploads/2025/04/3d-AR-Ecommerce.mp4',
    videoTitle: '3D AR E-Commerce Showcase — WebAR Product Viewer',
    videoDescription:
      'A short demo of a product moving from a 3D web viewer into a phone camera view for AR placement.',
    gallery: [
      '/src/assets/images/project_ar_ecommerce_1795151334397.jpg',
      '/src/assets/images/project_maajik_web_1795151334331.jpg',
    ],
    hasArLaunch: true,
  },
  {
    slug: 'ar-bowling-game',
    indexLabel: '02',
    title: 'Interactive AR Bowling Game',
    category: 'AR Development · Interactive',
    kind: 'AR',
    shortDescription: 'A surface-tracked AR bowling game that turns tables and floors into a playable lane.',
    altText: 'Mobile AR bowling lane anchored on a table with a ball rolling toward pins',
    overview:
      'AWGZO designed a mobile AR mini-game that places a bowling lane on real tables and floors using plane detection. Players aim, swipe and release while the ball responds to simple physics in the camera view. Built as a playful brand activation, it shows how augmented reality can earn attention through participation rather than passive viewing. The experience runs directly on a phone, with no headset or extra hardware.',
    challenge:
      'Mobile audiences scroll past static ads in seconds. A campaign needs a reason to stop, move the phone and try something with a friend. Traditional game builds can feel heavy, while complex controls lose people before the first throw. The brief was to create a shared AR moment that felt obvious from the first second. It had to work on common indoor surfaces without printed markers.',
    solution:
      'We used surface tracking to anchor the lane, added responsive physics for roll and impact, and kept the control set to aim and release. Visual cues guide placement when a surface is not detected, and the interface resets quickly for another turn. The result is a compact interactive AR game that brands can use for events and social content. No app installation or external marker is required.',
    technologies: ['Mobile AR', 'Plane Detection', 'Interactive 3D', 'Real-Time Physics'],
    poster: '/src/assets/images/project_ar_bowling_1795151335041.jpg',
    fallbackPoster: '/src/assets/images/project_ar_bowling_1795151335041.jpg',
    posterWidth: 800,
    posterHeight: 600,
    videoUrl: 'https://awgzo.com/wp-content/uploads/2025/04/Bowling-Game.mp4',
    videoTitle: 'Interactive AR Bowling Game — Surface-Tracked Demo',
    videoDescription:
      'A phone-camera demo showing an AR bowling lane placed on a table and played with simple swipe controls.',
    gallery: ['/src/assets/images/project_ar_bowling_1795151335041.jpg'],
    hasArLaunch: true,
  },
  {
    slug: 'tiktok-ar-effects',
    indexLabel: '03',
    title: 'Custom AR & TikTok Effects',
    category: 'TikTok Effects · Social AR',
    kind: 'AR',
    shortDescription: 'Face-tracked TikTok effects and custom AR filters built for creator sharing.',
    altText: 'Creator using a custom TikTok face-tracking AR effect with colourful overlays',
    overview:
      'AWGZO creates custom TikTok AR effects in Effect House using face tracking, gesture triggers and stylised overlays. Each effect is designed for the way people actually use the camera: quick to open, easy to understand and fun to repeat. The work helps brands join a conversation creators already care about instead of interrupting it. Effects can support launches, challenges or always-on brand visibility.',
    challenge:
      'A social filter has seconds to make sense. If tracking feels slow or the visual looks flat on camera, creators move on. Many brand effects also try to say too much at once. The task was to build effects that feel native to TikTok, reward a simple gesture and stay light enough for everyday phones. That means careful asset sizing and restrained shader work.',
    solution:
      'We build each effect around one clear interaction, then tune face mesh tracking and shaders for stable mobile performance. Overlays are layered so the effect reads well in different lighting and on different skin tones, with gesture triggers that feel intuitive. Delivery includes the published effect and guidance for creators using it. The goal is repeat use, not a one-off novelty.',
    technologies: ['TikTok Effect House', 'Face Mesh Tracking', 'Real-Time Shaders'],
    poster: '/src/assets/images/project_tiktok_effects_1795151334452.jpg',
    fallbackPoster: '/src/assets/images/project_tiktok_effects_1795151334452.jpg',
    posterWidth: 800,
    posterHeight: 600,
    videoUrl: 'https://awgzo.com/wp-content/uploads/2025/04/Ar-Effects.mp4',
    videoTitle: 'Custom TikTok AR Effects — Face Tracking Demo',
    videoDescription:
      'A camera demo of a branded TikTok effect reacting to face movement and gestures.',
    gallery: ['/src/assets/images/project_tiktok_effects_1795151334452.jpg'],
    hasArLaunch: true,
  },
  {
    slug: 'ar-business-card',
    indexLabel: '04',
    title: 'Interactive AR Business Card',
    category: 'AR Development · Print to Spatial',
    kind: 'AR',
    shortDescription: 'Scan a printed card to reveal 3D visuals, links and a compact digital showcase.',
    altText: 'Printed business card opening a 3D AR showcase when scanned by a phone',
    overview:
      'AWGZO turned a printed business card into an image-target AR experience. Scanning the card opens 3D animation, spatial labels and tap actions that connect straight to contact details or portfolio links. It keeps the familiarity of paper while giving the card a useful digital layer, useful for networking, pitches and event follow-ups. The scan runs in the browser, so recipients do not need a separate app.',
    challenge:
      'Business cards are often forgotten the moment a meeting ends. A QR code can help, but it rarely feels like part of the brand. The challenge was to make a small printed surface feel alive without slowing down the person scanning it, and without asking them to install anything new. It also had to stay readable as a normal card first.',
    solution:
      'We prepared a clean image target from the card artwork, then built a short 3D reveal with clear spatial UI and direct links. The scan experience opens in WebAR, with fallback content when tracking is unavailable. Print and digital were designed together so the card still works as a simple contact handout. That balance keeps the novelty useful rather than fragile.',
    technologies: ['Image Target AR', 'WebAR', '3D Animation', 'Spatial UI'],
    poster: '/src/assets/images/project_ar_card_1795151334182.jpg',
    fallbackPoster: '/src/assets/images/project_ar_card_1795151334182.jpg',
    posterWidth: 800,
    posterHeight: 600,
    videoUrl: 'https://awgzo.com/wp-content/uploads/2025/04/ar-business-card-2.mp4',
    videoTitle: 'Interactive AR Business Card — Image Target Demo',
    videoDescription:
      'A phone scanning a printed card and revealing floating 3D visuals and tap links.',
    gallery: ['/src/assets/images/project_ar_card_1795151334182.jpg'],
    hasArLaunch: true,
  },
  {
    slug: 'maajik-website-build',
    indexLabel: '05',
    title: 'Maajik Web Platform',
    category: 'Website & E-commerce Development',
    kind: 'Web',
    shortDescription: 'Responsive e-commerce website with clean product browsing across mobile and desktop.',
    altText: 'Maajik e-commerce website shown across laptop and phone screens',
    overview:
      'AWGZO built a responsive web platform for Maajik with a clear product structure and calm visual system. Page layouts, imagery and navigation were shaped to keep browsing simple on phones and desktops alike. The site is part of our verified web portfolio and reflects a practical approach to e-commerce website development in Pakistan. Content and calls to action stay easy to scan at every screen size.',
    challenge:
      'An online store can lose shoppers when product pages feel crowded or slow. Maajik needed a layout that presented items clearly, kept the brand consistent and did not bury the next step on smaller screens. The build had to feel polished without adding unnecessary visual noise. That meant careful type scale, spacing and image treatment from the first scroll to checkout.',
    solution:
      'We organised the platform around readable product blocks, consistent spacing and clear navigation states. Responsive rules adapt grids and type for phone, tablet and desktop, while image treatment keeps the catalogue cohesive. The result is a storefront that feels light, focused and easy to understand wherever visitors open it. It gives the brand a dependable base for future campaigns and product launches.',
    technologies: ['Responsive Web', 'E-Commerce', 'UI/UX Design'],
    poster: 'https://awgzo.com/wp-content/uploads/2025/02/Maajik-Mockup-1-300x300.webp',
    fallbackPoster: '/src/assets/images/project_maajik_web_1795151334331.jpg',
    posterWidth: 300,
    posterHeight: 300,
    gallery: [
      'https://awgzo.com/wp-content/uploads/2025/02/Maajik-Mockup-1-300x300.webp',
      '/src/assets/images/project_maajik_web_1795151334331.jpg',
    ],
  },
  {
    slug: 'multi-device-web-launch',
    indexLabel: '06',
    title: 'Multi-Device Website Showcase',
    category: 'Website & E-commerce Development',
    kind: 'Web',
    shortDescription: 'Responsive launch website keeping layout and calls to action clear on every device.',
    altText: 'Website launch showcase displayed consistently on laptop, tablet and smartphone',
    overview:
      'AWGZO created a multi-device web showcase focused on consistency. The same brand rhythm, typography and call-to-action placement carry from laptop to tablet to phone, so visitors always know where to look next. It is a practical example of responsive website development for brands launching campaigns across several screens. The build keeps visual impact without hiding key information on compact displays.',
    challenge:
      'Large brand layouts often break when they meet a small screen. Columns collapse, type shrinks and the primary action slips below the fold. The task was to keep a launch page expressive while making sure the message and next step stayed legible on every device people actually use. That required flexible grids and restrained motion, not a separate mobile afterthought.',
    solution:
      'We set fluid grid rules, tested type at real viewport sizes and kept the CTA in a predictable position. Imagery scales with the layout instead of overriding it, and spacing adapts so the page never feels cramped. The result is one cohesive launch experience that reads cleanly from desktop down to phone. It gives campaign teams a dependable page to share across channels.',
    technologies: ['Responsive UI', 'Frontend Architecture', 'Brand Systems'],
    poster:
      'https://awgzo.com/wp-content/uploads/2025/02/Minimalist-Neutral-Multi-Device-Computer-Mockup-Website-Launch-Instagram-Post-1-300x300.webp',
    fallbackPoster: '/src/assets/images/project_event_marketing_1795151334253.jpg',
    posterWidth: 300,
    posterHeight: 300,
    gallery: [
      'https://awgzo.com/wp-content/uploads/2025/02/Minimalist-Neutral-Multi-Device-Computer-Mockup-Website-Launch-Instagram-Post-1-300x300.webp',
      '/src/assets/images/project_event_marketing_1795151334253.jpg',
    ],
  },
  {
    slug: 'brand-web-experience',
    indexLabel: '07',
    title: 'Conversion Brand Website',
    category: 'Website & Digital Marketing',
    kind: 'Web',
    shortDescription: 'Focused landing website and social visuals built to turn campaign attention into enquiries.',
    altText: 'Conversion-focused brand landing page with matching social launch visuals',
    overview:
      'AWGZO paired a focused campaign landing page with matching social visuals for a cohesive brand launch. Copy, service framing and imagery were aligned so a click from social feels like a natural continuation of the same story. The build shows how a clear landing experience supports digital marketing without adding unnecessary complexity. Every section guides the visitor toward the next useful step.',
    challenge:
      'Social campaigns create curiosity, but the destination page often loses it. Slow loading, vague messaging or mismatched visuals make people hesitate. The challenge was to build one clear page that explained the offer quickly and matched the creative people had already seen in the feed. It needed to work as a standalone landing page too, arriving from search or direct links.',
    solution:
      'We shaped short copy blocks, a clear service frame and social visuals from one creative direction. The landing page keeps the message focused, with a visible next step for visitors who arrive ready to talk. All elements were written and laid out together so the campaign feels consistent from first impression to enquiry. The result is simple to maintain and easy to extend.',
    technologies: ['Web Design', 'Digital Branding', 'Landing Optimization'],
    poster:
      'https://awgzo.com/wp-content/uploads/2025/02/Pink-minimal-new-website-instagram-post-7-300x300.webp',
    fallbackPoster: '/src/assets/images/project_maajik_web_1795151334331.jpg',
    posterWidth: 300,
    posterHeight: 300,
    gallery: [
      'https://awgzo.com/wp-content/uploads/2025/02/Pink-minimal-new-website-instagram-post-7-300x300.webp',
      'https://awgzo.com/wp-content/uploads/2025/02/Aesthetic-Laptop-Mockup-Instagram-Post-1-300x300.webp',
    ],
  },
];
