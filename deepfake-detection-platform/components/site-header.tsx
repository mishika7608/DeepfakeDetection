'use client'

import Link from 'next/link'
import { ShieldHalf } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-foreground"
          aria-label="Vera home"
        >
          <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldHalf className="size-[18px]" aria-hidden />
          </span>
          <span className="font-serif text-lg tracking-tight">Vera</span>
        </Link>

        <nav
          className="hidden items-center gap-8 text-sm text-muted-foreground md:flex"
          aria-label="Primary"
        >
          <Link href="/#how-it-works" className="transition-colors hover:text-foreground">
            How it works
          </Link>
          <Link href="/#signals" className="transition-colors hover:text-foreground">
            Signals
          </Link>
          <Link href="/#privacy" className="transition-colors hover:text-foreground">
            Privacy
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/#how-it-works" />}
            className="hidden sm:inline-flex"
          >
            How it works
          </Button>
          <Button size="sm" nativeButton={false} render={<Link href="/analyze" />}>
            Analyze media
          </Button>
        </div>
      </div>
    </header>
  )
}
