"use client"

import { useState, useRef, useEffect } from "react"

interface FallbackPlayerProps {
  trackUrl: string | null
  trackId: string
  onPlay?: () => void
  onPause?: () => void
  onEnd?: () => void
  isPlaying: boolean
  setIsPlaying: (isPlaying: boolean) => void
}

export function FallbackPlayer({
  trackUrl,
  trackId,
  onPlay,
  onPause,
  onEnd,
  isPlaying,
  setIsPlaying,
}: FallbackPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Create or update audio element when track changes
  useEffect(() => {
    // Clean up previous audio element
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ""
      audioRef.current.remove()
      audioRef.current = null
    }

    // Create new audio element if we have a URL
    if (trackUrl) {
      console.log("Creating new audio element for:", trackUrl)
      const audio = new Audio(trackUrl)
      audioRef.current = audio

      // Add event listeners
      audio.addEventListener("ended", () => {
        console.log("Audio playback ended")
        setIsPlaying(false)
        if (onEnd) onEnd()
      })

      audio.addEventListener("error", (e) => {
        console.error("Audio error:", e)
        setError("Failed to load audio. The preview may not be available.")
        setIsPlaying(false)
      })

      // Pre-load the audio
      audio.load()
      setError(null)
    }

    // Clean up on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
        audioRef.current.remove()
        audioRef.current = null
      }
    }
  }, [trackUrl, trackId])

  // Handle play/pause state changes
  useEffect(() => {
    if (!audioRef.current || !trackUrl) return

    if (isPlaying) {
      console.log("Attempting to play audio:", trackUrl)
      const playPromise = audioRef.current.play()

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Audio playback started successfully")
            if (onPlay) onPlay()
          })
          .catch((err) => {
            console.error("Error playing audio:", err)
            // Check if this is an autoplay policy error
            if (err.name === "NotAllowedError") {
              setError("Autoplay blocked by browser. Please click play again.")
            } else {
              setError("Failed to play audio. The preview may not be available.")
            }
            setIsPlaying(false)
          })
      }
    } else {
      console.log("Pausing audio")
      audioRef.current.pause()
      if (onPause) onPause()
    }
  }, [isPlaying, trackUrl, onPlay, onPause, setIsPlaying])

  // This component can be used invisibly (just for audio) or with controls
  return <>{error && <div className="text-red-500 text-xs">{error}</div>}</>
}
