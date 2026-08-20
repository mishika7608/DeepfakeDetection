'use client'

import { RefreshCw } from 'lucide-react'
import type { UploadedMedia } from '@/components/analyze/dropzone'
import { Button } from '@/components/ui/button'

export function MediaPreview({
  media,
  onReset,
  badge,
}: {
  media: UploadedMedia
  onReset?: () => void
  badge?: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-card">
      <div className="relative bg-muted/50">
        {media.kind === 'video' ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            src={media.url}
            controls
            className="max-h-[520px] w-full object-contain"
          />
        ) : (
          <img
            src={media.url || '/placeholder.svg'}
            alt="The media you uploaded for analysis"
            className="max-h-[520px] w-full object-contain"
          />
        )}
        {badge ? <div className="absolute left-4 top-4">{badge}</div> : null}
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-border/60 px-4 py-3">
        <p className="min-w-0 truncate text-sm text-muted-foreground" title={media.name}>
          {media.name}
        </p>
        {onReset ? (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RefreshCw />
            New media
          </Button>
        ) : null}
      </div>
    </div>
  )
}
