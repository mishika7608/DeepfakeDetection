import type { LucideIcon } from 'lucide-react'

import {
  Sparkles,
  ScanFace,
  Telescope,
  ShieldCheck,
  BadgeCheck,
  SlidersHorizontal,
  FileText,
  SearchCheck,
} from 'lucide-react'


export type SignalStatus = 'clear' | 'minor' | 'flag'

export type SignalKey =
  | 'ai-generation'
  | 'facial-consistency'
  | 'semantic'
  | 'identity'
  | 'attribute'
  | 'metadata'
  | 'reverse-search'
  | 'c2pa'

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
  // {
  //   key: 'identity',
  //   label: 'Identity verification',
  //   icon: ShieldCheck,
  //   summary:
  //     'Compares the face against reference identity signals to catch swaps and impersonation.',
  // },
  // {
  //   key: 'attribute',
  //   label: 'Attribute manipulation',
  //   icon: SlidersHorizontal,
  //   summary:
  //     'Detects retouching of age, expression, or features that changes what the media says.',
  // },
  {
    key: 'metadata',
    label: 'Metadata',
    icon: FileText,
    summary:
      'Reviews capture data, software traces, and edit history for signs of tampering.',
  },
  {
    key: 'reverse-search',
    label: 'Reverse image search',
    icon: SearchCheck,
    summary:
      'Searches indexed online images for exact or visually similar sources and possible provenance.',
  },
  {
    key: 'c2pa',
    label: 'Content Credentials',
    icon: BadgeCheck,
    summary:
      'Checks cryptographically bound Content Credentials and provenance information embedded in the image.',
  },

]

const SIGNAL_BY_KEY = Object.fromEntries(
  SIGNAL_LIBRARY.map((signal) => [
    signal.key,
    signal,
  ])
) as Record<
  SignalKey,
  (typeof SIGNAL_LIBRARY)[number]
