"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { allThemedPlaylists } from "@/components/browse-themed-playlists"

interface ThemedPlaylistsProps {
  isLoading?: boolean
}

export function FeaturedPlaylists({ isLoading = false }: ThemedPlaylistsProps) {
  const [playlists, setPlaylists] = useState<typeof allThemedPlaylists>([])

  useEffect(() => {
    // Get playlists and sort by followers (highest to lowest)
    const sortedPlaylists = [...allThemedPlaylists].sort((a, b) => (b.followers || 0) - (a.followers || 0)).slice(0, 4)
    setPlaylists(sortedPlaylists)
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Featured Playlists</h2>

      <div className="grid grid-cols-4 gap-6">
        {isLoading ? (
          // Show skeletons while loading
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))
        ) : playlists.length === 0 ? (
          <div className="col-span-4 text-center text-gray-500 py-8">No playlists available</div>
        ) : (
          playlists.map((playlist) => (
            <Link key={playlist.id} href={`/playlists/${playlist.slug}`} className="group">
              <div className="space-y-2">
                <div className="relative">
                  <div className="relative aspect-square overflow-hidden rounded-lg">
                    <Image
                      src={playlist.image || "/placeholder.svg"}
                      alt={playlist.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium group-hover:text-[#F50604]">{playlist.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{playlist.description}</p>
                  {playlist.followers > 0 && (
                    <p className="text-xs text-zinc-500 mt-1">{playlist.followers.toLocaleString()} followers</p>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="mt-6">
        <Button variant="outline" asChild>
          <Link href="/browse-featured-playlists">Browse Featured Playlists</Link>
        </Button>
      </div>
    </div>
  )
}
