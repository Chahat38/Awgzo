import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Contact } from '../sections/Contact/Contact';
import { FooterSlot } from '../components/slots/TeammateSlots';
import { useReality } from '../context/RealityContext';
import { ScrollTrigger } from '../lib/scroll';

export default function ContactPage() {
  const { setActiveSection, sceneStateRef } = useReality();

  useEffect(() => {
    setActiveSection('contact');
    sceneStateRef.current.section = 'contact';
    window.scrollTo({ top: 0, behavior: 'auto' });
    const timer = window.setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => window.clearTimeout(timer);
  }, [setActiveSection, sceneStateRef]);

  return (
    <>
      <Helmet>
        <title>Contact AWGZO | AR VR XR Agency</title>
        <meta
          name="description"
          content="Contact AWGZO. Tell us about your AR, VR, WebXR, web or marketing project, call us or book a free call."
        />
        <link rel="canonical" href="https://awgzo.com/contact" />
      </Helmet>

      <main className="pt-6">
        <Contact />
      </main>
      <FooterSlot />
    </>
  );
}