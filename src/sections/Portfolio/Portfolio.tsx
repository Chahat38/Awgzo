import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Compass, Play } from 'lucide-react';
import { AWGZO_PROJECTS, type AwgzoProject, type ProjectKind } from '../../data/projects';
import { useReality } from '../../context/RealityContext';
import { SmartImage } from '../../components/common/SmartImage';
import { GlassCard } from '../../components/ui/Glass';
import { gsap } from '../../lib/scroll';

type FilterKind = 'All' | ProjectKind;

function ProjectMediaCard({
  project,
  isCentered,
  sectionVisible,
  onSelect,
}: {
  project: AwgzoProject;
  isCentered: boolean;
  sectionVisible: boolean;
  onSelect: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  // Play muted MP4 video ONLY on the centered card when Portfolio is visible in viewport
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (sectionVisible && isCentered && !videoFailed) {
      vid.play().catch(() => {});
    } else {
      vid.pause();
    }
  }, [isCentered, sectionVisible, videoFailed]);

  return (
    <GlassCard
      role="article"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      tone={project.kind === 'AR' ? 'orange' : 'neutral'}
      className="group relative flex h-[360px] w-full shrink-0 flex-col overflow-hidden p-5 sm:h-[380px] lg:h-[400px] lg:w-[320px] xl:w-[370px] cursor-pointer"
      data-cursor="INSPECT"
    >
      <div className="font-mono-tabular text-[11px]">
        <span className="text-orange font-semibold">
          {project.indexLabel} · {project.kind}
        </span>
      </div>

      <div className="relative my-3 h-[170px] shrink-0 overflow-hidden rounded-xl border border-white/12 bg-black sm:h-[190px]">
        {project.videoUrl && !videoFailed ? (
          <video
            ref={videoRef}
            src={project.videoUrl}
            poster={project.poster}
            muted
            loop
            playsInline
            preload="none"
            title={project.videoTitle}
            aria-label={project.videoDescription ?? `${project.title} preview video`}
            onError={() => setVideoFailed(true)}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <SmartImage
            src={project.poster}
            fallbackSrc={project.fallbackPoster}
            alt={project.altText}
            title={project.title}
            width={project.posterWidth}
            height={project.posterHeight}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        )}
      </div>

      <div className="mt-auto border-t border-white/10 pt-3">
        <h3 className="font-display text-lg font-bold tracking-tight text-white sm:text-xl">
          {project.title}
        </h3>
        <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-white group-hover:text-orange">
          View Case Study <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </GlassCard>
  );
}

