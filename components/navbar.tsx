'use client'

import { useState } from 'react'

interface NavbarProps {
  variant: 'full' | 'logo-only'
  onLogoClick?: () => void
}

export function Navbar({ variant, onLogoClick }: NavbarProps) {
  const [menuHover, setMenuHover] = useState<string | null>(null)

  const navLinks = [
    {
      id: 'review',
      label: 'Leave a review',
      href: 'https://www.linkedin.com/in/madhura-patgavkar/',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
  ]

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 60,
        zIndex: 50,
        background: 'rgba(10,10,10,0.9)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        className="bar-inner-padding"
        style={{
          width: '100%',
          paddingLeft: 48,
          paddingRight: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left: Logo + BETA badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: 17,
              letterSpacing: '-0.03em',
              fontFamily: 'var(--font-sans)',
              lineHeight: 1,
            }}
          >
            DTV
          </span>
          <span
            style={{
              background: 'rgba(99,102,241,0.15)',
              color: '#A5B4FC',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: 9999,
              padding: '2px 9px',
              fontSize: 10,
              fontWeight: 700,
              marginLeft: 8,
              fontFamily: 'var(--font-sans)',
              lineHeight: 1.6,
            }}
          >
            BETA
          </span>
        </div>

        {variant === 'full' ? (
          <nav aria-label="Site navigation" className="nav-links" style={{ display: 'flex' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  target={link.target}
                  rel={link.rel}
                  onClick={link.onClick}
                  style={{
                    color: menuHover === link.id ? '#FFFFFF' : '#9CA3AF',
                    fontSize: 14,
                    fontWeight: 500,
                    fontFamily: 'var(--font-sans)',
                    textDecoration: 'none',
                    transition: 'color 150ms ease',
                    cursor: 'pointer',
                    minHeight: 44,
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                  onMouseEnter={() => setMenuHover(link.id)}
                  onMouseLeave={() => setMenuHover(null)}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </nav>
        ) : (
          <div aria-hidden="true" style={{ width: 1, height: 1 }} />
        )}
      </div>
    </header>
  )
}
