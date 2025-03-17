"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, Music } from "lucide-react"
import { SpotifyLogin } from "./spotify-login"

interface TrackPreviewProps {
  previewUrl: string
  trackName: string
}

export function TrackPreview({ previewUrl, trackName }: TrackPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Check if user is authenticated with Spotify
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/spotify/check-auth")
        const data = await response.json()
        
        if (data.authenticated) {
          setIsAuthenticated(true)
          setError(null)
        } else {
          setIsAuthenticated(false)
          setError("Please connect your Spotify account to preview tracks")
        }
      } catch (error) {
        console.error("Error checking auth:", error)
        setIsAuthenticated(false)
        setError("Failed to verify Spotify connection")
      }
    }

    checkAuth()
  }, [])

  const togglePlay = async () => {
    if (!audioRef.current) return

    try {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        // Check auth again before playing
        const response = await fetch("/api/spotify/check-auth")
        const data = await response.json()
        
        if (!data.authenticated) {
          setIsAuthenticated(false)
          setError("Please reconnect your Spotify account")
          return
        }

        const playPromise = audioRef.current.play()
        if (playPromise !== undefined) {
          await playPromise
        }
      }
      setIsPlaying(!isPlaying)
      setError(null)
    } catch (error) {
      console.error("Error playing audio:", error)
      setError("Failed to play audio. Please try again.")
      setIsPlaying(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center gap-4 p-4 border rounded-lg">
        <p className="text-sm text-zinc-600">Connect Spotify to preview tracks</p>
        <SpotifyLogin />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg">
      <Button
        onClick={togglePlay}
        variant="ghost"
        size="icon"
        className="rounded-full"
      >
        {isPlaying ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Play className="w-5 h-5" />
        )}
      </Button>
      <div className="flex-1">
        <p className="text-sm font-medium">{trackName}</p>
        <p className="text-xs text-zinc-500">Preview Mode</p>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
      <audio
        ref={audioRef}
        src={previewUrl}
        onEnded={() => setIsPlaying(false)}
        onError={() => {
          console.error("Failed to play audio")
          setError("Failed to play audio. Please try again.")
          setIsPlaying(false)
        }}
      />
    </div>
  )
} 