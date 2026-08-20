import { Reveal } from '@/components/reveal'
import { SIGNAL_LIBRARY } from '@/lib/analysis'

export function Signals() {
  return (
    <section id="signals" className="border-y border-border/60 bg-secondary/40">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr] lg:items-end">
          <Reveal>
            <p className="text-sm font-medium tracking-wide text-primary uppercase">
              The signals
            </p>
            <h2 className="mt-3 font-serif text-3xl leading-tight tracking-tight text-balance sm:text-4xl">
              Six perspectives, one honest picture.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="text-base leading-relaxed text-muted-foreground lg:pb-1">
              No single test can tell the whole story. Vera weighs several
              independent signals together, so a small quirk never becomes a
              false accusation — and real manipulation has nowhere to hide.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-border/70 bg-border/70 sm:grid-cols-2 lg:grid-cols-3">
          {SIGNAL_LIBRARY.map((signal, i) => (
            <Reveal key={signal.key} delay={(i % 3) * 0.06} className="bg-card">
              <div className="flex h-full flex-col p-7">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <signal.icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-5 text-base font-medium text-foreground">
                  {signal.label}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {signal.summary}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
