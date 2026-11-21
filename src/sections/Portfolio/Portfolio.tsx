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
  const { setPanoOpen } = useReality();
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

  const showVrMode = project.kind === 'VR';

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
      className="group relative flex h-[420px] w-full shrink-0 flex-col justify-between overflow-hidden p-5 sm:h-[450px] lg:h-[450px] lg:w-[320px] xl:w-[370px] cursor-pointer"
      data-cursor="INSPECT"
    >
      <div className="flex items-center justify-between gap-2 font-mono-tabular text-[11px]">
        <span className="text-[#E86C22] font-semibold">
          {project.indexLabel} · {project.kind}
        </span>
        <span className="truncate text-white/65">{project.category}</span>
      </div>

      <div className="relative my-3 h-[215px] overflow-hidden rounded-xl border border-white/12 bg-[#080808]">
        {project.videoUrl && !videoFailed ? (
          <video
            ref={videoRef}
            src={project.videoUrl}
            poster={project.poster}
            muted
            loop
            playsInline
            preload="none"
            aria-label={`${project.title} preview video`}
            onError={() => setVideoFailed(true)}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <SmartImage
            src={project.poster}
            fallbackSrc={project.fallbackPoster}
            alt={`${project.title} — ${project.category}`}
            title={project.title}
            width={project.posterWidth}
            height={project.posterHeight}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        )}

        {showVrMode ? (
          <div className="pointer-events-none absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/75 via-transparent to-transparent p-3 opacity-90">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#3B82F6]/50 bg-black/70 px-2.5 py-1 font-mono-tabular text-[10px] text-white">
              <Compass
                className="h-3 w-3 text-[#3B82F6] animate-spin"
                style={{ animationDuration: '8s' }}
              />
              360° Preview Ready
            </span>
          </div>
        ) : (
          <div className="pointer-events-none absolute inset-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-[#E86C22]" />
            <span className="absolute right-0 top-0 h-3 w-3 border-r-2 border-t-2 border-[#E86C22]" />
            <span className="absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-[#E86C22]" />
            <span className="absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-[#E86C22]" />
            {project.videoUrl && !videoFailed && !isCentered && (
              <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/75 px-2 py-0.5 font-mono-tabular text-[10px] text-[#E86C22]">
                <Play className="h-2.5 w-2.5" /> CENTER TO PLAY
              </span>
            )}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-display text-lg font-bold tracking-tight text-white">
          {project.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[#A0A0A0]">
          {project.shortDescription}
        </p>

        <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/10 pt-3">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-white group-hover:text-[#E86C22]">
            View Case Study <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
          {project.has360View && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPanoOpen(true);
              }}
              className="inline-flex items-center gap-1 rounded-full border border-[#3B82F6]/50 bg-[#3B82F6]/15 px-2.5 py-1 font-mono-tabular text-[10px] font-semibold text-white hover:bg-[#3B82F6] cursor-pointer"
            >
              <Compass className="h-3 w-3" /> Open 360°
            </button>
          )}
        </div>
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
            <span className="font-mono-tabular text-xs font-semibold uppercase tracking-[0.2em] text-[#E86C22]">
              Portfolio · Case Studies
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Selected AR &amp; Web Work
            </h2>
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
                      ? 'bg-[#E86C22] text-[#080808]'
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
              className="h-full bg-[#E86C22] transition-all duration-150"
              style={{ width: `${Math.max(8, progress * 100)}%` }}
            />
          </div>
          <span className="font-mono-tabular text-[11px] text-[#A0A0A0]">
            SELECT ANY PROJECT TO INSPECT
          </span>
        </div>
      </div>
    </section>
  );
}
