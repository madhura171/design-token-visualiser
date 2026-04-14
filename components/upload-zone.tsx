'use client'

import { useCallback, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Upload, FileJson, Wand2, LayoutGrid, ChevronRight } from 'lucide-react'

interface UploadZoneProps {
  onFile: (content: string, filename: string) => void
  onError: (msg: string) => void
}

export function UploadZone({ onFile, onError }: UploadZoneProps) {
  const [isDragging, setIsDragging]   = useState(false)
  const [glowPos, setGlowPos]         = useState<{ x: number; y: number } | null>(null)
  const inputRef  = useRef<HTMLInputElement>(null)
  const zoneRef   = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoneRef.current) return
    const rect = zoneRef.current.getBoundingClientRect()
    setGlowPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }
  const handleMouseLeave = () => setGlowPos(null)

  const readFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith('.json') && file.type !== 'application/json') {
        onError('not-json')
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result
        if (typeof content === 'string') onFile(content, file.name)
      }
      reader.readAsText(file)
    },
    [onFile, onError],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files?.[0]
      if (file) readFile(file)
    },
    [readFile],
  )

  const handleDragOver  = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = () => setIsDragging(false)
  const handleChange    = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) readFile(file)
    e.target.value = ''
  }

  const HOW_IT_WORKS_STEPS = [
    {
      id: 'drop',
      Icon: FileJson,
      title: 'Drop your file',
      description: 'Upload any .json token file from your design system',
    },
    {
      id: 'parse',
      Icon: Wand2,
      title: 'Tokens are parsed',
      description: 'We detect colors, typography, spacing and more automatically',
    },
    {
      id: 'see',
      Icon: LayoutGrid,
      title: 'See your system',
      description: 'Browse and copy tokens from a clean visual reference',
    },
  ]

  return (
    // Outermost: bg color only, position:relative so the dot-grid layer is absolute inside
    <div style={{ position: 'relative', backgroundColor: '#0A0A0A' }}>

      {/* Dot-grid background — masked, pointer-events:none — Fix 1: fade starts at 60% */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* All content — zIndex:1, never masked */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Hero + drop zone ──────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            // Fix 2: 64px top/bottom padding accounts for 56px navbar + breathing room
            padding: '80px 24px 64px',
          }}
        >
          <div style={{ width: '100%', maxWidth: 520, textAlign: 'center' }}>

            {/* Page heading */}
            <div style={{ marginBottom: 64 }} className="animate-fade-in-up">
              <h1
                className="text-white leading-none"
                style={{
                  fontSize: 56,
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  fontFamily: 'var(--font-sans)',
                  marginBottom: 16,
                }}
              >
                Design Token Visualiser
              </h1>
              <p style={{ color: '#A1A1AA', fontSize: 16, fontFamily: 'var(--font-sans)', lineHeight: 1.6, margin: 0 }}>
                Drop your token file. Instantly see your system.
              </p>
            </div>

            {/* Drop zone */}
            <div
              ref={zoneRef}
              role="button"
              tabIndex={0}
              aria-label="Upload token JSON file — drag and drop or press Enter to browse"
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className={cn('select-none transition-all duration-200', isDragging && 'scale-[1.01]')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
                borderRadius: 20,
                borderWidth: 1.5,
                borderStyle: 'dashed',
                padding: '52px 40px',
                cursor: 'pointer',
                overflow: 'hidden',
                borderColor: isDragging ? 'rgba(99,102,241,0.8)' : 'rgba(99,102,241,0.5)',
                background: isDragging
                  ? 'rgba(255,255,255,0.10)'
                  : glowPos
                  ? `radial-gradient(300px circle at ${glowPos.x}px ${glowPos.y}px, rgba(99,102,241,0.12) 0%, transparent 70%), rgba(255,255,255,0.06)`
                  : 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(12px)',
                boxShadow: isDragging || glowPos ? '0 0 32px rgba(99,102,241,0.2)' : 'none',
                outline: 'none',
              }}
              onFocus={e => (e.currentTarget.style.boxShadow = '0 0 0 2px #6366F1')}
              onBlur={e => (e.currentTarget.style.boxShadow = isDragging || glowPos ? '0 0 32px rgba(99,102,241,0.2)' : 'none')}
            >
              <Upload size={32} color="#6366F1" aria-hidden="true" />

              <p style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-sans)', margin: 0 }}>
                {isDragging ? 'Release to upload' : 'Drag & drop your token file'}
              </p>

              <p style={{ color: '#A1A1AA', fontSize: 14, fontFamily: 'var(--font-sans)', margin: 0 }}>
                JSON files only &middot; W3C and Figma Tokens format supported
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', margin: '8px 0' }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                <span style={{ color: '#A1A1AA', fontSize: 13, fontFamily: 'var(--font-sans)' }}>or</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              </div>

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
                style={{
                  background: '#6366F1',
                  color: '#FFFFFF',
                  borderRadius: 10,
                  padding: '12px 28px',
                  fontWeight: 600,
                  fontSize: 15,
                  fontFamily: 'var(--font-sans)',
                  border: 'none',
                  cursor: 'pointer',
                  minHeight: 44,
                  outlineOffset: 2,
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                onFocus={e => (e.currentTarget.style.outline = '2px solid #A5B4FC')}
                onBlur={e => (e.currentTarget.style.outline = 'none')}
              >
                Browse file
              </button>
            </div>

            {/* Privacy pill — Fix 2: 16px below drop zone */}
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  borderRadius: 9999,
                  padding: '6px 14px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#A1A1AA',
                  fontSize: 13,
                  fontFamily: 'var(--font-sans)',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <rect x="2" y="5" width="8" height="6" rx="1" stroke="#A1A1AA" strokeWidth="1.2" />
                  <path d="M4 5V3.5a2 2 0 014 0V5" stroke="#A1A1AA" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                Your file never leaves your browser. Nothing is uploaded to any server.
              </span>
            </div>

            {/* Hidden file input */}
            <label htmlFor="token-file-input" className="sr-only">Upload token JSON file</label>
            <input
              ref={inputRef}
              id="token-file-input"
              type="file"
              accept=".json,application/json"
              className="sr-only"
              onChange={handleChange}
            />
          </div>
        </div>

        {/* ── Fix 4: "How it works" section ────────────────────────── */}
        <section
          id="how-it-works"
          style={{
            paddingTop: 80,
            paddingBottom: 80,
            paddingLeft: 24,
            paddingRight: 24,
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
            <h2
              style={{
                color: '#FFFFFF',
                fontSize: 22,
                fontWeight: 700,
                fontFamily: 'var(--font-sans)',
                marginBottom: 40,
                letterSpacing: '-0.01em',
              }}
            >
              How it works
            </h2>

            {/* Steps row — horizontal on desktop, stacked on mobile */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0,
                flexWrap: 'wrap',
              }}
            >
              {HOW_IT_WORKS_STEPS.map((step, i) => (
                <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
                  {/* Step card */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 16,
                      padding: '0 32px',
                      maxWidth: 240,
                    }}
                  >
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 16,
                        background: 'rgba(99,102,241,0.12)',
                        border: '1px solid rgba(99,102,241,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <step.Icon size={24} color="#6366F1" aria-hidden="true" />
                    </div>
                    <div>
                      <p
                        style={{
                          color: '#FFFFFF',
                          fontSize: 16,
                          fontWeight: 600,
                          fontFamily: 'var(--font-sans)',
                          margin: '0 0 8px',
                        }}
                      >
                        {step.title}
                      </p>
                      <p
                        style={{
                          color: '#9CA3AF',
                          fontSize: 14,
                          fontFamily: 'var(--font-sans)',
                          lineHeight: 1.6,
                          margin: 0,
                        }}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Chevron separator — hidden on last step and on mobile */}
                  {i < HOW_IT_WORKS_STEPS.length - 1 && (
                    <ChevronRight
                      size={20}
                      color="#4B5563"
                      aria-hidden="true"
                      className="hidden sm:block flex-shrink-0"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
