"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { additionalPlaylists } from "@/components/mock-data"
import { Play, Pause, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Update allThemedPlaylists array
export const allThemedPlaylists = [
  {
    id: "1",
    name: "2025 Grammy Nominees",
    description: "All the hits from 2025 Grammy nominees featuring Bebe Cool, Jhenell Dina, and Phila Kaweesa!",
    image: "https://placehold.co/600x600?text=Grammy+2025",
    slug: "2025-grammy-nominees",
    type: "Themed Playlists",
    created: "2024-01-30",
    totalTracks: 33,
    owner: "Denise Carlos - RMPG,Uganda",
  },
  {
    id: "2",
    name: "Gospel Hits",
    description: "The best gospel music featuring Jhenell Dina, Carol Bu'dhwike, and Phila Kaweesa",
    image: "https://placehold.co/600x600?text=Gospel+Hits",
    slug: "gospel-hits",
    type: "Themed Playlists",
    created: "2024-01-30",
    totalTracks: 25,
    owner: "Denise Carlos - RMPG,Uganda",
  },
  {
    id: "3",
    name: "East African Hits",
    description: "Top hits from East Africa featuring Bebe Cool, Richy Kaweesa, and Johnie Beats",
    image: "https://placehold.co/600x600?text=East+African+Hits",
    slug: "east-african-hits",
    type: "Themed Playlists",
    created: "2024-01-30",
    totalTracks: 30,
    owner: "Denise Carlos - RMPG,Uganda",
  },
  {
    id: "4",
    name: "Worship Experience",
    description: "A powerful worship experience with Carol Bu'dhwike, Jhenell Dina, and Phila Kaweesa",
    image: "https://placehold.co/600x600?text=Worship+Experience",
    slug: "worship-experience",
    type: "Themed Playlists",
    created: "2024-01-30",
    totalTracks: 28,
    owner: "Denise Carlos - RMPG,Uganda",
  },
  {
    id: "5",
    name: "Producer's Corner",
    description: "Top productions from Johnie Beats featuring collaborations with various artists",
    image: "https://placehold.co/600x600?text=Producer's+Corner",
    slug: "producers-corner",
    type: "Themed Playlists",
    created: "2024-01-30",
    totalTracks: 40,
    owner: "Denise Carlos - RMPG,Uganda",
  },
  {
    id: "6",
    name: "RMPG Essentials",
    description: "Essential tracks from all RMPG artists including Bebe Cool, Richy Kaweesa, and more",
    image: "https://placehold.co/600x600?text=RMPG+Essentials",
    slug: "rmpg-essentials",
    type: "Themed Playlists",
    created: "2024-01-30",
    totalTracks: 50,
    owner: "Denise Carlos - RMPG,Uganda",
  },
  {
    id: "7",
    name: "New & Notable",
    description: "Fresh releases from Carol Bu'dhwike, Richy Kaweesa, and other RMPG artists",
    image: "https://placehold.co/600x600?text=New+&+Notable",
    slug: "new-and-notable",
    type: "Themed Playlists",
    created: "2024-02-15",
    totalTracks: 20,
    owner: "Denise Carlos - RMPG,Uganda",
  },
  {
    id: "8",
    name: "Christian Contemporary",
    description: "Modern Christian music featuring Johnie Beats, Carol Bu'dhwike, and more",
    image: "https://placehold.co/600x600?text=Christian+Contemporary",
    slug: "christian-contemporary",
    type: "Themed Playlists",
    created: "2024-02-15",
    totalTracks: 35,
    owner: "Denise Carlos - RMPG,Uganda",
  },
  ...additionalPlaylists,
]

interface SpotifyPlaylist {
  id: string
  name: string
  description: string
  image: string
  tracks: Array<{
    id: string
    name: string
    artists: string
    preview_url: string | null
    album: {
      name: string
      images: Array<{ url: string; height: number; width: number }>
    }
    external_urls: {
      spotify: string
    }
  }>
  external_url: string
  owner: string
}

export function BrowseThemedPlaylists() {
  const [loading, setLoading] = useState(true)
  const [displayedPlaylists, setDisplayedPlaylists] = useState(allThemedPlaylists.slice(0, 8))
  const [spotifyPlaylists, setSpotifyPlaylists] = useState<SpotifyPlaylist[]>([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 8,
    hasMore: allThemedPlaylists.length > 8,
  })
  const [error, setError] = useState<string | null>(null)
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchArtistPlaylists() {
      try {
        setLoading(true)

        // Try to get from session storage first
        const cachedPlaylists = sessionStorage.getItem("artistPlaylists")
        if (cachedPlaylists) {
          try {
            const parsedPlaylists = JSON.parse(cachedPlaylists)
            if (Array.isArray(parsedPlaylists) && parsedPlaylists.length > 0) {
              console.log("Using cached playlists from session storage")
              setSpotifyPlaylists(parsedPlaylists)

              // Convert to our format
              const formattedPlaylists = parsedPlaylists.map((playlist: SpotifyPlaylist) => ({
                id: `spotify-${playlist.id}`,
                name: playlist.name,
                description: playlist.description || "Featured Spotify playlist",
                image: playlist.image || "/placeholder.svg",
                slug: `spotify-${playlist.id}`,
                type: "Spotify Playlist",
                created: new Date().toISOString().split("T")[0],
                totalTracks: playlist.tracks?.length || 0,
                owner: playlist.owner || "Spotify",
                spotifyUrl: playlist.external_url,
                tracks: playlist.tracks || [],
              }))

              // Add Spotify playlists to our themed playlists
              const combinedPlaylists = [...allThemedPlaylists, ...formattedPlaylists]
              setDisplayedPlaylists(combinedPlaylists.slice(0, 8))

              // Update pagination
              setPagination({
                currentPage: 1,
                itemsPerPage: 8,
                hasMore: combinedPlaylists.length > 8,
              })

              setLoading(false)
              return
            }
          } catch (parseError) {
            console.error("Error parsing cached playlists:", parseError)
            // Continue to fetch from API
          }
        }

        // Fetch playlists featuring our artists
        const response = await fetch("/api/spotify/artist-playlists")

        // Always process the response regardless of status code
        // The API now returns mock data on error with a 200 status
        const data = await response.json()

        if (Array.isArray(data) && data.length > 0) {
          // Cache the playlists in session storage
          try {
            sessionStorage.setItem("artistPlaylists", JSON.stringify(data))
          } catch (cacheError) {
            console.error("Error caching playlists:", cacheError)
            // Continue without caching
          }

          setSpotifyPlaylists(data)

          // Convert Spotify playlists to our format and add to displayed playlists
          const formattedPlaylists = data.map((playlist: SpotifyPlaylist) => ({
            id: `spotify-${playlist.id}`,
            name: playlist.name,
            description: playlist.description || "Featured Spotify playlist",
            image: playlist.image || "/placeholder.svg",
            slug: `spotify-${playlist.id}`,
            type: "Spotify Playlist",
            created: new Date().toISOString().split("T")[0],
            totalTracks: playlist.tracks?.length || 0,
            owner: playlist.owner || "Spotify",
            spotifyUrl: playlist.external_url,
            tracks: playlist.tracks || [],
          }))

          // Add Spotify playlists to our themed playlists
          const combinedPlaylists = [...allThemedPlaylists, ...formattedPlaylists]
          setDisplayedPlaylists(combinedPlaylists.slice(0, 8))

          // Update pagination
          setPagination({
            currentPage: 1,
            itemsPerPage: 8,
            hasMore: combinedPlaylists.length > 8,
          })
        } else {
          // If no data or empty array, just use our themed playlists
          setDisplayedPlaylists(allThemedPlaylists.slice(0, 8))
          setPagination({
            currentPage: 1,
            itemsPerPage: 8,
            hasMore: allThemedPlaylists.length > 8,
          })
        }
      } catch (err) {
        console.error("Error fetching Spotify playlists:", err)
        setError(err instanceof Error ? err.message : "An error occurred")

        // Show a toast notification
        toast({
          title: "Spotify Connection Issue",
          description: "Using local playlist data instead. Some features may be limited.",
          variant: "destructive",
        })

        // Keep using initial playlists data on error
        setDisplayedPlaylists(allThemedPlaylists.slice(0, 8))
        setPagination({
          currentPage: 1,
          itemsPerPage: 8,
          hasMore: allThemedPlaylists.length > 8,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchArtistPlaylists()

    // Cleanup function
    return () => {
      if (audioRef) {
        audioRef.pause()
        audioRef.src = ""
      }
    }
  }, [toast])

  const loadMore = () => {
    setLoading(true)

    // Simulate API loading delay
    setTimeout(() => {
      const nextPageStart = pagination.currentPage * pagination.itemsPerPage
      const nextPageEnd = nextPageStart + pagination.itemsPerPage

      // Combine our themed playlists with Spotify playlists
      const combinedPlaylists = [...allThemedPlaylists]

      // Add converted Spotify playlists
      spotifyPlaylists.forEach((playlist) => {
        combinedPlaylists.push({
          id: `spotify-${playlist.id}`,
          name: playlist.name,
          description: playlist.description || "Featured Spotify playlist",
          image: playlist.image || "/placeholder.svg",
          slug: `spotify-${playlist.id}`,
          type: "Spotify Playlist",
          created: new Date().toISOString().split("T")[0],
          totalTracks: playlist.tracks?.length || 0,
          owner: playlist.owner || "Spotify",
          spotifyUrl: playlist.external_url,
          tracks: playlist.tracks || [],
        })
      })

      const nextPagePlaylists = combinedPlaylists.slice(nextPageStart, nextPageEnd)

      setDisplayedPlaylists((prev) => [...prev, ...nextPagePlaylists])
      setPagination((prev) => ({
        ...prev,
        currentPage: prev.currentPage + 1,
        hasMore: nextPageEnd < combinedPlaylists.length,
      }))

      setLoading(false)
    }, 500)
  }

  const handlePlayTrack = (trackId: string, previewUrl: string | null) => {
    // Stop current playback
    if (audioRef) {
      audioRef.pause()
      audioRef.src = ""
    }

    // If clicking the same track that's playing, stop it
    if (currentlyPlaying === trackId) {
      setCurrentlyPlaying(null)
      return
    }

    // If no preview URL, show a message
    if (!previewUrl) {
      toast({
        title: "No preview available",
        description: "This track doesn't have a preview available.",
        variant: "destructive",
      })
      return
    }

    // Create and play new audio
    const audio = new Audio(previewUrl)
    setAudioRef(audio)

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
        setCurrentlyPlaying(trackId)
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

  return (
    <div className="max-w-[1180px] mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Featured Playlists</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayedPlaylists.map((playlist) => (
          <div key={playlist.id} className="group">
            <div className="space-y-2">
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <Image
                  src={playlist.image || "/placeholder.svg"}
                  alt={playlist.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div>
                <h3 className="font-medium group-hover:text-[#F50604]">{playlist.name}</h3>
                <p className="text-sm text-zinc-600 line-clamp-2">{playlist.description}</p>

                {/* If it's a Spotify playlist with tracks, show preview buttons */}
                {playlist.id.startsWith("spotify-") && playlist.tracks && (
                  <div className="mt-2">
                    <h4 className="text-sm font-medium mb-1">Preview Tracks:</h4>
                    <ul className="space-y-1">
                      {(playlist.tracks as any).slice(0, 3).map((track: any) => (
                        <li key={track.id} className="flex items-center justify-between text-xs">
                          <span className="truncate flex-1">
                            {track.name} - {track.artists}
                          </span>
                          <button
                            onClick={() => handlePlayTrack(track.id, track.preview_url)}
                            className="ml-2 text-zinc-400 hover:text-[#F50604]"
                            title={track.preview_url ? "Play preview" : "No preview available"}
                            disabled={!track.preview_url}
                          >
                            {currentlyPlaying === track.id ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className={`w-4 h-4 ${!track.preview_url ? "opacity-50" : ""}`} />
                            )}
                          </button>
                          <a
                            href={track.external_urls?.spotify}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-zinc-400 hover:text-[#1DB954]"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* External link for Spotify playlists */}
                {playlist.spotifyUrl && (
                  <a
                    href={playlist.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs text-[#1DB954] mt-2 hover:underline"
                  >
                    Open in Spotify <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading &&
          Array.from({ length: pagination.itemsPerPage }).map((_, i) => (
            <div key={`skeleton-${i}`} className="space-y-2">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
      </div>

      {/* Pagination - Show More button */}
      {pagination.hasMore && (
        <div className="mt-8 flex justify-center">
          <Button onClick={loadMore} variant="outline" className="w-full max-w-xs" disabled={loading}>
            {loading ? "Loading..." : "Show More"}
          </Button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md">
          Error loading playlists from Spotify: {error}. Showing local data instead.
        </div>
      )}
    </div>
  )
}

