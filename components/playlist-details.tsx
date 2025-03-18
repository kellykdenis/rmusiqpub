"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Play, Pause, ExternalLink } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { allThemedPlaylists } from "@/components/browse-themed-playlists"
import { useToast } from "@/hooks/use-toast"

interface PlaylistDetailsProps {
  slug: string
}

export function PlaylistDetails({ slug }: PlaylistDetailsProps) {
  const [loading, setLoading] = useState(true)
  const [playlist, setPlaylist] = useState<any | null>(null)
  const [tracks, setTracks] = useState<any[]>([])
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { toast } = useToast()

  // Helper function to use fallback playlist data
  const [fallbackPlaylist, setFallbackPlaylist] = useState({
    id: "fallback",
    name: "Sample Playlist",
    description: "Sample playlist with our artists",
    image: "/placeholder.svg",
    slug: slug,
    type: "Themed Playlist",
    created: new Date().toISOString().split("T")[0],
    totalTracks: 3,
    owner: "RMPG",
  })

  // Helper function to use sample tracks
  const [sampleTracks, setSampleTracks] = useState([
    {
      id: "sample1",
      name: "Sample Track 1",
      artists: "Bebe Cool",
      preview_url: "https://samplelib.com/lib/preview/mp3/sample-3s.mp3",
      album: {
        name: "Sample Album",
        images: [{ url: "/placeholder.svg", height: 300, width: 300 }],
      },
      external_urls: { spotify: "https://open.spotify.com/" },
    },
    {
      id: "sample2",
      name: "Sample Track 2",
      artists: "Jhenell Dina",
      preview_url: "https://samplelib.com/lib/preview/mp3/sample-6s.mp3",
      album: {
        name: "Sample Album",
        images: [{ url: "/placeholder.svg", height: 300, width: 300 }],
      },
      external_urls: { spotify: "https://open.spotify.com/" },
    },
    {
      id: "sample3",
      name: "Sample Track 3",
      artists: "Phila Kaweesa",
      preview_url: "https://samplelib.com/lib/preview/mp3/sample-9s.mp3",
      album: {
        name: "Sample Album",
        images: [{ url: "/placeholder.svg", height: 300, width: 300 }],
      },
      external_urls: { spotify: "https://open.spotify.com/" },
    },
  ])

  useEffect(() => {
    // Update the fetchPlaylistDetails function to better handle errors

    async function fetchPlaylistDetails() {
      setLoading(true)

      // Check if this is a Spotify playlist
      const isSpotifyPlaylist = slug.startsWith("spotify-")

      if (isSpotifyPlaylist) {
        // Extract the Spotify playlist ID
        const spotifyPlaylistId = slug.replace("spotify-", "")

        try {
          // Try to get from session storage first
          const cachedPlaylists = sessionStorage.getItem("artistPlaylists")
          if (cachedPlaylists) {
            try {
              const parsedPlaylists = JSON.parse(cachedPlaylists)
              if (Array.isArray(parsedPlaylists) && parsedPlaylists.length > 0) {
                const foundPlaylist = parsedPlaylists.find((p: any) => p.id === spotifyPlaylistId)

                if (foundPlaylist) {
                  console.log("Using cached playlist from session storage")
                  setPlaylist({
                    ...foundPlaylist,
                    slug: slug,
                    type: "Spotify Playlist",
                    created: new Date().toISOString().split("T")[0],
                    totalTracks: foundPlaylist.tracks?.length || 0,
                  })

                  setTracks(foundPlaylist.tracks || [])
                  setLoading(false)
                  return
                }
              }
            } catch (parseError) {
              console.error("Error parsing cached playlists:", parseError)
              // Continue to fetch from API
            }
          }

          // Fetch playlist details from our API
          const response = await fetch(`/api/spotify/artist-playlists`)

          // Always process the response, as our API now returns 200 with mock data on error
          const allPlaylists = await response.json()
          const foundPlaylist = allPlaylists.find((p: any) => p.id === spotifyPlaylistId)

          if (foundPlaylist) {
            setPlaylist({
              ...foundPlaylist,
              slug: slug,
              type: "Spotify Playlist",
              created: new Date().toISOString().split("T")[0],
              totalTracks: foundPlaylist.tracks?.length || 0,
            })

            setTracks(foundPlaylist.tracks || [])
          } else {
            // Use fallback if playlist not found
            console.log("Playlist not found in API response, using fallback")
            setPlaylist(fallbackPlaylist)
            setTracks(sampleTracks)
          }
        } catch (error) {
          console.error("Error fetching Spotify playlist:", error)
          toast({
            title: "Error",
            description: "Failed to load playlist details. Using fallback data.",
            variant: "destructive",
          })

          // Use fallback when API call fails
          setPlaylist(fallbackPlaylist)
          setTracks(sampleTracks)
        } finally {
          setLoading(false)
        }
      } else {
        // Find the playlist in our local data
        const foundPlaylist = allThemedPlaylists.find((p) => p.slug === slug)

        if (foundPlaylist) {
          setPlaylist(foundPlaylist)

          // For local playlists, we'll use sample tracks
          setTracks(sampleTracks)
        } else {
          // If playlist not found in local data, use a fallback
          setPlaylist(fallbackPlaylist)
          setTracks(sampleTracks)
        }

        setLoading(false)
      }
    }

    fetchPlaylistDetails()

    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
      }
    }
  }, [slug, toast, fallbackPlaylist, sampleTracks])

  const handlePlay = (track: any) => {
    // Stop current playback
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ""
    }

    // If clicking the same track that's playing, stop it
    if (currentlyPlaying === track.id) {
      setCurrentlyPlaying(null)
      return
    }

    // If no preview URL, show a message
    if (!track.preview_url) {
      toast({
        title: "No preview available",
        description: "This track doesn't have a preview available.",
        variant: "destructive",
      })
      return
    }

    // Create and play new audio
    const audio = new Audio(track.preview_url)
    audioRef.current = audio

    audio.addEventListener("ended", () => {
      setCurrentlyPlaying(null)
    })

    audio.addEventListener("error", () => {
      toast({
        title: "Playback Error",
        description: "Failed to play this track. Please try another.",
        variant: "destructive",
      })
      setCurrentlyPlaying(null)
    })

    audio
      .play()
      .then(() => {
        setCurrentlyPlaying(track.id)
      })
      .catch((err) => {
        console.error("Error playing audio:", err)
        toast({
          title: "Playback Error",
          description: "Failed to play this track. Please try another.",
          variant: "destructive",
        })
      })
  }

  if (loading) {
    return (
      <div className="max-w-[1180px] mx-auto px-4 py-8">
        <Skeleton className="h-10 w-1/3 mb-8" />
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <Skeleton className="aspect-square w-full rounded-lg mb-4" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="md:col-span-2">
            <Skeleton className="h-6 w-1/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-6" />

            <Skeleton className="h-6 w-1/4 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!playlist) {
    return (
      <div className="max-w-[1180px] mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Playlist not found</h1>
        <p className="text-zinc-600">The requested playlist could not be found.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/browse-featured-playlists">Browse All Playlists</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-[1180px] mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{playlist.name}</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-lg mb-4">
            <Image src={playlist.image || "/placeholder.svg"} alt={playlist.name} fill className="object-cover" />
          </div>
          <h2 className="text-xl font-semibold mb-2">{playlist.name}</h2>
          <p className="text-zinc-600 mb-4">{playlist.description}</p>

          {playlist.external_url && (
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => window.open(playlist.external_url, "_blank")}
            >
              Open in Spotify <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="md:col-span-2">
          <div className="mb-6">
            <h3 className="font-medium mb-2">Playlist Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-zinc-500">Type:</span> {playlist.type}
              </div>
              <div>
                <span className="text-zinc-500">Created:</span> {playlist.created}
              </div>
              <div>
                <span className="text-zinc-500">Tracks:</span> {playlist.totalTracks || tracks.length}
              </div>
              <div>
                <span className="text-zinc-500">Owner:</span> {playlist.owner}
              </div>
            </div>
          </div>

          <h3 className="font-medium mb-4">Tracks</h3>
          {tracks.length === 0 ? (
            <p className="text-zinc-500">No tracks available for this playlist.</p>
          ) : (
            <div className="space-y-4">
              {tracks.map((track: any) => (
                <div key={track.id} className="flex items-center gap-4 group">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <Image
                      src={track.album?.images?.[0]?.url || "/placeholder.svg"}
                      alt={track.name}
                      fill
                      className="object-cover rounded"
                    />
                    <button
                      onClick={() => handlePlay(track)}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                      title={track.preview_url ? "Play preview" : "No preview available"}
                      disabled={!track.preview_url}
                    >
                      {currentlyPlaying === track.id ? (
                        <Pause className="w-6 h-6 text-white" />
                      ) : (
                        <Play className={`w-6 h-6 text-white ${!track.preview_url ? "opacity-50" : ""}`} />
                      )}
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{track.name}</h4>
                    <p className="text-sm text-zinc-600 truncate">{track.artists}</p>
                  </div>
                  {track.external_urls?.spotify && (
                    <a
                      href={track.external_urls.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-[#1DB954]"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

