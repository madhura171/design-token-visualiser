'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'

interface NavbarProps {
  onLogoClick?: () => void
}

export function Navbar({ onLogoClick }: NavbarProps) {
  const [menuHover, setMenuHover] = useState<string | null>(null)

  const navLinks = [
    {
      id: 'how-it-works',
      label: 'How it works',
      href: '#how-it-works',
      onClick: onLogoClick
        ? (e: React.MouseEvent<HTMLAnchorElement>) => {
            e.preventDefault()
            onLogoClick()
          }
        : undefined,
    },
    {
      id: 'feedback',
      label: 'Feedback',
      href: 'https://www.linkedin.com/in/madhura-patgavkar/',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
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
        height: 56,
        zIndex: 50,
        background: 'rgba(10,10,10,0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 24px',
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
              fontSize: 18,
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
              padding: '2px 10px',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.05em',
              fontFamily: 'var(--font-sans)',
              lineHeight: 1.6,
            }}
          >
            BETA
          </span>
        </div>

        {/* Right: nav links (hidden on mobile) + hamburger (mobile only) */}
        <nav aria-label="Site navigation">
          {/* Desktop nav */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 32 }}
            className="hidden sm:flex"
          >
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                target={link.target}
                rel={link.rel}
                onClick={link.onClick}
                style={{
                  color: menuHover === link.id ? '#FFFFFF' : '#A1A1AA',
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: 'var(--font-sans)',
                  textDecoration: 'none',
                  transition: 'color 150ms',
                  cursor: 'pointer',
                }}
                onMouseEnter={() => setMenuHover(link.id)}
                onMouseLeave={() => setMenuHover(null)}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Mobile hamburger placeholder */}
          <button
            type="button"
            aria-label="Open navigation menu"
            className="flex sm:hidden items-center justify-center"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              color: '#A1A1AA',
              minHeight: 44,
              minWidth: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Menu size={20} aria-hidden="true" />
          </button>
        </nav>
      </div>
    </header>
  )
}
