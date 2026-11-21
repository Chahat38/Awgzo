import { FAQ_ITEMS } from '../../data/faq';
import { GlassCard } from '../../components/ui/Glass';

export function FAQ() {
  return (
    <section
      id="faq"
      aria-label="Frequently asked questions"
      className="relative z-10 border-t border-white/[0.08] py-16 sm:py-20"
    >
      <div className="mx-auto w-full max-w-[1440px] px-6 lg:px-12">
        <span className="font-mono-tabular text-xs font-semibold uppercase tracking-[0.2em] text-[#E86C22]">
          FAQ · Common questions
        </span>
        <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
          Frequently Asked Questions
        </h2>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {FAQ_ITEMS.map((item) => (
            <GlassCard key={item.question} className="p-5" depth="low">
              <details className="group">
                <summary className="cursor-pointer list-none">
                  <h3 className="font-display text-base font-semibold text-white">
                    {item.question}
                  </h3>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[#A0A0A0]">{item.answer}</p>
              </details>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
