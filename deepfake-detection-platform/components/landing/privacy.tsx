import { Lock, EyeOff, Trash2 } from 'lucide-react'
import { Reveal } from '@/components/reveal'

const promises = [
  {
    icon: Lock,
    title: 'Yours alone',
    body: 'Your media is used only to produce your result. It is never sold, shared, or used to train models.',
  },
  {
    icon: EyeOff,
    title: 'No profiling',
    body: 'We analyze the media, not you. There are no hidden dossiers and no tracking behind the scenes.',
  },
  {
    icon: Trash2,
    title: 'Easy to remove',
    body: 'Delete an analysis whenever you like and the underlying media goes with it — quietly and completely.',
  },
]

export function Privacy() {
  return (
    <section id="privacy" className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
      <div className="overflow-hidden rounded-[2rem] bg-ink text-ink-foreground">
        <div className="grid gap-10 p-8 sm:p-12 lg:grid-cols-[0.9fr_1.1fr] lg:p-16">
          <Reveal>
            <p className="text-sm font-medium tracking-wide text-ink-foreground/60 uppercase">
              Privacy
            </p>
            <h2 className="mt-3 font-serif text-3xl leading-tight tracking-tight text-balance sm:text-4xl">
              Sensitive images deserve a quiet room.
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-ink-muted">
              People bring Vera some of their most personal media. We treat that
              trust as the product — privacy is the default, not a setting you
              have to find.
            </p>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {promises.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.08}>
                <div className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 lg:items-center">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-ink-foreground">
                    <p.icon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-sm font-medium text-ink-foreground">{p.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-muted">{p.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
