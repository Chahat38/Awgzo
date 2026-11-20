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

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { setActiveSection, setPanoOpen, sceneStateRef } = useReality();

  const index = AWGZO_PROJECTS.findIndex((p) => p.slug === slug);
  const project = index >= 0 ? AWGZO_PROJECTS[index] : AWGZO_PROJECTS[0];
  const nextProject = AWGZO_PROJECTS[(Math.max(0, index) + 1) % AWGZO_PROJECTS.length];

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
        <title>{project.title} | AWGZO</title>
        <meta name="description" content={project.shortDescription} />
      </Helmet>

      <main className="relative z-10 min-h-screen pt-28 pb-20">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
          <Link
            to="/?section=portfolio"
            className="inline-flex items-center gap-2 font-mono-tabular text-xs font-medium text-[#A0A0A0] transition hover:text-[#E86C22]"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Selected AR &amp; Web Work
          </Link>

          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="font-mono-tabular text-xs font-semibold uppercase tracking-[0.2em] text-[#E86C22]">
                {project.indexLabel} · {project.category}
              </span>
              <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
                {project.title}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#A0A0A0]">
                {project.shortDescription}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {project.hasArLaunch && (
                <MagneticCta variant="orange" onClick={() => navigate('/?section=reality-lab')}>
                  <Compass className="h-4 w-4" /> Try in AR / VR Lab
                </MagneticCta>
              )}
              {project.has360View && (
                <MagneticCta variant="glass" onClick={() => setPanoOpen(true)}>
                  <Compass className="h-4 w-4 text-[#3B82F6]" /> Open Full 360°
                </MagneticCta>
              )}
            </div>
          </div>

          <GlassCard className="mt-8 overflow-hidden p-3 sm:p-4">
            <div className="overflow-hidden rounded-2xl border border-white/12 bg-[#080808]">
              {project.videoUrl ? (
                <video
                  src={project.videoUrl}
                  poster={project.poster}
                  controls
                  muted
                  playsInline
                  preload="none"
                  aria-label={`${project.title} demonstration video`}
                  className="max-h-[480px] w-full object-cover"
                />
              ) : project.has360View ? (
                <PanoViewport className="h-[420px]" />
              ) : (
                <SmartImage
                  src={project.poster}
                  fallbackSrc={project.fallbackPoster}
                  alt={`${project.title} — ${project.category}`}
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
              <span className="font-mono-tabular text-[11px] font-semibold uppercase tracking-widest text-[#E86C22]">
                Overview
              </span>
              <p className="mt-3 text-sm leading-relaxed text-[#A0A0A0]">{project.overview}</p>
            </GlassCard>

            <GlassCard className="p-6" depth="low">
              <span className="font-mono-tabular text-[11px] font-semibold uppercase tracking-widest text-[#E86C22]">
                Challenge
              </span>
              <p className="mt-3 text-sm leading-relaxed text-[#A0A0A0]">{project.challenge}</p>
            </GlassCard>

            <GlassCard className="p-6" depth="low">
              <span className="font-mono-tabular text-[11px] font-semibold uppercase tracking-widest text-[#E86C22]">
                Solution
              </span>
              <p className="mt-3 text-sm leading-relaxed text-[#A0A0A0]">{project.solution}</p>
            </GlassCard>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-12">
            <GlassCard className="p-6 lg:col-span-5" depth="low">
              <div className="flex items-center gap-2 font-mono-tabular text-xs font-semibold text-[#E86C22]">
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
                    className="h-44 overflow-hidden rounded-xl border border-white/12 bg-[#080808]"
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
              className="awgzo-glass awgzo-glass--low inline-flex items-center gap-3 rounded-full px-6 py-3.5 text-sm font-semibold text-white transition hover:border-[#E86C22]"
            >
              <span>
                Next Project: <span className="text-[#E86C22]">{nextProject.title}</span>
              </span>
              <ArrowRight className="h-4 w-4 text-[#E86C22]" />
            </Link>
          </div>
        </div>
      </main>
      <FooterSlot />
    </>
  );
}
