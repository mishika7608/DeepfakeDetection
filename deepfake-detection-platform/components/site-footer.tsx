import Link from 'next/link'
import { ShieldHalf } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-12 sm:px-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <div className="flex items-center gap-2.5 text-foreground">
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldHalf className="size-[18px]" aria-hidden />
            </span>
            <span className="font-serif text-lg tracking-tight">Vindicate</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            A calm, private way to understand whether the media in front of you is real.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
          <FooterColumn
            title="Product"
            links={[
              { label: 'Analyze media', href: '/analyze' },
              { label: 'How it works', href: '/#how-it-works' },
              { label: 'Signals', href: '/#signals' },
            ]}
          />
          <FooterColumn
            title="Trust"
            links={[
              { label: 'Privacy', href: '/#privacy' },
              { label: 'Our approach', href: '/#how-it-works' },
            ]}
          />
          <FooterColumn
            title="Company"
            links={[
              { label: 'About', href: '/' },
              { label: 'Contact', href: '/' },
            ]}
          />
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>&copy; {new Date().getFullYear()} Vindicate. Built for peace of mind.</p>
          <p>Analysis is assistive and does not constitute a legal determination.</p>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: { label: string; href: string }[]
}) {
  return (
    <div>
      <h3 className="font-medium text-foreground">{title}</h3>
      <ul className="mt-3 space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
