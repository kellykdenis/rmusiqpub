"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

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
  const [artists, setArtists] = useState<Artist[]>(initialArtists)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchArtists() {
      try {
        setLoading(true)
        const response = await fetch("/api/spotify/artists")

        if (!response.ok) {
          throw new Error(`Failed to fetch artists: ${response.status}`)
        }

        const data = await response.json()

        // Merge Spotify data with our existing artist data
        if (data && Array.isArray(data)) {
          // Create a map of our existing artists by Spotify ID for quick lookup
          const existingArtistsMap = initialArtists.reduce(
            (map, artist) => {
              if (artist.spotifyId) {
                map[artist.spotifyId] = artist
              }
              return map
            },
            {} as Record<string, Artist>,
          )

          // Create a map of existing artists by slug for quick lookup
          const existingArtistsBySlug = initialArtists.reduce(
            (map, artist) => {
              map[artist.slug] = artist
              return map
            },
            {} as Record<string, Artist>,
          )

          // Process all artists from Spotify API
          const updatedArtists: Artist[] = []

          // First add our existing artists that match Spotify IDs
          data.forEach((spotifyArtist: SpotifyArtist) => {
            const existingArtist = existingArtistsMap[spotifyArtist.id]

            if (existingArtist) {
              // Update with Spotify data but preserve existing data
              updatedArtists.push({
                ...existingArtist,
                name: spotifyArtist.name,
                image: spotifyArtist.images[0]?.url || existingArtist.image,
                spotifyUrl: spotifyArtist.external_urls.spotify,
                socials: {
                  ...existingArtist.socials,
                  spotify: spotifyArtist.external_urls.spotify,
                },
              })
              // Remove from map to track which ones we've processed
              delete existingArtistsMap[spotifyArtist.id]
            } else {
              // Add new artist from Spotify
              const slug = artistIdToSlugMap[spotifyArtist.id] || `spotify-${spotifyArtist.id}`

              // Check if we already have an artist with this slug
              if (existingArtistsBySlug[slug]) {
                // Update the existing artist
                const existingBySlug = existingArtistsBySlug[slug]
                updatedArtists.push({
                  ...existingBySlug,
                  name: spotifyArtist.name,
                  image: spotifyArtist.images[0]?.url || existingBySlug.image,
                  spotifyId: spotifyArtist.id,
                  spotifyUrl: spotifyArtist.external_urls.spotify,
                  socials: {
                    ...existingBySlug.socials,
                    spotify: spotifyArtist.external_urls.spotify,
                  },
                })
              } else {
                // Create a completely new artist
                updatedArtists.push({
                  id: `spotify-${spotifyArtist.id}`,
                  name: spotifyArtist.name,
                  image: spotifyArtist.images[0]?.url || "/placeholder.svg",
                  slug: slug,
                  website: spotifyArtist.external_urls.spotify,
                  featuredVideoId: "dQw4w9WgXcQ",
                  spotifyId: spotifyArtist.id,
                  spotifyUrl: spotifyArtist.external_urls.spotify,
                  socials: {
                    spotify: spotifyArtist.external_urls.spotify,
                    instagram: `https://instagram.com/${spotifyArtist.name.replace(/\s+/g, "")}`,
                    youtube: `https://youtube.com/@${spotifyArtist.name.replace(/\s+/g, "")}`,
                    facebook: `https://facebook.com/${spotifyArtist.name.replace(/\s+/g, "")}`,
                    twitter: `https://twitter.com/${spotifyArtist.name.replace(/\s+/g, "")}`,
                  },
                  releases: [],
                })
              }
            }
          })

          // Add any remaining existing artists that weren't in the Spotify response
          Object.values(existingArtistsMap).forEach((artist) => {
            updatedArtists.push(artist)
          })

          // Update the global artists array for other components to use
          artists.length = 0
          artists.push(...updatedArtists)

          setArtists(updatedArtists)
          console.log(`Loaded ${updatedArtists.length} artists from Spotify`)
        }
      } catch (err) {
        console.error("Error fetching artists:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
        // Keep using initial artists data on error
      } finally {
        setLoading(false)
      }
    }

    fetchArtists()
  }, [])

  return (
    <div className="max-w-[1180px] mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Artists & Writers</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading
          ? // Show skeletons while loading
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="flex flex-col gap-2">
                <Skeleton className="aspect-[4/3] w-full rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            ))
          : artists.map((artist) => (
              <Link key={artist.slug} href={`/artists-writers/${artist.slug}`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg mb-2">
                  <Image
                    src={artist.image || "/placeholder.svg"}
                    alt={artist.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <h2 className="text-lg font-medium group-hover:text-[#F50604]">{artist.name}</h2>
              </Link>
            ))}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md">
          Error loading artists from Spotify: {error}. Showing local data instead.
        </div>
      )}
    </div>
  )
}

// Export the artists array for use in other components
export const artists = initialArtists

