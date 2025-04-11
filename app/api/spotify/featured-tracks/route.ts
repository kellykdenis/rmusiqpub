import { getAccessToken } from "@/lib/spotify"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const token = await getAccessToken()

    // First try to get new releases
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
        })

        const tracksByAlbum = await Promise.all(tracksPromises)
        const allTracks = tracksByAlbum.flat()

        // Get full track details for each track
        const trackDetailsPromises = allTracks.slice(0, 10).map(async (track: any) => {
          const trackResponse = await fetch(`https://api.spotify.com/v1/tracks/${track.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (trackResponse.ok) {
            return trackResponse.json()
          }
          return track
        })

        const tracksWithDetails = await Promise.all(trackDetailsPromises)

        return NextResponse.json(tracksWithDetails, {
          headers: {
            "Cache-Control": "public, max-age=3600",
          },
        })
      }
    }

    // Fallback to featured playlists if new releases fail
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

          return NextResponse.json(tracks, {
            headers: {
              "Cache-Control": "public, max-age=3600",
            },
          })
        }
      }
    }

    // If all else fails, return an empty array
    return NextResponse.json([], {
      status: 404,
      headers: {
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("Error fetching featured tracks:", error)
    return NextResponse.json({ error: "Failed to fetch featured tracks" }, { status: 500 })
  }
}
