'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Check, Loader } from 'lucide-react'
import { SIGNAL_LIBRARY } from '@/lib/analysis'
import { cn } from '@/lib/utils'

const STEP_MS = 900

export function AnalysisJourney({ onComplete }: { onComplete: () => void }) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (active >= SIGNAL_LIBRARY.length) {
      const done = setTimeout(onComplete, 700)
      return () => clearTimeout(done)
    }
    const next = setTimeout(() => setActive((i) => i + 1), STEP_MS)
    return () => clearTimeout(next)
  }, [active, onComplete])

  const progress = Math.min(active / SIGNAL_LIBRARY.length, 1)

  return (
    <div className="rounded-[1.75rem] border border-border/70 bg-card p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl tracking-tight">Reading the signals</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Working through six independent checks. This only takes a moment.
          </p>
        </div>
        <span className="font-serif text-2xl tabular-nums text-muted-foreground">
          {Math.round(progress * 100)}%
        </span>
      </div>

      <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ ease: 'easeOut', duration: 0.5 }}
        />
      </div>

      <ul className="mt-6 space-y-1">
        {SIGNAL_LIBRARY.map((signal, i) => {
          const state = i < active ? 'done' : i === active ? 'active' : 'pending'
          return (
            <li
              key={signal.key}
              className={cn(
                'flex items-center gap-3.5 rounded-2xl px-3 py-3 transition-colors',
                state === 'active' && 'bg-muted/60',
              )}
            >
              <span
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors',
                  state === 'done' && 'bg-sage/15 text-sage-foreground',
                  state === 'active' && 'bg-primary/10 text-primary',
                  state === 'pending' && 'bg-muted text-muted-foreground/50',
                )}
              >
                {state === 'done' ? (
                  <motion.span
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                  >
                    <Check className="size-[18px]" aria-hidden />
                  </motion.span>
                ) : state === 'active' ? (
                  <Loader className="size-[18px] animate-spin" aria-hidden />
                ) : (
                  <signal.icon className="size-[18px]" aria-hidden />
                )}
              </span>
              <div className="min-w-0">
                <p
                  className={cn(
                    'text-sm font-medium transition-colors',
                    state === 'pending' ? 'text-muted-foreground' : 'text-foreground',
                  )}
                >
                  {signal.label}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {state === 'done'
                    ? 'Checked'
                    : state === 'active'
                      ? 'Analyzing…'
                      : 'Waiting'}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
