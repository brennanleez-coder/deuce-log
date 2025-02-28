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
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={metadata.description ?? undefined} />
        <title>{String(metadata.title ?? '')}</title>
        <link rel="icon" href="/deucelog.png" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />

      </head>
      <body>
        {children}
        <Toaster position="top-center" />
        <Analytics/>
        </body>
    </html>
  )
}
