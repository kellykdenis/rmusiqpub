"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { TrackPreview } from "./track-preview"

interface SpotifyArtist {
  id: string
  name: string
  images: Array<{ url: string; height: number; width: number }>
  external_urls: {
    spotify: string
  }
  followers: {
    total: number
  }
  genres: string[]
  popularity: number
}

interface Artist {
  id: string
  name: string
  image: string
  slug: string
  website: string
  featuredVideoId: string
  spotifyId?: string
  spotifyUrl?: string
  socials: {
    spotify: string
    instagram: string
    youtube: string
    facebook: string
    twitter: string
  }
  releases: Array<{
    title: string
    image: string
    slug: string
  }>
}

// Map Spotify artist IDs to our artist slugs
const artistIdToSlugMap: Record<string, string> = {
  "53u06LkxIUGXSn3fCbwfau": "bebe-cool",
  "6x4C5hivCmfL4SIluxGV81": "phila-kaweesa",
  "3I0DLcc9U3sXwCj5RIu1qF": "jhenell-dina",
  "6JgZGZUxAsUWv8o1hcKHRS": "carol-budhwike",
  "2HhbgMesxeJCkAwSSJ8EBy": "johnie-beats",
  "4H6ZO57SwwBU3EySPa9THB": "richy-kaweesa",
  "2sJUTjQmuW1hLhLy7dQtPh": "artist-2sJUTjQmuW1hLhLy7dQtPh",
  "2mToO55cekNJDa4tQx5Ipp": "artist-2mToO55cekNJDa4tQx5Ipp",
  "4AO9uBcZTJbn4EhaZlL8gX": "artist-4AO9uBcZTJbn4EhaZlL8gX",
  "6OPe0VU4tE6WsIyYZatf1l": "artist-6OPe0VU4tE6WsIyYZatf1l",
  "2CzPnR1jSDtjM3ZEiRl3pX": "artist-2CzPnR1jSDtjM3ZEiRl3pX",
  "4jY6R19KcBOgfVoYcFRGmx": "artist-4jY6R19KcBOgfVoYcFRGmx",
  "439cAFpgGsd10FGSviU0sF": "artist-439cAFpgGsd10FGSviU0sF",
  "74irFmh7k7vfTa2QXwI729": "artist-74irFmh7k7vfTa2QXwI729",
  "6d7TH1WmN4YI15WAygkuMR": "artist-6d7TH1WmN4YI15WAygkuMR",
  "6nTXL0DkmSqjvcKjn6hCUz": "artist-6nTXL0DkmSqjvcKjn6hCUz",
  "0ETh62E8XafPUn9uCQeriQ": "artist-0ETh62E8XafPUn9uCQeriQ",
  "5lkIhrZsXArI4PMzEPr4BU": "artist-5lkIhrZsXArI4PMzEPr4BU",
  "4Dvh0aMCIBySKye4a8O2UB": "artist-4Dvh0aMCIBySKye4a8O2UB",
  "1tLHxC9BSAUZBtKbK6qdgc": "artist-1tLHxC9BSAUZBtKbK6qdgc",
  "5A4WNUoNE2OHg8hbn0wzDi": "artist-5A4WNUoNE2OHg8hbn0wzDi",
}

