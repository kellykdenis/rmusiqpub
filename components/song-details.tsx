"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Play, Pause, ExternalLink } from "lucide-react"
import Link from "next/link"
import { allNewReleases } from "@/components/browse-new-releases"
import { artists } from "@/components/artists-grid"
import { Skeleton } from "@/components/ui/skeleton"
import { FallbackPlayer } from "@/components/fallback-player"
import { useToast } from "@/hooks/use-toast"
import { useSpotify } from "@/contexts/spotify-context"
import { extractTrackId, fetchTrackPreviewById } from "@/utils/spotify-helpers"

// Sample audio URLs for testing
const sampleAudioUrls = [
  "https://samplelib.com/lib/preview/mp3/sample-3s.mp3",
  "https://samplelib.com/lib/preview/mp3/sample-6s.mp3",
  "https://samplelib.com/lib/preview/mp3/sample-9s.mp3",
  "https://samplelib.com/lib/preview/mp3/sample-12s.mp3",
  "https://samplelib.com/lib/preview/mp3/sample-15s.mp3",
]

interface SpotifyTrack {
  id: string
  name: string
  artists: Array<{ name: string }>
  duration_ms: number
  preview_url: string | null
  external_urls: {
    spotify: string
  }
  writers?: string[] // Optional writers field
}

interface SpotifyAlbumDetails {
  tracks: {
    items: SpotifyTrack[]
  }
  label: string
  copyrights: Array<{
    text: string
    type: string
  }>
}

interface SongDetailsProps {
  slug: string
}

// Helper function to find artist slug by name
function getArtistSlug(artistName: string) {
  const artist = artists.find((a) => a.name.toLowerCase() === artistName.toLowerCase())
  return artist?.slug
}

