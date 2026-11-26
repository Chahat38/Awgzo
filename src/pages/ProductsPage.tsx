import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { RealityLab } from '../sections/RealityLab/RealityLab';
import { ProductsShowcase } from '../sections/Products/ProductsShowcase';
import { FooterSlot } from '../components/slots/TeammateSlots';
import { useReality } from '../context/RealityContext';
import { ScrollTrigger } from '../lib/scroll';

export default function ProductsPage() {
  const { setActiveSection, sceneStateRef } = useReality();

  useEffect(() => {
    setActiveSection('reality-lab');
    sceneStateRef.current.section = 'reality-lab';
    window.scrollTo({ top: 0, behavior: 'auto' });
    const timer = window.setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => window.clearTimeout(timer);
  }, [setActiveSection, sceneStateRef]);

  return (
    <>
      <Helmet>
        <title>Products | WebXR Reality Lab | AWGZO</title>
        <meta
          name="description"
          content="Try the AWGZO WebXR Reality Lab and explore our AR products: AR tourist guide, virtual try-on for face and hands, and an AR bowling game."
        />
        <link rel="canonical" href="https://awgzo.com/products" />
      </Helmet>

      <main className="pt-6">
        <RealityLab />
        <ProductsShowcase />
      </main>
      <FooterSlot />
    </>
  );
}