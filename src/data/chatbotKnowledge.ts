import { AWGZO_SITE } from './site';

export interface KnowledgeMatch {
  answer: string;
  actionLabel?: 'Book a Free Call' | 'WhatsApp Community' | 'Email hello@awgzo.com';
  actionHref?: string;
}

export const CHATBOT_WELCOME =
  "Hi, I'm the AWGZO assistant. Ask about our AR & VR work, services or booking a call.";

export function matchChatbotReply(input: string): KnowledgeMatch {
  const q = input.trim().toLowerCase();

  if (q.includes('ar vs vr') || (q.includes('ar') && q.includes('vr'))) {
    return {
      answer:
        'AR layers digital 3D objects onto the real world through a camera—ideal for product try-on, TikTok effects, and AR business cards. VR places viewers inside an immersive 360° virtual environment. Book a quick call and we can recommend the right format for your campaign.',
      actionLabel: 'Book a Free Call',
      actionHref: AWGZO_SITE.contact.calendlyUrl,
    };
  }

  if (q.includes('what is vr') || q === 'vr' || q.includes('virtual reality')) {
    return {
      answer:
        'Virtual Reality (VR) immerses audiences in a simulated 3D or 360° environment explored via headsets or browser viewers. Book a consultation to scope an interactive VR room or product showcase.',
      actionLabel: 'Book a Free Call',
      actionHref: AWGZO_SITE.contact.calendlyUrl,
    };
  }

  if (q.includes('what is ar') || q.includes('try-on') || q.includes('try on') || q.includes('tiktok')) {
    return {
      answer:
        'AWGZO builds augmented reality experiences for mobile, web, and iOS—including AR try-on for e-commerce, scannable AR business cards, and custom TikTok AR effects.',
      actionLabel: 'Book a Free Call',
      actionHref: AWGZO_SITE.contact.calendlyUrl,
    };
  }

  if (q.includes('service') || q.includes('what do you do') || q.includes('offer')) {
    return {
      answer: `Our core services include ${AWGZO_SITE.servicesVerified.join(', ')}, and AR & VR Experiences—tailored by our Kohat-based digital marketing, design, and engineering team.`,
      actionLabel: 'Book a Free Call',
      actionHref: AWGZO_SITE.contact.calendlyUrl,
    };
  }

  if (q.includes('quote') || q.includes('price') || q.includes('cost') || q.includes('pricing')) {
    return {
      answer:
        'Every campaign and software build is scoped to your goals, so we prepare custom quotes after a short discovery call or project brief.',
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
    q.includes('address') ||
    q.includes('location') ||
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
      'I can share verified details about AWGZO’s AR development, TikTok effects, web & e-commerce builds, software, marketing services, and studio hours. Ready to start a project?',
    actionLabel: 'Book a Free Call',
    actionHref: AWGZO_SITE.contact.calendlyUrl,
  };
}

export async function askAI(_message: string): Promise<string | null> {
  return null;
}
