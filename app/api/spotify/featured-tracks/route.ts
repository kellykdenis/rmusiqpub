import { getAccessToken } from "@/lib/spotify"
import { NextResponse } from "next/server"

// Sample tracks to use as fallback
const FALLBACK_TRACKS = [
  {
    id: "fallback1",
    name: "Sample Track 1",
    artists: [{ name: "Sample Artist" }],
    album: {
      name: "Sample Album",
      images: [{ url: "/placeholder.svg?height=300&width=300", height: 300, width: 300 }],
    },
    preview_url: "https://samplelib.com/lib/preview/mp3/sample-3s.mp3",
    external_urls: { spotify: "https://open.spotify.com/" },
  },
  {
    id: "fallback2",
    name: "Sample Track 2",
    artists: [{ name: "Sample Artist" }],
    album: {
      name: "Sample Album",
      images: [{ url: "/placeholder.svg?height=300&width=300", height: 300, width: 300 }],
    },
    preview_url: "https://samplelib.com/lib/preview/mp3/sample-6s.mp3",
    external_urls: { spotify: "https://open.spotify.com/" },
  },
  {
    id: "fallback3",
    name: "Sample Track 3",
    artists: [{ name: "Sample Artist" }],
    album: {
      name: "Sample Album",
      images: [{ url: "/placeholder.svg?height=300&width=300", height: 300, width: 300 }],
    },
    preview_url: "https://samplelib.com/lib/preview/mp3/sample-9s.mp3",
    external_urls: { spotify: "https://open.spotify.com/" },
  },
]

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Try to get token, but handle errors gracefully
    let token
    try {
      token = await getAccessToken()
    } catch (error) {
      console.error("Failed to get Spotify token:", error)
      // Return fallback tracks
      return NextResponse.json(FALLBACK_TRACKS, {
        headers: { "Cache-Control": "public, max-age=3600" },
      })
    }

    // First try to get new releases
    try {
      const newReleasesResponse = await fetch("https://api.spotify.com/v1/browse/new-releases?limit=10&country=UG", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (newReleasesResponse.ok) {
        const newReleasesData = await newReleasesResponse.json()

        if (newReleasesData?.albums?.items?.length > 0) {
          // Get the first few album IDs
          const albumIds = newReleasesData.albums.items.slice(0, 5).map((album: any) => album.id)

          // Fetch tracks for each album
          const tracksPromises = albumIds.map(async (albumId: string) => {
            try {
              const tracksResponse = await fetch(`https://api.spotify.com/v1/albums/${albumId}/tracks?limit=2`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              })

              if (tracksResponse.ok) {
                const tracksData = await tracksResponse.json()
                return tracksData.items || []
              }
              return []
            } catch (error) {
              console.error(`Error fetching tracks for album ${albumId}:`, error)
              return []
            }
          })

          const tracksByAlbum = await Promise.all(tracksPromises)
          const allTracks = tracksByAlbum.flat()

          if (allTracks.length > 0) {
            // Get full track details for each track
            const trackDetailsPromises = allTracks.slice(0, 10).map(async (track: any) => {
              try {
                const trackResponse = await fetch(`https://api.spotify.com/v1/tracks/${track.id}`, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                })

                if (trackResponse.ok) {
                  return trackResponse.json()
                }
                return track
              } catch (error) {
                console.error(`Error fetching details for track ${track.id}:`, error)
                return track
              }
            })

            const tracksWithDetails = await Promise.all(trackDetailsPromises)

            if (tracksWithDetails.length > 0) {
              return NextResponse.json(tracksWithDetails, {
                headers: {
                  "Cache-Control": "public, max-age=3600",
                },
              })
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching new releases:", error)
      // Continue to fallback
    }

    // Fallback to featured playlists if new releases fail
    try {
      const featuredResponse = await fetch("https://api.spotify.com/v1/browse/featured-playlists?limit=1&country=UG", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (featuredResponse.ok) {
        const featuredData = await featuredResponse.json()

        if (featuredData?.playlists?.items?.length > 0) {
          const playlistId = featuredData.playlists.items[0].id

          const playlistTracksResponse = await fetch(
            `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=10`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          )

          if (playlistTracksResponse.ok) {
            const playlistTracksData = await playlistTracksResponse.json()
            const tracks = playlistTracksData.items.map((item: any) => item.track).filter(Boolean)

            if (tracks.length > 0) {
              return NextResponse.json(tracks, {
                headers: {
                  "Cache-Control": "public, max-age=3600",
                },
              })
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching featured playlists:", error)
      // Continue to fallback
    }

    // If all else fails, return fallback tracks
    return NextResponse.json(FALLBACK_TRACKS, {
      headers: {
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (error) {
    console.error("Error fetching featured tracks:", error)
    return NextResponse.json(FALLBACK_TRACKS, {
      headers: {
        "Cache-Control": "public, max-age=3600",
      },
    })
  }
}

