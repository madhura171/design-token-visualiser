'use client'

import { useCallback, useRef, useState } from 'react'
import { Upload } from 'lucide-react'

interface UploadZoneProps {
  onFile: (content: string, filename: string) => void
  onError: (msg: string) => void
}

export function UploadZone({ onFile, onError }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [glowPos, setGlowPos] = useState<{x:number,y:number}|null>(null)
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

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:'100%' }}>
      <div className="upload-hero-shell">
        <div style={{ width:'100%', maxWidth:960, textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', minHeight:'calc(100vh - 60px)', justifyContent:'center', paddingTop:80, paddingBottom:80 }} className="animate-fade-in-up">
              <h1 style={{ fontSize:'clamp(40px, 6vw, 72px)', fontWeight:900, color:'#FFFFFF', letterSpacing:'-0.03em', lineHeight:1.1, textAlign:'center', marginBottom:20, fontFamily:'var(--font-sans)' }}>
                Design Token Visualiser
              </h1>
              <p
                style={{ color:'#9CA3AF', fontSize:17, fontWeight:400, lineHeight:1.6, textAlign:'center', maxWidth:460, marginBottom:40, marginTop:0, fontFamily:'var(--font-sans)' }}
              >
                Paste your token file and instantly get a scannable visual reference for your entire system.
              </p>

            <div style={{ width:'100%', maxWidth:480, marginBottom:20, position:'relative' }}>
              <div
                role="button"
                tabIndex={0}
                aria-label="Upload token file by drag and drop or browse"
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  setGlowPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
                }}
                onMouseLeave={(e) => { setIsDragging(false); setGlowPos(null) }}
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
              {glowPos && (
                <div style={{ position:'absolute', pointerEvents:'none', borderRadius:'50%', width:300, height:300, background:`radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)`, transform:'translate(-50%,-50%)', left:glowPos.x, top:glowPos.y, zIndex:0 }} />
              )}
              <div style={{position:'relative',zIndex:1,display:'flex',flexDirection:'column',alignItems:'center',width:'100%'}}>
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
              </div>
            </div>

            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
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

      </div>
  )
}
