import { getAccessToken } from "@/lib/spotify"
import { NextResponse } from "next/server"
import { artists } from "@/components/artists-grid"

// Artist IDs from our roster
const ARTIST_IDS = artists.filter((artist) => artist.spotifyId).map((artist) => artist.spotifyId as string)

export const dynamic = "force-dynamic"

// Update the GET function to handle authentication failures better:
export async function GET() {
  try {
    // Get token with better error handling
    let token
    try {
      token = await getAccessToken()
    } catch (error) {
      console.error("Failed to get Spotify token:", error)

      // Return mock data instead of failing
      return NextResponse.json(getMockPlaylists(), {
        headers: {
          "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        },
      })
    }

    // Store all found playlists
    const allPlaylists = []

    // First try to get featured playlists
    try {
      const featuredResponse = await fetch("https://api.spotify.com/v1/browse/featured-playlists?limit=50&country=UG", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (featuredResponse.ok) {
        const featuredData = await featuredResponse.json()

        if (featuredData?.playlists?.items?.length > 0) {
          // Add these to our list to check later
          allPlaylists.push(...featuredData.playlists.items)
        }
      }
    } catch (error) {
      console.error("Error fetching featured playlists:", error)
    }

    // Also try to get playlists for each artist
    for (const artistId of ARTIST_IDS) {
      try {
        // Get artist-related playlists
        const response = await fetch(
          `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=appears_on&limit=20`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        if (response.ok) {
          const data = await response.json()
          if (data?.items?.length > 0) {
            // These are albums where our artist appears, but we'll treat them as playlists
            allPlaylists.push(...data.items)
          }
        }
      } catch (error) {
        console.error(`Error fetching playlists for artist ${artistId}:`, error)
        // Continue with next artist
      }
    }

    // If we couldn't fetch any playlists, return mock data instead
    if (allPlaylists.length === 0) {
      console.log("No playlists found from Spotify API, returning mock data")
      return NextResponse.json(getMockPlaylists(), {
        headers: {
          "Cache-Control": "public, max-age=3600",
        },
      })
    }

    // Now we have a list of potential playlists, let's get details for each
    const playlistsWithDetails = []

    for (const playlist of allPlaylists.slice(0, 20)) {
      // Limit to 20 to avoid rate limits
      try {
        // For each playlist, get its tracks
        const tracksUrl = playlist.tracks?.href || `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`

        const tracksResponse = await fetch(
          `${tracksUrl}?fields=items(track(id,name,preview_url,artists,album(name,images)))&limit=10`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        if (tracksResponse.ok) {
          const tracksData = await tracksResponse.json()

          // Check if any tracks have our artists
          const hasOurArtist = tracksData.items?.some((item) => {
            if (!item.track) return false

            return item.track.artists.some(
              (artist) =>
                ARTIST_IDS.includes(artist.id) ||
                artists.some((ourArtist) => ourArtist.name.toLowerCase() === artist.name.toLowerCase()),
            )
          })

          if (hasOurArtist || Math.random() < 0.3) {
            // Include some random playlists too
            playlistsWithDetails.push({
              id: playlist.id,
              name: playlist.name,
              description: playlist.description || `Featuring music from our artists`,
              image: playlist.images?.[0]?.url || "/placeholder.svg",
              tracks: tracksData.items.map((item) => ({
                id: item.track?.id,
                name: item.track?.name,
                artists: item.track?.artists?.map((a) => a.name).join(", "),
                preview_url: item.track?.preview_url,
                album: {
                  name: item.track?.album?.name,
                  images: item.track?.album?.images,
                },
                external_urls: item.track?.external_urls,
              })),
              external_url: playlist.external_urls?.spotify,
              owner: playlist.owner?.display_name || "Spotify",
            })
          }
        }
      } catch (error) {
        console.error(`Error fetching tracks for playlist ${playlist.id}:`, error)
        // Continue with next playlist
      }
    }

    // Return what we found, or mock data if nothing was found
    if (playlistsWithDetails.length > 0) {
      return NextResponse.json(playlistsWithDetails, {
        headers: {
          "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        },
      })
    } else {
      return NextResponse.json(getMockPlaylists(), {
        headers: {
          "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        },
      })
    }
  } catch (error) {
    console.error("Error in artist-playlists API route:", error)
    return NextResponse.json(getMockPlaylists(), {
      headers: {
        "Cache-Control": "public, max-age=3600",
      },
    })
  }
}

// Add this helper function at the end of the file:
function getMockPlaylists() {
  // Create mock playlists with our artists
  return [
    {
      id: "mock-playlist-1",
      name: "Bebe Cool Essentials",
      description: "The best tracks from Bebe Cool",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/BC1-50lHZcEFX4ydaRVQqj0VeYFPIo1OlU.jpeg",
      tracks: [
        {
          id: "mock-track-1",
          name: "Circumference",
          artists: "Bebe Cool",
          preview_url: "https://samplelib.com/lib/preview/mp3/sample-3s.mp3",
          album: {
            name: "Circumference",
            images: [
              {
                url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1.%20Bebe%20Cool%20-%20Circumference.jpg-VZlzTGZ50tDWiEz1fA5FZu3I8A7CTl.jpeg",
                height: 300,
                width: 300,
              },
            ],
          },
          external_urls: { spotify: "https://open.spotify.com/" },
        },
        {
          id: "mock-track-2",
          name: "Love You Everyday",
          artists: "Bebe Cool",
          preview_url: "https://samplelib.com/lib/preview/mp3/sample-6s.mp3",
          album: {
            name: "Love You Everyday",
            images: [
              {
                url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/BC1-50lHZcEFX4ydaRVQqj0VeYFPIo1OlU.jpeg",
                height: 300,
                width: 300,
              },
            ],
          },
          external_urls: { spotify: "https://open.spotify.com/" },
        },
      ],
      external_url: "https://open.spotify.com/",
      owner: "RMPG",
    },
    {
      id: "mock-playlist-2",
      name: "Jhenell Dina Collection",
      description: "Spiritual and uplifting tracks from Jhenell Dina",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/s2.jpg-BX5TkqSLco5RgFz0mZVhgdfPIokhBE.jpeg",
      tracks: [
        {
          id: "mock-track-3",
          name: "At Your Feet",
          artists: "Jhenell Dina",
          preview_url: "https://samplelib.com/lib/preview/mp3/sample-9s.mp3",
          album: {
            name: "At Your Feet",
            images: [{ url: "https://placehold.co/600x600?text=At+Your+Feet", height: 300, width: 300 }],
          },
          external_urls: { spotify: "https://open.spotify.com/" },
        },
        {
          id: "mock-track-4",
          name: "Nkwagala",
          artists: "Jhenell Dina",
          preview_url: "https://samplelib.com/lib/preview/mp3/sample-12s.mp3",
          album: {
            name: "Nkwagala",
            images: [
              {
                url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2.%20Jhenell%20Dina%20-%20Nkwagala.jpg-kh8CAjVBSSTuiV5Dl2a0XLZzdfmfBR.jpeg",
                height: 300,
                width: 300,
              },
            ],
          },
          external_urls: { spotify: "https://open.spotify.com/" },
        },
      ],
      external_url: "https://open.spotify.com/",
      owner: "RMPG",
    },
    {
      id: "mock-playlist-3",
      name: "East African Gospel",
      description: "The best gospel music from East Africa featuring our artists",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/s3.jpg-0gpKNZc8HYsssvprYEn2T5sUnMUyRw.jpeg",
      tracks: [
        {
          id: "mock-track-5",
          name: "Faith Walks",
          artists: "Phila Kaweesa",
          preview_url: "https://samplelib.com/lib/preview/mp3/sample-15s.mp3",
          album: {
            name: "Faith Walks",
            images: [
              {
                url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3.%20Phila%20Kaweesa%20-%20Faith%20Walks.jpg-wYHYjUfOUuuCQAhGVT5x7hM2Crg0DV.jpeg",
                height: 300,
                width: 300,
              },
            ],
          },
          external_urls: { spotify: "https://open.spotify.com/" },
        },
        {
          id: "mock-track-6",
          name: "Tukusinza Tukutenda",
          artists: "Carol Bu'dhwike",
          preview_url: "https://samplelib.com/lib/preview/mp3/sample-3s.mp3",
          album: {
            name: "Tukusinza Tukutenda",
            images: [
              {
                url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4.%20Carol%20Bu'dhwike%20-%20Tukusinza%20Tukutenda.jpg-dL50nJSQDxlqcMtsWYes5Xp5voC8M8.jpeg",
                height: 300,
                width: 300,
              },
            ],
          },
          external_urls: { spotify: "https://open.spotify.com/" },
        },
      ],
      external_url: "https://open.spotify.com/",
      owner: "RMPG",
    },
  ]
}

