import { FEATURED_PLAYLIST_IDS } from "@/lib/spotify-playlists"
import { getAccessToken } from "@/lib/spotify"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// Cache for playlist data to avoid repeated API calls
const playlistCache: Record<string, any> = {}

export async function GET() {
  try {
    console.log("Fetching specifically imported playlists...")

    // Check if we have cached data
    const cacheKey = "imported-playlists"
    if (playlistCache[cacheKey]) {
      console.log("Using cached imported playlists data")
      return NextResponse.json(playlistCache[cacheKey], {
        headers: {
          "Cache-Control": "public, max-age=3600",
          "Content-Type": "application/json",
        },
      })
    }

    const token = await getAccessToken()
    const importedPlaylists = []

    // Fetch each playlist in parallel
    const playlistPromises = FEATURED_PLAYLIST_IDS.map(async (playlistId) => {
      try {
        console.log(`Fetching playlist: ${playlistId}`)
        // Get full playlist details including tracks
        const response = await fetch(
          `https://api.spotify.com/v1/playlists/${playlistId}?fields=id,name,description,images,owner.display_name,tracks.total,external_urls,followers.total,tracks.items(track(id,name,artists,album,duration_ms,preview_url,external_urls))`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        if (!response.ok) {
          console.error(`Failed to fetch playlist ${playlistId}: ${response.status}`)
          return null
        }

        const playlist = await response.json()

        // Format tracks data
        const tracks =
          playlist.tracks?.items
            ?.map((item: any) => {
              if (!item.track) return null

              return {
                id: item.track.id,
                name: item.track.name,
                artists: item.track.artists.map((artist: any) => ({
                  id: artist.id,
                  name: artist.name,
                })),
                album: {
                  name: item.track.album.name,
                  images: item.track.album.images,
                },
                duration_ms: item.track.duration_ms,
                preview_url: item.track.preview_url,
                external_urls: item.track.external_urls,
              }
            })
            .filter(Boolean) || []

        return {
          id: playlist.id,
          name: playlist.name,
          description: playlist.description || "Featured playlist",
          image: playlist.images[0]?.url || "/placeholder.svg",
          tracks: {
            total: playlist.tracks?.total || 0,
            items: tracks,
          },
          external_url: playlist.external_urls?.spotify || `https://open.spotify.com/playlist/${playlist.id}`,
          owner: playlist.owner?.display_name || "Spotify",
          followers: playlist.followers?.total || 0,
          imported: true, // Mark as specifically imported
        }
      } catch (error) {
        console.error(`Error fetching playlist ${playlistId}:`, error)
        return null
      }
    })

    // Wait for all playlist fetches to complete
    const results = await Promise.all(playlistPromises)

    // Filter out null results (failed fetches)
    const validPlaylists = results.filter((playlist) => playlist !== null)

    // Cache the results
    playlistCache[cacheKey] = validPlaylists

    return NextResponse.json(validPlaylists, {
      headers: {
        "Cache-Control": "public, max-age=3600",
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Error fetching imported playlists:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch imported playlists",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
