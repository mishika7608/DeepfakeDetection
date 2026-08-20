import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Hero } from '@/components/landing/hero'
import { HowItWorks } from '@/components/landing/how-it-works'
import { Signals } from '@/components/landing/signals'
import { Privacy } from '@/components/landing/privacy'
import { ClosingCta } from '@/components/landing/closing-cta'

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Signals />
        <Privacy />
        <ClosingCta />
      </main>
      <SiteFooter />
    </div>
  )
}
