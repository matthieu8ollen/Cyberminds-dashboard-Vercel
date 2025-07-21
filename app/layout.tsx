import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CyberMinds - AI Content Generator',
  description: 'Create authentic LinkedIn content for finance professionals',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
