import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Hero } from '../sections/Hero/Hero';
import { Portfolio } from '../sections/Portfolio/Portfolio';
import { RealityLab } from '../sections/RealityLab/RealityLab';
import { Team } from '../sections/Team/Team';
import { Contact } from '../sections/Contact/Contact';
import {
  ServicesSlot,
  TestimonialsSlot,
  PythonLibSlot,
  FooterSlot,
} from '../components/slots/TeammateSlots';
import { scrollToSection } from '../lib/scroll';

export default function HomePage({ loaderDone = true }: { loaderDone?: boolean }) {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const target = params.get('section');
    if (target) {
      const timer = window.setTimeout(() => scrollToSection(target), 120);
      return () => window.clearTimeout(timer);
    }
  }, [location.search]);

  return (
    <>
      <Helmet>
        <title>AWGZO | AR &amp; VR Marketing Agency in Pakistan</title>
        <meta
          name="description"
          content="AWGZO builds AR experiences, TikTok effects, websites, software and digital marketing that help brands grow. Book a free call."
        />
        <link rel="canonical" href="https://awgzo.com/" />
      </Helmet>

      <main>
        <Hero loaderDone={loaderDone} />
        <ServicesSlot />
        <Portfolio />
        <RealityLab />
        <Team />
        <TestimonialsSlot />
        <PythonLibSlot />
        <Contact />
      </main>
      <FooterSlot />
    </>
  );
}
