"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

export interface ThemedPlaylist {
  id: string
  name: string
  description: string
  image: string
  slug: string
  type: string
  created: string
  totalTracks: number
  owner: string
  spotifyUrl?: string
  featuredArtist?: string
  genreBased?: boolean
  spotifyId?: string
  matchScore?: number
  followers?: number
  relevanceScore?: number
}

export const allThemedPlaylists: ThemedPlaylist[] = [
  {
    id: "1",
    name: "Gospel Hits",
    description: "The best gospel music featuring our top artists",
    image: "https://placehold.co/600x600?text=Gospel+Hits",
    slug: "gospel-hits",
    type: "Themed Playlists",
    created: "2024-01-15",
    totalTracks: 25,
    owner: "Denise Carlos - RMPG,Uganda",
    followers: 1500,
    relevanceScore: 100,
  },
  {
    id: "2",
    name: "East African Hits",
    description: "Top hits from East Africa featuring our artists",
    image: "https://placehold.co/600x600?text=East+African+Hits",
    slug: "east-african-hits",
    type: "Themed Playlists",
    created: "2024-01-20",
    totalTracks: 30,
    owner: "Denise Carlos - RMPG,Uganda",
    followers: 2200,
    relevanceScore: 100,
  },
  {
    id: "3",
    name: "Worship Experience",
    description: "A powerful worship experience with our artists",
    image: "https://placehold.co/600x600?text=Worship+Experience",
    slug: "worship-experience",
    type: "Themed Playlists",
    created: "2024-01-25",
    totalTracks: 28,
    owner: "Denise Carlos - RMPG,Uganda",
    followers: 1800,
    relevanceScore: 100,
  },
  {
    id: "4",
    name: "RMPG Essentials",
    description: "Essential tracks from all RMPG artists",
    image: "https://placehold.co/600x600?text=RMPG+Essentials",
    slug: "rmpg-essentials",
    type: "Themed Playlists",
    created: "2024-01-30",
    totalTracks: 50,
    owner: "Denise Carlos - RMPG,Uganda",
    followers: 3500,
    relevanceScore: 100,
  },
  {
    id: "5",
    name: "Love Ballads",
    description: "The most romantic love songs by our artists",
    image: "https://placehold.co/600x600?text=Love+Ballads",
    slug: "love-ballads",
    type: "Themed Playlists",
    created: "2024-02-05",
    totalTracks: 15,
    owner: "Denise Carlos - RMPG,Uganda",
    followers: 1200,
    relevanceScore: 100,
  },
  {
    id: "6",
    name: "Afrobeat Anthems",
    description: "The best Afrobeat tracks from our top artists",
    image: "https://placehold.co/600x600?text=Afrobeat+Anthems",
    slug: "afrobeat-anthems",
    type: "Themed Playlists",
    created: "2024-02-10",
    totalTracks: 20,
    owner: "Denise Carlos - RMPG,Uganda",
    followers: 2800,
    relevanceScore: 100,
  },
  {
    id: "7",
    name: "Inspirational Gospel",
    description: "Uplifting gospel songs to inspire your day",
    image: "https://placehold.co/600x600?text=Inspirational+Gospel",
    slug: "inspirational-gospel",
    type: "Themed Playlists",
    created: "2024-02-15",
    totalTracks: 18,
    owner: "Denise Carlos - RMPG,Uganda",
    followers: 1600,
    relevanceScore: 100,
  },
  {
    id: "8",
    name: "Acoustic Worship",
    description: "Intimate acoustic worship sessions with our artists",
    image: "https://placehold.co/600x600?text=Acoustic+Worship",
    slug: "acoustic-worship",
    type: "Themed Playlists",
    created: "2024-02-20",
    totalTracks: 12,
    owner: "Denise Carlos - RMPG,Uganda",
    followers: 900,
    relevanceScore: 100,
  },
]

