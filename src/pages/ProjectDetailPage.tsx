import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ArrowRight, Compass, Layers } from 'lucide-react';
import { AWGZO_PROJECTS } from '../data/projects';
import { useReality } from '../context/RealityContext';
import { GlassCard, MagneticCta } from '../components/ui/Glass';
import { SmartImage } from '../components/common/SmartImage';
import { PanoViewport } from '../components/xr/PanoViewer';
import { FooterSlot } from '../components/slots/TeammateSlots';

const PROJECT_META: Record<string, { title: string; description: string }> = {
  '3d-ar-ecommerce': {
    title: '3D AR E-Commerce Showcase | AWGZO',
    description:
      'WebAR product viewer with 3D AR try-on and mobile placement for online stores. Built by AWGZO in Islamabad.',
  },
  'ar-bowling-game': {
    title: 'Interactive AR Bowling Game | AWGZO',
    description:
      'Surface-tracked AR bowling game that turns any table into a playable lane. Built by AWGZO in Islamabad.',
  },
  'snap-ar-effects': {
    title: 'Snap AR Effects | AWGZO',
    description:
      'Face-tracked Snap AR effects and branded filters made for sharing. Built by AWGZO in Islamabad.',
  },
  'ar-business-card': {
    title: 'AR Business Card | AWGZO',
    description:
      'Printed card that opens a WebAR showcase with 3D visuals and direct links. Built by AWGZO.',
  },
  'maajik-website-build': {
    title: 'Maajik Web Platform | AWGZO',
    description:
      'Responsive e-commerce site with clean product browsing on mobile and desktop. Built by AWGZO.',
  },
  'multi-device-web-launch': {
    title: 'Multi-Device Website Showcase | AWGZO',
    description:
      'Launch site with consistent layout and CTAs across laptop, tablet and phone. Built by AWGZO.',
  },
  'brand-web-experience': {
    title: 'Conversion Brand Website | AWGZO',
    description:
      'Focused landing page and social visuals built to turn campaign attention into enquiries. By AWGZO.',
  },
};

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { setActiveSection, setPanoOpen, sceneStateRef } = useReality();

  const index = AWGZO_PROJECTS.findIndex((p) => p.slug === slug);
  const project = index >= 0 ? AWGZO_PROJECTS[index] : AWGZO_PROJECTS[0];
  const nextProject = AWGZO_PROJECTS[(Math.max(0, index) + 1) % AWGZO_PROJECTS.length];
  const meta = PROJECT_META[project.slug];

  useEffect(() => {
    setActiveSection('detail');
    sceneStateRef.current.section = 'detail';
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [slug, setActiveSection, sceneStateRef]);

  return (
    <>
      <Helmet>
        <title>{meta?.title ?? `${project.title} | AWGZO`}</title>
        <meta name="description" content={meta?.description ?? project.shortDescription} />
        <link rel="canonical" href={`https://awgzo.com/work/${project.slug}`} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://awgzo.com/work/${project.slug}`} />
        <meta property="og:title" content={meta?.title ?? `${project.title} | AWGZO`} />
        <meta
          property="og:description"
          content={meta?.description ?? project.shortDescription}
        />
        <meta
          property="og:image"
          content={
            project.poster.startsWith('http')
              ? project.poster
              : 'https://awgzo.com/wp-content/uploads/2025/04/Awgzo-logo-3-e1743884108133.webp'
          }
        />
        <meta property="og:image:alt" content={project.altText} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={meta?.title ?? `${project.title} | AWGZO`} />
        <meta
          name="twitter:description"
          content={meta?.description ?? project.shortDescription}
        />
        <meta
          name="twitter:image"
          content={
            project.poster.startsWith('http')
              ? project.poster
              : 'https://awgzo.com/wp-content/uploads/2025/04/Awgzo-logo-3-e1743884108133.webp'
          }
        />
        <meta name="twitter:image:alt" content={project.altText} />
      </Helmet>

      <main className="relative z-10 min-h-screen pt-28 pb-20">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
          <Link
            to="/?section=portfolio"
            className="inline-flex items-center gap-2 font-mono-tabular text-xs font-medium text-white/60 transition hover:text-orange"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Selected AR &amp; Web Work
          </Link>

          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="font-mono-tabular text-xs font-semibold uppercase tracking-[0.2em] text-orange">
                {project.indexLabel} · {project.category}
              </span>
              <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
                {project.title}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/60">
                {project.shortDescription}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {project.hasArLaunch && (
                <MagneticCta variant="orange" onClick={() => navigate('/?section=reality-lab')}>
                  <Compass className="h-4 w-4" /> Try in AR Lab
                </MagneticCta>
              )}
              {project.has360View && (
                <MagneticCta variant="glass" onClick={() => setPanoOpen(true)}>
                  <Compass className="h-4 w-4 text-orange" /> Open Full 360°
                </MagneticCta>
              )}
            </div>
          </div>

          <GlassCard className="mt-8 overflow-hidden p-3 sm:p-4">
            <div className="overflow-hidden rounded-2xl border border-white/12 bg-black">
              {project.videoUrl ? (
                <video
                  src={project.videoUrl}
                  poster={project.poster}
                  controls
                  muted
                  playsInline
                  preload="none"
                  title={project.videoTitle}
                  aria-label={project.videoDescription ?? `${project.title} demonstration video`}
                  className="max-h-[480px] w-full object-cover"
                />
              ) : project.has360View ? (
                <PanoViewport className="h-[420px]" />
              ) : (
                <SmartImage
                  src={project.poster}
                  fallbackSrc={project.fallbackPoster}
                  alt={project.altText}
                  title={project.title}
                  width={project.posterWidth}
                  height={project.posterHeight}
                  className="max-h-[480px] w-full object-cover"
                />
              )}
            </div>
          </GlassCard>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <GlassCard className="p-6" depth="low">
              <span className="font-mono-tabular text-[11px] font-semibold uppercase tracking-widest text-orange">
                Overview
              </span>
              <p className="mt-3 text-sm leading-relaxed text-white/60">{project.overview}</p>
            </GlassCard>

            <GlassCard className="p-6" depth="low">
              <span className="font-mono-tabular text-[11px] font-semibold uppercase tracking-widest text-orange">
                Challenge
              </span>
              <p className="mt-3 text-sm leading-relaxed text-white/60">{project.challenge}</p>
            </GlassCard>

            <GlassCard className="p-6" depth="low">
              <span className="font-mono-tabular text-[11px] font-semibold uppercase tracking-widest text-orange">
                Solution
              </span>
              <p className="mt-3 text-sm leading-relaxed text-white/60">{project.solution}</p>
            </GlassCard>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-12">
            <GlassCard className="p-6 lg:col-span-5" depth="low">
              <div className="flex items-center gap-2 font-mono-tabular text-xs font-semibold text-orange">
                <Layers className="h-4 w-4" /> TECHNOLOGIES USED
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 font-mono-tabular text-xs text-white/90"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-6 lg:col-span-7" depth="low">
              <div className="font-mono-tabular text-xs font-semibold text-white">
                PROJECT GALLERY
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {project.gallery.map((imgUrl, idx) => (
                  <div
                    key={`${imgUrl}-${idx}`}
                    className="h-44 overflow-hidden rounded-xl border border-white/12 bg-black"
                  >
                    <SmartImage
                      src={imgUrl}
                      fallbackSrc={project.fallbackPoster}
                      alt={`${project.title} preview image ${idx + 1}`}
                      title={project.title}
                      width={project.posterWidth}
                      height={project.posterHeight}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          <div className="mt-10 flex justify-end">
            <Link
              to={`/work/${nextProject.slug}`}
              className="awgzo-glass awgzo-glass--low inline-flex items-center gap-3 rounded-full px-6 py-3.5 text-sm font-semibold text-white transition hover:border-orange"
            >
              <span>
                Next Project: <span className="text-orange">{nextProject.title}</span>
              </span>
              <ArrowRight className="h-4 w-4 text-orange" />
            </Link>
          </div>
        </div>
      </main>
      <FooterSlot />
    </>
  );
}
