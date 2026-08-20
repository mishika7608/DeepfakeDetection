import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/reveal'

export function ClosingCta() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 pb-24 sm:px-8">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card px-6 py-16 text-center sm:px-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_0%,oklch(0.86_0.04_250/0.4),transparent_70%)]"
          />
          <h2 className="relative mx-auto max-w-xl font-serif text-3xl leading-tight tracking-tight text-balance sm:text-4xl">
            When you need to be sure, start here.
          </h2>
          <p className="relative mx-auto mt-4 max-w-md leading-relaxed text-muted-foreground text-pretty">
            Upload a photo or video and get a calm, clear read on its
            authenticity in moments.
          </p>
          <div className="relative mt-8 flex justify-center">
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/analyze" />}
              className="group"
            >
              Analyze media
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