export function BrowseThemedPlaylists() {
  const [loading, setLoading] = useState(true)
  const [displayedPlaylists, setDisplayedPlaylists] = useState<ThemedPlaylist[]>([])
  const [allPlaylists, setAllPlaylists] = useState<ThemedPlaylist[]>([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 12,
    hasMore: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [artistFilter, setArtistFilter] = useState<string | null>(null)
  const [artistOptions, setArtistOptions] = useState<{ name: string; id: string }[]>([])
  const [sortOption, setSortOption] = useState<string>("followers")
  const [minRelevance, setMinRelevance] = useState<number>(20) // Minimum relevance score filter

  useEffect(() => {
    async function fetchArtistOptions() {
      try {
        const response = await fetch("/api/spotify/artists")
        if (response.ok) {
          const data = await response.json()
          if (Array.isArray(data)) {
            const options = data
              .map((artist) => ({
                name: artist.name,
                id: artist.id,
              }))
              .sort((a, b) => a.name.localeCompare(b.name))
            setArtistOptions(options)
          }
        }
      } catch (error) {
        console.error("Error fetching artist options:", error)
      }
    }

    fetchArtistOptions()
  }, [])

  useEffect(() => {
    async function fetchDiscoveredPlaylists() {
      try {
        setLoading(true)
        const response = await fetch(`/api/spotify/playlists/discovered?refresh=true&minScore=${minRelevance}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch discovered playlists: ${response.status}`)
        }

        const data = await response.json()

        // Check if data is an array before proceeding
        if (Array.isArray(data)) {
          console.log(`Fetched ${data.length} discovered playlists`)

          // Format the discovered playlists with null checks
          const formattedPlaylists = data
            .filter((playlist) => playlist && playlist.id) // Filter out null or invalid playlists
            .map((playlist) => ({
              id: `discovered-${playlist.id}`,
              name: playlist.name || "Unnamed Playlist",
              description: playlist.description || `Featuring ${playlist.featuredArtist || "Various Artists"}`,
              image: playlist.image || "/placeholder.svg",
              slug: `discovered-${playlist.id}`,
              type: "Discovered Playlist",
              created: new Date().toISOString().split("T")[0],
              totalTracks: playlist.tracks || 0,
              owner: playlist.owner || "Spotify",
              spotifyUrl: playlist.external_url || "",
              featuredArtist: playlist.featuredArtist || "Various Artists",
              genreBased: playlist.genreBased || false,
              spotifyId: playlist.id,
              matchScore: playlist.matchScore || 0,
              followers: playlist.followers || 0,
              relevanceScore: playlist.relevanceScore || 0,
            }))

          // Sort playlists by followers count (highest to lowest)
          const sortedPlaylists = sortPlaylists(formattedPlaylists, sortOption)

          // Store all playlists
          setAllPlaylists(sortedPlaylists)

          // Set displayed playlists
          setDisplayedPlaylists(sortedPlaylists.slice(0, pagination.itemsPerPage))
          setPagination({
            ...pagination,
            hasMore: sortedPlaylists.length > pagination.itemsPerPage,
          })
        } else {
          // If data is not an array, use themed playlists as fallback
          console.warn("Discovered playlists API did not return an array, using fallback data")
          const sortedFallbackPlaylists = sortPlaylists(allThemedPlaylists, sortOption)
          setAllPlaylists(sortedFallbackPlaylists)
          setDisplayedPlaylists(sortedFallbackPlaylists.slice(0, pagination.itemsPerPage))
          setPagination({
            ...pagination,
            hasMore: sortedFallbackPlaylists.length > pagination.itemsPerPage,
          })
        }
      } catch (err) {
        console.error("Error fetching discovered playlists:", err)
        setError(err instanceof Error ? err.message : "An error occurred")

        // Use themed playlists as fallback
        const sortedFallbackPlaylists = sortPlaylists(allThemedPlaylists, sortOption)
        setAllPlaylists(sortedFallbackPlaylists)
        setDisplayedPlaylists(sortedFallbackPlaylists.slice(0, pagination.itemsPerPage))
        setPagination({
          ...pagination,
          hasMore: sortedFallbackPlaylists.length > pagination.itemsPerPage,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDiscoveredPlaylists()
  }, [sortOption, minRelevance])

  // Function to sort playlists based on the selected option
  const sortPlaylists = (playlists: ThemedPlaylist[], sortBy: string) => {
    switch (sortBy) {
      case "followers":
        return [...playlists].sort((a, b) => (b.followers || 0) - (a.followers || 0))
      case "tracks":
        return [...playlists].sort((a, b) => b.totalTracks - a.totalTracks)
      case "name":
        return [...playlists].sort((a, b) => a.name.localeCompare(b.name))
      case "newest":
        return [...playlists].sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
      case "relevance":
        return [...playlists].sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
      default:
        return [...playlists].sort((a, b) => (b.followers || 0) - (a.followers || 0))
    }
  }

  // Handle sort change
  const handleSortChange = (option: string) => {
    setSortOption(option)
    setLoading(true)

    // Sort the existing playlists without fetching again
    const sortedPlaylists = sortPlaylists(allPlaylists, option)
    setAllPlaylists(sortedPlaylists)

    // Reset pagination
    setDisplayedPlaylists(sortedPlaylists.slice(0, pagination.itemsPerPage))
    setPagination({
      currentPage: 1,
      itemsPerPage: 12,
      hasMore: sortedPlaylists.length > pagination.itemsPerPage,
    })

    setLoading(false)
  }

  // Handle relevance filter change
  const handleRelevanceChange = (value: number) => {
    setMinRelevance(value)
    // The useEffect will trigger a new fetch with the updated minRelevance
  }

  const loadMore = () => {
    setLoading(true)

    // Calculate next page
    const nextPageStart = pagination.currentPage * pagination.itemsPerPage
    const nextPageEnd = nextPageStart + pagination.itemsPerPage

    let filteredPlaylists = allPlaylists

    // Apply search filter if searching
    if (isSearching) {
      filteredPlaylists = filteredPlaylists.filter((playlist) => {
        const matchesSearch = searchTerm
          ? playlist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            playlist.description.toLowerCase().includes(searchTerm.toLowerCase())
          : true

        const matchesArtist = artistFilter
          ? playlist.featuredArtist && playlist.featuredArtist.toLowerCase().includes(artistFilter.toLowerCase())
          : true

        return matchesSearch && matchesArtist
      })
    }

    const nextPagePlaylists = filteredPlaylists.slice(nextPageStart, nextPageEnd)

    setDisplayedPlaylists((prev) => [...prev, ...nextPagePlaylists])
    setPagination((prev) => ({
      ...prev,
      currentPage: prev.currentPage + 1,
      hasMore: nextPageEnd < filteredPlaylists.length,
    }))

    setLoading(false)
  }

  const handleSearch = () => {
    setIsSearching(true)
    setLoading(true)

    let filteredPlaylists = allPlaylists

    // Apply search and artist filters
    filteredPlaylists = filteredPlaylists.filter((playlist) => {
      const matchesSearch = searchTerm
        ? playlist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          playlist.description.toLowerCase().includes(searchTerm.toLowerCase())
        : true

      const matchesArtist = artistFilter
        ? playlist.featuredArtist && playlist.featuredArtist.toLowerCase().includes(artistFilter.toLowerCase())
        : true

      return matchesSearch && matchesArtist
    })

    setDisplayedPlaylists(filteredPlaylists.slice(0, pagination.itemsPerPage))
    setPagination({
      currentPage: 1,
      itemsPerPage: 12,
      hasMore: filteredPlaylists.length > 12,
    })

    setLoading(false)
  }

  const clearSearch = () => {
    setSearchTerm("")
    setArtistFilter(null)
    setIsSearching(false)

    // Reset to initial state
    setLoading(true)

    // Use the already fetched playlists
    setDisplayedPlaylists(allPlaylists.slice(0, pagination.itemsPerPage))
    setPagination({
      currentPage: 1,
      itemsPerPage: 12,
      hasMore: allPlaylists.length > 12,
    })

    setLoading(false)
  }

  // Function to get badge color based on relevance score
  const getRelevanceBadgeVariant = (score: number | undefined) => {
    if (!score) return "outline"
    if (score >= 70) return "imported" // Green
    if (score >= 40) return "secondary" // Yellow
    return "destructive" // Red
  }

  return (
    <div className="max-w-[1180px] mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Discovered Playlists</h1>
      <p className="text-zinc-600 mb-6">Playlists from across Spotify that feature our artists and their music</p>

      {/* Search, filter, and sort controls */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Playlists
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by name or description"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="w-full md:w-64">
            <label htmlFor="artist-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Artist
            </label>
            <select
              id="artist-filter"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={artistFilter || ""}
              onChange={(e) => setArtistFilter(e.target.value || null)}
            >
              <option value="">All Artists</option>
              {artistOptions.map((artist) => (
                <option key={artist.id} value={artist.name}>
                  {artist.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <Button onClick={handleSearch} className="bg-[#F50604] hover:bg-[#D50604] text-white">
              Search
            </Button>
            <Button variant="outline" onClick={clearSearch}>
              Clear
            </Button>
          </div>
        </div>

        {/* Sort options */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
          <label htmlFor="sort-by" className="text-sm font-medium text-gray-700">
            Sort by:
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={sortOption === "followers" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSortChange("followers")}
              className={sortOption === "followers" ? "bg-[#F50604] hover:bg-[#D50604]" : ""}
            >
              Most Popular
            </Button>
            <Button
              variant={sortOption === "relevance" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSortChange("relevance")}
              className={sortOption === "relevance" ? "bg-[#F50604] hover:bg-[#D50604]" : ""}
            >
              Most Relevant
            </Button>
            <Button
              variant={sortOption === "tracks" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSortChange("tracks")}
              className={sortOption === "tracks" ? "bg-[#F50604] hover:bg-[#D50604]" : ""}
            >
              Most Tracks
            </Button>
            <Button
              variant={sortOption === "newest" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSortChange("newest")}
              className={sortOption === "newest" ? "bg-[#F50604] hover:bg-[#D50604]" : ""}
            >
              Newest
            </Button>
            <Button
              variant={sortOption === "name" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSortChange("name")}
              className={sortOption === "name" ? "bg-[#F50604] hover:bg-[#D50604]" : ""}
            >
              Alphabetical
            </Button>
          </div>
        </div>

        {/* Relevance filter */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <label htmlFor="relevance-filter" className="text-sm font-medium text-gray-700">
            Minimum relevance:
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={minRelevance === 0 ? "default" : "outline"}
              size="sm"
              onClick={() => handleRelevanceChange(0)}
              className={minRelevance === 0 ? "bg-[#F50604] hover:bg-[#D50604]" : ""}
            >
              All
            </Button>
            <Button
              variant={minRelevance === 20 ? "default" : "outline"}
              size="sm"
              onClick={() => handleRelevanceChange(20)}
              className={minRelevance === 20 ? "bg-[#F50604] hover:bg-[#D50604]" : ""}
            >
              Low (20%+)
            </Button>
            <Button
              variant={minRelevance === 40 ? "default" : "outline"}
              size="sm"
              onClick={() => handleRelevanceChange(40)}
              className={minRelevance === 40 ? "bg-[#F50604] hover:bg-[#D50604]" : ""}
            >
              Medium (40%+)
            </Button>
            <Button
              variant={minRelevance === 70 ? "default" : "outline"}
              size="sm"
              onClick={() => handleRelevanceChange(70)}
              className={minRelevance === 70 ? "bg-[#F50604] hover:bg-[#D50604]" : ""}
            >
              High (70%+)
            </Button>
          </div>
        </div>
      </div>

      {displayedPlaylists.length === 0 && !loading ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-medium mb-2">No playlists found</h3>
          <p className="text-zinc-600 mb-4">We couldn't find any playlists matching your criteria.</p>
          <Button onClick={clearSearch} variant="outline">
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedPlaylists.map((playlist) => (
            <Link key={playlist.id} href={`/playlists/${playlist.slug}`} className="group">
              <div className="space-y-2">
                <div className="relative aspect-square overflow-hidden rounded-lg">
                  <Image
                    src={playlist.image || "/placeholder.svg"}
                    alt={playlist.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  {playlist.featuredArtist && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 truncate">
                      {playlist.featuredArtist}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium group-hover:text-[#F50604] truncate">{playlist.name}</h3>
                    {playlist.relevanceScore !== undefined && (
                      <Badge variant={getRelevanceBadgeVariant(playlist.relevanceScore)} className="text-xs">
                        {playlist.relevanceScore.toFixed(0)}%
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-zinc-600 line-clamp-2">{playlist.description}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-zinc-500">{playlist.totalTracks} tracks</p>
                    <p className="text-xs text-zinc-500">{playlist.owner}</p>
                  </div>
                  {playlist.followers > 0 && (
                    <p className="text-xs text-zinc-500 mt-1">{playlist.followers.toLocaleString()} followers</p>
                  )}
                </div>
              </div>
            </Link>
          ))}

          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="space-y-2">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
        </div>
      )}

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
          Error loading playlists: {error}. Showing local data instead.
        </div>
      )}
    </div>
  )
}
