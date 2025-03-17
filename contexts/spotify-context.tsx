"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { SpotifyPlayer } from "@/components/spotify-player"

// Declare the Spotify variable
declare global {
  interface Window {
    Spotify: any
  }
}

interface SpotifyContextType {
  player: Spotify.Player | null
  deviceId: string | null
  isPlaying: boolean
  currentTrackId: string | null
  playTrack: (trackUri: string) => Promise<boolean>
  pausePlayback: () => Promise<boolean>
  isSpotifyAvailable: boolean
}

const SpotifyContext = createContext<SpotifyContextType>({
  player: null,
  deviceId: null,
  isPlaying: false,
  currentTrackId: null,
  playTrack: async () => false,
  pausePlayback: async () => false,
  isSpotifyAvailable: false,
})

export const useSpotify = () => useContext(SpotifyContext)

interface SpotifyProviderProps {
  children: ReactNode
}

export function SpotifyProvider({ children }: SpotifyProviderProps) {
  const [player, setPlayer] = useState<Spotify.Player | null>(null)
  const [deviceId, setDeviceId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isSpotifyAvailable, setIsSpotifyAvailable] = useState(false)

  const handlePlayerReady = (player: Spotify.Player | null) => {
    if (!player) {
      console.log("Spotify player not available")
      setIsInitialized(true)
      setIsSpotifyAvailable(false)
      return
    }

    setPlayer(player)
    setIsInitialized(true)
    setIsSpotifyAvailable(true)

    player.getCurrentState().then((state) => {
      if (state) {
        setIsPlaying(!state.paused)
        if (state.track_window.current_track) {
          setCurrentTrackId(state.track_window.current_track.id)
        }
      }
    })
  }

  const handlePlayerStateChanged = (state: Spotify.PlaybackState | null) => {
    if (state) {
      setIsPlaying(!state.paused)
      if (state.track_window.current_track) {
        setCurrentTrackId(state.track_window.current_track.id)
      }
    } else {
      setIsPlaying(false)
      setCurrentTrackId(null)
    }
  }

  const playTrack = async (trackUri: string) => {
    if (!player || !deviceId) return false

    const token = localStorage.getItem("spotify_access_token")

    if (!token) return false

    try {
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: [trackUri],
        }),
      })
      return true
    } catch (error) {
      console.error("Error playing track:", error)
      return false
    }
  }

  const pausePlayback = async () => {
    if (!player) return false

    try {
      await player.pause()
      return true
    } catch (error) {
      console.error("Error pausing playback:", error)
      return false
    }
  }

  // Check if we have a token before trying to initialize the player
  useEffect(() => {
    const token = localStorage.getItem("spotify_access_token")
    if (!token) {
      console.log("No Spotify token available, skipping player initialization")
      setIsInitialized(true) // Mark as initialized even though we're not using Spotify
      setIsSpotifyAvailable(false)
    }
  }, [])

  return (
    <SpotifyContext.Provider
      value={{
        player,
        deviceId,
        isPlaying,
        currentTrackId,
        playTrack,
        pausePlayback,
        isSpotifyAvailable,
      }}
    >
      <SpotifyPlayer onReady={handlePlayerReady} onPlayerStateChanged={handlePlayerStateChanged} />
      {children}
    </SpotifyContext.Provider>
  )
}