// Helper function to format duration
function formatDuration(ms: number) {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

// Helper function to find single by track name
function findSingleByTrack(trackName: string, artistName: string) {
  return allNewReleases.find(
    (release) =>
      release.title.toLowerCase() === trackName.toLowerCase() &&
      release.artist.toLowerCase() === artistName.toLowerCase() &&
      release.type === "single",
  )
}

export function SongDetails({ slug }: SongDetailsProps) {
  const [albumDetails, setAlbumDetails] = useState<SpotifyAlbumDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [currentTrackUrl, setCurrentTrackUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const { toast } = useToast()
  const { isSpotifyAvailable } = useSpotify()
  const [previewsLoaded, setPreviewsLoaded] = useState(false)

  // Find the release by matching the slug
  const release = allNewReleases.find((r) => {
    const releaseSlug = `${r.id}-${r.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
    return releaseSlug === slug
  })

  useEffect(() => {
    async function fetchAlbumDetails() {
      if (!release) return

      try {
        // Update the API endpoint path to match the new route
        const response = await fetch(`/api/spotify/albums/${release.id}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch album details: ${response.status} ${response.statusText}`)
        }
        const data = await response.json()

        // Add sample audio URLs to tracks for testing
        if (data && data.tracks && data.tracks.items) {
          data.tracks.items = data.tracks.items.map((track: SpotifyTrack, index: number) => ({
            ...track,
            preview_url: track.preview_url || sampleAudioUrls[index % sampleAudioUrls.length],
          }))
        }

        setAlbumDetails(data)
      } catch (err) {
        console.error("Error fetching album details:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchAlbumDetails()
  }, [release])

  // Fetch preview URLs for tracks that don't have them
  useEffect(() => {
    async function fetchPreviewUrls() {
      if (!albumDetails || !albumDetails.tracks || !albumDetails.tracks.items || previewsLoaded) return

      const tracksWithoutPreviews = albumDetails.tracks.items.filter(
        (track) => !track.preview_url || track.preview_url.includes("samplelib.com"),
      )

      if (tracksWithoutPreviews.length === 0) {
        setPreviewsLoaded(true)
        return
      }

      const updatedTracks = [...albumDetails.tracks.items]

      for (const track of tracksWithoutPreviews) {
        try {
          const trackId = extractTrackId(track.external_urls.spotify)
          if (trackId) {
            const previewData = await fetchTrackPreviewById(trackId)
            if (previewData && previewData.preview_url) {
              const index = updatedTracks.findIndex((t) => t.id === track.id)
              if (index !== -1) {
                updatedTracks[index] = {
                  ...updatedTracks[index],
                  preview_url: previewData.preview_url,
                }
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching preview for track ${track.name}:`, error)
        }
      }

      setAlbumDetails({
        ...albumDetails,
        tracks: {
          ...albumDetails.tracks,
          items: updatedTracks,
        },
      })

      setPreviewsLoaded(true)
    }

    fetchPreviewUrls()
  }, [albumDetails, previewsLoaded])

  // Handle play with Spotify API
  const handlePlay = (track: SpotifyTrack) => {
    // If clicking the same track that's playing, stop it
    if (currentlyPlaying === track.id) {
      setIsPlaying(false)
      setCurrentlyPlaying(null)
      return
    }

    // Set the current track URL for the fallback player
    setCurrentTrackUrl(track.preview_url)
    setCurrentlyPlaying(track.id)

    // If Spotify is not available, use the fallback player directly
    if (!isSpotifyAvailable) {
      console.log("Spotify not available, using fallback player directly")
      setIsPlaying(true)
      return
    }

    // Try to play with Spotify API
    if (track.external_urls?.spotify) {
      const trackUri = track.external_urls.spotify.replace("https://open.spotify.com/track/", "spotify:track:")

      // Check if we have a Spotify token before trying to play
      const hasToken = localStorage.getItem("spotify_access_token")

      if (!hasToken) {
        console.log("No Spotify token, using preview player directly")
        setIsPlaying(true)
        return
      }

      // Try to play with Spotify API
      fetch(`/api/spotify/play?uri=${encodeURIComponent(trackUri)}`, {
        method: "POST",
      })
        .then(async (response) => {
          if (response.ok) {
            setIsPlaying(true)
            toast({
              title: "Playing on Spotify",
              description: `Now playing: ${track.name}`,
            })
          } else {
            // Get error details
            let errorMessage = "Couldn't play on Spotify. Using preview instead."
            try {
              const errorData = await response.json()
              console.error("Spotify API error:", errorData)
              if (errorData.message) {
                errorMessage = errorData.message
              }
            } catch (e) {
              console.error("Error parsing error response:", e)
            }

            // Show error message
            toast({
              title: "Using Preview Player",
              description: errorMessage,
              variant: "destructive",
            })

            // Fall back to preview URL
            setIsPlaying(true)
          }
        })
        .catch((err) => {
          console.error("Error playing with Spotify API:", err)
          toast({
            title: "Using Preview Player",
            description: "Couldn't connect to Spotify. Using preview instead.",
            variant: "destructive",
          })
          // Fall back to preview URL
          setIsPlaying(true)
        })
    } else {
      // No Spotify URL, use preview URL directly
      setIsPlaying(true)
    }
  }

  if (!release) {
    return (
      <div className="max-w-[1180px] mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Release not found</h1>
        <p className="text-zinc-600">The requested release could not be found.</p>
      </div>
    )
  }

  const artistSlug = getArtistSlug(release.artist)

  return (
    <div className="max-w-[1180px] mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Album Details</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-lg mb-4">
            <Image src={release.image || "/placeholder.svg"} alt={release.title} fill className="object-cover" />
          </div>
          <h2 className="text-2xl font-bold">{release.title}</h2>
          <p className="text-zinc-600">
            By{" "}
            {artistSlug ? (
              <Link href={`/artists-writers/${artistSlug}`} className="hover:text-[#F50604]">
                {release.artist}
              </Link>
            ) : (
              release.artist
            )}
          </p>
        </div>

        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <Button
              className="bg-[#1DB954] hover:bg-[#1AA34A] text-white"
              onClick={() => window.open(release.spotifyUrl, "_blank")}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Listen on Spotify
            </Button>

            {!isSpotifyAvailable && (
              <div className="text-sm text-zinc-600 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Preview Mode
                </span>
                <span>Connect Spotify for full playback features</span>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {albumDetails?.label && (
              <div>
                <h3 className="font-medium mb-2">Label</h3>
                <p className="text-sm text-zinc-600">{albumDetails.label}</p>
              </div>
            )}

            <div>
              <h3 className="font-medium mb-2">Release Date</h3>
              <p className="text-sm text-zinc-600">
                {new Date(release.releaseDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Release Type</h3>
              <p className="text-sm text-zinc-600 capitalize">{release.type}</p>
            </div>
            <div className="overflow-x-auto">
              {error ? (
                <div className="text-red-600 text-sm">Failed to load tracks. Please try again later.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4 w-8"></th>
                      <th className="text-left py-2 px-4">Title</th>
                      <th className="text-left py-2 px-4">Artist</th>
                      <th className="text-left py-2 px-4">Duration</th>
                      <th className="text-left py-2 px-4">Writer</th>
                      <th className="text-left py-2 px-4 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading
                      ? Array.from({ length: 3 }).map((_, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2 px-4">
                              <Skeleton className="h-4 w-4" />
                            </td>
                            <td className="py-2 px-4">
                              <Skeleton className="h-4 w-40" />
                            </td>
                            <td className="py-2 px-4">
                              <Skeleton className="h-4 w-32" />
                            </td>
                            <td className="py-2 px-4">
                              <Skeleton className="h-4 w-16" />
                            </td>
                            <td className="py-2 px-4">
                              <Skeleton className="h-4 w-24" />
                            </td>
                            <td className="py-2 px-4">
                              <Skeleton className="h-4 w-4" />
                            </td>
                          </tr>
                        ))
                      : albumDetails?.tracks.items.map((track) => {
                          const single = findSingleByTrack(track.name, track.artists[0]?.name)
                          const TrackTitle = () =>
                            single ? (
                              <Link
                                href={`/songs/${single.id}-${single.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                                className="hover:text-[#F50604]"
                              >
                                {track.name}
                              </Link>
                            ) : (
                              track.name
                            )

                          return (
                            <tr key={track.id} className="border-b hover:bg-gray-50">
                              <td className="py-2 px-4">
                                <button
                                  onClick={() => handlePlay(track)}
                                  className="text-zinc-400 hover:text-[#F50604]"
                                  title={track.preview_url ? "Play preview" : "No preview available"}
                                  disabled={!track.preview_url}
                                >
                                  {currentlyPlaying === track.id && isPlaying ? (
                                    <Pause className="w-4 h-4" />
                                  ) : (
                                    <Play className={`w-4 h-4 ${!track.preview_url ? "opacity-50" : ""}`} />
                                  )}
                                </button>
                              </td>
                              <td className="py-2 px-4">
                                <TrackTitle />
                              </td>
                              <td className="py-2 px-4">
                                {artistSlug ? (
                                  <Link href={`/artists-writers/${artistSlug}`} className="hover:text-[#F50604]">
                                    {track.artists[0]?.name}
                                  </Link>
                                ) : (
                                  track.artists[0]?.name
                                )}
                              </td>
                              <td className="py-2 px-4">{formatDuration(track.duration_ms)}</td>
                              <td className="py-2 px-4">{track.writers?.[0] || track.artists[0]?.name}</td>
                              <td className="py-2 px-4">
                                <a
                                  href={track.external_urls.spotify}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-zinc-400 hover:text-[#1DB954]"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </td>
                            </tr>
                          )
                        })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden fallback player for audio playback */}
      <FallbackPlayer
        trackUrl={currentTrackUrl}
        trackId={currentlyPlaying || ""}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        onEnd={() => {
          setIsPlaying(false)
          setCurrentlyPlaying(null)
        }}
      />
    </div>
  )
}

