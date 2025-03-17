"use client"

import { AudioPlayer } from "@/components/audio-player"
import { Footer } from "@/components/footer"
import { usePathname } from "next/navigation"
import type React from "react"
import { SpotifyProvider } from "@/contexts/spotify-context"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/login"

  return (
    <SpotifyProvider>
      {!isLoginPage && <AudioPlayer />}
      <div className={`min-h-screen flex flex-col ${!isLoginPage ? "pt-[50px]" : ""}`}>
        {children}
        {!isLoginPage && <Footer />}
      </div>
    </SpotifyProvider>
  )
}