// Initial artists data (will be merged with Spotify data)
const initialArtists: Artist[] = [
  {
    id: "1",
    name: "Bebe Cool",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/BC1-50lHZcEFX4ydaRVQqj0VeYFPIo1OlU.jpeg",
    slug: "bebe-cool",
    website: "https://bebecool.co.ug",
    featuredVideoId: "dQw4w9WgXcQ",
    spotifyId: "53u06LkxIUGXSn3fCbwfau",
    socials: {
      spotify: "https://open.spotify.com/artist/53u06LkxIUGXSn3fCbwfau",
      instagram: "https://instagram.com/bebecoolug",
      youtube: "https://youtube.com/@bebecool",
      facebook: "https://facebook.com/bebecool",
      twitter: "https://twitter.com/bebecoolug",
    },
    releases: [
      {
        title: "Circumference",
        image:
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1.%20Bebe%20Cool%20-%20Circumference.jpg-VZlzTGZ50tDWiEz1fA5FZu3I8A7CTl.jpeg",
        slug: "circumference",
      },
    ],
  },
  {
    id: "2",
    name: "Jhenell Dina",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/s2.jpg-BX5TkqSLco5RgFz0mZVhgdfPIokhBE.jpeg",
    slug: "jhenell-dina",
    website: "https://jhenelldina.com",
    featuredVideoId: "dQw4w9WgXcQ",
    spotifyId: "3I0DLcc9U3sXwCj5RIu1qF",
    socials: {
      spotify: "https://open.spotify.com/artist/3I0DLcc9U3sXwCj5RIu1qF",
      instagram: "https://instagram.com/jhenelldina",
      youtube: "https://youtube.com/@jhenelldina",
      facebook: "https://facebook.com/jhenelldina",
      twitter: "https://twitter.com/jhenelldina",
    },
    releases: [
      {
        title: "At Your Feet",
        image: "https://placehold.co/600x600?text=At+Your+Feet",
        slug: "at-your-feet",
      },
      {
        title: "Your Way",
        image: "https://placehold.co/600x600?text=Your+Way",
        slug: "your-way",
      },
      {
        title: "Bless Me",
        image: "https://placehold.co/600x600?text=Bless+Me",
        slug: "bless-me",
      },
      {
        title: "Mighty Warrior",
        image: "https://placehold.co/600x600?text=Mighty+Warrior",
        slug: "mighty-warrior",
      },
      {
        title: "Trust (Alive Again Riddim)",
        image: "https://placehold.co/600x600?text=Trust",
        slug: "trust",
      },
      {
        title: "Ffe'Abaliko",
        image: "https://placehold.co/600x600?text=Ffe+Abaliko",
        slug: "ffe-abaliko",
      },
      {
        title: "Nkwagala",
        image:
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2.%20Jhenell%20Dina%20-%20Nkwagala.jpg-kh8CAjVBSSTuiV5Dl2a0XLZzdfmfBR.jpeg",
        slug: "nkwagala",
      },
    ],
  },
  {
    id: "3",
    name: "Phila Kaweesa",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/s3.jpg-0gpKNZc8HYsssvprYEn2T5sUnMUyRw.jpeg",
    slug: "phila-kaweesa",
    website: "https://philakaweesa.com",
    featuredVideoId: "dQw4w9WgXcQ",
    spotifyId: "6x4C5hivCmfL4SIluxGV81",
    socials: {
      spotify: "https://open.spotify.com/artist/6x4C5hivCmfL4SIluxGV81",
      instagram: "https://instagram.com/philakaweesa",
      youtube: "https://youtube.com/@philakaweesa",
      facebook: "https://facebook.com/philakaweesa",
      twitter: "https://twitter.com/philakaweesa",
    },
    releases: [
      {
        title: "Faith Walks",
        image:
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3.%20Phila%20Kaweesa%20-%20Faith%20Walks.jpg-wYHYjUfOUuuCQAhGVT5x7hM2Crg0DV.jpeg",
        slug: "faith-walks",
      },
    ],
  },
  {
    id: "4",
    name: "Carol Bu'dhwike",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4.%20Carol%20Bu'dhwike%20-%20Tukusinza%20Tukutenda.jpg-dL50nJSQDxlqcMtsWYes5Xp5voC8M8.jpeg",
    slug: "carol-budhwike",
    website: "https://carolbudhwike.com",
    featuredVideoId: "dQw4w9WgXcQ",
    spotifyId: "6JgZGZUxAsUWv8o1hcKHRS",
    socials: {
      spotify: "https://open.spotify.com/artist/6JgZGZUxAsUWv8o1hcKHRS",
      instagram: "https://instagram.com/carolbudhwike",
      youtube: "https://youtube.com/@carolbudhwike",
      facebook: "https://facebook.com/carolbudhwike",
      twitter: "https://twitter.com/carolbudhwike",
    },
    releases: [
      {
        title: "Tukusinza Tukutenda",
        image:
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4.%20Carol%20Bu'dhwike%20-%20Tukusinza%20Tukutenda.jpg-dL50nJSQDxlqcMtsWYes5Xp5voC8M8.jpeg",
        slug: "tukusinza-tukutenda",
      },
    ],
  },
  {
    id: "5",
    name: "Johnie Beats",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5.%20Alive%20Again%20-%20Johnie%20Beats.jpg-pFT2A8jb9GoR6CdRybcUGsUI4C9m9G.jpeg",
    slug: "johnie-beats",
    website: "https://johniebeats.com",
    featuredVideoId: "dQw4w9WgXcQ",
    spotifyId: "2HhbgMesxeJCkAwSSJ8EBy",
    socials: {
      spotify: "https://open.spotify.com/artist/2HhbgMesxeJCkAwSSJ8EBy",
      instagram: "https://instagram.com/johniebeats",
      youtube: "https://youtube.com/@johniebeats",
      facebook: "https://facebook.com/johniebeats",
      twitter: "https://twitter.com/johniebeats",
    },
    releases: [
      {
        title: "Alive Again (Remastered)",
        image:
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5.%20Alive%20Again%20-%20Johnie%20Beats.jpg-pFT2A8jb9GoR6CdRybcUGsUI4C9m9G.jpeg",
        slug: "alive-again-remastered",
      },
    ],
  },
  {
    id: "6",
    name: "Richy Kaweesa",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/6.%20Richy%20Kaweesa%20-%20Kings%20&%20Queens.jpg-LsYI8KU9bBOZgXbB9PkMvWIpaZpREr.jpeg",
    slug: "richy-kaweesa",
    website: "https://richykaweesa.com",
    featuredVideoId: "dQw4w9WgXcQ",
    spotifyId: "4H6ZO57SwwBU3EySPa9THB",
    socials: {
      spotify: "https://open.spotify.com/artist/4H6ZO57SwwBU3EySPa9THB",
      instagram: "https://instagram.com/richykaweesa",
      youtube: "https://youtube.com/@richykaweesa",
      facebook: "https://facebook.com/richykaweesa",
      twitter: "https://twitter.com/richykaweesa",
    },
    releases: [
      {
        title: "Kings & Queens",
        image:
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/6.%20Richy%20Kaweesa%20-%20Kings%20&%20Queens.jpg-LsYI8KU9bBOZgXbB9PkMvWIpaZpREr.jpeg",
        slug: "kings-and-queens",
      },
    ],
  },
]

