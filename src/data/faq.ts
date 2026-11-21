export const FAQ_ITEMS = [
  {
    question: 'What does AWGZO do?',
    answer:
      'AWGZO is a digital marketing and tech agency in Islamabad, Pakistan. We build AR experiences, TikTok effects, websites, e-commerce stores, software and brand strategy. Our team helps brands turn a short brief into useful, interactive work that people can actually use.',
  },
  {
    question: 'What is AR marketing?',
    answer:
      'AR marketing uses augmented reality to place digital visuals into the real world through a phone or web camera. Instead of only viewing an ad, people can try a product, scan a card or play with a branded effect. It makes the message easier to explore and remember.',
  },
  {
    question: 'Can we use AR without an app?',
    answer:
      'Yes. WebAR runs in the mobile browser, so customers can open a link or scan a code and see the experience without installing anything. AWGZO builds WebAR product viewers, AR try-on and scannable AR business cards that load on everyday phones.',
  },
  {
    question: 'Do you make TikTok AR effects?',
    answer:
      'Yes. We create custom TikTok AR effects in Effect House using face tracking, gestures and branded overlays. Each effect is tuned for quick loading and repeat use, so creators can film, react and share naturally. Tell us the campaign idea and we will shape the right effect.',
  },
  {
    question: 'Do you build websites and online stores?',
    answer:
      'Yes. AWGZO designs and develops responsive websites, e-commerce stores and focused landing pages. We keep navigation clear, calls to action visible and layouts readable on phone, tablet and desktop. Every build starts with the next step you want visitors to take.',
  },
  {
    question: 'Can AWGZO build custom software or AI platforms?',
    answer:
      'Yes. Our software work covers web platforms, mobile apps and AI-powered tools that reduce repetitive tasks or support better decisions. We scope the build in stages, keep communication direct and hand over systems your team can maintain. Book a call to discuss your idea.',
  },
  {
    question: 'How much does a project cost?',
    answer:
      'Every project is scoped to its goals, so we share a custom quote after a short discovery call or project brief. That lets us price the right mix of AR, web, software or marketing instead of guessing. Send your brief or book a free consultation to start.',
  },
  {
    question: 'Where is AWGZO located?',
    answer:
      'AWGZO is based in Islamabad, Pakistan. Our studio is at Flat 2, Block 32-C, Street 102, Gate 9, Ibn-e-Sina Road, G-11/3, Islamabad, Pakistan. We work with clients across Pakistan and can meet by call or video.',
  },
];

export const FAQ_PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};
