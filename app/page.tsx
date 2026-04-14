'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { parseTokenFile, totalTokenCount, type ParsedTokens } from '@/lib/token-parser'
import { usePdfDownload } from '@/lib/use-pdf-download'
import { UploadZone } from '@/components/upload-zone'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { AlertCircle, AlertTriangle, CheckCircle2, X, ChevronLeft, Download } from 'lucide-react'
import {
  ColorsSection,
  TypographySection,
  SpacingSection,
  BorderRadiusSection,
  ShadowsSection,
  OtherSection,
} from '@/components/token-sections'

// ── setInterval-based progress (0→100) ───────────────────────────
function useIntervalProgress(active: boolean, onDone: () => void) {
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const doneCalled  = useRef(false)

  useEffect(() => {
    if (!active) {
      setProgress(0)
      doneCalled.current = false
      return
    }

    doneCalled.current = false
    setProgress(0)

    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        let increment: number
        if (prev < 60)       increment = 1.8
        else if (prev < 85)  increment = 0.8
        else if (prev < 95)  increment = 0.3
        else                 increment = 0.1

        const next = prev + increment

        if (next >= 100) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          if (!doneCalled.current) {
            doneCalled.current = true
            setTimeout(onDone, 200)
          }
          return 100
        }

        return next
      })
    }, 35)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [active, onDone])

  return progress
}

// ── Status labels ────────────────────────────────────────────────
const STATUS_STEPS = [
  { at: 0,  label: 'Reading your file\u2026' },
  { at: 25, label: 'Parsing token categories\u2026' },
  { at: 55, label: 'Building your reference\u2026' },
  { at: 80, label: 'Almost ready\u2026' },
  { at: 95, label: 'Finishing up\u2026' },
] as const

function getStatusLabel(pct: number) {
  let label = STATUS_STEPS[0].label
  for (const step of STATUS_STEPS) {
    if (pct >= step.at) label = step.label
  }
  return label
}

type AppState   = 'upload' | 'loading' | 'ready'
type ErrorKind  = 'not-json' | 'no-tokens' | 'parse-error' | null

const PDF_ELEMENT_ID = 'token-output'

