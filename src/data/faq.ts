export const FAQ_ITEMS = [
  {
    question: 'What is AR, VR and XR?',
    answer:
      'AR overlays digital visuals on the real world. VR creates a fully digital space. XR covers both, including WebXR in the browser.',
  },
  {
    question: 'What does AWGZO do?',
    answer:
      'AWGZO is an AR VR XR agency. We build AR try-on, VR experiences, WebXR, TikTok effects, websites, software and marketing.',
  },
  {
    question: 'Do you build VR experiences?',
    answer:
      'Yes. We scope VR experiences as new builds for demos and training. No VR project is in our portfolio yet; book a call to plan yours.',
  },
  {
    question: 'Can AR run without an app?',
    answer:
      'Yes. WebAR opens in a mobile browser. We build AR try-on, WebAR viewers and AR business cards that work on everyday phones.',
  },
  {
    question: 'Do you make TikTok AR effects?',
    answer:
      'Yes. We create TikTok AR effects with face tracking and branded overlays for creators and campaigns.',
  },
  {
    question: 'Where is AWGZO located?',
    answer:
      'Visit: Flat 2, Block 32-C, Street 102, Gate 9, Ibn-e-Sina Road, G-11/3, Islamabad, Pakistan. Call +92 335 8595274 or email hello@awgzo.com.',
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
