'use client'

import { useState } from 'react'
import type {
  ColorToken,
  TypographyToken,
  SpacingToken,
  BorderRadiusToken,
  ShadowToken,
  OtherToken,
} from '@/lib/token-parser'

// ── Card base styles ───────────────────────────────────────────────
const CARD_BASE: React.CSSProperties = {
  background: '#111111',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.4)',
}

// ── Copy hook ──────────────────────────────────────────────────────
function useCopy(text: string) {
  const [copied, setCopied] = useState(false)
  const copy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return { copied, copy }
}

// ── Inline copy button ─────────────────────────────────────────────
// Fix 3: min 44x44px touch target and descriptive aria-label.
function InlineCopyBtn({
  text,
  label = 'Copy value',
}: {
  text: string
  label?: string
}) {
  const { copied, copy } = useCopy(text)
  const [hovered, setHovered] = useState(false)
  return (
    <button
      type="button"
      onClick={copy}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={copied ? 'Copied!' : label}
      style={{
        // Fix 3: 44x44 min touch target via padding around 28x28 visual
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 44,
        height: 44,
        margin: -8, // pull back excess space from 44px container around 28px visual
        flexShrink: 0,
        background: 'none',
        border: 'none',
        borderRadius: 8,
        cursor: 'pointer',
        color: copied ? '#22C55E' : hovered ? '#FFFFFF' : '#A1A1AA',
        boxShadow: copied ? '0 0 8px rgba(34,197,94,0.3)' : 'none',
        transition: 'color 0.15s, box-shadow 0.15s',
        outlineOffset: 2,
      }}
    >
      {/* Visual icon container — 28x28 */}
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28,
          height: 28,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8,
        }}
      >
        {copied ? (
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
            <path d="M1.5 5.5l3 3 5-5" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
            <rect x="5" y="3.5" width="8" height="9.5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M5 5.5H3a1.5 1.5 0 00-1.5 1.5v5A1.5 1.5 0 003 13.5h5A1.5 1.5 0 009.5 12v-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        )}
      </span>
    </button>
  )
}

// ── Section wrapper ────────────────────────────────────────────────
interface SectionProps {
  title: string
  count: number
  sectionIndex: number
  children: React.ReactNode
}

export function Section({ title, count, sectionIndex, children }: SectionProps) {
  return (
    <section
      className="section-reveal"
      style={{
        '--section-index': sectionIndex,
        paddingTop: 48,
        paddingBottom: 48,
        borderTop: sectionIndex > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
      } as React.CSSProperties}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        {/* Fix 2: font-sans for section headings */}
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#FFFFFF', lineHeight: 1, margin: 0, fontFamily: 'var(--font-sans)' }}>
          {title}
        </h2>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.08)',
            color: '#A5B4FC',
            borderRadius: 9999,
            padding: '2px 12px',
            fontSize: 13,
            fontWeight: 500,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {count}
        </span>
      </div>

      {children}
    </section>
  )
}

// ── Colors ─────────────────────────────────────────────────────────
function ColorCard({ token, cardIndex, sectionIndex }: { token: ColorToken; cardIndex: number; sectionIndex: number }) {
  return (
    <div
      data-token-card
      className="card-reveal"
      style={{
        ...CARD_BASE,
        '--section-index': sectionIndex,
        '--card-index': cardIndex,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      } as React.CSSProperties}
    >
      <div
        style={{ height: 96, backgroundColor: token.value, flexShrink: 0 }}
        aria-hidden="true"
      />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          padding: '8px 10px 8px 12px',
          minHeight: 48,
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              fontWeight: 500,
              color: '#FAFAFA',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={token.path.join('.')}
          >
            {token.name}
          </p>
          {/* Fix 3: hex value contrast — #A1A1AA on #111111 ≈ 5.7:1 */}
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              color: '#A1A1AA',
              margin: '2px 0 0',
              letterSpacing: '0.03em',
            }}
          >
            {token.value}
          </p>
        </div>
        {/* Fix 3: aria-label includes the actual hex value */}
        <InlineCopyBtn text={token.value} label={`Copy hex value ${token.value}`} />
      </div>
    </div>
  )
}

export function ColorsSection({ tokens, sectionIndex }: { tokens: ColorToken[]; sectionIndex: number }) {
  if (!tokens.length) return null
  return (
    <Section title="Colors" count={tokens.length} sectionIndex={sectionIndex}>
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
        {tokens.map((t, i) => (
          <ColorCard key={t.path.join('/')} token={t} cardIndex={i} sectionIndex={sectionIndex} />
        ))}
      </div>
    </Section>
  )
}

