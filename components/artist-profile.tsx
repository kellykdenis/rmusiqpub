"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Facebook, Twitter, Instagram, Youtube, AirplayIcon as Spotify, ExternalLink, Play, Pause } from "lucide-react"
import { artists } from "@/components/artists-grid"
import { allThemedPlaylists } from "@/components/browse-themed-playlists"
import { fetchAllReleases, getArtistReleases } from "@/components/browse-new-releases"
import { Skeleton } from "@/components/ui/skeleton"
import { useSpotify } from "@/contexts/spotify-context"
import { useToast } from "@/hooks/use-toast"
import { LatestVideo } from "@/components/latest-video"
import { fetchTrackPreviewById } from "@/utils/spotify-helpers"

interface ArtistProfileProps {
  slug: string
}

interface SpotifyTrack {
  id: string
  name: string
  album: {
    images: Array<{ url: string; height: number; width: number }>
    name: string
    release_date: string
  }
  artists: Array<{ name: string }>
  preview_url: string | null
  external_urls: {
    spotify: string
  }
  duration_ms: number
}

interface ArtistSong {
  id: string
  title: string
  artist: string
  image: string
  slug: string
  preview_url?: string | null
  external_url?: string
  duration_ms?: number
}

interface ArtistRelease {
  id: string
  title: string
  artist: string
  image: string
  slug: string
  type: string
  releaseDate: string
}

