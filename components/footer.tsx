'use client'

import { useState } from 'react'
import { Github, Linkedin } from 'lucide-react'

export function Footer() {
  const [hovered, setHovered] = useState<string | null>(null)

  const iconLinks = [
    { id: 'github',   href: 'https://github.com/madhura171',                      Icon: Github,   label: 'GitHub profile' },
    { id: 'linkedin', href: 'https://www.linkedin.com/in/madhura-patgavkar/',     Icon: Linkedin, label: 'LinkedIn profile' },
  ]

  return (
    <footer
      style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background: 'transparent',
        paddingTop: 32,
        paddingBottom: 32,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        {/* Left */}
        <p
          style={{
            color: '#71717A',
            fontSize: 13,
            fontFamily: 'var(--font-sans)',
            margin: 0,
          }}
        >
          &copy; 2026 Design Token Visualiser
        </p>

        {/* Center */}
        <p
          style={{
            color: '#71717A',
            fontSize: 13,
            fontFamily: 'var(--font-sans)',
            margin: 0,
            textAlign: 'center',
            flex: '1 1 auto',
          }}
        >
          Built with ❤️ curiosity to learn and share
        </p>

        {/* Right: icon links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {iconLinks.map(({ id, href, Icon, label }) => (
            <a
              key={id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              style={{
                color: hovered === id ? '#FFFFFF' : '#71717A',
                transition: 'color 150ms',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 44,
                minWidth: 44,
              }}
              onMouseEnter={() => setHovered(id)}
              onMouseLeave={() => setHovered(null)}
            >
              <Icon size={16} aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