// ── Typography ─────────────────────────────────────────────────────
function TypographyCard({ token, cardIndex, sectionIndex }: { token: TypographyToken; cardIndex: number; sectionIndex: number }) {
  const rawSize     = token.fontSize ? parseFloat(token.fontSize) : undefined
  const displaySize = rawSize && !isNaN(rawSize) ? Math.max(14, Math.min(rawSize, 48)) : 18

  const metaRows: { label: string; value: string }[] = [
    token.fontFamily    ? { label: 'Font',           value: token.fontFamily }    : null,
    token.fontSize      ? { label: 'Size',           value: token.fontSize }      : null,
    token.fontWeight    ? { label: 'Weight',         value: token.fontWeight }    : null,
    token.lineHeight    ? { label: 'Line height',    value: token.lineHeight }    : null,
    token.letterSpacing ? { label: 'Letter spacing', value: token.letterSpacing } : null,
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <div
      data-token-card
      className="card-reveal"
      style={{
        ...CARD_BASE,
        '--section-index': sectionIndex,
        '--card-index': cardIndex,
        overflow: 'hidden',
      } as React.CSSProperties}
    >
      <div
        style={{
          padding: '24px 16px 16px',
          minHeight: 100,
          display: 'flex',
          alignItems: 'flex-end',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <span
          style={{
            fontFamily: token.fontFamily ?? 'inherit',
            fontSize: `${displaySize}px`,
            fontWeight: token.fontWeight ?? 'normal',
            lineHeight: token.lineHeight ?? 'normal',
            letterSpacing: token.letterSpacing ?? 'normal',
            color: '#FAFAFA',
            wordBreak: 'break-words',
          }}
          aria-label={`Typography sample for ${token.name}`}
        >
          The quick brown fox
        </span>
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#FAFAFA',
              fontFamily: "'JetBrains Mono', monospace",
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              paddingRight: 8,
            }}
          >
            {token.name}
          </p>
          <InlineCopyBtn text={token.name} label={`Copy token name ${token.name}`} />
        </div>
        {metaRows.length > 0 && (
          <dl style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {metaRows.map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16 }}>
                {/* Fix 2: labels use font-sans, values use mono */}
                <dt style={{ fontSize: 10, color: '#A1A1AA', fontFamily: 'var(--font-sans)', flexShrink: 0 }}>
                  {label}
                </dt>
                <dd style={{ fontSize: 10, color: '#FAFAFA', fontFamily: "'JetBrains Mono', monospace", textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  )
}

export function TypographySection({ tokens, sectionIndex }: { tokens: TypographyToken[]; sectionIndex: number }) {
  if (!tokens.length) return null
  return (
    <Section title="Typography" count={tokens.length} sectionIndex={sectionIndex}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tokens.map((t, i) => (
          <TypographyCard key={t.path.join('/')} token={t} cardIndex={i} sectionIndex={sectionIndex} />
        ))}
      </div>
    </Section>
  )
}

// ── Spacing ────────────────────────────────────────────────────────
const SPACING_BAR_MAX = 256

function SpacingCard({ token, cardIndex, sectionIndex }: { token: SpacingToken; cardIndex: number; sectionIndex: number }) {
  const fillPx  = Math.max(4, Math.min(token.pxValue, SPACING_BAR_MAX))
  const fillPct = (fillPx / SPACING_BAR_MAX) * 100

  return (
    <div
      data-token-card
      className="card-reveal"
      style={{
        ...CARD_BASE,
        '--section-index': sectionIndex,
        '--card-index': cardIndex,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '12px 14px',
      } as React.CSSProperties}
    >
      <div
        style={{ width: 192, height: 6, borderRadius: 3, background: '#1F1F1F', flexShrink: 0 }}
        aria-hidden="true"
      >
        <div
          style={{
            width: `${fillPct}%`,
            height: '100%',
            borderRadius: 3,
            background: 'linear-gradient(90deg, #6366F1, #818CF8)',
            boxShadow: '0 0 8px rgba(99,102,241,0.5)',
          }}
        />
      </div>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <p
          style={{ fontSize: 11, fontWeight: 500, color: '#FAFAFA', fontFamily: "'JetBrains Mono', monospace", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}
        >
          {token.name}
        </p>
        {/* Fix 3: #A1A1AA on #111111 passes WCAG AA for small text */}
        <p
          style={{ fontSize: 11, color: '#A1A1AA', fontFamily: "'JetBrains Mono', monospace", flexShrink: 0, margin: 0 }}
        >
          {token.value}
        </p>
      </div>

      <InlineCopyBtn text={token.value} label={`Copy spacing value ${token.value}`} />
    </div>
  )
}

export function SpacingSection({ tokens, sectionIndex }: { tokens: SpacingToken[]; sectionIndex: number }) {
  if (!tokens.length) return null
  return (
    <Section title="Spacing" count={tokens.length} sectionIndex={sectionIndex}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tokens.map((t, i) => (
          <SpacingCard key={t.path.join('/')} token={t} cardIndex={i} sectionIndex={sectionIndex} />
        ))}
      </div>
    </Section>
  )
}

// ── Border Radius ──────────────────────────────────────────────────
function BorderRadiusCard({ token, cardIndex, sectionIndex }: { token: BorderRadiusToken; cardIndex: number; sectionIndex: number }) {
  const radiusPx    = Math.min(token.pxValue, 48)
  const isFullRound = token.value === '9999px' || token.value === '50%' || token.value === '100%' || token.pxValue >= 9999

  return (
    <div
      data-token-card
      className="card-reveal"
      style={{
        ...CARD_BASE,
        '--section-index': sectionIndex,
        '--card-index': cardIndex,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px 16px 16px',
        gap: 12,
      } as React.CSSProperties}
    >
      <div
        style={{
          width: 80,
          height: 80,
          background: '#2A2A2A',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: isFullRound ? '50%' : radiusPx,
          flexShrink: 0,
        }}
        aria-hidden="true"
      />

      <div style={{ textAlign: 'center', width: '100%' }}>
        <p
          style={{ fontSize: 11, fontWeight: 500, color: '#FAFAFA', fontFamily: "'JetBrains Mono', monospace", margin: 0 }}
        >
          {token.name}
        </p>
        {/* Fix 3: #A1A1AA for secondary value text */}
        <p
          style={{ fontSize: 10, color: '#A1A1AA', fontFamily: "'JetBrains Mono', monospace", margin: '3px 0 0' }}
        >
          {token.value}
        </p>
      </div>

      <InlineCopyBtn text={token.value} label={`Copy radius value ${token.value}`} />
    </div>
  )
}

export function BorderRadiusSection({ tokens, sectionIndex }: { tokens: BorderRadiusToken[]; sectionIndex: number }) {
  if (!tokens.length) return null
  return (
    <Section title="Border Radius" count={tokens.length} sectionIndex={sectionIndex}>
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
        {tokens.map((t, i) => (
          <BorderRadiusCard key={t.path.join('/')} token={t} cardIndex={i} sectionIndex={sectionIndex} />
        ))}
      </div>
    </Section>
  )
}

// ── Shadows ────────────────────────────────────────────────────────
function ShadowCard({ token, cardIndex, sectionIndex }: { token: ShadowToken; cardIndex: number; sectionIndex: number }) {
  return (
    <div
      data-token-card
      className="card-reveal"
      style={{
        ...CARD_BASE,
        '--section-index': sectionIndex,
        '--card-index': cardIndex,
        overflow: 'hidden',
      } as React.CSSProperties}
    >
      <div
        style={{ padding: '32px 24px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0D0D0D' }}
      >
        <div
          style={{ width: 64, height: 64, background: '#1F1F1F', borderRadius: 8, boxShadow: token.value }}
          aria-hidden="true"
        />
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <p
            style={{ fontSize: 11, fontWeight: 600, color: '#FAFAFA', fontFamily: "'JetBrains Mono', monospace", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, paddingRight: 8, margin: 0 }}
          >
            {token.name}
          </p>
          <InlineCopyBtn text={token.value} label={`Copy shadow value for ${token.name}`} />
        </div>
        {/* Fix 3: #A1A1AA for shadow value text */}
        <p
          style={{ fontSize: 10, color: '#A1A1AA', fontFamily: "'JetBrains Mono', monospace", wordBreak: 'break-all', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 }}
        >
          {token.value}
        </p>
      </div>
    </div>
  )
}

export function ShadowsSection({ tokens, sectionIndex }: { tokens: ShadowToken[]; sectionIndex: number }) {
  if (!tokens.length) return null
  return (
    <Section title="Shadows" count={tokens.length} sectionIndex={sectionIndex}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {tokens.map((t, i) => (
          <ShadowCard key={t.path.join('/')} token={t} cardIndex={i} sectionIndex={sectionIndex} />
        ))}
      </div>
    </Section>
  )
}

// ── Other ──────────────────────────────────────────────────────────
function OtherCard({ token, cardIndex, sectionIndex }: { token: OtherToken; cardIndex: number; sectionIndex: number }) {
  return (
    <div
      data-token-card
      className="card-reveal"
      style={{
        ...CARD_BASE,
        '--section-index': sectionIndex,
        '--card-index': cardIndex,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
      } as React.CSSProperties}
    >
      <p
        style={{ fontSize: 11, fontWeight: 500, color: '#FAFAFA', fontFamily: "'JetBrains Mono', monospace", flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}
      >
        {token.name}
      </p>
      {/* Fix 3: #A1A1AA for value text */}
      <p
        style={{ fontSize: 10, color: '#A1A1AA', fontFamily: "'JetBrains Mono', monospace", maxWidth: '45%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0, margin: 0 }}
      >
        {token.value}
      </p>
      <InlineCopyBtn text={token.name} label={`Copy token name ${token.name}`} />
    </div>
  )
}

export function OtherSection({ tokens, sectionIndex }: { tokens: OtherToken[]; sectionIndex: number }) {
  if (!tokens.length) return null
  return (
    <Section title="Other Tokens" count={tokens.length} sectionIndex={sectionIndex}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tokens.map((t, i) => (
          <OtherCard key={t.path.join('/')} token={t} cardIndex={i} sectionIndex={sectionIndex} />
        ))}
      </div>
    </Section>
  )
}