export function Portfolio() {
  const { setActiveSection, sceneStateRef } = useReality();
  const navigate = useNavigate();

  const [filter, setFilter] = useState<FilterKind>('All');
  const [centeredIdx, setCenteredIdx] = useState(0);
  const [sectionVisible, setSectionVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const hasVrProjects = useMemo(
    () => AWGZO_PROJECTS.some((p) => p.kind === 'VR'),
    []
  );

  const filterTabs = useMemo<FilterKind[]>(
    () => (hasVrProjects ? ['All', 'AR', 'VR', 'Web'] : ['All', 'AR', 'Web']),
    [hasVrProjects]
  );

  const filteredProjects = useMemo(() => {
    if (filter === 'All') return AWGZO_PROJECTS;
    return AWGZO_PROJECTS.filter((p) => p.kind === filter);
  }, [filter]);

  useEffect(() => {
    setCenteredIdx(0);
    setProgress(0);
  }, [filter]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof window === 'undefined') return;

    const obs = new IntersectionObserver(
      (entries) => {
        const isVis = Boolean(entries[0]?.isIntersecting);
        setSectionVisible(isVis);
        if (isVis) {
          setActiveSection('portfolio');
          sceneStateRef.current.section = 'portfolio';
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);

    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        const track = trackRef.current;
        if (!track) return;

        const updateCylinder = (p: number) => {
          const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
          if (!cards.length) return;
          const activeFloat = p * (cards.length - 1);
          const closest = Math.round(activeFloat);
          setCenteredIdx(closest);

          const velSkew = Math.max(-4, Math.min(4, sceneStateRef.current.scrollVelocity * 0.16));

          cards.forEach((card, i) => {
            const offset = i - activeFloat;
            const absOffset = Math.abs(offset);
            const rotateY = Math.max(-28, Math.min(28, offset * -14));
            const translateZ = -absOffset * 70;
            const scale = Math.max(0.82, 1 - absOffset * 0.085);
            const opacity = Math.max(0.38, 1 - absOffset * 0.25);

            card.style.transform = `perspective(1200px) rotateY(${rotateY}deg) translateZ(${translateZ}px) scale(${scale}) skewY(${velSkew * 0.35}deg)`;
            card.style.opacity = `${opacity}`;
          });
        };

        const totalShift = Math.max(1, (filteredProjects.length - 1) * 390);
        updateCylinder(0);

        gsap.to(track, {
          x: -totalShift,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: `+=${Math.max(900, filteredProjects.length * 420)}`,
            pin: true,
            scrub: 0.7,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              setProgress(self.progress);
              updateCylinder(self.progress);
            },
          },
        });
      });
    }, el);

    return () => {
      obs.disconnect();
      mm.revert();
      ctx.revert();
    };
  }, [filteredProjects, setActiveSection, sceneStateRef]);

  const countLabel = `${String(Math.min(filteredProjects.length, centeredIdx + 1)).padStart(2, '0')} / ${String(
    filteredProjects.length
  ).padStart(2, '0')}`;

  return (
    <section
      id="portfolio"
      ref={sectionRef}
      className="relative z-10 overflow-hidden border-t border-white/[0.08] py-20 lg:flex lg:min-h-screen lg:flex-col lg:justify-center lg:py-16"
    >
      <div className="mx-auto w-full max-w-[1440px] px-6 lg:px-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="font-mono-tabular text-xs font-semibold uppercase tracking-[0.2em] text-orange">
              Selected Work
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
              AR &amp; Web Projects by AWGZO
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60 sm:text-base">
              A closer look at AR, WebAR product viewers, Snap AR effects and responsive web
              builds created by AWGZO in Islamabad.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              role="tablist"
              aria-label="Filter projects by category"
              className="awgzo-glass awgzo-glass--low inline-flex gap-1 rounded-full p-1"
            >
              {filterTabs.map((kind) => (
                <button
                  key={kind}
                  type="button"
                  role="tab"
                  aria-selected={filter === kind}
                  onClick={() => setFilter(kind)}
                  className={`relative z-[2] rounded-full px-3.5 py-1.5 font-mono-tabular text-xs font-semibold transition cursor-pointer ${
                    filter === kind
                      ? 'bg-orange text-black'
                      : 'text-white/75 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {kind}
                </button>
              ))}
            </div>
            <span className="font-mono-tabular text-sm font-semibold text-white/90">{countLabel}</span>
          </div>
        </div>

        <div className="mt-10">
          <div
            ref={trackRef}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:flex lg:gap-6 lg:overflow-visible lg:pb-0 lg:pl-[28vw] lg:snap-x lg:snap-mandatory"
          >
            {filteredProjects.map((project, idx) => (
              <div
                key={project.slug}
                ref={(node) => {
                  cardRefs.current[idx] = node;
                }}
                className="snap-center transition-transform duration-150 will-change-transform"
              >
                <ProjectMediaCard
                  project={project}
                  isCentered={idx === centeredIdx}
                  sectionVisible={sectionVisible}
                  onSelect={() => navigate(`/work/${project.slug}`)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 hidden items-center gap-4 lg:flex">
          <div className="h-[2px] flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-orange transition-all duration-150"
              style={{ width: `${Math.max(8, progress * 100)}%` }}
            />
          </div>
          <span className="font-mono-tabular text-[11px] text-white/60">
            SELECT ANY PROJECT TO INSPECT
          </span>
        </div>
      </div>
    </section>
  );
}
