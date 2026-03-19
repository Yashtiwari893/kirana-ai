import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'KiranaAI — WhatsApp AI Ordering for Kirana Shops',
  description: 'AI-powered WhatsApp ordering system for kirana shops. Hindi/Hinglish mein order lo, real-time dashboard dekhein, aur bulk broadcast karein.',
  keywords: 'kirana, whatsapp ordering, AI bot, hindi ordering system, grocery shop',
  openGraph: {
    title: 'KiranaAI',
    description: 'WhatsApp AI Ordering for Kirana Shops',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="hi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            className: '',
            style: { background: '#111827', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.08)' },
            success: { className: 'toast-success' },
            error: { className: 'toast-error' },
          }}
        />
      </body>
    </html>
  )
}
