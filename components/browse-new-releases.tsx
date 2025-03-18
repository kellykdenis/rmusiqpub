"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface SpotifyTrack {
  id: string
  name: string
  artists: Array<{ name: string }>
  duration_ms: number
  preview_url: string | null
  external_urls: {
    spotify: string
  }
}

interface SpotifyAlbum {
  id: string
  name: string
  artists: Array<{ name: string }>
  images: Array<{ url: string; height: number; width: number }>
  release_date: string
  album_type: string
  external_urls: {
    spotify: string
  }
  tracks?: {
    items: SpotifyTrack[]
  }
}

interface PaginationData {
  currentPage: number
  totalPages: number
  hasMore: boolean
  totalItems: number
}

// Convert Spotify album to our release format
function convertToRelease(album: SpotifyAlbum) {
  return {
    id: album.id,
    title: album.name,
    artist: album.artists[0]?.name || "Unknown Artist",
    image: album.images[0]?.url || "/placeholder.svg",
    slug: `${album.id}-${album.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    releaseDate: album.release_date,
    recordLabel: "Revered Musiq Publishing",
    spotifyUrl: album.external_urls.spotify,
    type: album.album_type,
    tracks: album.tracks?.items || [],
  }
}

// Global store for all releases
export const allNewReleases: ReturnType<typeof convertToRelease>[] = []

// Global loading state
let isLoadingReleases = false
let releasesLoadPromise: Promise<ReturnType<typeof convertToRelease>[]> | null = null

// Function to fetch all releases at once
export async function fetchAllReleases() {
  // If already loading, return the existing promise
  if (isLoadingReleases && releasesLoadPromise) {
    return releasesLoadPromise
  }

  // If releases are already loaded, return them
  if (allNewReleases.length > 0) {
    return allNewReleases
  }

  // Check if we have cached data in sessionStorage
  if (typeof window !== "undefined") {
    const cachedReleases = sessionStorage.getItem("allNewReleases")
    if (cachedReleases) {
      try {
        const parsed = JSON.parse(cachedReleases)
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log(`Using ${parsed.length} cached releases from sessionStorage`)
          allNewReleases.length = 0
          allNewReleases.push(...parsed)
          return allNewReleases
        }
      } catch (e) {
        console.error("Error parsing cached releases:", e)
      }
    }
  }

  // Set loading state and create promise
  isLoadingReleases = true

  releasesLoadPromise = new Promise<ReturnType<typeof convertToRelease>[]>(async (resolve, reject) => {
    try {
      console.log("Fetching all releases from API...")
      const response = await fetch("/api/spotify/all", {
        cache: "no-store",
      })

      if (!response.ok) {
        let errorMessage = `Failed to fetch all releases: ${response.status} ${response.statusText}`

        try {
          const errorData = await response.json()
          if (errorData.message) {
            errorMessage = errorData.message
          }
        } catch (e) {
          // If we can't parse JSON, use the text content
          const errorText = await response.text()
          errorMessage = errorText || errorMessage
        }

        throw new Error(errorMessage)
      }

      const albums = await response.json()
      console.log(`Received ${albums.length} albums from API`)

      const releases = albums.map(convertToRelease)

      // Update the global store
      allNewReleases.length = 0
      allNewReleases.push(...releases)

      // Cache in sessionStorage for future use
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("allNewReleases", JSON.stringify(releases))
          console.log("Cached releases in sessionStorage")
        } catch (e) {
          console.error("Error caching releases:", e)
        }
      }

      resolve(releases)
    } catch (error) {
      console.error("Error fetching all releases:", error)

      // If we have a network error, set a fallback empty array
      // This allows the UI to show "No releases available" instead of crashing
      allNewReleases.length = 0

      reject(error)
    } finally {
      isLoadingReleases = false
    }
  })

  return releasesLoadPromise
}

// Helper functions for other components
export function getLatestReleases(count: number) {
  if (allNewReleases.length === 0) {
    // If no releases are loaded yet, return empty array
    return []
  }

  return allNewReleases
    .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
    .slice(0, count)
}

export function getArtistReleases(artistName: string, count = 0) {
  if (allNewReleases.length === 0) {
    // If no releases are loaded yet, return empty array
    return []
  }

  const artistReleases = allNewReleases
    .filter((release) => release.artist.toLowerCase() === artistName.toLowerCase())
    .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())

  return count > 0 ? artistReleases.slice(0, count) : artistReleases
}

export function getPopularSongs(artistName: string, count = 6) {
  if (allNewReleases.length === 0) {
    // If no releases are loaded yet, return empty array
    return []
  }

  // Get all releases for this artist
  const artistReleases = getArtistReleases(artistName)

  // Extract all tracks from all releases
  const allTracks = artistReleases.flatMap((release) =>
    (release.tracks || []).map((track) => ({
      id: track.id || `track-${Math.random().toString(36).substring(2, 9)}`,
      title: track.name,
      artist: track.artists?.[0]?.name || artistName,
      image: release.image,
      slug: `${release.slug}#track-${track.id || ""}`,
      releaseDate: release.releaseDate,
      preview_url: track.preview_url,
      external_url: track.external_urls?.spotify,
      duration_ms: track.duration_ms,
    })),
  )

  // Sort by release date (newest first) as a proxy for popularity
  const sortedTracks = allTracks.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())

  // If we don't have enough tracks, we'll just return what we have
  return sortedTracks.slice(0, count)
}

