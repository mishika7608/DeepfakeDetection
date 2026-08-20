'use client'

import { motion } from 'motion/react'
import type { RiskLevel } from '@/lib/analysis'

const RISK_STROKE: Record<RiskLevel, string> = {
  low: 'var(--sage)',
  moderate: 'var(--lavender)',
  elevated: 'var(--destructive)',
}

export function ConfidenceMeter({
  score,
  risk,
  size = 176,
}: {
  score: number
  risk: RiskLevel
  size?: number
}) {
  const stroke = 12
  const radius = (size - stroke) / 2
  const cx = size / 2
  const cy = size / 2
  // 270° arc, starting bottom-left
  const startAngle = 135
  const sweep = 270
  const circumference = 2 * Math.PI * radius
  const arcLength = (sweep / 360) * circumference
  const progress = (score / 100) * arcLength

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`Authenticity confidence ${score} out of 100`}
        style={{ transform: `rotate(${startAngle}deg)` }}
      >
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
        />
        <motion.circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={RISK_STROKE[risk]}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
          initial={{ strokeDashoffset: arcLength }}
          animate={{ strokeDashoffset: arcLength - progress }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="font-serif text-5xl tabular-nums text-foreground"
        >
          {score}
        </motion.span>
        <span className="mt-1 text-xs tracking-wide text-muted-foreground uppercase">
          Confidence
        </span>
      </div>
    </div>
  )
}
