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
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#111827',
              color: '#F1F5F9',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: '12px',
              fontSize: '13px',
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
              padding: '12px 16px',
            },
            success: { iconTheme: { primary: '#0BB07C', secondary: '#111827' } },
            error:   { iconTheme: { primary: '#f87171', secondary: '#111827' } },
          }}
        />
      </body>
    </html>
  )
}
