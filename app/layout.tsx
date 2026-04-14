import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'Design Token Visualiser',
  description: 'Drop in a design tokens JSON file and instantly see your entire token system rendered as a beautiful, scannable visual reference.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} style={{ background: '#0A0A0A' }}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
