'use client'

import { useRef, useState } from 'react'
import { motion } from 'motion/react'
import { UploadCloud, ImageIcon, Film, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface UploadedMedia {
  url: string
  name: string
  kind: 'image' | 'video'
  file: File
}

export function Dropzone({ onSelect }: { onSelect: (media: UploadedMedia) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function handleFiles(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    const isVideo = file.type.startsWith('video/')
    const isImage = file.type.startsWith('image/')
    if (!isVideo && !isImage) return
    onSelect({
      url: URL.createObjectURL(file),
      name: file.name,
      kind: isVideo ? 'video' : 'image',
      file,
    })
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          handleFiles(e.dataTransfer.files)
        }}
        className={cn(
          'group flex w-full flex-col items-center justify-center rounded-[1.75rem] border border-dashed px-6 py-16 text-center transition-colors sm:py-20',
          dragging
            ? 'border-primary bg-primary/[0.04]'
            : 'border-border bg-card hover:border-primary/50 hover:bg-muted/40',
        )}
        aria-label="Upload a photo or video to analyze"
      >
        <motion.span
          animate={{ y: dragging ? -4 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"
        >
          <UploadCloud className="size-6" aria-hidden />
        </motion.span>
        <p className="mt-5 text-base font-medium text-foreground">
          {dragging ? 'Drop it here' : 'Drag and drop, or click to browse'}
        </p>
        <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted-foreground">
          JPG, PNG, or MP4 up to 50MB. Your media stays private to this analysis.
        </p>
        <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <ImageIcon className="size-3.5" aria-hidden /> Images
          </span>
          <span className="flex items-center gap-1.5">
            <Film className="size-3.5" aria-hidden /> Video
          </span>
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Lock className="size-3.5 text-primary" aria-hidden />
        Analyzed privately — never stored, sold, or used to train models.
      </p>
    </div>
  )
}