// Initialize releases on module load
if (typeof window !== "undefined") {
  fetchAllReleases().catch(console.error)
}

export function BrowseNewReleases() {
  const [displayedAlbums, setDisplayedAlbums] = useState<ReturnType<typeof convertToRelease>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    hasMore: false,
    totalItems: 0,
  })

  useEffect(() => {
    async function loadReleases() {
      try {
        setLoading(true)
        await fetchAllReleases()

        // Display first page (20 items)
        const firstPageAlbums = allNewReleases.slice(0, 20)
        setDisplayedAlbums(firstPageAlbums)

        // Set up pagination
        setPagination({
          currentPage: 1,
          totalPages: Math.ceil(allNewReleases.length / 20),
          hasMore: allNewReleases.length > 20,
          totalItems: allNewReleases.length,
        })
      } catch (err) {
        console.error("Error loading releases:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    loadReleases()
  }, [])

  const loadMore = () => {
    const nextPageStart = pagination.currentPage * 20
    const nextPageEnd = nextPageStart + 20
    const nextPageAlbums = allNewReleases.slice(nextPageStart, nextPageEnd)

    setDisplayedAlbums((prev) => [...prev, ...nextPageAlbums])
    setPagination((prev) => ({
      ...prev,
      currentPage: prev.currentPage + 1,
      hasMore: nextPageEnd < allNewReleases.length,
    }))
  }

  if (error) {
    return (
      <div className="max-w-[1180px] mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Discover Our Music</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Unable to load releases at this time. Please try again later.</p>
          <p className="text-sm text-red-500 mt-2">Error details: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1180px] mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Discover Our Music</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {displayedAlbums.map((album) => (
          <Link key={album.id} href={`/songs/${album.slug}`} className="group">
            <div className="space-y-2">
              <div className="relative">
                <div className="relative aspect-square overflow-hidden rounded-lg">
                  <Image
                    src={album.image || "/placeholder.svg"}
                    alt={`${album.title} by ${album.artist}`}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              </div>
              <div>
                <div className="text-xs text-zinc-600 mb-1 capitalize">{album.type}</div>
                <h3 className="font-medium truncate group-hover:text-[#F50604]">{album.title}</h3>
                <p className="text-sm text-zinc-600 truncate">{album.artist}</p>
              </div>
            </div>
          </Link>
        ))}

        {loading &&
          Array.from({ length: 20 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="space-y-2">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
      </div>

      {/* Pagination - Show More button */}
      {!loading && pagination.hasMore && (
        <div className="mt-8 flex justify-center">
          <Button onClick={loadMore} variant="outline" className="w-full max-w-xs">
            Show More
          </Button>
        </div>
      )}
    </div>
  )
}

