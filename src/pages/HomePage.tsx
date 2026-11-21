import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Hero } from '../sections/Hero/Hero';
import { Portfolio } from '../sections/Portfolio/Portfolio';
import { RealityLab } from '../sections/RealityLab/RealityLab';
import { Team } from '../sections/Team/Team';
import { FAQ } from '../sections/FAQ/FAQ';
import { Contact } from '../sections/Contact/Contact';
import { FAQ_PAGE_SCHEMA } from '../data/faq';
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
        <title>AWGZO | AR VR XR Agency Islamabad</title>
        <meta
          name="description"
          content="AWGZO is an AR VR XR agency in Islamabad, Pakistan. We build AR try-on, VR experiences, WebXR, TikTok effects, websites and software. Book a call."
        />
        <link rel="canonical" href="https://awgzo.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://awgzo.com/" />
        <meta property="og:title" content="AWGZO | AR VR XR Agency Islamabad" />
        <meta
          property="og:description"
          content="AWGZO is an AR VR XR agency in Islamabad, Pakistan. We build AR try-on, VR experiences, WebXR, TikTok effects, websites and software. Book a call."
        />
        <meta
          property="og:image"
          content="https://awgzo.com/wp-content/uploads/2025/04/Awgzo-logo-3-e1743884108133.webp"
        />
        <meta property="og:image:alt" content="AWGZO AR VR XR agency in Islamabad, Pakistan" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AWGZO | AR VR XR Agency Islamabad" />
        <meta
          name="twitter:description"
          content="AWGZO is an AR VR XR agency in Islamabad, Pakistan. We build AR try-on, VR experiences, WebXR, TikTok effects, websites and software. Book a call."
        />
        <meta
          name="twitter:image"
          content="https://awgzo.com/wp-content/uploads/2025/04/Awgzo-logo-3-e1743884108133.webp"
        />
        <meta name="twitter:image:alt" content="AWGZO AR VR XR agency in Islamabad, Pakistan" />
        <script type="application/ld+json">
          {JSON.stringify(FAQ_PAGE_SCHEMA)}
        </script>
      </Helmet>

      <main>
        <Hero loaderDone={loaderDone} />
        <ServicesSlot />
        <Portfolio />
        <RealityLab />
        <Team />
        <TestimonialsSlot />
        <FAQ />
        <PythonLibSlot />
        <Contact />
      </main>
      <FooterSlot />
    </>
  );
}
