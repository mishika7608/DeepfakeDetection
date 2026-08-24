'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'motion/react'
import { ArrowRight, Check, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'

const ease = [0.22, 1, 0.36, 1] as const

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* very subtle warm wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,oklch(0.86_0.04_250/0.35),transparent_70%)]"
      />
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pt-16 pb-20 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:pt-24 lg:pb-28">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur"
          >
            <span className="size-1.5 rounded-full bg-sage" aria-hidden />
            Quiet, private media analysis
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05, ease }}
            className="mt-6 font-serif text-[2.6rem] leading-[1.05] tracking-tight text-balance sm:text-6xl"
          >
            Know what you&apos;re looking at.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12, ease }}
            className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground text-pretty"
          >
            Analyze images and media for signs of manipulation, synthetic
            generation, and identity inconsistencies — explained in plain
            language you can trust.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.19, ease }}
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/analyze" />}
              className="group"
            >
              Analyze media
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              nativeButton={false}
              render={<Link href="/#how-it-works" />}
            >
              How it works
            </Button>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3, ease }}
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
          >
            <li className="flex items-center gap-2">
              <Lock className="size-4 text-primary" aria-hidden />
              Private by default
            </li>
            <li className="flex items-center gap-2">
              <Check className="size-4 text-sage" aria-hidden />
              Six independent signals
            </li>
            <li className="flex items-center gap-2">
              <Check className="size-4 text-sage" aria-hidden />
              Clear, honest results
            </li>
          </motion.ul>
        </div>

        <HeroVisual />
      </div>
    </section>
  )
}

function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.15, ease }}
      className="relative mx-auto w-full max-w-md"
    >
      <div className="relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-card shadow-[0_30px_60px_-30px_oklch(0.29_0.02_265/0.35)]">
        <div className="relative aspect-[4/5]">
          <Image
            src="/hero-portrait.png"
            alt="A calm portrait being reviewed by Vindicate"
            fill
            priority
            sizes="(max-width: 1024px) 90vw, 420px"
            className="object-cover"
          />
          {/* gentle scan line */}
          <motion.div
            aria-hidden
            className="absolute inset-x-0 h-24 bg-[linear-gradient(to_bottom,transparent,oklch(0.86_0.04_250/0.35),transparent)]"
            initial={{ top: '-20%' }}
            animate={{ top: ['-20%', '110%'] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.5 }}
          />
        </div>

        {/* floating result chip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1, ease }}
          className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-2xl border border-border/70 bg-card/85 p-3.5 backdrop-blur-md"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-sage/15 text-sage-foreground">
            <Check className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">Likely authentic</p>
            <p className="truncate text-xs text-muted-foreground">
              82% confidence · low risk
            </p>
          </div>
          <span className="ml-auto font-serif text-2xl tabular-nums text-foreground">
            82
          </span>
        </motion.div>
      </div>
    </motion.div>
  )
}
