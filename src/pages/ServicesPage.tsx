import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ServicesSlot, FooterSlot } from '../components/slots/TeammateSlots';
import { ClientOnboarding } from '../sections/ClientOnboarding/ClientOnboarding';
import { useReality } from '../context/RealityContext';
import { ScrollTrigger } from '../lib/scroll';

export default function ServicesPage() {
  const { setActiveSection, sceneStateRef } = useReality();

  useEffect(() => {
    setActiveSection('services');
    sceneStateRef.current.section = 'services';
    window.scrollTo({ top: 0, behavior: 'auto' });
    const timer = window.setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => window.clearTimeout(timer);
  }, [setActiveSection, sceneStateRef]);

  return (
    <>
      <Helmet>
        <title>AR VR XR Services | AWGZO</title>
        <meta
          name="description"
          content="AWGZO services: AR development, VR experiences, WebXR, TikTok effects, marketing, websites, software and consulting."
        />
        <link rel="canonical" href="https://awgzo.com/services" />
      </Helmet>

      <main>
        <ServicesSlot />
        <ClientOnboarding />
      </main>
      <FooterSlot />
    </>
  );
}
