"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import type { Song } from "@/data/sampleSongs"
import Link from "next/link"
import { useSpotify } from "@/contexts/spotify-context"
import { useToast } from "@/hooks/use-toast"

export function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(80)
  const [error, setError] = useState<string | null>(null)
  const [spotifyTracks, setSpotifyTracks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { toast } = useToast()

  const { playTrack, pausePlayback, isPlaying: spotifyIsPlaying, currentTrackId } = useSpotify()

  // Fetch tracks from Spotify on component mount
  useEffect(() => {
    async function fetchSpotifyTracks() {
      try {
        setIsLoading(true)

        // Try to get from session storage first
        const cachedTracks = sessionStorage.getItem("spotifyFeaturedTracks")
        if (cachedTracks) {
          try {
            const parsedTracks = JSON.parse(cachedTracks)
            if (Array.isArray(parsedTracks) && parsedTracks.length > 0) {
              setSpotifyTracks(parsedTracks)
              setCurrentSong(parsedTracks[0])
              setIsLoading(false)
              return
            }
          } catch (parseError) {
            console.error("Error parsing cached tracks:", parseError)
            // Continue to fetch from API
          }
        }

        // Fetch from API if not in cache
        try {
          const response = await fetch("/api/spotify/featured-tracks")

          if (!response.ok) {
            throw new Error(`Failed to fetch tracks: ${response.status}`)
          }

          const data = await response.json()

          if (data && Array.isArray(data) && data.length > 0) {
            // Convert to our Song format
            const formattedTracks = data.map((track: any) => ({
              id: track.id,
              title: track.name,
              artist: track.artists[0]?.name || "Unknown Artist",
              audioUrl: track.preview_url || "https://samplelib.com/lib/preview/mp3/sample-3s.mp3",
              external_urls: track.external_urls,
              album: {
                name: track.album?.name,
                images: track.album?.images,
              },
            }))

            // Cache in session storage
            try {
              sessionStorage.setItem("spotifyFeaturedTracks", JSON.stringify(formattedTracks))
            } catch (cacheError) {
              console.error("Error caching tracks:", cacheError)
              // Continue without caching
            }

            setSpotifyTracks(formattedTracks)
            setCurrentSong(formattedTracks[0])
          } else {
            throw new Error("No tracks returned from API")
          }
        } catch (fetchError) {
          console.error("Error fetching Spotify tracks:", fetchError)

          // Use fallback tracks
          const fallbackTracks = [
            {
              id: "fallback1",
              title: "Sample Track 1",
              artist: "Sample Artist",
              audioUrl: "https://samplelib.com/lib/preview/mp3/sample-3s.mp3",
              external_urls: { spotify: "https://open.spotify.com/" },
            },
            {
              id: "fallback2",
              title: "Sample Track 2",
              artist: "Sample Artist",
              audioUrl: "https://samplelib.com/lib/preview/mp3/sample-6s.mp3",
              external_urls: { spotify: "https://open.spotify.com/" },
            },
            {
              id: "fallback3",
              title: "Sample Track 3",
              artist: "Sample Artist",
              audioUrl: "https://samplelib.com/lib/preview/mp3/sample-9s.mp3",
              external_urls: { spotify: "https://open.spotify.com/" },
            },
          ]

          setSpotifyTracks(fallbackTracks)
          setCurrentSong(fallbackTracks[0])
          setError("Failed to load tracks from Spotify. Using sample tracks instead.")
        }
      } catch (err) {
        console.error("Error fetching Spotify tracks:", err)
        setError("Failed to load tracks. Using default player.")

        // Set fallback track
        const fallbackTrack = {
          id: "fallback",
          title: "Sample Track",
          artist: "Sample Artist",
          audioUrl: "https://samplelib.com/lib/preview/mp3/sample-3s.mp3",
        }
        setCurrentSong(fallbackTrack)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSpotifyTracks()
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100
    }
  }, [volume])

  const togglePlay = () => {
    if (currentSong?.external_urls?.spotify) {
      // Try to play with Spotify
      const trackUri = currentSong.external_urls.spotify.replace("https://open.spotify.com/track/", "spotify:track:")

      if (isPlaying) {
        pausePlayback().then((success) => {
          if (success) {
            setIsPlaying(false)
          } else {
            // Fall back to HTML Audio if Spotify fails
            if (audioRef.current) {
              audioRef.current.pause()
              setIsPlaying(false)
            }
          }
        })
      } else {
        playTrack(trackUri).then((success) => {
          if (success) {
            setIsPlaying(true)
            toast({
              title: "Now Playing",
              description: `${currentSong.title} by ${currentSong.artist}`,
            })
          } else {
            // Fall back to HTML Audio if Spotify fails
            if (audioRef.current && currentSong.audioUrl) {
              audioRef.current.play().catch((e) => {
                setError("Failed to play audio. Please try again.")
                console.error("Audio playback error:", e)
              })
              setIsPlaying(true)
            } else {
              setError("No preview available for this track.")
            }
          }
        })
      }
    } else {
      // Use HTML Audio API as fallback
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause()
        } else {
          audioRef.current.play().catch((e) => {
            setError("Failed to play audio. Please try again.")
            console.error("Audio playback error:", e)
          })
        }
        setIsPlaying(!isPlaying)
      }
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
      setDuration(audioRef.current.duration)
    }
  }

  const handleSliderChange = (newValue: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newValue[0]
      setCurrentTime(newValue[0])
    }
  }

  const handleVolumeChange = (newValue: number[]) => {
    setVolume(newValue[0])
  }

  const skipToNextSong = () => {
    if (spotifyTracks.length === 0) return

    const currentIndex = spotifyTracks.findIndex((song) => song.id === currentSong?.id)
    const nextIndex = (currentIndex + 1) % spotifyTracks.length
    setCurrentSong(spotifyTracks[nextIndex])
    setIsPlaying(true)
    setError(null)
  }

  const skipToPreviousSong = () => {
    if (spotifyTracks.length === 0) return

    const currentIndex = spotifyTracks.findIndex((song) => song.id === currentSong?.id)
    const previousIndex = (currentIndex - 1 + spotifyTracks.length) % spotifyTracks.length
    setCurrentSong(spotifyTracks[previousIndex])
    setIsPlaying(true)
    setError(null)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleError = () => {
    setError("Failed to load audio. Please try another song.")
    setIsPlaying(false)
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#7D7D7D] text-white">
      <div className="max-w-[1180px] mx-auto flex items-center justify-between gap-4 px-4 py-2">
        <div className="flex items-center gap-2">
          <button className="p-1 hover:text-zinc-300" onClick={skipToPreviousSong}>
            <SkipBack className="h-4 w-4" />
          </button>
          <button className="p-1 hover:text-zinc-300" onClick={togglePlay} disabled={isLoading || !currentSong}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button className="p-1 hover:text-zinc-300" onClick={skipToNextSong}>
            <SkipForward className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 flex-1">
          <Slider
            value={[currentTime]}
            max={duration || 1}
            step={1}
            className="w-32"
            onValueChange={handleSliderChange}
          />
          <span className="text-xs">
            {isLoading
              ? "Loading tracks..."
              : currentSong
                ? `${currentSong.artist} - ${currentSong.title}`
                : "No song selected"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4" />
          <Slider value={[volume]} max={100} step={1} className="w-24" onValueChange={handleVolumeChange} />
          <span className="text-xs whitespace-nowrap">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <Link href="/login" className="text-sm hover:text-zinc-300">
          Log In
        </Link>
      </div>
      {error && <div className="text-red-500 text-xs text-center py-1">{error}</div>}
      {currentSong && (
        <audio
          ref={audioRef}
          src={currentSong.audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={skipToNextSong}
          onError={handleError}
          autoPlay={isPlaying}
        />
      )}
    </div>
  )
}

