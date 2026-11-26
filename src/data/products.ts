/**
 * AWGZO products shown on the /products page.
 * To add a link later, just paste the website into `url` (empty string = "coming soon" button).
 */
export type ProductIcon = 'compass' | 'face' | 'hand' | 'game';

export interface AwgzoProduct {
  id: string;
  name: string;
  tag: string;
  description: string;
  icon: ProductIcon;
  url: string;
}

export const AWGZO_PRODUCTS: AwgzoProduct[] = [
  {
    id: 'ar-tourist-guide',
    name: 'AR Tourist Guide',
    tag: 'AR · Tourism',
    description:
      'Interactive 3D and AR tourist guide for Lahore Fort and the Japanese heritage pavilion, with a speaking character that narrates every landmark.',
    icon: 'compass',
    url: 'https://artouristguide.vercel.app/',
  },
  {
    id: 'tryon-face',
    name: 'Virtual Try-On for Face',
    tag: 'WebAR · Try-On',
    description:
      'Try earrings, necklaces, hairbands, hair clips and hijabs live with your camera or a photo. Every piece follows your face in real time.',
    icon: 'face',
    url: 'https://liveweb-tan.vercel.app',
  },
  {
    id: 'tryon-hands',
    name: 'Virtual Try-On for Hands',
    tag: 'WebAR · Try-On',
    description:
      'Try watches, rings and bracelets on your hand with live camera tracking, before you buy.',
    icon: 'hand',
    url: 'https://hand-try-on.vercel.app/',
  },
  {
    id: 'ar-bowling-game',
    name: 'AR Bowling Game',
    tag: 'WebAR · Game',
    description:
      'Surface-tracked AR bowling game that turns any table into a playable lane. Open it on your phone and start rolling.',
    icon: 'game',
    url: 'https://bowling-ar.vercel.app/',
  },
];