export default function Home() {
  const [appState, setAppState]       = useState<AppState>('upload')
  const [tokens, setTokens]           = useState<ParsedTokens | null>(null)
  const [filename, setFilename]       = useState('')
  const [errorKind, setErrorKind]     = useState<ErrorKind>(null)
  const [errorMsg, setErrorMsg]       = useState<string | null>(null)
  const [showToast, setShowToast]     = useState(false)
  const [dismissHovered, setDismissHovered] = useState(false)
  const pendingRef = useRef<{ parsed: ParsedTokens; name: string } | null>(null)
  const timers     = useRef<ReturnType<typeof setTimeout>[]>([])

  const { download, downloading } = usePdfDownload()

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // Auto-dismiss error after 4 s
  useEffect(() => {
    if (!errorKind) return
    if (errorKind === 'no-tokens' || errorKind === 'parse-error') return
    const t = setTimeout(() => setErrorKind(null), 4000)
    return () => clearTimeout(t)
  }, [errorKind])

  const handleCountDone = useCallback(() => {
    if (!pendingRef.current) return
    const { parsed, name } = pendingRef.current
    pendingRef.current = null
    setTokens(parsed)
    setFilename(name)
    setAppState('ready')
    setShowToast(true)
  }, [])

  const progress    = useIntervalProgress(appState === 'loading', handleCountDone)
  const statusLabel = getStatusLabel(progress)

  const handleFile = useCallback((content: string, name: string) => {
    setErrorKind(null)
    setErrorMsg(null)

    let parsed: ParsedTokens
    try {
      parsed = parseTokenFile(content)
    } catch (err) {
      setErrorKind('parse-error')
      setErrorMsg(err instanceof Error ? err.message : 'Failed to parse file.')
      return
    }

    if (totalTokenCount(parsed) === 0) {
      setErrorKind('no-tokens')
      setAppState('upload')
      return
    }

    pendingRef.current = { parsed, name }
    setAppState('loading')
  }, [])

  const handleError = useCallback((kind: string) => {
    if (kind === 'not-json') {
      setErrorKind('not-json')
    } else {
      setErrorKind('parse-error')
      setErrorMsg(kind)
    }
    setTokens(null)
    setAppState('upload')
  }, [])

  const handleReset = () => {
    timers.current.forEach(clearTimeout)
    setTokens(null)
    setFilename('')
    setErrorKind(null)
    setErrorMsg(null)
    setShowToast(false)
    setAppState('upload')
  }

  const handleDownload = () => {
    const name = filename.replace(/\.json$/, '') || 'design-tokens'
    download(PDF_ELEMENT_ID, `${name}.pdf`)
  }

  const sectionOrder = tokens
    ? [
        tokens.colors.length       > 0 && 'colors',
        tokens.typography.length   > 0 && 'typography',
        tokens.spacing.length      > 0 && 'spacing',
        tokens.borderRadius.length > 0 && 'borderRadius',
        tokens.shadows.length      > 0 && 'shadows',
        tokens.other.length        > 0 && 'other',
      ].filter(Boolean) as string[]
    : []
  const idx = (key: string) => sectionOrder.indexOf(key)

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0A' }}>

      <Navbar
        variant={appState === 'upload' ? 'full' : 'logo-only'}
        onLogoClick={appState !== 'upload' ? handleReset : undefined}
      />

      {appState === 'ready' && (
        <div style={{ paddingTop: 60 }}>
          <div
            className="visual-subheader"
            data-no-print
          >
            <button
              type="button"
              onClick={handleReset}
              aria-label="Go back to upload page"
              className="flex items-center"
              style={{
                color: '#9CA3AF',
                fontSize: 14,
                fontWeight: 500,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                gap: 4,
                minHeight: 44,
                transition: 'color 150ms ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#FFFFFF')}
              onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}
            >
              <ChevronLeft size={16} aria-hidden="true" />
              Back
            </button>
            <span
              style={{
                color: '#FFFFFF',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
                maxWidth: 'min(60ch,35vw)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
              title={filename}
            >
              {filename}
            </span>
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              aria-label="Download PDF"
              className="flex items-center disabled:opacity-50"
              style={{
                background: '#6366F1',
                color: '#FFFFFF',
                borderRadius: 10,
                padding: '8px 18px',
                fontSize: 13,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                gap: 6,
                minHeight: 44,
                transition: 'opacity 150ms ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              <Download size={14} aria-hidden="true" />
              Download PDF
            </button>
          </div>
        </div>
      )}

      {/* ── Fix 6: Compact success toast ────────────────────────────── */}
      {showToast && tokens && (
        <div
          data-no-print
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#1A1A1A',
            border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: 10,
            padding: '12px 16px',
            color: '#FFFFFF',
            fontSize: 13,
            fontFamily: 'var(--font-sans)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
          }}
          role="status"
          aria-live="polite"
        >
          <CheckCircle2 size={14} color="#22C55E" aria-hidden="true" style={{ flexShrink: 0 }} />
          <span>{totalTokenCount(tokens)} tokens loaded successfully</span>
          <button
            type="button"
            onClick={() => setShowToast(false)}
            aria-label="Dismiss notification"
            style={{
              marginLeft: 12,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: dismissHovered ? '#FFFFFF' : '#71717A',
              padding: '7px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 28,
              minWidth: 28,
              borderRadius: 6,
              transition: 'color 150ms ease',
              flexShrink: 0,
            }}
            onMouseEnter={() => setDismissHovered(true)}
            onMouseLeave={() => setDismissHovered(false)}
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      )}

      <main>
        {/* ── Upload state ───────────────────────────────────────────── */}
        {appState === 'upload' && (
          <div style={{ position:'relative', minHeight:'100vh', backgroundColor:'#0A0A0A', overflow:'hidden' }}>
            <div className="dot-grid-bg" />
            <div style={{ position:'relative', zIndex:1 }}>
              <div style={{ paddingTop: 60 }}>
              <UploadZone onFile={handleFile} onError={handleError} />

              {/* Error pills */}
              {errorKind && (
                <div className="mx-auto max-w-xl px-6 -mt-12 pb-12 flex justify-center" style={{ position: 'relative', zIndex: 2 }}>
                  {errorKind === 'not-json' && (
                    <div
                      className="flash-in flex items-center gap-2 rounded-full px-4 py-2 text-sm"
                      style={{
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        color: '#EF4444',
                        fontFamily: 'var(--font-sans)',
                      }}
                      role="alert"
                    >
                      <AlertCircle size={14} aria-hidden="true" />
                      {"That's not a JSON file. Please upload a valid .json token file."}
                    </div>
                  )}
                  {errorKind === 'no-tokens' && (
                    <div style={{
                      position: 'fixed',
                      bottom: 24,
                      right: 24,
                      zIndex: 100,
                      background: '#1A1A1A',
                      border: '1px solid rgba(245,158,11,0.3)',
                      borderRadius: 12,
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 13,
                      color: '#FFFFFF',
                      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                    }}>
                      <AlertTriangle size={14} color="#F59E0B" />
                      <span>No tokens found. Check it uses W3C or Figma Tokens format.</span>
                      <button onClick={() => setErrorKind(null)} aria-label="Dismiss notification" style={{ marginLeft: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#71717A', padding: 0, display: 'flex', alignItems: 'center', minHeight: 28, minWidth: 28, justifyContent: 'center' }}>
                        <X size={14} />
                      </button>
                    </div>
                  )}
                  {errorKind === 'parse-error' && (
                    <div style={{
                      position: 'fixed',
                      bottom: 24,
                      right: 24,
                      zIndex: 100,
                      background: '#1A1A1A',
                      border: '1px solid rgba(239,68,68,0.3)',
                      borderRadius: 12,
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 13,
                      color: '#FFFFFF',
                      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                    }}>
                      <AlertCircle size={14} color="#EF4444" />
                      <span>{errorMsg ?? 'Failed to parse file.'}</span>
                      <button onClick={() => setErrorKind(null)} aria-label="Dismiss notification" style={{ marginLeft: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#71717A', padding: 0, display: 'flex', alignItems: 'center', minHeight: 28, minWidth: 28, justifyContent: 'center' }}>
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              <Footer />
              </div>
            </div>
          </div>
        )}

        {/* ── Loading state ──────────────────────────────────────────── */}
        {appState === 'loading' && (
          <div style={{ position:'relative', minHeight:'100vh', backgroundColor:'#0A0A0A', overflow:'hidden' }}>
            <div className="dot-grid-bg" />
            <div style={{ position:'relative', zIndex:1 }}>
              <div style={{ paddingTop: 60, display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', flex: 1, backgroundColor: '#0A0A0A' }} className="animate-fade-in-up">
                <div
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 'calc(100vh - 60px)',
                    padding: '24px',
                  }}
                >
                  <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>

                    <p
                      style={{
                        fontSize: 72,
                        fontWeight: 800,
                        fontFamily: "'JetBrains Mono', monospace",
                        letterSpacing: '-0.03em',
                        color: '#FFFFFF',
                        lineHeight: 1,
                        margin: 0,
                      }}
                      aria-live="polite"
                      aria-label={`Loading ${Math.floor(progress)} percent`}
                    >
                      {Math.floor(progress)}%
                    </p>

                    <p
                      key={statusLabel}
                      className="animate-fade-in-up"
                      style={{ color: '#9CA3AF', fontSize: 14, fontFamily: 'var(--font-sans)', textAlign: 'center', margin: 0 }}
                    >
                      {statusLabel}
                    </p>

                    <div
                      style={{ width: '100%', height: 4, borderRadius: 2, background: '#1F1F1F' }}
                      role="progressbar"
                      aria-valuenow={Math.floor(progress)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="File processing progress"
                    >
                      <div
                        style={{
                          width: `${progress}%`,
                          height: '100%',
                          borderRadius: 2,
                          background: 'linear-gradient(90deg, #6366F1, #818CF8)',
                          boxShadow: '0 0 12px rgba(99,102,241,0.6)',
                          transition: 'none',
                        }}
                      />
                    </div>

                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Ready state ────────────────────────────────────────────── */}
        {appState === 'ready' && tokens && (
          <div style={{ position:'relative', minHeight:'100vh', backgroundColor:'#0A0A0A', overflow:'hidden' }}>
            <div className="dot-grid-bg" />
            <div style={{ position:'relative', zIndex:1 }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', flex: 1, backgroundColor: '#0A0A0A' }} className="animate-fade-in-up">
                <div id={PDF_ELEMENT_ID} style={{ position: 'relative', zIndex: 1 }}>
                  <div className="visual-content-shell">
                    <div className="flex flex-col">
                      <ColorsSection       tokens={tokens.colors}        sectionIndex={idx('colors')} />
                      <TypographySection   tokens={tokens.typography}    sectionIndex={idx('typography')} />
                      <SpacingSection      tokens={tokens.spacing}       sectionIndex={idx('spacing')} />
                      <BorderRadiusSection tokens={tokens.borderRadius}  sectionIndex={idx('borderRadius')} />
                      <ShadowsSection      tokens={tokens.shadows}       sectionIndex={idx('shadows')} />
                      <OtherSection        tokens={tokens.other}         sectionIndex={idx('other')} />
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
