import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Achievements, MissionVision, TeamMission } from '../sections/About/AboutSections';
import { Team } from '../sections/Team/Team';
import { ClientOnboarding } from '../sections/ClientOnboarding/ClientOnboarding';
import { FooterSlot } from '../components/slots/TeammateSlots';
import { useReality } from '../context/RealityContext';
import { ScrollTrigger } from '../lib/scroll';

export default function AboutPage() {
  const { setActiveSection, sceneStateRef } = useReality();

  useEffect(() => {
    setActiveSection('detail');
    sceneStateRef.current.section = 'detail';
    window.scrollTo({ top: 0, behavior: 'auto' });
    const timer = window.setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => window.clearTimeout(timer);
  }, [setActiveSection, sceneStateRef]);

  return (
    <>
      <Helmet>
        <title>About AWGZO | Mission, Vision & Team</title>
        <meta
          name="description"
          content="About AWGZO, an AR VR XR agency: our mission and vision, team mission, achievements and the team behind the work."
        />
        <link rel="canonical" href="https://awgzo.com/about" />
      </Helmet>

      <main>
        <MissionVision />
        <TeamMission />
        <Achievements />
        <Team />
        <ClientOnboarding />
      </main>
      <FooterSlot />
    </>
  );
}
