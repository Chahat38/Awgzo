import { useEffect, useRef, useState } from 'react';
import { Calendar, Glasses, MessageSquare, Send, Sparkles, X } from 'lucide-react';
import { CHATBOT_WELCOME, matchChatbotReply } from '../../data/chatbotKnowledge';
import { useReality } from '../../context/RealityContext';
import { GlassCard } from '../../components/ui/Glass';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  actionLabel?: string;
  actionHref?: string;
}

const QUICK_CHIPS = [
  'Services',
  'AR try-on',
  'Get a quote',
  'What is AR?',
  'WebAR without an app',
  'TikTok effects',
  'Book a call',
  'Contact',
];

function getSectionPrompt(section: string): string {
  switch (section) {
    case 'portfolio':
      return 'Curious about our work?';
    case 'reality-lab':
      return 'Try the AR Lab?';
    case 'team':
      return 'Meet the team?';
    default:
      return 'Need a quote?';
  }
}

export function Chatbot() {
  const { activeSection, mode, contactFocused, sceneStateRef, cameraRunning, wholePageHandControl } = useReality();
  const pageHandActive = cameraRunning && wholePageHandControl;
  const [open, setOpen] = useState(false);
  const [nudged, setNudged] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [orbOffsetY, setOrbOffsetY] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: CHATBOT_WELCOME,
    },
  ]);

  const scrollBoxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let raf = 0;
    const sync = () => {
      const p = sceneStateRef.current.scrollProgress;
      setOrbOffsetY(Math.sin(p * Math.PI * 2) * 12);
      raf = requestAnimationFrame(sync);
    };
    raf = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(raf);
  }, [sceneStateRef]);

  useEffect(() => {
    const t = window.setTimeout(() => setNudged(true), 4000);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (scrollBoxRef.current) {
      scrollBoxRef.current.scrollTop = scrollBoxRef.current.scrollHeight;
    }
  }, [messages, typing, open]);

  const submitQuery = (text: string) => {
    const clean = text.trim();
    if (!clean || typing) return;
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: clean,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    window.setTimeout(() => {
      const reply = matchChatbotReply(clean);
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: reply.answer,
          actionLabel: reply.actionLabel,
          actionHref: reply.actionHref,
        },
      ]);
      setTyping(false);
    }, 320);
  };

  if (contactFocused && !open) {
    return null;
  }

  return (
    <div
      className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3"
      style={{ transform: `translateY(${orbOffsetY}px)` }}
    >
      {open && (
        <GlassCard
          role="dialog"
          aria-modal="false"
          aria-label="AWGZO Assistant"
          className="flex h-[460px] max-h-[calc(100svh-40px)] w-[min(92vw,380px)] flex-col overflow-hidden p-4 sm:p-5"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <div className="flex items-center gap-2 font-mono-tabular text-[11px] font-semibold text-[#E86C22]">
                <Sparkles className="h-3.5 w-3.5" /> AWGZO ASSISTANT
              </div>
              <h3 className="font-display text-base font-bold text-white">Ask AWGZO</h3>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat panel"
              {...(pageHandActive ? { 'data-hand-target': 'chatbot-close' } : {})}
              className="rounded-full border border-white/15 bg-white/5 p-1.5 text-white hover:border-[#E86C22] hover:bg-[#E86C22] hover:text-[#080808] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div
            ref={scrollBoxRef}
            aria-live="polite"
            className="my-3 flex-1 space-y-3 overflow-y-auto pr-1 text-xs leading-relaxed"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 ${
                    m.sender === 'user'
                      ? 'bg-[#E86C22] text-[#080808] font-medium'
                      : 'border border-white/12 bg-white/[0.06] text-white/95'
                  }`}
                >
                  {m.text}
                </div>
                {m.actionHref && m.actionLabel && (
                  <a
                    href={m.actionHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-[#E86C22]/50 bg-[#E86C22]/15 px-3 py-1 font-mono-tabular text-[11px] font-semibold text-[#E86C22] hover:bg-[#E86C22] hover:text-[#080808]"
                  >
                    <Calendar className="h-3 w-3" /> {m.actionLabel}
                  </a>
                )}
              </div>
            ))}

            {typing && (
              <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-[#A0A0A0]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E86C22] animate-pulse" />
                Typing…
              </div>
            )}
          </div>

          <div className="mb-2.5 flex flex-wrap gap-1.5">
            {QUICK_CHIPS.map((chip, idx) => (
              <button
                key={chip}
                type="button"
                onClick={() => submitQuery(chip)}
                {...(pageHandActive ? { 'data-hand-target': `chatbot-chip-${idx}` } : {})}
                className="rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1 font-mono-tabular text-[10px] text-white/85 transition hover:border-[#E86C22] hover:text-[#E86C22] cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitQuery(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about AR, WebAR, TikTok effects or booking a call…"
              aria-label="Ask AWGZO a question"
              className="flex-1 rounded-full border border-white/15 bg-[#080808]/80 px-4 py-2 text-xs text-white placeholder:text-white/40 focus:border-[#E86C22] focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Send question"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E86C22] text-[#080808] transition hover:bg-[#FD9800] cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </GlassCard>
      )}

      <div className="flex items-center gap-2.5">
        {!open && nudged && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="awgzo-glass awgzo-glass--low hidden rounded-full px-3.5 py-1.5 font-mono-tabular text-[11px] font-medium text-white shadow-lg sm:inline-flex cursor-pointer"
          >
            {getSectionPrompt(activeSection)}
          </button>
        )}

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label="Open AWGZO assistant"
          data-cursor="CHAT"
          {...(pageHandActive ? { 'data-hand-target': 'chatbot-orb' } : {})}
          className={`relative flex h-14 w-14 items-center justify-center rounded-full border transition-transform hover:scale-105 cursor-pointer shadow-[0_12px_36px_rgba(0,0,0,0.6)] ${
            mode === 'VR'
              ? 'border-[#3B82F6]/60 bg-[#0d142a]/85 text-[#3B82F6] backdrop-blur-xl'
              : 'border-[#E86C22]/70 bg-[#14100e]/85 text-[#E86C22] backdrop-blur-xl'
          }`}
        >
          {open ? (
            <X className="h-5 w-5 text-white" />
          ) : mode === 'VR' ? (
            <Glasses className="h-6 w-6" />
          ) : (
            <MessageSquare className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}
