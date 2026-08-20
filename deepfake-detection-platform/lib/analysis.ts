import type { LucideIcon } from 'lucide-react'
import {
  Sparkles,
  ScanFace,
  Telescope,
  ShieldCheck,
  SlidersHorizontal,
  FileText,
} from 'lucide-react'

export type SignalStatus = 'clear' | 'minor' | 'flag'

export type SignalKey =
  | 'ai-generation'
  | 'facial-consistency'
  | 'semantic'
  | 'identity'
  | 'attribute'
  | 'metadata'

export interface AnalysisSignal {
  key: SignalKey
  label: string
  icon: LucideIcon
  /** one-line description of what this signal listens for */
  summary: string
  /** confidence, 0–100, that this signal looks authentic */
  score: number
  status: SignalStatus
  /** plain-language observations that explain the score */
  findings: string[]
}

export type RiskLevel = 'low' | 'moderate' | 'elevated'

export interface AnalysisResult {
  /** overall authenticity confidence, 0–100 */
  score: number
  risk: RiskLevel
  verdict: string
  summary: string
  signals: AnalysisSignal[]
}

/** Descriptions used across the marketing + analysis surfaces. */
export const SIGNAL_LIBRARY: {
  key: SignalKey
  label: string
  icon: LucideIcon
  summary: string
}[] = [
  {
    key: 'ai-generation',
    label: 'AI generation',
    icon: Sparkles,
    summary:
      'Looks for the statistical fingerprints that image and video models leave behind.',
  },
  {
    key: 'facial-consistency',
    label: 'Facial consistency',
    icon: ScanFace,
    summary:
      'Checks that facial geometry, lighting, and skin texture stay consistent throughout.',
  },
  {
    key: 'semantic',
    label: 'Semantic analysis',
    icon: Telescope,
    summary:
      'Reads the whole scene for small details and physics that quietly do not add up.',
  },
  {
    key: 'identity',
    label: 'Identity verification',
    icon: ShieldCheck,
    summary:
      'Compares the face against reference identity signals to catch swaps and impersonation.',
  },
  {
    key: 'attribute',
    label: 'Attribute manipulation',
    icon: SlidersHorizontal,
    summary:
      'Detects retouching of age, expression, or features that changes what the media says.',
  },
  {
    key: 'metadata',
    label: 'Metadata',
    icon: FileText,
    summary:
      'Reviews capture data, software traces, and edit history for signs of tampering.',
  },
]

/**
 * Mock analysis. Deterministic so the experience is calm and repeatable.
 * Replace this with a call to the real detection backend later — the shape of
 * `AnalysisResult` is what the UI depends on.
 */
export function getMockAnalysis(): AnalysisResult {
  const signals: AnalysisSignal[] = [
    {
      key: 'ai-generation',
      label: 'AI generation',
      icon: Sparkles,
      summary: SIGNAL_LIBRARY[0].summary,
      score: 91,
      status: 'clear',
      findings: [
        'No frequency patterns typical of diffusion or GAN generation.',
        'Sensor noise is consistent with a real camera capture.',
      ],
    },
    {
      key: 'facial-consistency',
      label: 'Facial consistency',
      icon: ScanFace,
      summary: SIGNAL_LIBRARY[1].summary,
      score: 88,
      status: 'clear',
      findings: [
        'Lighting on the face matches the surrounding scene.',
        'Skin texture and pore detail are natural and uniform.',
      ],
    },
    {
      key: 'semantic',
      label: 'Semantic analysis',
      icon: Telescope,
      summary: SIGNAL_LIBRARY[2].summary,
      score: 84,
      status: 'clear',
      findings: [
        'Reflections and shadows follow a single, consistent light source.',
        'Background geometry is coherent with no warping near the subject.',
      ],
    },
    {
      key: 'identity',
      label: 'Identity verification',
      icon: ShieldCheck,
      summary: SIGNAL_LIBRARY[3].summary,
      score: 79,
      status: 'clear',
      findings: [
        'Facial landmarks align with a single, stable identity.',
        'No blending seams detected around the hairline or jaw.',
      ],
    },
    {
      key: 'attribute',
      label: 'Attribute manipulation',
      icon: SlidersHorizontal,
      summary: SIGNAL_LIBRARY[4].summary,
      score: 68,
      status: 'minor',
      findings: [
        'Light smoothing detected around the eyes — consistent with everyday retouching.',
        'No changes to age, expression, or identifying features.',
      ],
    },
    {
      key: 'metadata',
      label: 'Metadata',
      icon: FileText,
      summary: SIGNAL_LIBRARY[5].summary,
      score: 62,
      status: 'minor',
      findings: [
        'Image was exported from photo-editing software after capture.',
        'Original capture timestamp is intact; no signs of tampering.',
      ],
    },
  ]

  return {
    score: 82,
    risk: 'low',
    verdict: 'Likely authentic',
    summary:
      'This media shows the hallmarks of a genuine camera capture. We found light, ordinary editing but no signs of synthetic generation or identity manipulation.',
    signals,
  }
}

/** Calls the local SelfBlendedImages service and adapts its score for the UI. */
export async function getDetectorAnalysis(file: File): Promise<AnalysisResult> {
  const form = new FormData()
  form.append('file', file)
  const baseUrl = process.env.NEXT_PUBLIC_DETECTOR_API_URL ?? 'http://localhost:8000'
  const response = await fetch(`${baseUrl}/analyze`, { method: 'POST', body: form })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.detail ?? 'The detector service is unavailable.')
  const score = payload.authenticity as number
  const fake = payload.fakeness as number
  const flagged = fake >= 0.5
  return {
    score,
    risk: fake >= 0.7 ? 'elevated' : fake >= 0.4 ? 'moderate' : 'low',
    verdict: flagged ? 'Possible deepfake detected' : 'Likely authentic',
    summary: `SelfBlendedImages analyzed the detected face${file.type.startsWith('video/') ? 's across sampled frames' : ''}. This score is a model estimate, not a definitive determination.`,
    signals: [{
      key: 'ai-generation', label: 'SelfBlendedImages detector', icon: Sparkles,
      summary: SIGNAL_LIBRARY[0].summary, score, status: flagged ? 'flag' : 'clear',
      findings: [`SBI fakeness score: ${(fake * 100).toFixed(1)}%.`, flagged ? 'The detector found manipulation-like facial artifacts.' : 'The detector found no strong facial manipulation artifacts.'],
    }],
  }
}

export const RISK_COPY: Record<
  RiskLevel,
  { label: string; note: string }
> = {
  low: {
    label: 'Low risk',
    note: 'Signals point toward authentic media.',
  },
  moderate: {
    label: 'Some signals to review',
    note: 'A few areas are worth a closer look.',
  },
  elevated: {
    label: 'Signs of manipulation',
    note: 'Several signals suggest this media was altered.',
  },
}

export function statusColor(status: SignalStatus) {
  switch (status) {
    case 'clear':
      return {
        dot: 'bg-sage',
        text: 'text-sage-foreground',
        soft: 'bg-sage/15',
        label: 'Clear',
      }
    case 'minor':
      return {
        dot: 'bg-lavender',
        text: 'text-lavender-foreground',
        soft: 'bg-lavender/15',
        label: 'Minor note',
      }
    case 'flag':
      return {
        dot: 'bg-destructive',
        text: 'text-destructive',
        soft: 'bg-destructive/10',
        label: 'Needs attention',
      }
  }
}
