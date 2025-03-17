"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { sampleSongs, type Song } from "@/data/sampleSongs"
import Link from "next/link"
import { useSpotify } from "@/contexts/spotify-context"

export function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(80)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const { playTrack, pausePlayback, isPlaying: spotifyIsPlaying, currentTrackId } = useSpotify()

  useEffect(() => {
    if (sampleSongs.length > 0 && !currentSong) {
      setCurrentSong(sampleSongs[0])
    }
  }, [currentSong])

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
          } else {
            // Fall back to HTML Audio if Spotify fails
            if (audioRef.current) {
              audioRef.current.play().catch((e) => {
                setError("Failed to play audio. Please try again.")
                console.error("Audio playback error:", e)
              })
              setIsPlaying(true)
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
    const currentIndex = sampleSongs.findIndex((song) => song.id === currentSong?.id)
    const nextIndex = (currentIndex + 1) % sampleSongs.length
    setCurrentSong(sampleSongs[nextIndex])
    setIsPlaying(true)
    setError(null)
  }

  const skipToPreviousSong = () => {
    const currentIndex = sampleSongs.findIndex((song) => song.id === currentSong?.id)
    const previousIndex = (currentIndex - 1 + sampleSongs.length) % sampleSongs.length
    setCurrentSong(sampleSongs[previousIndex])
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
          <button className="p-1 hover:text-zinc-300" onClick={togglePlay}>
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
            {currentSong ? `${currentSong.artist} - ${currentSong.title}` : "No song selected"}
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

