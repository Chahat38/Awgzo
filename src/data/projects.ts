export type ProjectKind = 'AR' | 'VR' | 'Web';

export interface AwgzoProject {
  slug: string;
  indexLabel: string;
  title: string;
  category: string;
  kind: ProjectKind;
  shortDescription: string;
  overview: string;
  challenge: string;
  solution: string;
  technologies: string[];
  poster: string;
  fallbackPoster: string;
  posterWidth: number;
  posterHeight: number;
  videoUrl?: string;
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
    shortDescription: 'View products in 3D and augmented reality before you buy.',
    overview:
      'Interactive 3D product viewer and browser AR placement built for online storefronts without requiring app downloads.',
    challenge:
      'Shoppers struggle to judge proportions and surface finishes from flat gallery thumbnails alone.',
    solution:
      'Lightweight WebGL and mobile AR try-on scenes let visitors inspect scale and detail directly in their room.',
    technologies: ['WebAR', 'Three.js / WebGL', '3D PBR Assets', 'AR Try-On'],
    poster: '/src/assets/images/project_ar_ecommerce_1795151334397.jpg',
    fallbackPoster: '/src/assets/images/project_ar_ecommerce_1795151334397.jpg',
    posterWidth: 800,
    posterHeight: 600,
    videoUrl: 'https://awgzo.com/wp-content/uploads/2025/04/3d-AR-Ecommerce.mp4',
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
    shortDescription: 'Play spatial AR bowling anchored onto real-world tables and floors.',
    overview:
      'Surface-tracked augmented reality mini-game turning everyday indoor rooms into a playable interactive bowling lane.',
    challenge:
      'Mobile audiences scroll quickly past passive ads and look for hands-on brand moments.',
    solution:
      'Plane detection and responsive physics place an interactive lane right in front of the player.',
    technologies: ['Mobile AR', 'Plane Detection', 'Interactive 3D', 'Real-Time Physics'],
    poster: '/src/assets/images/project_ar_bowling_1795151335041.jpg',
    fallbackPoster: '/src/assets/images/project_ar_bowling_1795151335041.jpg',
    posterWidth: 800,
    posterHeight: 600,
    videoUrl: 'https://awgzo.com/wp-content/uploads/2025/04/Bowling-Game.mp4',
    gallery: ['/src/assets/images/project_ar_bowling_1795151335041.jpg'],
    hasArLaunch: true,
  },
  {
    slug: 'tiktok-ar-effects',
    indexLabel: '03',
    title: 'Custom AR & TikTok Effects',
    category: 'TikTok Effects · Social AR',
    kind: 'AR',
    shortDescription: 'Interactive TikTok filters designed for creator sharing and brand recall.',
    overview:
      'Custom TikTok Effect House filters combining face mesh tracking, gesture triggers, and stylized overlays.',
    challenge:
      'Social campaigns need playful mechanics creators want to film and share natively.',
    solution:
      'Custom Effect House shaders and facial tracking built for quick loading on mobile cameras.',
    technologies: ['TikTok Effect House', 'Face Mesh Tracking', 'Real-Time Shaders'],
    poster: '/src/assets/images/project_tiktok_effects_1795151334452.jpg',
    fallbackPoster: '/src/assets/images/project_tiktok_effects_1795151334452.jpg',
    posterWidth: 800,
    posterHeight: 600,
    videoUrl: 'https://awgzo.com/wp-content/uploads/2025/04/Ar-Effects.mp4',
    gallery: ['/src/assets/images/project_tiktok_effects_1795151334452.jpg'],
    hasArLaunch: true,
  },
  {
    slug: 'ar-business-card',
    indexLabel: '04',
    title: 'Interactive AR Business Card',
    category: 'AR Development · Print to Spatial',
    kind: 'AR',
    shortDescription: 'Scan a printed card to reveal interactive 3D visuals and direct links.',
    overview:
      'Print-to-spatial business card concept anchoring 3D animations and tap actions directly over paper stock.',
    challenge:
      'Traditional business cards carry static contact info with no interactive preview of digital work.',
    solution:
      'Image-target AR tracking turns every printed card into a pocket-sized interactive studio showcase.',
    technologies: ['Image Target AR', 'WebAR', '3D Animation', 'Spatial UI'],
    poster: '/src/assets/images/project_ar_card_1795151334182.jpg',
    fallbackPoster: '/src/assets/images/project_ar_card_1795151334182.jpg',
    posterWidth: 800,
    posterHeight: 600,
    videoUrl: 'https://awgzo.com/wp-content/uploads/2025/04/ar-business-card-2.mp4',
    gallery: ['/src/assets/images/project_ar_card_1795151334182.jpg'],
    hasArLaunch: true,
  },
  {
    slug: 'maajik-website-build',
    indexLabel: '05',
    title: 'Maajik Web Platform',
    category: 'Website & E-commerce Development',
    kind: 'Web',
    shortDescription: 'Responsive e-commerce website designed for clean mobile browsing.',
    overview:
      'Responsive digital storefront and brand web presence featured in AWGZO’s verified web portfolio.',
    challenge:
      'Desktop-heavy sites lose mobile visitors before they reach product details or checkout actions.',
    solution:
      'Clean typography hierarchy, fast-loading visual blocks, and intuitive cross-device navigation.',
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
    shortDescription: 'Cross-device launch website adapting cleanly from laptop to smartphone.',
    overview:
      'Modern web interface built to keep layout rhythm and CTA legibility consistent across screen sizes.',
    challenge:
      'Multi-column brand layouts frequently break or hide primary actions on compact screens.',
    solution:
      'Fluid responsive grids tailored for mobile, tablet, and desktop product launches.',
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
    shortDescription: 'Focused campaign landing website paired with social launch visuals.',
    overview:
      'Brand launch web build designed alongside digital marketing assets for cohesive campaign storytelling.',
    challenge:
      'Social campaigns need a matching destination page that communicates value within seconds.',
    solution:
      'Focused copy blocks, clear service framing, and unified social-to-web creative direction.',
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
