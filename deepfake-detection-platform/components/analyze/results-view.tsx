'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronRight } from 'lucide-react'
import {
  type AnalysisResult,
  type AnalysisSignal,
  RISK_COPY,
  statusColor,
} from '@/lib/analysis'
import { ConfidenceMeter } from '@/components/analyze/confidence-meter'
import { cn } from '@/lib/utils'

export function ResultsView({ result }: { result: AnalysisResult }) {
  const risk = RISK_COPY[result.risk]

  return (
    <div className="space-y-4">
      {/* Assessment summary */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-card"
        aria-labelledby="assessment-heading"
      >
        <div className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-8">
          <ConfidenceMeter score={result.score} risk={result.risk} />
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium tracking-wide text-primary uppercase">
              Authenticity assessment
            </p>
            <h2
              id="assessment-heading"
              className="mt-2 font-serif text-3xl leading-tight tracking-tight"
            >
              {result.verdict}
            </h2>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
              <span
                className={cn('size-2 rounded-full', statusColor('clear').dot)}
                aria-hidden
              />
              {risk.label}
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground text-pretty">
              {result.summary}
            </p>
          </div>
        </div>
      </motion.section>

      {/* Evidence */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-[1.75rem] border border-border/70 bg-card p-2"
        aria-label="Why we reached this result"
      >
        <div className="px-4 pb-1 pt-4">
          <h3 className="text-base font-medium text-foreground">Why we reached this</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Each signal, with what it found. Open one to see the details.
          </p>
        </div>
        <ul className="mt-2">
          {result.signals.map((signal, i) => (
            <SignalRow key={signal.key} signal={signal} defaultOpen={signal.status !== 'clear'} index={i} />
          ))}
        </ul>
      </motion.section>
    </div>
  )
}

function SignalRow({
  signal,
  defaultOpen,
  index,
}: {
  signal: AnalysisSignal
  defaultOpen: boolean
  index: number
}) {
  const [open, setOpen] = useState(defaultOpen)
  const colors = statusColor(signal.status)

  return (
    <li className="border-t border-border/50 first:border-t-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left transition-colors hover:bg-muted/50"
      >
        <span
          className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', colors.soft)}
        >
          <signal.icon className={cn('size-5', colors.text)} aria-hidden />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground">{signal.label}</p>
            <span className={cn('flex items-center gap-1.5 text-xs', colors.text)}>
              <span className={cn('size-1.5 rounded-full', colors.dot)} aria-hidden />
              {colors.label}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{signal.summary}</p>
        </div>

        <div className="hidden w-28 shrink-0 items-center gap-2 sm:flex" aria-hidden>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <motion.div
              className={cn('h-full rounded-full', colors.dot)}
              initial={{ width: 0 }}
              animate={{ width: `${signal.score}%` }}
              transition={{ duration: 1, delay: 0.3 + index * 0.06, ease: 'easeOut' }}
            />
          </div>
          <span className="w-7 text-right text-xs tabular-nums text-muted-foreground">
            {signal.score}
          </span>
        </div>

        <ChevronRight
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform',
            open && 'rotate-90',
          )}
          aria-hidden
        />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <ul className="space-y-2.5 px-4 pb-5 pl-[4.5rem]">
              {signal.findings.map((finding) => (
                <li key={finding} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
                  <span className={cn('mt-2 size-1.5 shrink-0 rounded-full', colors.dot)} aria-hidden />
                  {finding}
                </li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </li>
  )
}
