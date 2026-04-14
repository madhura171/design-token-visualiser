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
        borderTop: '1px solid rgba(255,255,255,0.07)',
        background: 'transparent',
        paddingTop: 28,
        paddingBottom: 28,
      }}
    >
      <div
        className="footer-row"
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          paddingLeft: 40,
          paddingRight: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <p style={{ color: '#6B7280', fontSize: 13, fontFamily: 'var(--font-sans)', margin: 0 }}>
            &copy; 2026 Design Token Visualiser
          </p>
          <p style={{ color: '#4B5563', fontSize: 12, fontFamily: 'var(--font-sans)', margin: 0 }}>
            Made to learn, made to share
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {iconLinks.map(({ id, href, Icon, label }) => (
            <a
              key={id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              style={{
                color: hovered === id ? '#FFFFFF' : '#71717A',
                transition: 'color 150ms ease',
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
