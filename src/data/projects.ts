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
    shortDescription: 'WebAR product viewer with 3D AR try-on and mobile placement for online stores.',
    altText: 'WebAR product viewer with 3D AR try-on on a phone',
    overview: 'WebAR product viewer with 3D AR try-on for mobile shoppers.',
    challenge: 'Flat images hide scale and finish, causing hesitation before purchase.',
    solution: 'Compact 3D assets and a browser viewer with place, rotate and zoom controls.',
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
    shortDescription: 'Surface-tracked AR bowling game that turns any table into a playable lane.',
    altText: 'AR bowling lane on a table with a ball rolling toward pins',
    overview: 'Mobile AR game that anchors a bowling lane on real surfaces.',
    challenge: 'Static ads rarely earn a second look from mobile audiences.',
    solution: 'Plane tracking, simple swipe controls and quick reset for repeat play.',
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
    shortDescription: 'Face-tracked TikTok AR effects and branded filters made for sharing.',
    altText: 'Creator using a TikTok AR effect with face tracking overlays',
    overview: 'TikTok AR effects built for creators, reactions and repeat use.',
    challenge: 'Social filters must read fast and stay light on everyday phones.',
    solution: 'One clear interaction, tuned face tracking and restrained overlays.',
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
    shortDescription: 'Printed card that opens a WebAR showcase with 3D visuals and direct links.',
    altText: 'Printed business card opening a WebAR showcase with 3D visuals',
    overview: 'Print card that opens a WebAR layer when scanned by phone.',
    challenge: 'Paper cards are easy to forget after a meeting ends.',
    solution: 'Image target, short 3D reveal and direct tap links in the browser.',
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
    shortDescription: 'Responsive e-commerce site with clean product browsing on mobile and desktop.',
    altText: 'Maajik e-commerce website on laptop and phone screens',
    overview: 'Responsive e-commerce site with a calm product structure.',
    challenge: 'Crowded product pages slow down browsing and checkout.',
    solution: 'Readable product blocks, consistent spacing and clear mobile paths.',
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
    shortDescription: 'Launch site with consistent layout and CTAs across laptop, tablet and phone.',
    altText: 'Launch website shown on laptop, tablet and smartphone',
    overview: 'Launch site with one clear message across screens.',
    challenge: 'Large layouts often lose type and CTAs on small displays.',
    solution: 'Fluid grids, tested type sizes and a predictable CTA position.',
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
    shortDescription: 'Focused landing page and social visuals built to turn campaign attention into enquiries.',
    altText: 'Conversion brand landing page with matching social launch visuals',
    overview: 'Landing page and social visuals shaped from one creative direction.',
    challenge: 'Campaign clicks often land on pages that feel disconnected.',
    solution: 'Short copy, matched visuals and a visible next step for enquiries.',
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
