"use client"

import { getSpotifyAuthUrl } from "@/lib/spotify"
import { Button } from "@/components/ui/button"
import { Music } from "lucide-react"

export function SpotifyLogin() {
  const handleLogin = () => {
    window.location.href = getSpotifyAuthUrl()
  }

  return (
    <Button
      onClick={handleLogin}
      className="bg-[#1DB954] hover:bg-[#1ed760] text-white flex items-center gap-2"
    >
      <Music className="w-5 h-5" />
      Connect Spotify
    </Button>
  )
} 