export function ArtistsGrid() {
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null)
  const [topTracks, setTopTracks] = useState<any[]>([])

  useEffect(() => {
    async function fetchArtists() {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch("/api/spotify/artists")
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.details || "Failed to fetch artists")
        }

        const data = await response.json()
        setArtists(data)
      } catch (err) {
        console.error("Error fetching artists:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch artists")
      } finally {
        setLoading(false)
      }
    }

    fetchArtists()
  }, [])

  useEffect(() => {
    async function fetchTopTracks() {
      if (!selectedArtist) return

      try {
        const response = await fetch(`/api/spotify/artists/${selectedArtist.id}/top-tracks`)
        if (!response.ok) throw new Error("Failed to fetch top tracks")
        
        const data = await response.json()
        setTopTracks(data.tracks || [])
      } catch (err) {
        console.error("Error fetching top tracks:", err)
      }
    }

    fetchTopTracks()
  }, [selectedArtist])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {artists.map((artist) => (
          <div
            key={artist.id}
            className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            onClick={() => setSelectedArtist(artist)}
          >
            <div className="aspect-square relative">
              <Image
                src={artist.image || "/placeholder.svg"}
                alt={artist.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg truncate">{artist.name}</h3>
              <p className="text-sm text-gray-600">
                {artist.releases[0]?.title || "No releases found"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {selectedArtist && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">{selectedArtist.name}'s Top Tracks</h2>
          <div className="space-y-4">
            {topTracks.map((track) => (
              <div
                key={track.id}
                className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
              >
                <div className="flex items-center space-x-4">
                  <Image
                    src={track.album.images[0]?.url || "/placeholder.svg"}
                    alt={track.name}
                    width={48}
                    height={48}
                    className="rounded"
                  />
                  <div>
                    <h3 className="font-medium">{track.name}</h3>
                    <p className="text-sm text-gray-600">{track.album.name}</p>
                  </div>
                </div>
                <TrackPreview previewUrl={track.preview_url} trackName={track.name} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Export the artists array for use in other components
export const artists = initialArtists

