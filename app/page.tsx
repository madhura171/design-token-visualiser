'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { parseTokenFile, totalTokenCount, type ParsedTokens } from '@/lib/token-parser'
import { usePdfDownload } from '@/lib/use-pdf-download'
import { UploadZone } from '@/components/upload-zone'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { AlertCircle, AlertTriangle, CheckCircle2, X } from 'lucide-react'
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

// ── Dot-grid background layer — Fix 1: mask starts fading at 60% ─
function DotGridBg() {
  return (
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
  )
}

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

      {/* ── Fix 3: Navbar present on ALL states ─────────────────────── */}
      <Navbar
        onLogoClick={appState !== 'upload' ? handleReset : undefined}
      />

      {/* ── Sticky visuals header (loading + ready only) ─────────────── */}
      {(appState === 'loading' || appState === 'ready') && (
        <div
          className="sticky z-40"
          style={{
            top: 56, // sit just below the fixed navbar
            background: 'rgba(10,10,10,0.85)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">

            {/* Back button */}
            <button
              type="button"
              onClick={handleReset}
              data-no-print
              aria-label="Go back to upload page"
              className="flex items-center gap-1.5 transition-opacity flex-shrink-0"
              style={{
                color: '#FAFAFA',
                fontSize: 15,
                fontWeight: 500,
                fontFamily: 'var(--font-sans)',
                background: 'none',
                border: 'none',
                padding: '10px 0',
                minHeight: 44,
                cursor: 'pointer',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              onFocus={e => (e.currentTarget.style.outline = '2px solid #6366F1')}
              onBlur={e => (e.currentTarget.style.outline = 'none')}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M10 13L6 8l4-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back
            </button>

            {/* Center — filename */}
            {filename && (
              <span
                className="font-mono font-semibold text-center flex-1"
                style={{
                  color: '#FAFAFA',
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', monospace",
                  maxWidth: 'min(60ch, 40vw)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block',
                }}
                title={filename}
              >
                {filename}
              </span>
            )}

            {/* Right — Download PDF */}
            <div className="flex items-center gap-2 flex-shrink-0" data-no-print>
              {appState === 'ready' && (
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={downloading}
                  aria-label="Download token reference as PDF"
                  className="flex items-center gap-1.5 font-semibold text-white transition-all disabled:opacity-50"
                  style={{
                    background: '#6366F1',
                    borderRadius: 10,
                    padding: '12px 20px',
                    fontSize: 14,
                    fontFamily: 'var(--font-sans)',
                    border: 'none',
                    cursor: 'pointer',
                    minHeight: 44,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 20px rgba(99,102,241,0.5)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                  onFocus={e => (e.currentTarget.style.outline = '2px solid #6366F1')}
                  onBlur={e => (e.currentTarget.style.outline = 'none')}
                >
                  {downloading ? 'Generating…' : (
                    <>
                      <svg width="13" height="13" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M6 1v7M3 5l3 3 3-3M1 10h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Download PDF
                    </>
                  )}
                </button>
              )}
            </div>
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
              transition: 'color 150ms',
              flexShrink: 0,
            }}
            onMouseEnter={() => setDismissHovered(true)}
            onMouseLeave={() => setDismissHovered(false)}
            onFocus={e => (e.currentTarget.style.outline = '2px solid #6366F1')}
            onBlur={e => (e.currentTarget.style.outline = 'none')}
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      )}

      <main>
        {/* ── Upload state ───────────────────────────────────────────── */}
        {appState === 'upload' && (
          <div style={{ paddingTop: 56 }}>
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
                  <div
                    className="flash-in flex items-center gap-2 rounded-full px-4 py-2 text-sm"
                    style={{
                      background: 'rgba(245,158,11,0.08)',
                      border: '1px solid rgba(245,158,11,0.2)',
                      color: '#F59E0B',
                      fontFamily: 'var(--font-sans)',
                    }}
                    role="alert"
                  >
                    <AlertTriangle size={14} aria-hidden="true" />
                    {"We couldn't find any design tokens in this file. Check it uses W3C or Figma Tokens format."}
                  </div>
                )}
                {errorKind === 'parse-error' && (
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
                    {errorMsg ?? 'Failed to parse the file.'}
                  </div>
                )}
              </div>
            )}

            {/* Fix 5: Footer on upload page */}
            <Footer />
          </div>
        )}

        {/* ── Loading state ──────────────────────────────────────────── */}
        {appState === 'loading' && (
          <div style={{ paddingTop: 56, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <div style={{ position: 'relative', flex: 1, backgroundColor: '#0A0A0A' }}>
              <DotGridBg />
              <div
                style={{
                  position: 'relative',
                  zIndex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 'calc(100vh - 56px)',
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
                    style={{ color: '#A1A1AA', fontSize: 14, fontFamily: 'var(--font-sans)', textAlign: 'center', margin: 0 }}
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
            {/* Fix 5: Footer on loading page */}
            <Footer />
          </div>
        )}

        {/* ── Ready state ────────────────────────────────────────────── */}
        {appState === 'ready' && tokens && (
          <div style={{ paddingTop: 56, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <div style={{ position: 'relative', flex: 1, backgroundColor: '#0A0A0A' }}>
              <DotGridBg />
              <div id={PDF_ELEMENT_ID} style={{ position: 'relative', zIndex: 1 }}>
                <div className="mx-auto max-w-7xl px-6 py-10">
                  <div className="flex flex-col" style={{ gap: 48 }}>
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
            {/* Fix 5: Footer on visuals page */}
            <Footer />
          </div>
        )}
      </main>
    </div>
  )
}