>

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
      summary: SIGNAL_BY_KEY['ai-generation'].summary, //SIGNAL_LIBRARY[0].summary,
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
      summary: SIGNAL_BY_KEY.semantic.summary,//SIGNAL_LIBRARY[2].summary,
      score: 84,
      status: 'clear',
      findings: [
        'Reflections and shadows follow a single, consistent light source.',
        'Background geometry is coherent with no warping near the subject.',
      ],
    },
    // {
    //   key: 'identity',
    //   label: 'Identity verification',
    //   icon: ShieldCheck,
    //   summary: SIGNAL_LIBRARY[3].summary,
    //   score: 79,
    //   status: 'clear',
    //   findings: [
    //     'Facial landmarks align with a single, stable identity.',
    //     'No blending seams detected around the hairline or jaw.',
    //   ],
    // },
    // {
    //   key: 'attribute',
    //   label: 'Attribute manipulation',
    //   icon: SlidersHorizontal,
    //   summary: SIGNAL_LIBRARY[4].summary,
    //   score: 68,
    //   status: 'minor',
    //   findings: [
    //     'Light smoothing detected around the eyes — consistent with everyday retouching.',
    //     'No changes to age, expression, or identifying features.',
    //   ],
    // },
    {
      key: 'metadata',
      label: 'Metadata',
      icon: FileText,
      summary:SIGNAL_BY_KEY.metadata.summary,// SIGNAL_LIBRARY[5].summary,
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
// export async function getDetectorAnalysis(file: File): Promise<AnalysisResult> {
//   const form = new FormData()
//   form.append('file', file)
//   const baseUrl = process.env.NEXT_PUBLIC_DETECTOR_API_URL ?? 'http://localhost:8000'
//   const response = await fetch(`${baseUrl}/analyze`, { method: 'POST', body: form })
//   const payload = await response.json().catch(() => ({}))
//   if (!response.ok) throw new Error(payload.detail ?? 'The detector service is unavailable.')
//   const score = payload.authenticity as number
//   const fake = payload.fakeness as number
//   const flagged = fake >= 0.5
//   return {
//     score,
//     risk: fake >= 0.7 ? 'elevated' : fake >= 0.4 ? 'moderate' : 'low',
//     verdict: flagged ? 'Possible deepfake detected' : 'Likely authentic',
//     summary: `SelfBlendedImages analyzed the detected face${file.type.startsWith('video/') ? 's across sampled frames' : ''}. This score is a model estimate, not a definitive determination.`,
//     signals: [{
//       key: 'ai-generation', label: 'SelfBlendedImages detector', icon: Sparkles,
//       summary: SIGNAL_LIBRARY[0].summary, score, status: flagged ? 'flag' : 'clear',
//       findings: [`SBI fakeness score: ${(fake * 100).toFixed(1)}%.`, flagged ? 'The detector found manipulation-like facial artifacts.' : 'The detector found no strong facial manipulation artifacts.'],
//     }],
//   }
// }

// export async function getDetectorAnalysis(
//   file: File
// ): Promise<AnalysisResult> {

//   const form = new FormData()

//   form.append('file', file)

//   const baseUrl =
//     process.env.NEXT_PUBLIC_DETECTOR_API_URL ??
//     'http://localhost:8000'

//   const response = await fetch(
//     `${baseUrl}/analyze`,
//     {
//       method: 'POST',
//       body: form,
//     }
//   )

//   const payload = await response
//     .json()
//     .catch(() => ({}))

//   if (!response.ok) {
//     throw new Error(
//       payload.detail ??
//       'The detector service is unavailable.'
//     )
//   }

//   // =====================================================
//   // EXISTING SBI RESULT
//   // =====================================================

//   const score =
//     Number(payload.authenticity ?? 0)

//   const fake =
//     Number(payload.fakeness ?? 0)

//   // =====================================================
//   // METADATA RESULT
//   // =====================================================

//   const metadata =
//     payload.metadata ?? {}

//   const metadataRisk =
//     Number(metadata.risk_score ?? 0)

//   const metadataFindings =
//     Array.isArray(metadata.findings)
//       ? metadata.findings
//       : []

//   const metadataWarnings =
//     Array.isArray(metadata.warnings)
//       ? metadata.warnings
//       : []

//   // =====================================================
//   // FORENSIC RESULT
//   // =====================================================

//   const forensic =
//     payload.forensic_analysis ?? {}

//   const finalAuthenticity =
//     Number(
//       forensic.final_authenticity ??
//       score
//     )

//   const finalRisk =
//     Number(
//       forensic.final_risk ??
//       (100 - score)
//     )

//   // =====================================================
//   // SBI STATUS
//   // =====================================================

//   const aiFlagged =
//     fake >= 0.5

//   const aiStatus: SignalStatus =
//     fake >= 0.7
//       ? 'flag'
//       : fake >= 0.4
//         ? 'minor'
//         : 'clear'

//   // =====================================================
//   // METADATA STATUS
//   // =====================================================

//   const metadataStatus: SignalStatus =
//     metadataRisk >= 50
//       ? 'flag'
//       : metadataRisk >= 20
//         ? 'minor'
//         : 'clear'

//   // =====================================================
//   // METADATA FINDINGS FOR UI
//   // =====================================================

//   const formattedMetadataFindings = [
//     ...metadataFindings,
//     ...metadataWarnings.map(
//       (warning: string) =>
//         `Warning: ${warning}`
//     ),
//   ]

//   if (formattedMetadataFindings.length === 0) {
//     formattedMetadataFindings.push(
//       'No significant metadata findings were detected.'
//     )
//   }

//   // =====================================================
//   // FINAL RISK
//   // =====================================================

//   const risk: RiskLevel =
//     finalRisk >= 70
//       ? 'elevated'
//       : finalRisk >= 40
//         ? 'moderate'
//         : 'low'

//   // =====================================================
//   // VERDICT
//   // =====================================================

//   const verdict =
//     finalRisk >= 70
//       ? 'Possible manipulation detected'
//       : finalRisk >= 40
//         ? 'Requires further review'
//         : 'Likely authentic'

//   // =====================================================
//   // SUMMARY
//   // =====================================================

//   const summary =
//     `AI detection estimates ${score.toFixed(1)}% authenticity. ` +
//     `Metadata analysis reports ${metadataRisk.toFixed(0)}% metadata risk. ` +
//     `The combined forensic assessment estimates ` +
//     `${finalAuthenticity.toFixed(1)}% authenticity.`

//   // =====================================================
//   // RETURN UI MODEL
//   // =====================================================

//   return {

//     // IMPORTANT:
//     // The main meter now represents the
//     // combined forensic authenticity.
//     score: finalAuthenticity,

//     risk,

//     verdict,

//     summary,

//     signals: [

//       // -------------------------------------------------
//       // AI DETECTION
//       // -------------------------------------------------

//       {
//         key: 'ai-generation',

//         label: 'SelfBlendedImages detector',

//         icon: Sparkles,

//         summary:
//           SIGNAL_LIBRARY[0].summary,

//         score,

//         status: aiStatus,

//         findings: [

//           `SBI fakeness score: ${(fake * 100).toFixed(1)}%.`,

//           aiFlagged
//             ? 'The detector found manipulation-like facial artifacts.'
//             : 'The detector found no strong facial manipulation artifacts.',

//           `AI model authenticity: ${score.toFixed(1)}%.`,

//         ],

//       },

//       // -------------------------------------------------
//       // METADATA
//       // -------------------------------------------------

//       {
//         key: 'metadata',

//         label: 'Metadata analysis',

//         icon: FileText,

//         summary:
//           'Reviews capture data, software traces, timestamps, and file information for forensic indicators.',

//         // Signal score is authenticity,
//         // so convert metadata risk → authenticity.
//         score: Math.max(
//           0,
//           Math.min(
//             100,
//             100 - metadataRisk
//           )
//         ),

//         status: metadataStatus,

//         findings: [

//           `Metadata risk: ${metadataRisk.toFixed(0)}%.`,

//           ...formattedMetadataFindings,

//           metadata.format
//             ? `File format: ${metadata.format}.`
//             : '',

//           metadata.width && metadata.height
//             ? `Dimensions: ${metadata.width} × ${metadata.height}.`
//             : '',

//         ].filter(Boolean),

//       },

//     ],

//   }
// }

/**
 * Calls the local SelfBlendedImages service and adapts
 * AI + metadata + reverse-search results for the UI.
 */
export async function getDetectorAnalysis(
  file: File
): Promise<AnalysisResult> {

  const form = new FormData()

  form.append(
    'file',
    file
  )

  const baseUrl =
    process.env.NEXT_PUBLIC_DETECTOR_API_URL ??
    'http://localhost:8000'

  const response = await fetch(
    `${baseUrl}/analyze`,
    {
      method: 'POST',
      body: form,
    }
  )

  const payload =
    await response
      .json()
      .catch(() => ({}))

  if (!response.ok) {

    throw new Error(
      payload.detail ??
      'The detector service is unavailable.'
    )
  }

  // =====================================================
  // AI / SBI
  // =====================================================

  const score =
    Number(
      payload.authenticity ?? 0
    )

  const fake =
    Number(
      payload.fakeness ?? 0
    )

  const flagged =
    fake >= 0.5

  // =====================================================
  // METADATA
  // =====================================================

  const metadata =
    payload.metadata ?? {}

  const metadataRisk =
    Number(
      metadata.risk_score ?? 0
    )

  const metadataFindings =
    Array.isArray(
      metadata.findings
    )
      ? metadata.findings
      : []

  const metadataWarnings =
    Array.isArray(
      metadata.warnings
    )
      ? metadata.warnings
      : []

  // =====================================================
  // REVERSE SEARCH
  // =====================================================

  const reverseSearch =
    payload.reverse_search ?? {}

  const reverseAvailable =
    Boolean(
      reverseSearch.available
    )

  const reverseStatus =
    reverseSearch.status ??
    'not_configured'

  const exactMatches =
    Array.isArray(
      reverseSearch.exact_matches
    )
      ? reverseSearch.exact_matches
      : []

  const visualMatches =
    Array.isArray(
      reverseSearch.visual_matches
    )
      ? reverseSearch.visual_matches
      : []

  const reverseFindings =
    Array.isArray(
      reverseSearch.findings
    )
      ? reverseSearch.findings
      : []

  // =====================================================
  // REVERSE SEARCH STATUS
  // =====================================================

  let reverseSignalStatus: SignalStatus

  if (!reverseAvailable) {

    reverseSignalStatus = 'minor'

  } else if (
    exactMatches.length > 0
  ) {

    reverseSignalStatus = 'clear'

  } else if (
    visualMatches.length > 0
  ) {

    reverseSignalStatus = 'minor'

  } else {

    reverseSignalStatus = 'clear'
  }

  // =====================================================
  // REVERSE SEARCH FINDINGS
  // =====================================================

  const reverseEvidence: string[] = [
    ...reverseFindings,
  ]

  if (
    exactMatches.length > 0
  ) {

    reverseEvidence.push(
      `Exact/near-exact matches found: ${exactMatches.length}.`
    )

  }

  if (
    visualMatches.length > 0
  ) {

    reverseEvidence.push(
      `Visual matches found: ${visualMatches.length}.`
    )

  }

  // -----------------------------------------------------
  // Show the first few sources in the evidence panel.
  // -----------------------------------------------------

  exactMatches
    .slice(0, 5)
    .forEach(
      (
        match: {
          title?: string
          source?: string
          link?: string
        }
      ) => {

        const title =
          match.title ??
          'Online match'

        const source =
          match.source ??
          'Unknown source'

        reverseEvidence.push(
          `Exact match: ${title} — ${source}.`
        )

        if (match.link) {

          reverseEvidence.push(
            `Source: ${match.link}`
          )
        }
      }
    )

  visualMatches
    .slice(0, 5)
    .forEach(
      (
        match: {
          title?: string
          source?: string
          link?: string
        }
      ) => {

        const title =
          match.title ??
          'Visual match'

        const source =
          match.source ??
          'Unknown source'

        reverseEvidence.push(
          `Visual match: ${title} — ${source}.`
        )
      }
    )

  if (
    reverseEvidence.length === 0
  ) {

    reverseEvidence.push(
      'No reverse-search findings were returned.'
    )
  }

  // =====================================================
// C2PA
// =====================================================

const c2pa =
  payload.c2pa ?? {}

const c2paAvailable =
  Boolean(c2pa.available)

const c2paPresent =
  Boolean(c2pa.has_manifest)

const c2paStatus =
  c2pa.status ??
  'not_present'

const c2paValidationState =
  c2pa.validation_state ??
  null

const c2paFindings =
  Array.isArray(c2pa.findings)
    ? c2pa.findings
    : []

const c2paWarnings =
  Array.isArray(c2pa.warnings)
    ? c2pa.warnings
    : []

const c2paActions =
  Array.isArray(c2pa.actions)
    ? c2pa.actions
    : []

const c2paIngredients =
  Array.isArray(c2pa.ingredients)
    ? c2pa.ingredients
    : []

const c2paClaimGenerator =
  c2pa.claim_generator ??
  null

  // =====================================================
// SEMANTIC ANALYSIS
// =====================================================

const semantic =
  payload.semantic ?? {}

const semanticAvailable =
  Boolean(
    semantic.available
  )

const semanticScore =
  Number(
    semantic.semantic_score ?? 0
  )

const semanticRealScore =
  Number(
    semantic.real_score ?? 0
  )

const semanticSyntheticScore =
  Number(
    semantic.synthetic_score ?? 0
  )

const semanticMargin =
  Number(
    semantic.margin ?? 0
  )

const semanticFindings =
  Array.isArray(
    semantic.findings
  )
    ? semantic.findings
    : []

const semanticWarnings =
  Array.isArray(
    semantic.warnings
  )
    ? semantic.warnings
    : []

const semanticStatus =
  semantic.status ??
  'clear'

  // =====================================================
  // MAIN RISK
  // =====================================================

  // IMPORTANT:
  //
  // Keep the main authenticity score tied to the
  // trained SBI detector.
  //
  // Reverse search is evidence/provenance, not a
  // replacement for the trained model's probability.

  const risk: RiskLevel =
    fake >= 0.7
      ? 'elevated'
      : fake >= 0.4
        ? 'moderate'
        : 'low'

  const verdict =
    flagged
      ? 'Possible deepfake detected'
      : 'Likely authentic'

  // const summary =
  //   `SelfBlendedImages estimated ${score.toFixed(1)}% authenticity. ` +
  //   `Metadata analysis returned ${metadataFindings.length} finding(s). ` +
  //   `Reverse image search identified ` +
  //   `${exactMatches.length} exact/near-exact and ` +
  //   `${visualMatches.length} visual match(es). ` +
  //   `These auxiliary signals provide forensic context and do not replace the AI model score.`

const summary =
  `SelfBlendedImages estimated ${score.toFixed(1)}% authenticity. ` +
  `Metadata analysis returned ${metadataFindings.length} finding(s). ` +
  `Reverse image search identified ` +
  `${exactMatches.length} exact/near-exact and ` +
  `${visualMatches.length} visual match(es). ` +
  `Semantic analysis estimated ` +
  `${semanticScore.toFixed(1)}% real-photo semantic compatibility. ` +
  `These auxiliary signals provide forensic context and do not replace the AI model score.`

  // =====================================================
  // RETURN RESULT
  // =====================================================

  return {

    // Keep this equal to the actual SBI model result.
    score,

    risk,

    verdict,

    summary,

    signals: [

      // =================================================
      // 1. AI DETECTION
      // =================================================

      {
        key: 'ai-generation',

        label: 'SelfBlendedImages detector',

        icon: Sparkles,

        summary:
          // SIGNAL_LIBRARY[0].summary,
          SIGNAL_BY_KEY['ai-generation'].summary,

        score,

        status:
          flagged
            ? 'flag'
            : 'clear',

        findings: [

          `SBI fakeness score: ${(fake * 100).toFixed(1)}%.`,

          flagged
            ? 'The detector found manipulation-like facial artifacts.'
            : 'The detector found no strong facial manipulation artifacts.',

          `AI model authenticity: ${score.toFixed(1)}%.`,

        ],
      },

      
      // =================================================
      // 5. SEMANTIC ANALYSIS
      // =================================================

      {
        key: 'semantic',

        label: 'Semantic analysis',

        icon: Telescope,

        summary:
          SIGNAL_BY_KEY.semantic.summary,

        score:
          semanticAvailable
            ? semanticScore
            : 0,

        status:
          semanticAvailable
            ? (
                semanticStatus === 'flag'
                  ? 'flag'
                  : semanticStatus === 'minor'
                    ? 'minor'
                    : 'clear'
              )
            : 'minor',

        findings: [

          ...semanticFindings,

          ...(semanticAvailable
            ? [
                `Real-photo semantic score: ${semanticRealScore.toFixed(1)}%.`,
                `Synthetic semantic score: ${semanticSyntheticScore.toFixed(1)}%.`,
                `Semantic margin: ${semanticMargin.toFixed(1)} points.`,
              ]
            : []),

          ...semanticWarnings.map(
            (warning: string) =>
              `Warning: ${warning}`
          ),

        ],
      },

      // =================================================
      // 2. METADATA
      // =================================================

      {
        key: 'metadata',

        label: 'Metadata',

        icon: FileText,

        summary:
          // SIGNAL_LIBRARY[5].summary,
          SIGNAL_BY_KEY.metadata.summary,

        // Metadata risk converted to an
        // authenticity-style signal score.
        score:
          Math.max(
            0,
            Math.min(
              100,
              100 - metadataRisk
            )
          ),

        status:
          metadataRisk >= 50
            ? 'flag'
            : metadataRisk >= 20
              ? 'minor'
              : 'clear',

        findings: [

          `Metadata risk: ${metadataRisk.toFixed(0)}%.`,

          ...metadataFindings,

          ...metadataWarnings.map(
            (warning: string) =>
              `Warning: ${warning}`
          ),

        ],
      },

      // =================================================
      // 3. REVERSE IMAGE SEARCH
      // =================================================

      {
        key: 'reverse-search',

        label: 'Reverse image search',

        icon: SearchCheck,

        summary:
          // SIGNAL_LIBRARY[6].summary,
          SIGNAL_BY_KEY['reverse-search'].summary,

        // This is an evidence signal.
        //
        // We don't claim that a web match means
        // "authentic". Instead, we display evidence
        // availability.
        score:
          exactMatches.length > 0
            ? 100
            : visualMatches.length > 0
              ? 75
              : reverseAvailable
                ? 50
                : 0,

        status:
          reverseSignalStatus,

        findings:
          reverseEvidence,

      },
      {
        key: 'c2pa',

        label: 'C2PA Content Credentials',

        icon: BadgeCheck,

        summary:
          // SIGNAL_LIBRARY[7].summary,
          SIGNAL_BY_KEY.c2pa.summary,

        /*
        * IMPORTANT:
        *
        * C2PA is provenance evidence.
        * It is NOT another deepfake probability.
        *
        * Therefore we don't modify result.score.
        */

        score:
          c2paPresent
            ? 100
            : 0,

        status:
          c2paPresent
            ? (
                c2paValidationState &&
                String(c2paValidationState)
                  .toLowerCase()
                  .includes('invalid')
                  ? 'flag'
                  : 'clear'
              )
            : 'minor',

        findings: [

          ...c2paFindings,

          ...(c2paClaimGenerator
            ? [
                `Claim generator: ${c2paClaimGenerator}.`,
              ]
            : []),

          ...(c2paValidationState
            ? [
                `Validation state: ${c2paValidationState}.`,
              ]
            : []),

          ...(c2paActions.length
            ? [
                `Recorded provenance actions: ${c2paActions.length}.`,
              ]
            : []),

          ...(c2paIngredients.length
            ? [
                `Provenance ingredients: ${c2paIngredients.length}.`,
              ]
            : []),

          ...c2paWarnings.map(
            (warning: string) =>
              `Warning: ${warning}`
          ),

        ],
      },


    ],
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
