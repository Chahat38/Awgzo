import { AWGZO_SITE } from './site';

export interface KnowledgeMatch {
  answer: string;
  actionLabel?: 'Book a Free Call' | 'WhatsApp Community' | 'Email hello@awgzo.com';
  actionHref?: string;
}

export const CHATBOT_WELCOME =
  "Hi, I’m AWGZO’s assistant. Ask about AR, VR, WebXR or booking a call.";

export function matchChatbotReply(input: string): KnowledgeMatch {
  const q = input.trim().toLowerCase();

  if (
    q.includes('where') ||
    q.includes('located') ||
    q.includes('address') ||
    q.includes('location') ||
    q.includes('g-11') ||
    q.includes('islamabad')
  ) {
    return {
      answer: `We're here: ${AWGZO_SITE.contact.address}. Want to visit or book a call?`,
      actionLabel: 'Book a Free Call',
      actionHref: AWGZO_SITE.contact.calendlyUrl,
    };
  }

  if (
    q.includes('tiktok') ||
    q.includes('filter') ||
    q.includes('effect house') ||
    q.includes('face tracking')
  ) {
    return {
      answer:
        'We build custom TikTok AR effects with face tracking and branded overlays for creators and campaigns. Want one for your brand?',
      actionLabel: 'Book a Free Call',
      actionHref: AWGZO_SITE.contact.calendlyUrl,
    };
  }

  if (
    q.includes('webar') ||
    q.includes('without an app') ||
    q.includes('browser ar') ||
    q.includes('scan')
  ) {
    return {
      answer:
        'Yes, WebAR works in the mobile browser. We build product viewers, AR try-on and scannable AR cards without an app download.',
      actionLabel: 'Book a Free Call',
      actionHref: AWGZO_SITE.contact.calendlyUrl,
    };
  }

  if (q.includes('vr') || q.includes('virtual reality')) {
    return {
      answer:
        'We build VR experiences as a service. Want to scope one with our team?',
      actionLabel: 'Book a Free Call',
      actionHref: AWGZO_SITE.contact.calendlyUrl,
    };
  }

  if (
    q.includes('what is ar') ||
    q.includes('try-on') ||
    q.includes('try on') ||
    q.includes('augmented reality')
  ) {
    return {
      answer:
        'AWGZO builds augmented reality for mobile, web and iOS — AR try-on, WebAR viewers, scannable AR cards and custom TikTok effects.',
      actionLabel: 'Book a Free Call',
      actionHref: AWGZO_SITE.contact.calendlyUrl,
    };
  }

  if (q.includes('service') || q.includes('what do you do') || q.includes('offer')) {
    return {
      answer: `Our services: ${AWGZO_SITE.servicesVerified.join(', ')}. Book a call.`,
      actionLabel: 'Book a Free Call',
      actionHref: AWGZO_SITE.contact.calendlyUrl,
    };
  }

  if (q.includes('quote') || q.includes('price') || q.includes('cost') || q.includes('pricing')) {
    return {
      answer:
        'Every build is scoped to your goals, so we share a custom quote after a short discovery call or project brief.',
      actionLabel: 'Book a Free Call',
      actionHref: AWGZO_SITE.contact.calendlyUrl,
    };
  }

  if (q.includes('book') || q.includes('call') || q.includes('meeting') || q.includes('calendly')) {
    return {
      answer: `Book a free strategy call on Calendly, or email ${AWGZO_SITE.contact.email}.`,
      actionLabel: 'Book a Free Call',
      actionHref: AWGZO_SITE.contact.calendlyUrl,
    };
  }

  if (
    q.includes('contact') ||
    q.includes('phone') ||
    q.includes('email') ||
    q.includes('whatsapp')
  ) {
    return {
      answer: `Studio: ${AWGZO_SITE.contact.address} · Phone: ${AWGZO_SITE.contact.phone} · Email: ${AWGZO_SITE.contact.email}.`,
      actionLabel: 'WhatsApp Community',
      actionHref: AWGZO_SITE.contact.whatsappCommunityUrl,
    };
  }

  return {
    answer:
      'I can share details about AWGZO’s AR Development, VR Experiences, WebXR, TikTok effects, web, software and marketing services. Ready to start?',
    actionLabel: 'Book a Free Call',
    actionHref: AWGZO_SITE.contact.calendlyUrl,
  };
}

export async function askAI(_message: string): Promise<string | null> {
  return null;
}