export function ArtistProfile({ slug }: ArtistProfileProps) {
  const artist = artists.find((a) => a.slug === slug)
  const [popularSongs, setPopularSongs] = useState<ArtistSong[]>([])
  const [spotifyTopTracks, setSpotifyTopTracks] = useState<SpotifyTrack[]>([])
  const [artistReleases, setArtistReleases] = useState<ArtistRelease[]>([])
  const [artistPlaylists, setArtistPlaylists] = useState<typeof allThemedPlaylists>([])
  const [spotifyPlaylists, setSpotifyPlaylists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAllReleases, setShowAllReleases] = useState(false)
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const initialReleasesToShow = 8
  const [previewsLoaded, setPreviewsLoaded] = useState(false)

  const { playTrack, pausePlayback } = useSpotify()
  const { toast } = useToast()

  useEffect(() => {
    async function loadArtistContent() {
      if (!artist) return

      try {
        setLoading(true)

        // Fetch top tracks from Spotify if we have a Spotify ID
        if (artist.spotifyId) {
          try {
            console.log(`Fetching top tracks for artist: ${artist.name} with ID: ${artist.spotifyId}`)
            const response = await fetch(`/api/spotify/artists/${artist.spotifyId}/top-tracks`)
            if (response.ok) {
              const data = await response.json()
              if (data && data.tracks && Array.isArray(data.tracks)) {
                setSpotifyTopTracks(data.tracks)

                // Convert Spotify tracks to our format
                const formattedTracks = data.tracks.map((track: SpotifyTrack) => ({
                  id: track.id,
                  title: track.name,
                  artist: track.artists[0]?.name || artist.name,
                  image: track.album.images[0]?.url || "/placeholder.svg",
                  slug: `${track.id}-${track.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
                  preview_url: track.preview_url,
                  external_url: track.external_urls.spotify,
                  duration_ms: track.duration_ms,
                }))

                setPopularSongs(formattedTracks)
              }
            }
          } catch (err) {
            console.error(`Error fetching Spotify top tracks for ${artist.name}:`, err)
          }
        }

        await fetchAllReleases()

        // Get releases ONLY for THIS artist by exact name match
        console.log(`Getting releases for artist: ${artist.name}`)
        const releases = getArtistReleases(artist.name)
        setArtistReleases(releases)

        // Get playlists featuring THIS artist by exact name match
        const playlists = allThemedPlaylists.filter((playlist) =>
          playlist.description.toLowerCase().includes(artist.name.toLowerCase()),
        )
        setArtistPlaylists(playlists)

        // Fetch Spotify playlists specifically for this artist
        try {
          console.log(`Fetching Spotify playlists for artist: ${artist.name}`)
          const artistResponse = await fetch(`/api/spotify/playlists?artist=${encodeURIComponent(artist.name)}`)

          if (artistResponse.ok) {
            const artistData = await artistResponse.json()

            if (artistData && Array.isArray(artistData) && artistData.length > 0) {
              console.log(`Found ${artistData.length} playlists for ${artist.name}`)
              setSpotifyPlaylists(artistData)
            } else {
              console.log(`No Spotify playlists found for ${artist.name}`)
              setSpotifyPlaylists([])
            }
          } else {
            console.error(`Error response from playlists API: ${artistResponse.status}`)
            setSpotifyPlaylists([])
          }
        } catch (err) {
          console.error(`Error fetching Spotify playlists for ${artist.name}:`, err)
          setSpotifyPlaylists([])
        }
      } catch (err) {
        console.error("Error loading artist content:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    loadArtistContent()
  }, [artist])

  // Fetch preview URLs for tracks that don't have them
  useEffect(() => {
    async function fetchMissingPreviewUrls() {
      if (previewsLoaded || popularSongs.length === 0) return

      const tracksWithoutPreviews = popularSongs.filter((track) => !track.preview_url)

      if (tracksWithoutPreviews.length === 0) {
        setPreviewsLoaded(true)
        return
      }

      const updatedSongs = [...popularSongs]

      for (const track of tracksWithoutPreviews) {
        try {
          if (track.external_url) {
            const trackId = track.external_url.replace("https://open.spotify.com/track/", "")
            const previewData = await fetchTrackPreviewById(trackId)

            if (previewData && previewData.preview_url) {
              const index = updatedSongs.findIndex((t) => t.id === track.id)
              if (index !== -1) {
                updatedSongs[index] = {
                  ...updatedSongs[index],
                  preview_url: previewData.preview_url,
                }
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching preview for track ${track.title}:`, error)
        }
      }

      setPopularSongs(updatedSongs)
      setPreviewsLoaded(true)
    }

    fetchMissingPreviewUrls()
  }, [popularSongs, previewsLoaded])

  // Update the handlePlay function to match the behavior in other components
  const handlePlay = async (song: ArtistSong) => {
    // If clicking the same song that's playing, stop it
    if (currentlyPlaying === song.id) {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      setCurrentlyPlaying(null)
      return
    }

    // If no preview URL but we have an external URL, try to fetch the preview URL
    if (!song.preview_url && song.external_url) {
      try {
        const trackId = extractTrackId(song.external_url)
        if (trackId) {
          const previewData = await fetchTrackPreviewById(trackId)
          if (previewData && previewData.preview_url) {
            // Update the song with the fetched preview URL
            song.preview_url = previewData.preview_url
            console.log(`Successfully fetched preview URL for song: ${song.title}`)

            toast({
              title: "Preview Available",
              description: `Found preview for "${song.title}". Playing now.`,
            })
          } else {
            toast({
              title: "Preview Unavailable",
              description: "No preview is available for this track.",
              variant: "destructive",
            })
            return
          }
        }
      } catch (err) {
        console.error(`Error fetching preview for song ${song.title}:`, err)
        toast({
          title: "Preview Unavailable",
          description: "Could not fetch preview for this track.",
          variant: "destructive",
        })
        return
      }
    }

    // If still no preview URL is available, show a message
    if (!song.preview_url) {
      toast({
        title: "Preview Unavailable",
        description: "No preview is available for this track.",
        variant: "destructive",
      })
      return
    }

    // Try to play with Spotify if external_url exists
    if (song.external_url) {
      const trackUri = song.external_url.replace("https://open.spotify.com/track/", "spotify:track:")

      console.log(`Attempting to play track: ${trackUri} for song: ${song.title}`)

      // Try to play with Spotify API
      playTrack(trackUri)
        .then((success) => {
          if (success) {
            console.log(`Successfully playing ${song.title} with Spotify`)
            setCurrentlyPlaying(song.id)
            toast({
              title: "Now Playing",
              description: `${song.title} by ${song.artist}`,
            })
          } else {
            console.log(`Failed to play with Spotify, falling back to preview URL for ${song.title}`)
            // Fall back to preview URL if Spotify API fails
            playWithPreviewUrl(song)
          }
        })
        .catch((err) => {
          console.error(`Error playing track with Spotify: ${err}`)
          playWithPreviewUrl(song)
        })
    } else {
      // No Spotify URL, use preview URL
      console.log(`No Spotify URL available for ${song.title}, using preview URL`)
      playWithPreviewUrl(song)
    }
  }

  // Helper function for playing with preview URL
  const playWithPreviewUrl = (song: ArtistSong) => {
    // Stop current playback if any
    if (audioRef.current) {
      audioRef.current.pause()
    }

    // Only proceed if we have a preview URL
    if (!song.preview_url) {
      toast({
        title: "Preview Unavailable",
        description: "No preview is available for this track.",
        variant: "destructive",
      })
      return
    }

    // Create new audio element with the preview URL
    console.log(`Playing audio with preview URL: ${song.preview_url} for song: ${song.title}`)

    const audio = new Audio(song.preview_url)
    audioRef.current = audio

    // Add event listeners for better user feedback
    audio.addEventListener("ended", () => {
      console.log(`Playback ended for ${song.title}`)
      setCurrentlyPlaying(null)
    })

    audio.addEventListener("error", (e) => {
      console.error(`Audio error for ${song.title}:`, e)
      setCurrentlyPlaying(null)
      toast({
        title: "Playback Error",
        description: "There was an error playing this track.",
        variant: "destructive",
      })
    })

    // Play audio
    audio
      .play()
      .then(() => {
        console.log(`Successfully playing ${song.title} with HTML Audio`)
        setCurrentlyPlaying(song.id)
      })
      .catch((err) => {
        console.error(`Error playing audio for ${song.title}:`, err)
        setCurrentlyPlaying(null)
        toast({
          title: "Playback Error",
          description: "There was an error playing this track.",
          variant: "destructive",
        })
      })
  }

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [])

  if (!artist) {
    return <div>Artist not found</div>
  }

  // Get the releases to display based on showAllReleases state
  const releasesToDisplay = showAllReleases ? artistReleases : artistReleases.slice(0, initialReleasesToShow)

  return (
    <div className="max-w-[1180px] mx-auto px-4 py-8">
      <div className="mb-8">{/* Artist header space */}</div>

      <div className="grid md:grid-cols-[300px_1fr] gap-12 md:divide-x md:divide-gray-200">
        {/* Left Sidebar */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-center">{artist.name}</h1>
            <hr className="border-t border-gray-200" />
            <div className="relative w-[272px] h-[366px] overflow-hidden rounded-lg mx-auto">
              <Image
                src={artist.image || "/placeholder.svg"}
                alt={`${artist.name} photo`}
                width={272}
                height={366}
                className="object-cover object-center"
                priority
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="font-medium">License enquiries</h2>
            <p className="text-sm text-zinc-600">Interested in licensing the music of {artist.name}</p>
            <Button className="w-full bg-[#F50604] hover:bg-[#D50604] text-white">Contact RMPG now</Button>
          </div>

          <div className="space-y-4">
            <h2 className="font-medium">Connect with {artist.name}</h2>
            {artist.website && (
              <Button variant="outline" className="w-full" asChild>
                <Link
                  href={artist.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  {artist.name}'s website
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
            )}
            <div className="flex gap-4">
              {artist.socials?.spotify && (
                <Link
                  href={artist.socials.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-zinc-600"
                >
                  <Spotify className="h-5 w-5" />
                </Link>
              )}
              {artist.socials?.instagram && (
                <Link
                  href={artist.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#F50604]"
                >
                  <Instagram className="h-5 w-5" />
                </Link>
              )}
              {artist.socials?.youtube && (
                <Link
                  href={artist.socials.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#F50604]"
                >
                  <Youtube className="h-5 w-5" />
                </Link>
              )}
              {artist.socials?.facebook && (
                <Link
                  href={artist.socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#F50604]"
                >
                  <Facebook className="h-5 w-5" />
                </Link>
              )}
              {artist.socials?.twitter && (
                <Link
                  href={artist.socials.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#F50604]"
                >
                  <Twitter className="h-5 w-5" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-12 md:pl-12 divide-y divide-gray-200">
          {/* Popular Songs */}
          <section className="pt-0">
            <h2 className="text-xl font-bold mb-4">Popular Songs</h2>
            {loading ? (
              // Loading skeletons for songs
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-red-500">Failed to load songs. Please try again later.</div>
            ) : popularSongs.length === 0 ? (
              <div className="text-gray-500">No songs available for this artist.</div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {popularSongs.map((song) => (
                  <div key={song.id} className="flex items-center gap-4 group">
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <Image src={song.image || "/placeholder.svg"} alt={song.title} fill className="object-cover" />
                      <button
                        onClick={() => handlePlay(song)}
                        className={`absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity ${!song.preview_url ? "cursor-not-allowed" : ""}`}
                        title={song.preview_url ? "Play preview" : "No preview available"}
                        disabled={!song.preview_url}
                      >
                        {currentlyPlaying === song.id ? (
                          <Pause className="w-6 h-6 text-white" />
                        ) : (
                          <Play className={`w-6 h-6 text-white ${!song.preview_url ? "opacity-50" : ""}`} />
                        )}
                      </button>
                    </div>
                    <div>
                      <Link href={`/songs/${song.slug}`} className="font-medium group-hover:text-[#F50604]">
                        {song.title}
                      </Link>
                      <p className="text-sm text-zinc-600">{song.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* All Releases */}
          <section className="pt-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">All Releases</h2>
              {artistReleases.length > initialReleasesToShow && (
                <Button
                  variant="link"
                  onClick={() => setShowAllReleases(!showAllReleases)}
                  className="text-[#F50604] hover:text-[#D50604]"
                >
                  {showAllReleases ? "Show Less" : "Show All"}
                </Button>
              )}
            </div>

            {loading ? (
              // Loading skeletons for releases
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="aspect-square w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-red-500">Failed to load releases. Please try again later.</div>
            ) : artistReleases.length === 0 ? (
              <div className="text-gray-500">No releases available for this artist.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {releasesToDisplay.map((release) => (
                  <Link key={release.id} href={`/songs/${release.slug}`} className="group">
                    <div className="space-y-2">
                      <div className="relative aspect-square overflow-hidden rounded-lg">
                        <Image
                          src={release.image || "/placeholder.svg"}
                          alt={release.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium group-hover:text-[#F50604]">{release.title}</h3>
                        <div className="flex justify-between">
                          <p className="text-sm text-zinc-600 capitalize">{release.type}</p>
                          <p className="text-sm text-zinc-600">{new Date(release.releaseDate).getFullYear()}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Featured In Playlists */}
          <section className="pt-12">
            <h2 className="text-xl font-bold mb-4">Featured In Playlists</h2>
            {loading ? (
              // Loading skeletons for playlists
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="aspect-square w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                ))}
              </div>
            ) : artistPlaylists.length === 0 && spotifyPlaylists.length === 0 ? (
              <div className="text-gray-500">No playlists featuring this artist.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Show themed playlists */}
                {artistPlaylists.map((playlist) => (
                  <Link key={playlist.id} href={`/playlists/${playlist.slug}`} className="group">
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
                      </div>
                    </div>
                  </Link>
                ))}

                {/* Show Spotify playlists */}
                {spotifyPlaylists.slice(0, 3).map((playlist) => (
                  <a
                    key={playlist.id}
                    href={playlist.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
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
                        <h3 className="font-medium group-hover:text-[#1DB954]">{playlist.name}</h3>
                        <p className="text-sm text-zinc-600 line-clamp-2">{playlist.description}</p>
                        <p className="text-xs text-zinc-500 mt-1">
                          {playlist.tracks} tracks • By {playlist.owner}
                        </p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </section>

          {/* Watch Video */}
          <section className="pt-12">
            <h2 className="text-xl font-bold mb-4">Watch Video</h2>
            <LatestVideo artistName={artist.name} fallbackVideoId={artist.featuredVideoId} />
          </section>
        </div>
      </div>
    </div>
  )
}

// Helper function to extract track ID from Spotify URL
function extractTrackId(url: string): string | null {
  const regex = /track\/([a-zA-Z0-9]+)/
  const match = url.match(regex)
  return match && match[1] ? match[1] : null
}
