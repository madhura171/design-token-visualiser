'use client'

import { useCallback, useRef, useState } from 'react'
import { Upload, FileJson, Wand2, LayoutGrid, ChevronRight } from 'lucide-react'

interface UploadZoneProps {
  onFile: (content: string, filename: string) => void
  onError: (msg: string) => void
}

export function UploadZone({ onFile, onError }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef  = useRef<HTMLInputElement>(null)

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
    <div style={{ position: 'relative', backgroundColor: '#0A0A0A' }}>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.13) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 33%)',
          maskImage: 'linear-gradient(to bottom, black 0%, transparent 33%)',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="upload-hero-shell">
          <div style={{ width: '100%', maxWidth: 960, textAlign: 'center' }} className="animate-fade-in-up">
              <h1
                className="upload-page-title"
                style={{
                  fontSize: 'clamp(36px, 5.5vw, 60px)',
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.1,
                  color: '#FFFFFF',
                  textAlign: 'center',
                  fontFamily: 'var(--font-sans)',
                  margin: 0,
                }}
              >
                Design Token Visualiser
              </h1>
              <p
                style={{
                  marginTop: 18,
                  fontSize: 17,
                  color: '#9CA3AF',
                  maxWidth: 460,
                  textAlign: 'center',
                  lineHeight: 1.5,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
              >
                Paste your token file and instantly get a scannable visual reference for your entire system.
              </p>

            <div
              style={{ marginTop: 36, maxWidth: 500, width: '100%' }}
              role="button"
              tabIndex={0}
              aria-label="Upload token file by drag and drop or browse"
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className="upload-drop-zone"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 16,
                border: '1.5px dashed rgba(99,102,241,0.4)',
                padding: '36px 28px',
                cursor: 'pointer',
                background: isDragging ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(12px)',
                transition: 'background 150ms ease',
                minHeight: 44,
              }}
            >
              <Upload size={28} color="#6366F1" aria-hidden="true" />

              <p style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 600, marginTop: 14, marginBottom: 0 }}>
                Drag & drop your token file
              </p>

              <p style={{ color: '#6B7280', fontSize: 14, marginTop: 6, marginBottom: 0 }}>
                JSON · W3C and Figma Tokens format
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', marginTop: 20, marginBottom: 20 }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                <span style={{ color: '#6B7280', fontSize: 13 }}>or</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              </div>

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
                style={{
                  background: '#6366F1',
                  color: '#FFFFFF',
                  borderRadius: 10,
                  padding: '10px 28px',
                  fontWeight: 600,
                  fontSize: 14,
                  border: 'none',
                  cursor: 'pointer',
                  minHeight: 44,
                  alignSelf: 'center',
                  transition: 'opacity 150ms ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Browse file
              </button>
            </div>

            <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  borderRadius: 9999,
                  padding: '6px 14px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#9CA3AF',
                  fontSize: 13,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <rect x="2" y="5" width="8" height="6" rx="1" stroke="#A1A1AA" strokeWidth="1.2" />
                  <path d="M4 5V3.5a2 2 0 014 0V5" stroke="#A1A1AA" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                Your file never leaves your browser. Nothing is uploaded to any server.
              </span>
            </div>

            <label htmlFor="token-file-input" className="sr-only">Upload token JSON file</label>
            <input
              ref={inputRef}
              id="token-file-input"
              type="file"
              accept=".json,application/json"
              aria-label="Choose token file"
              className="sr-only"
              onChange={handleChange}
            />
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.07)', margin: '72px 0 0 0' }} />
        <section
          id="how-it-works"
          style={{
            paddingTop: 72,
            paddingBottom: 80,
            paddingLeft: 20,
            paddingRight: 20,
            background: 'rgba(255,255,255,0.012)',
          }}
        >
          <div style={{ maxWidth: 1120, margin: '0 auto', textAlign: 'center' }}>
            <h2
              style={{
                color: '#FFFFFF',
                fontSize: 20,
                fontWeight: 700,
                marginBottom: 52,
              }}
            >
              How it works
            </h2>

            <div className="how-steps-row" style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 48 }}>
              {HOW_IT_WORKS_STEPS.map((step, i) => (
                <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      maxWidth: 220,
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        borderRadius: 12,
                        background: 'rgba(99,102,241,0.12)',
                        padding: 14,
                        marginBottom: 16,
                      }}
                    >
                      <step.Icon size={22} color="#6366F1" aria-hidden="true" />
                    </div>
                    <p style={{ color: '#FFFFFF', fontSize: 15, fontWeight: 600, margin: '0 0 8px' }}>{step.title}</p>
                    <p style={{ color: '#6B7280', fontSize: 13, lineHeight: 1.5, margin: 0 }}>{step.description}</p>
                  </div>

                  {i < HOW_IT_WORKS_STEPS.length - 1 && (
                    <ChevronRight
                      size={18}
                      color="#374151"
                      aria-hidden="true"
                      className="how-step-chevron"
                      style={{ alignSelf: 'center', flexShrink: 0 }}
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
