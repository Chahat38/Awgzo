import { useEffect, useRef, useState } from 'react';
import { Calendar, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { AWGZO_SITE } from '../../data/site';
import { useReality } from '../../context/RealityContext';
import { GlassCard, MagneticCta } from '../../components/ui/Glass';
import { SocialIcon } from '../../components/ui/SocialIcon';
import { gsap } from '../../lib/scroll';

const SERVICE_OPTIONS = [
  ...AWGZO_SITE.servicesVerified,
  ...AWGZO_SITE.servicesAdditional,
];

export function Contact() {
  const { mode, irisOrigin, setActiveSection, setContactFocused, sceneStateRef } = useReality();
  const sectionRef = useRef<HTMLElement | null>(null);
  const irisLayerRef = useRef<HTMLDivElement | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [service, setService] = useState(SERVICE_OPTIONS[0]);
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<'error' | 'info' | 'success'>('info');
  const [submitting, setSubmitting] = useState(false);

  const endpoint = (import.meta as unknown as { env?: Record<string, string | undefined> }).env
    ?.VITE_FORM_ENDPOINT;

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof window === 'undefined') return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setActiveSection('contact');
          sceneStateRef.current.section = 'contact';
        }
      },
      { threshold: 0.25 }
    );
    obs.observe(el);

    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        if (!irisLayerRef.current) return;
        gsap.fromTo(
          irisLayerRef.current,
          { clipPath: `circle(24% at ${irisOrigin.x}% ${irisOrigin.y}%)` },
          {
            clipPath: `circle(145% at ${irisOrigin.x}% ${irisOrigin.y}%)`,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top 80%',
              end: 'top 15%',
              scrub: 0.7,
              onUpdate: (self) => {
                sceneStateRef.current.irisProgress = self.progress;
              },
            },
          }
        );
      });

      gsap.from(el.querySelectorAll('.contact-stagger'), {
        y: 18,
        opacity: 0,
        stagger: 0.08,
        duration: 0.7,
        ease: 'awgzoOut',
        scrollTrigger: {
          trigger: el,
          start: 'top 72%',
          once: true,
        },
      });
    }, el);

    return () => {
      obs.disconnect();
      mm.revert();
      ctx.revert();
    };
  }, [irisOrigin, setActiveSection, sceneStateRef]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot.trim()) return;

    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatusTone('error');
      setStatusMessage('Please fill in your name, email address, and project message.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatusTone('error');
      setStatusMessage('Please enter a valid email address.');
      return;
    }

    if (!endpoint || !endpoint.trim()) {
      setStatusTone('info');
      setStatusMessage("Form isn't connected yet. Please email hello@awgzo.com or book a call.");
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);
    try {
      const res = await fetch(endpoint.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name, email, service, message }),
      });
      if (!res.ok) throw new Error('Request failed');
      setStatusTone('success');
      setStatusMessage(
        'Thanks — your brief is with us. We’ll reply by email shortly. Need a faster answer? Book a call.'
      );
      setName('');
      setEmail('');
      setMessage('');
    } catch {
      setStatusTone('error');
      setStatusMessage("Couldn't submit right now. Please email hello@awgzo.com or book a call.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative z-10 overflow-hidden border-t border-white/[0.08] py-16 sm:py-24"
    >
      <div
        ref={irisLayerRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            mode === 'VR'
              ? 'radial-gradient(circle at 50% 45%, rgba(232,109,34,0.16), rgba(232,109,34,0.08) 45%, transparent 75%)'
              : 'radial-gradient(circle at 50% 45%, rgba(232,109,34,0.16), rgba(247,248,247,0.02) 48%, transparent 75%)',
        }}
      />

      <div className="relative mx-auto max-w-[1440px] px-6 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <div className="contact-stagger">
              <span className="font-mono-tabular text-xs font-semibold uppercase tracking-[0.2em] text-orange">
                Contact
              </span>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
                Let’s Build Your Next AR VR XR Experience
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/60">
                Tell us your goal and we’ll suggest the right mix of AR, VR, WebXR, web and
                marketing. Prefer to talk now? Book a call.
              </p>
            </div>

            <GlassCard className="contact-stagger p-6" depth="low">
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-orange" />
                  <div>
                    <div className="font-mono-tabular text-[11px] uppercase text-white/60">Phone</div>
                    <a href={AWGZO_SITE.contact.phoneHref} className="font-medium text-white hover:text-orange">
                      {AWGZO_SITE.contact.phone}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-orange" />
                  <div>
                    <div className="font-mono-tabular text-[11px] uppercase text-white/60">Email</div>
                    <a
                      href={`mailto:${AWGZO_SITE.contact.email}`}
                      className="font-medium text-white hover:text-orange"
                    >
                      {AWGZO_SITE.contact.email}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange" />
                  <div>
                    <div className="font-mono-tabular text-[11px] uppercase text-white/60">Studio</div>
                    <span className="font-medium text-white">{AWGZO_SITE.contact.address}</span>
                  </div>
                </li>
              </ul>

              <div className="mt-6 flex flex-wrap gap-3 border-t border-white/10 pt-5">
                <a
                  href={AWGZO_SITE.contact.calendlyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-orange px-4 py-2 text-xs font-semibold text-black hover:bg-orange"
                >
                  <Calendar className="h-3.5 w-3.5" /> Book an AR VR XR Call
                </a>
                <a
                  href={AWGZO_SITE.contact.whatsappCommunityUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-white hover:border-orange"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-orange" /> WhatsApp Community
                </a>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {AWGZO_SITE.socials.map((soc) => (
                  <a
                    key={soc.label}
                    href={soc.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={soc.label}
                    title={soc.label}
                    className="grid h-9 w-9 place-items-center rounded-xl border border-white/15 bg-white/5 text-white transition hover:border-orange hover:text-orange"
                  >
                    <SocialIcon label={soc.label} className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-7">
            <GlassCard className="contact-stagger p-6 sm:p-8" tone="orange">
              <form
                onSubmit={handleSubmit}
                onFocus={() => setContactFocused(true)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                    setContactFocused(false);
                  }
                }}
                noValidate
                className="space-y-5"
              >
                <div className="sr-only" aria-hidden="true">
                  <label htmlFor="awgzo-company-hp">Leave empty</label>
                  <input
                    id="awgzo-company-hp"
                    name="_gotcha"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-name" className="block font-mono-tabular text-xs font-medium text-white/85">
                      Your Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Ahmad Khan"
                      className="mt-2 w-full rounded-xl border border-white/15 bg-black/80 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-orange focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block font-mono-tabular text-xs font-medium text-white/85">
                      Email Address
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="mt-2 w-full rounded-xl border border-white/15 bg-black/80 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-orange focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-service" className="block font-mono-tabular text-xs font-medium text-white/85">
                    Service You're Interested In
                  </label>
                  <select
                    id="contact-service"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/15 bg-black/90 px-4 py-3 text-sm text-white focus:border-orange focus:outline-none"
                  >
                    {SERVICE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="bg-black text-white">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="contact-message" className="block font-mono-tabular text-xs font-medium text-white/85">
                    Tell Us About Your Project
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share your goal — AR try-on, VR experience, WebXR, website or marketing..."
                    className="mt-2 w-full rounded-xl border border-white/15 bg-black/80 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-orange focus:outline-none"
                  />
                </div>

                <div aria-live="polite">
                  {statusMessage && (
                    <div
                      className={`rounded-xl border px-4 py-3 text-xs leading-relaxed ${
                        statusTone === 'error'
                          ? 'border-orange/50 bg-orange/10 text-white'
                          : statusTone === 'success'
                            ? 'border-white/50 bg-white/10 text-white'
                            : 'border-orange/50 bg-orange/15 text-white'
                      }`}
                    >
                      {statusMessage}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                  <MagneticCta type="submit" variant="orange" disabled={submitting} cursorLabel="BOOK">
                    <Send className="h-4 w-4" />
                    {submitting ? 'Sending…' : 'Send an AR VR XR Brief'}
                  </MagneticCta>
                  <span className="font-mono-tabular text-[11px] text-white/60">
                    Or book directly via Calendly
                  </span>
                </div>
              </form>
            </GlassCard>
          </div>
        </div>
      </div>
    </section>
  );
}
