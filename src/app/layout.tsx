import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lerne! – Deutschlernen leicht gemacht',
  description: 'Interaktive Lernplattform für Deutsch als Fremdsprache',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}
