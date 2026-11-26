/**
 * 3D Assistant — explanations.
 *
 * Only the Hero section has an info button / recording now.
 *
 * Voice: /audio/<id>.mp3 is played to the end when it exists. If the file is
 * missing, the browser voice reads the script for about EXPLAIN_SECONDS.
 */
export const EXPLAIN_SECONDS = 11;
/** Safety limit for a recorded voice file. */
export const MAX_AUDIO_SECONDS = 30;

export interface AssistantSection {
  id: string;
  script: string;
  audioUrl?: string;
}

export const ASSISTANT_SECTIONS: AssistantSection[] = [
  {
    id: 'hero',
    audioUrl: '/audio/hero-dramatic.mp3',
    script:
      'Welcome to AWGZO, your tech and marketing wizards. We build AR, VR and WebXR experiences for brands. Scroll down and I will walk you through everything we do.',
  },
];