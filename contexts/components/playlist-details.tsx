"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Play, Pause, ExternalLink } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { allThemedPlaylists } from "@/components/browse-themed-playlists"

interface PlaylistDetailsProps {
  slug: string
}

// Sample tracks data structure with working audio URLs
const sampleTracks = [
  {
    id: "1",
    title: "Get Me Started",
    version: "Album",
    artist: "Troye Sivan",
    writer:
      "Glass, Jack (Spacey); Christopher John; Sivan, Troye; Behr, Kaeryn; (Kirkpatrick, Ian Eric); (McLaughlin, Brett Leland); (Park, Tayla)",
    charts: "",
    preview_url: "https://samplelib.com/lib/preview/mp3/sample-3s.mp3",
    external_url: "https://open.spotify.com/track/sample1",
  },
  {
    id: "2",
    title: "Asteroids",
    version: "Single",
    artist: "Rhapsody & Hit Boy",
    writer: "Hollis, Chauncey A.; (Evans, Marianna); (Corbett, Dustin James)",
    charts: "",
    preview_url: "https://samplelib.com/lib/preview/mp3/sample-6s.mp3",
    external_url: "https://open.spotify.com/track/sample2",
  },
  {
    id: "3",
    title: "Echoes of Tomorrow",
    version: "Album",
    artist: "The Cosmic Dreamers",
    writer: "Johnson, Michael; Smith, Sarah",
    charts: "",
    preview_url: "https://samplelib.com/lib/preview/mp3/sample-9s.mp3",
    external_url: "https://open.spotify.com/track/sample3",
  },
  {
    id: "4",
    title: "Neon Nights",
    version: "Single",
    artist: "Synthwave Collective",
    writer: "Williams, David; Brown, Jessica",
    charts: "",
    preview_url: "https://samplelib.com/lib/preview/mp3/sample-12s.mp3",
    external_url: "https://open.spotify.com/track/sample4",
  },
  {
    id: "5",
    title: "Whispers in the Wind",
    version: "Album",
    artist: "Aria Luna",
    writer: "Garcia, Maria; Lopez, Carlos",
    charts: "",
    preview_url: "https://samplelib.com/lib/preview/mp3/sample-15s.mp3",
    external_url: "https://open.spotify.com/track/sample5",
  },
]

export function PlaylistDetails({ slug }: PlaylistDetailsProps) {
  const [loading, setLoading] = useState(true)
  const [playlist, setPlaylist] = useState<(typeof allThemedPlaylists)[0] | null>(null)
  const [tracks, setTracks] = useState(sampleTracks)
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const playTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Simulate loading
    setLoading(true)

    // Find the playlist by slug
    const foundPlaylist = allThemedPlaylists.find((p) => p.slug === slug)
    setPlaylist(foundPlaylist || null)

    // Simulate API call delay
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }, [slug])

  // Handle audio playback
  const handlePlay = (track: (typeof sampleTracks)[0]) => {
    // Stop current playback if any
    if (audioRef.current) {
      audioRef.current.pause()
      if (playTimerRef.current) {
        clearTimeout(playTimerRef.current)
      }
    }

    // If clicking the same track that's playing, stop it
    if (currentlyPlaying === track.id) {
      setCurrentlyPlaying(null)
      return
    }

    // Create new audio element with the sample URL
    console.log("Playing audio:", track.preview_url)

    const audio = new Audio(track.preview_url)
    audioRef.current = audio

    // Add event listeners for better user feedback
    audio.addEventListener("ended", () => {
      setCurrentlyPlaying(null)
    })

    audio.addEventListener("error", (e) => {
      console.error("Audio error:", e)
      setCurrentlyPlaying(null)
    })

    // Play audio
    audio
      .play()
      .then(() => {
        setCurrentlyPlaying(track.id)
      })
      .catch((err) => {
        console.error("Error playing audio:", err)
        setCurrentlyPlaying(null)
      })
  }

  // Play all tracks
  const playAll = () => {
    if (tracks.length === 0) return

    // Start with the first track
    handlePlay(tracks[0])
  }

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      if (playTimerRef.current) {
        clearTimeout(playTimerRef.current)
      }
    }
  }, [])

  if (loading) {
    return (
      <div className="max-w-[1180px] mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">
          <Skeleton className="h-8 w-64" />
        </h1>
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="aspect-square w-full rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="md:col-span-2">
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-32" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!playlist) {
    return (
      <div className="max-w-[1180px] mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Playlist not found</h1>
        <p className="text-zinc-600">The requested playlist could not be found.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/browse-themed-playlists">Browse All Playlists</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-[1180px] mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{playlist.name}</h1>

      <div className="grid md:grid-cols-3 gap-8 mb-8">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-lg">
                <Image
                  src={playlist.image || "/placeholder.svg"}
                  alt={`Album artwork ${i}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
          <Button className="w-full bg-[#F50604] hover:bg-[#D50604] text-white" onClick={playAll}>
            <Play className="w-4 h-4 mr-2" />
            Play All
          </Button>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <h3 className="font-medium text-sm text-zinc-500">Type</h3>
              <p>{playlist.type}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-zinc-500">Folder</h3>
              <p>Themed Playlists</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-zinc-500">Created</h3>
              <p>{playlist.created}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-zinc-500">Last Modified</h3>
              <p>{playlist.created}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-zinc-500">Total Tracks</h3>
              <p>{playlist.totalTracks}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-zinc-500">Owner</h3>
              <p>{playlist.owner}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-4 w-8"></th>
              <th className="text-left py-2 px-4">Title</th>
              <th className="text-left py-2 px-4">Version</th>
              <th className="text-left py-2 px-4">Artist</th>
              <th className="text-left py-2 px-4">Writer</th>
              <th className="text-left py-2 px-4">Charts</th>
              <th className="text-left py-2 px-4 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {tracks.map((track) => (
              <tr key={track.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">
                  <button onClick={() => handlePlay(track)} className="text-zinc-400 hover:text-[#F50604]">
                    {currentlyPlaying === track.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                </td>
                <td className="py-2 px-4">{track.title}</td>
                <td className="py-2 px-4">{track.version}</td>
                <td className="py-2 px-4">{track.artist}</td>
                <td className="py-2 px-4">{track.writer}</td>
                <td className="py-2 px-4">{track.charts}</td>
                <td className="py-2 px-4">
                  {track.external_url && (
                    <a
                      href={track.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-[#1DB954]"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

