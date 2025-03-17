"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { MOCK_PLAYLISTS } from "@/lib/spotify"

interface SpotifyPlaylist {
  id: string
  name: string
  description: string
  image: string
  tracks: number
  external_url: string
  owner: string
}

export function SpotifyPlaylists() {
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPlaylists() {
      try {
        setLoading(true)
        const response = await fetch("/api/spotify/playlists", {
          cache: "no-store",
        })

        if (!response.ok) {
          console.warn("Spotify playlists API returned an error, using mock data")
          setPlaylists(MOCK_PLAYLISTS)
          return
        }

        const data = await response.json()

        if (!data || !Array.isArray(data) || data.length === 0) {
          console.warn("Spotify playlists API returned empty data, using mock data")
          setPlaylists(MOCK_PLAYLISTS)
          return
        }

        setPlaylists(data)
      } catch (err) {
        console.error("Error fetching playlists:", err)
        setError("Failed to load playlists. Using sample data instead.")
        // Use mock playlists as fallback if fetch fails completely
        setPlaylists(MOCK_PLAYLISTS)
      } finally {
        setLoading(false)
      }
    }

    fetchPlaylists()
  }, [])

  if (loading) {
    return (
      <section>
        <h2 className="text-2xl font-bold mb-6">Featured Playlists</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (playlists.length === 0) {
    return null
  }

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">{error ? "Sample Playlists" : "Featured Music"}</h2>
      {error && <p className="text-sm text-zinc-500 mb-4">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {playlists.map((playlist) => (
          <a key={playlist.id} href={playlist.external_url} target="_blank" rel="noopener noreferrer" className="group">
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
    </section>
  )
}

