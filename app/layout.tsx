import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner';
import { Analytics } from "@vercel/analytics/react"

export const metadata: Metadata = {
  title: 'DeuceLog',
  description: 'A simple log',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-center" />
        <Analytics/>
        </body>
    </html>
  )
}
