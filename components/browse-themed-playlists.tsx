"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { additionalPlaylists } from "@/components/mock-data"

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

export function BrowseThemedPlaylists() {
  const [loading, setLoading] = useState(false)
  const [displayedPlaylists, setDisplayedPlaylists] = useState(allThemedPlaylists.slice(0, 8))
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 8,
    hasMore: allThemedPlaylists.length > 8,
  })

  const loadMore = () => {
    setLoading(true)

    // Simulate API loading delay
    setTimeout(() => {
      const nextPageStart = pagination.currentPage * pagination.itemsPerPage
      const nextPageEnd = nextPageStart + pagination.itemsPerPage
      const nextPagePlaylists = allThemedPlaylists.slice(nextPageStart, nextPageEnd)

      setDisplayedPlaylists((prev) => [...prev, ...nextPagePlaylists])
      setPagination((prev) => ({
        ...prev,
        currentPage: prev.currentPage + 1,
        hasMore: nextPageEnd < allThemedPlaylists.length,
      }))

      setLoading(false)
    }, 500)
  }

  return (
    <div className="max-w-[1180px] mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Featured Playlists</h1>

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
              </div>
              <div>
                <h3 className="font-medium group-hover:text-[#F50604]">{playlist.name}</h3>
                <p className="text-sm text-zinc-600 line-clamp-2">{playlist.description}</p>
              </div>
            </div>
          </Link>
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
    </div>
  )
}

