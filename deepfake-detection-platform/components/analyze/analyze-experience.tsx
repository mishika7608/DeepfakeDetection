'use client'

import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'
import { Dropzone, type UploadedMedia } from '@/components/analyze/dropzone'
import { MediaPreview } from '@/components/analyze/media-preview'
import { AnalysisJourney } from '@/components/analyze/analysis-journey'
import { ResultsView } from '@/components/analyze/results-view'
import { getDetectorAnalysis, type AnalysisResult } from '@/lib/analysis'
import { Button } from '@/components/ui/button'

type Stage = 'upload' | 'analyzing' | 'results'

const fade = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
}

export function AnalyzeExperience() {
  const [media, setMedia] = useState<UploadedMedia | null>(null)
  const [stage, setStage] = useState<Stage>('upload')
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const reset = useCallback(() => {
    if (media) URL.revokeObjectURL(media.url)
    setMedia(null)
    setResult(null)
    setStage('upload')
  }, [media])

  const handleComplete = useCallback(async () => {
    if (!media) return
    try { setResult(await getDetectorAnalysis(media.file)) }
    catch (error) {
      window.alert(error instanceof Error ? error.message : 'Analysis could not be completed.')
      setStage('upload')
      return
    }
    setStage('results')
  }, [media])

  // Upload stage, no media yet — a single, welcoming column.
  if (stage === 'upload' && !media) {
    return (
      <div className="mx-auto w-full max-w-xl">
        <motion.div {...fade} className="mb-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" aria-hidden />
            Step 1 of 2
          </span>
          <h1 className="mt-5 font-serif text-4xl leading-tight tracking-tight text-balance sm:text-5xl">
            Upload a photo or video
          </h1>
          <p className="mx-auto mt-4 max-w-md leading-relaxed text-muted-foreground text-pretty">
            Your media is analyzed across multiple signals to help you understand
            its authenticity. It stays private the whole way through.
          </p>
        </motion.div>
        <motion.div {...fade} transition={{ ...fade.transition, delay: 0.1 }}>
          <Dropzone onSelect={setMedia} />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start">
      {/* Media stays prominent throughout */}
      <div className="lg:sticky lg:top-24">
        <MediaPreview
          media={media!}
          onReset={stage === 'results' ? reset : undefined}
          badge={
            stage === 'results' ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1 text-xs font-medium text-foreground backdrop-blur">
                <ShieldCheck className="size-3.5 text-sage-foreground" aria-hidden />
                Analyzed
              </span>
            ) : null
          }
        />
      </div>

      <div>
        <AnimatePresence mode="wait">
          {stage === 'upload' && media ? (
            <motion.div key="ready" {...fade} className="rounded-[1.75rem] border border-border/70 bg-card p-6 sm:p-8">
              <h2 className="font-serif text-2xl tracking-tight">Ready when you are</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                We&apos;ll review your media across six independent signals —
                AI generation, facial consistency, semantic cues, identity,
                attribute edits, and metadata — then explain what we found.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="group" onClick={() => setStage('analyzing')}>
                  Begin analysis
                  <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                </Button>
                <Button variant="outline" size="lg" onClick={reset}>
                  Choose different media
                </Button>
              </div>
            </motion.div>
          ) : null}

          {stage === 'analyzing' ? (
            <motion.div key="analyzing" {...fade}>
              <AnalysisJourney onComplete={handleComplete} />
            </motion.div>
          ) : null}

          {stage === 'results' && result ? (
            <motion.div key="results" {...fade}>
              <ResultsView result={result} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}
