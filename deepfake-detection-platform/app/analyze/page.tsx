import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { AnalyzeExperience } from '@/components/analyze/analyze-experience'

export const metadata: Metadata = {
  title: 'Analyze media — Vindicate',
  description:
    'Upload a photo or video and understand its authenticity across six independent signals, explained in plain language.',
}

export default function AnalyzePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 px-5 py-12 sm:px-8 lg:py-16">
        <AnalyzeExperience />
      </main>
      <SiteFooter />
    </div>
  )
}
