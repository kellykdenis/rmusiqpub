"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Play, Pause, ExternalLink, AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { allThemedPlaylists } from "@/components/browse-themed-playlists"
import { useSpotify } from "@/contexts/spotify-context"
import { fetchTrackPreviewById } from "@/utils/spotify-helpers"
import { useToast } from "@/hooks/use-toast"
import { artists } from "@/components/artists-grid"

interface PlaylistDetailsProps {
  slug: string
}

interface SpotifyTrack {
  id: string
  name: string
  artists: Array<{ name: string; id: string }>
  album: {
    name: string
    images: Array<{ url: string; height: number; width: number }>
  }
  duration_ms: number
  preview_url: string | null
  external_urls: {
    spotify: string
  }
}

// Helper function to normalize text for comparison
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^\w\s]/g, "") // Remove special characters
    .trim()
}

// Helper function to check if an artist matches our artists
function isOurArtist(artistName: string): boolean {
  const normalizedArtistName = normalizeText(artistName)
  return artists.some(
    (artist) =>
      normalizeText(artist.name).includes(normalizedArtistName) ||
      normalizedArtistName.includes(normalizeText(artist.name)),
  )
}

export function PlaylistDetails({ slug }: PlaylistDetailsProps) {
  const [loading, setLoading] = useState(true)
  const [playlist, setPlaylist] = useState<(typeof allThemedPlaylists)[0] | null>(null)
  const [tracks, setTracks] = useState<any[]>([])
  const [spotifyTracks, setSpotifyTracks] = useState<SpotifyTrack[]>([])
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [matchingTracks, setMatchingTracks] = useState<number>(0)
  const [totalTracks, setTotalTracks] = useState<number>(0)
  const [relevanceScore, setRelevanceScore] = useState<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { playTrack, pausePlayback } = useSpotify()
  const [previewsLoaded, setPreviewsLoaded] = useState(false)
  const [isImportedPlaylist, setIsImportedPlaylist] = useState(false)
  const [isDiscoveredPlaylist, setIsDiscoveredPlaylist] = useState(false)

  // Make sure to initialize the toast
  const { toast } = useToast()

  useEffect(() => {
    // Simulate loading
    setLoading(true)

    // Check if this is an imported playlist (slug starts with "imported-")
    const isImported = slug.startsWith("imported-")
    setIsImportedPlaylist(isImported)

    // Check if this is a discovered playlist (slug starts with "discovered-")
    const isDiscovered = slug.startsWith("discovered-")
    setIsDiscoveredPlaylist(isDiscovered)

    if (isImported) {
      // Extract the Spotify playlist ID
      const spotifyPlaylistId = slug.replace("imported-", "")

      // Fetch imported playlist details
      fetch(`/api/spotify/playlists/imported/${spotifyPlaylistId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch imported playlist: ${response.status}`)
          }
          return response.json()
        })
        .then((data) => {
          // Create a playlist object in the format our component expects
          const importedPlaylist = {
            id: `imported-${data.id}`,
            name: data.name,
            description: data.description || "Imported playlist",
            image: data.image || "/placeholder.svg",
            slug: `imported-${data.id}`,
            type: "Imported Playlist",
            created: new Date().toISOString().split("T")[0],
            totalTracks: data.tracks?.total || 0,
            owner: data.owner || "Spotify",
            spotifyUrl: data.external_url,
            imported: true,
            followers: data.followers || 0,
            relevanceScore: data.relevanceScore || null,
          }

          setPlaylist(importedPlaylist)

          // Format tracks for our component
          if (data.tracks && data.tracks.items && Array.isArray(data.tracks.items)) {
            const formattedTracks = data.tracks.items
              .filter((track) => track && track.id) // Filter out null or invalid tracks
              .map((track: any) => ({
                id: track.id,
                title: track.name,
                version: track.album?.name || "Album",
                artist: track.artists[0]?.name || "Unknown Artist",
                writer: track.artists.map((a: any) => a.name).join(", "),
                charts: "",
                preview_url: track.preview_url,
                external_url: track.external_urls?.spotify,
                artistId: track.artists[0]?.id,
                duration_ms: track.duration_ms,
                isOurArtist: isOurArtist(track.artists[0]?.name || ""),
              }))

            setTracks(formattedTracks)
            setSpotifyTracks(data.tracks.items)

            // Calculate matching tracks
            const matching = formattedTracks.filter((track) => track.isOurArtist).length
            setMatchingTracks(matching)
            setTotalTracks(formattedTracks.length)
            setRelevanceScore(matching > 0 ? (matching / formattedTracks.length) * 100 : 0)
          }
        })
        .catch((error) => {
          console.error("Error fetching imported playlist:", error)
          // Keep using empty tracks array on error
          setTracks([])
        })
        .finally(() => {
          setLoading(false)
        })
    } else if (isDiscovered) {
      // Handle discovered playlists
      const spotifyPlaylistId = slug.replace("discovered-", "")

      // Fetch playlist details from Spotify
      fetch(`/api/spotify/playlists/discovered/${spotifyPlaylistId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch discovered playlist: ${response.status}`)
          }
          return response.json()
        })
        .then((data) => {
          // Create a playlist object in the format our component expects
          const discoveredPlaylist = {
            id: `discovered-${data.id}`,
            name: data.name || "Discovered Playlist",
            description: data.description || "Discovered playlist",
            image: data.image || "/placeholder.svg",
            slug: `discovered-${data.id}`,
            type: "Discovered Playlist",
            created: new Date().toISOString().split("T")[0],
            totalTracks: data.tracks?.total || 0,
            owner: data.owner || "Spotify",
            spotifyUrl: data.external_url,
            featuredArtist: data.featuredArtist,
            followers: data.followers || 0,
            relevanceScore: data.relevanceScore || null,
          }

          setPlaylist(discoveredPlaylist)
          setRelevanceScore(data.relevanceScore || null)

          // Format tracks for our component
          if (data.tracks && data.tracks.items && Array.isArray(data.tracks.items)) {
            const formattedTracks = data.tracks.items
              .filter((track) => track && track.id) // Filter out null or invalid tracks
              .map((track: any) => ({
                id: track.id,
                title: track.name,
                version: track.album?.name || "Album",
                artist: track.artists[0]?.name || "Unknown Artist",
                writer: track.artists.map((a: any) => a.name).join(", "),
                charts: "",
                preview_url: track.preview_url,
                external_url: track.external_urls?.spotify,
                artistId: track.artists[0]?.id,
                duration_ms: track.duration_ms,
                isOurArtist: isOurArtist(track.artists[0]?.name || ""),
              }))

            setTracks(formattedTracks)
            setSpotifyTracks(data.tracks.items)

            // Calculate matching tracks
            const matching = formattedTracks.filter((track) => track.isOurArtist).length
            setMatchingTracks(matching)
            setTotalTracks(formattedTracks.length)
            if (!data.relevanceScore) {
              setRelevanceScore(matching > 0 ? (matching / formattedTracks.length) * 100 : 0)
            }
          }
        })
        .catch((error) => {
          console.error("Error fetching discovered playlist:", error)
          // Try to fetch as a regular Spotify playlist as fallback
          fetch(`/api/spotify/playlists/${spotifyPlaylistId}/tracks`)
            .then((response) => {
              if (!response.ok) {
                throw new Error(`Failed to fetch playlist tracks: ${response.status}`)
              }
              return response.json()
            })
            .then((data) => {
              if (data && Array.isArray(data)) {
                setSpotifyTracks(data)

                // Convert Spotify tracks to our format
                const formattedTracks = data
                  .filter((track) => track && track.id) // Filter out null or invalid tracks
                  .map((track: SpotifyTrack) => ({
                    id: track.id,
                    title: track.name,
                    version: track.album?.name || "Album",
                    artist: track.artists[0]?.name || "Unknown Artist",
                    writer: track.artists.map((a) => a.name).join(", "),
                    charts: "",
                    preview_url: track.preview_url,
                    external_url: track.external_urls.spotify,
                    artistId: track.artists[0]?.id,
                    isOurArtist: isOurArtist(track.artists[0]?.name || ""),
                  }))

                setTracks(formattedTracks)

                // Calculate matching tracks
                const matching = formattedTracks.filter((track) => track.isOurArtist).length
                setMatchingTracks(matching)
                setTotalTracks(formattedTracks.length)
                setRelevanceScore(matching > 0 ? (matching / formattedTracks.length) * 100 : 0)

                // Create a basic playlist object
                setPlaylist({
                  id: `discovered-${spotifyPlaylistId}`,
                  name: "Discovered Playlist",
                  description: "Playlist featuring our artists",
                  image: data[0]?.album?.images?.[0]?.url || "/placeholder.svg",
                  slug: `discovered-${spotifyPlaylistId}`,
                  type: "Discovered Playlist",
                  created: new Date().toISOString().split("T")[0],
                  totalTracks: data.length,
                  owner: "Spotify",
                  spotifyUrl: `https://open.spotify.com/playlist/${spotifyPlaylistId}`,
                })
              }
            })
            .catch((err) => {
              console.error("Error fetching as regular playlist:", err)
              setTracks([])
            })
            .finally(() => {
              setLoading(false)
            })
        })
        .finally(() => {
          setLoading(false)
        })
    } else if (slug.startsWith("spotify-")) {
      // Handle existing Spotify playlists
      const spotifyPlaylistId = slug.replace("spotify-", "")

      // Fetch playlist tracks from Spotify
      fetch(`/api/spotify/playlists/${spotifyPlaylistId}/tracks`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch playlist tracks: ${response.status}`)
          }
          return response.json()
        })
        .then((data) => {
          if (data && Array.isArray(data)) {
            setSpotifyTracks(data)

            // Convert Spotify tracks to our format
            const formattedTracks = data
              .filter((track) => track && track.id) // Filter out null or invalid tracks
              .map((track: SpotifyTrack) => ({
                id: track.id,
                title: track.name,
                version: track.album?.name || "Album",
                artist: track.artists[0]?.name || "Unknown Artist",
                writer: track.artists.map((a) => a.name).join(", "),
                charts: "",
                preview_url: track.preview_url,
                external_url: track.external_urls.spotify,
                artistId: track.artists[0]?.id,
                isOurArtist: isOurArtist(track.artists[0]?.name || ""),
              }))

            setTracks(formattedTracks)

            // Calculate matching tracks
            const matching = formattedTracks.filter((track) => track.isOurArtist).length
            setMatchingTracks(matching)
            setTotalTracks(formattedTracks.length)
            setRelevanceScore(matching > 0 ? (matching / formattedTracks.length) * 100 : 0)
          }
        })
        .catch((error) => {
          console.error("Error fetching Spotify playlist tracks:", error)
          // Keep using empty tracks array on error
          setTracks([])
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      // Find the playlist by slug
      const foundPlaylist = allThemedPlaylists.find((p) => p.slug === slug)
      setPlaylist(foundPlaylist || null)

      // Simulate API call delay for non-Spotify playlists
      setTimeout(() => {
        setTracks([])
        setLoading(false)
      }, 500)
    }
  }, [slug])

  // Fetch preview URLs for tracks that don't have them
  useEffect(() => {
    async function fetchMissingPreviewUrls() {
      if (previewsLoaded || tracks.length === 0) return

      const tracksWithoutPreviews = tracks.filter((track) => !track.preview_url)

      if (tracksWithoutPreviews.length === 0) {
        setPreviewsLoaded(true)
        return
      }

      const updatedTracks = [...tracks]

      for (const track of tracksWithoutPreviews) {
        try {
          if (track.external_url) {
            const trackId = track.external_url.replace("https://open.spotify.com/track/", "")
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
          console.error(`Error fetching preview for track ${track.title}:`, error)
        }
      }

      setTracks(updatedTracks)
      setPreviewsLoaded(true)
    }

    fetchMissingPreviewUrls()
  }, [tracks, previewsLoaded])

  // Helper function to extract track ID from URL
  const extractTrackId = (url: string): string | null => {
    const regex = /\/track\/([a-zA-Z0-9]+)/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  // Handle audio playback
  const handlePlay = async (track: any) => {
    // If clicking the same track that's playing, stop it
    if (currentlyPlaying === track.id) {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      setCurrentlyPlaying(null)
      return
    }

    // If no preview URL is available but we have a Spotify link, try to fetch the preview
    if (!track.preview_url && track.external_url) {
      try {
        const trackId = extractTrackId(track.external_url)
        if (trackId) {
          const previewData = await fetchTrackPreviewById(trackId)
          if (previewData && previewData.preview_url) {
            // Update the track with the fetched preview URL
            track.preview_url = previewData.preview_url
            console.log(`Successfully fetched preview URL for track: ${track.title}`)

            // Update the toast to show we found a preview
            toast({
              title: "Preview Available",
              description: `Found preview for "${track.title}". Playing now.`,
            })
          } else {
            console.log("No preview URL available for track:", track.title)
            toast({
              title: "Preview Unavailable",
              description: "No preview is available for this track.",
              variant: "destructive",
            })
            return
          }
        }
      } catch (error) {
        console.error(`Error fetching preview for track ${track.title}:`, error)
        toast({
          title: "Preview Unavailable",
          description: "Could not fetch preview for this track.",
          variant: "destructive",
        })
        return
      }
    }

    // If still no preview URL available, show error
    if (!track.preview_url) {
      console.log("No preview URL available for track:", track.title)
      toast({
        title: "Preview Unavailable",
        description: "No preview is available for this track.",
        variant: "destructive",
      })
      return
    }

    // Try to play with Spotify if external_url exists
    if (track.external_url && track.external_url.includes("spotify")) {
      const trackUri = track.external_url.replace("https://open.spotify.com/track/", "spotify:track:")

      playTrack(trackUri)
        .then((success) => {
          if (success) {
            setCurrentlyPlaying(track.id)
            toast({
              title: "Now Playing",
              description: `${track.title || track.name} by ${track.artist}`,
            })
          } else {
            // Fall back to preview URL
            playWithPreviewUrl(track)
          }
        })
        .catch(() => {
          // Fall back to preview URL on error
          playWithPreviewUrl(track)
        })
    } else {
      // No Spotify URL, use preview URL directly
      playWithPreviewUrl(track)
    }
  }

  // Helper function for playing with preview URL
  const playWithPreviewUrl = (track: any) => {
    // Stop current playback if any
    if (audioRef.current) {
      audioRef.current.pause()
    }

    // Only proceed if we have a preview URL
    if (!track.preview_url) {
      console.log("No preview URL available for track:", track.title)
      return
    }

    // Create new audio element with the preview URL
    console.log(`Playing audio with preview URL: ${track.preview_url} for track: ${track.title}`)

    const audio = new Audio(track.preview_url)
    audioRef.current = audio

    // Add event listeners for better user feedback
    audio.addEventListener("ended", () => {
      console.log(`Playback ended for ${track.title}`)
      setCurrentlyPlaying(null)
    })

    audio.addEventListener("error", (e) => {
      console.error(`Audio error for ${track.title}:`, e)
      setCurrentlyPlaying(null)
    })

    // Play audio
    audio
      .play()
      .then(() => {
        console.log(`Successfully playing ${track.title} with HTML Audio`)
        setCurrentlyPlaying(track.id)
      })
      .catch((err) => {
        console.error(`Error playing audio for ${track.title}:`, err)
        setCurrentlyPlaying(null)
      })
  }

  // Play all tracks
  const playAll = () => {
    if (tracks.length === 0) return

    // Find the first track with a preview URL
    const firstPlayableTrack = tracks.find((track) => track.preview_url)
    if (firstPlayableTrack) {
      handlePlay(firstPlayableTrack)
    }
  }

  // Format duration
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
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

  if (!playlist && !isImportedPlaylist && !isDiscoveredPlaylist) {
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
      <h1 className="text-3xl font-bold mb-8">{playlist?.name || "Playlist"}</h1>

      <div className="grid md:grid-cols-3 gap-8 mb-8">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-lg">
                <Image
                  src={playlist?.image || "/placeholder.svg"}
                  alt={`Album artwork ${i}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
          <Button
            className="w-full bg-[#F50604] hover:bg-[#D50604] text-white"
            onClick={playAll}
            disabled={tracks.length === 0 || !tracks.some((track) => track.preview_url)}
          >
            <Play className="w-4 h-4 mr-2" />
            Play All
          </Button>

          {(isImportedPlaylist || isDiscoveredPlaylist) && playlist?.spotifyUrl && (
            <Button variant="outline" className="w-full" onClick={() => window.open(playlist.spotifyUrl, "_blank")}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in Spotify
            </Button>
          )}

          {/* Relevance score indicator */}
          {relevanceScore !== null && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Playlist Relevance</h3>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      relevanceScore >= 70 ? "bg-green-600" : relevanceScore >= 40 ? "bg-yellow-500" : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(100, relevanceScore)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{relevanceScore.toFixed(0)}%</span>
              </div>
              <p className="text-xs text-zinc-600">
                {matchingTracks} of {totalTracks} tracks match our artists
              </p>

              {relevanceScore < 40 && (
                <div className="mt-2 flex items-start gap-2 text-amber-600 text-xs">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <p>This playlist contains few tracks from our artists. Some tracks may not be relevant.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <h3 className="font-medium text-sm text-zinc-500">Type</h3>
              <p>
                {isImportedPlaylist
                  ? "Imported Playlist"
                  : isDiscoveredPlaylist
                    ? "Discovered Playlist"
                    : playlist?.type}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-zinc-500">Folder</h3>
              <p>
                {isImportedPlaylist
                  ? "Spotify Playlists"
                  : isDiscoveredPlaylist
                    ? "Discovered Playlists"
                    : "Themed Playlists"}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-zinc-500">Created</h3>
              <p>{playlist?.created || new Date().toISOString().split("T")[0]}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-zinc-500">Last Modified</h3>
              <p>{playlist?.created || new Date().toISOString().split("T")[0]}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-zinc-500">Total Tracks</h3>
              <p>{tracks.length || playlist?.totalTracks || 0}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-zinc-500">Owner</h3>
              <p>{playlist?.owner || "Spotify"}</p>
            </div>
            {playlist?.followers && (
              <div className="col-span-2">
                <h3 className="font-medium text-sm text-zinc-500">Followers</h3>
                <p>{playlist.followers.toLocaleString()}</p>
              </div>
            )}
          </div>

          {playlist?.description && (
            <div className="mt-4">
              <h3 className="font-medium text-sm text-zinc-500">Description</h3>
              <p className="text-sm text-zinc-600">{playlist.description}</p>
            </div>
          )}
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
              <th className="text-left py-2 px-4">Duration</th>
              <th className="text-left py-2 px-4 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {tracks.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  No tracks available for this playlist.
                </td>
              </tr>
            ) : (
              tracks.map((track) => (
                <tr key={track.id} className={`border-b hover:bg-gray-50 ${track.isOurArtist ? "bg-green-50" : ""}`}>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => handlePlay(track)}
                      className="text-zinc-400 hover:text-[#F50604]"
                      title={track.preview_url ? "Play preview" : "Try to fetch preview"}
                    >
                      {currentlyPlaying === track.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="py-2 px-4">
                    {track.title}
                    {track.isOurArtist && (
                      <Badge variant="imported" className="ml-2 text-xs">
                        Our Artist
                      </Badge>
                    )}
                  </td>
                  <td className="py-2 px-4">{track.version}</td>
                  <td className="py-2 px-4">{track.artist}</td>
                  <td className="py-2 px-4">{track.writer}</td>
                  <td className="py-2 px-4">{track.duration_ms ? formatDuration(track.duration_ms) : "--:--"}</td>
                  <td className="py-2 px-4">
                    <a
                      href={track.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-zinc-600"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
