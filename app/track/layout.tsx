"use client"

import React from "react"
import { SessionProvider } from "next-auth/react"

/**
 * This layout wraps everything under /track
 * in a SessionProvider so we can useSession()
 * in the child pages or components.
 */
export default function TrackLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}
