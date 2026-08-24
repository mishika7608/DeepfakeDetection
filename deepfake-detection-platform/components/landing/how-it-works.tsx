import { UploadCloud, Waypoints, HeartHandshake } from 'lucide-react'
import { Reveal } from '@/components/reveal'

const steps = [
  {
    icon: UploadCloud,
    title: 'Share your media',
    body: 'Drop in a photo or video. It stays private to you — we only use it to run the analysis you asked for.',
  },
  {
    icon: Waypoints,
    title: 'We read the signals',
    body: 'Vindicate reviews the media across six independent signals, from generation traces to identity and metadata.',
  },
  {
    icon: HeartHandshake,
    title: 'You get a clear answer',
    body: 'A single, honest assessment with the reasoning laid out in plain language — no jargon, no alarms.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
      <Reveal>
        <p className="text-sm font-medium tracking-wide text-primary uppercase">
          How it works
        </p>
        <h2 className="mt-3 max-w-2xl font-serif text-3xl leading-tight tracking-tight text-balance sm:text-4xl">
          Three calm steps between a question and an answer.
        </h2>
      </Reveal>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {steps.map((step, i) => (
          <Reveal key={step.title} delay={i * 0.08}>
            <div className="flex h-full flex-col rounded-3xl border border-border/70 bg-card p-7">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <step.icon className="size-5" aria-hidden />
                </span>
                <span className="font-serif text-lg text-muted-foreground/70 tabular-nums">
                  0{i + 1}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-medium text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
