import { getAccessToken } from "@/lib/spotify"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// Cache for playlist data to avoid repeated API calls
const playlistCache: Record<string, any> = {}

export async function GET(request: Request, { params }: { params: { playlistId: string } }) {
  try {
    const { playlistId } = params
    console.log(`Fetching discovered playlist: ${playlistId}`)

    // Check if we have cached data
    if (playlistCache[playlistId]) {
      console.log(`Using cached data for playlist ${playlistId}`)
      return NextResponse.json(playlistCache[playlistId], {
        headers: {
          "Cache-Control": "public, max-age=3600",
          "Content-Type": "application/json",
        },
      })
    }

    const token = await getAccessToken()

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
      return NextResponse.json({ error: `Failed to fetch playlist: ${response.status}` }, { status: response.status })
    }

    const playlist = await response.json()

    // Format tracks data with null checks
    const tracks =
      playlist.tracks?.items
        ?.filter((item: any) => item && item.track) // Filter out null items or tracks
        .map((item: any) => {
          return {
            id: item.track.id,
            name: item.track.name,
            artists: item.track.artists?.map((artist: any) => ({
              id: artist.id,
              name: artist.name,
            })) || [{ name: "Unknown Artist" }],
            album: {
              name: item.track.album?.name || "Unknown Album",
              images: item.track.album?.images || [],
            },
            duration_ms: item.track.duration_ms || 0,
            preview_url: item.track.preview_url,
            external_urls: item.track.external_urls || {},
          }
        }) || []

    const formattedPlaylist = {
      id: playlist.id,
      name: playlist.name || "Discovered Playlist",
      description: playlist.description || "Discovered playlist",
      image: playlist.images?.[0]?.url || "/placeholder.svg",
      tracks: {
        total: playlist.tracks?.total || 0,
        items: tracks,
      },
      external_url: playlist.external_urls?.spotify || `https://open.spotify.com/playlist/${playlist.id}`,
      owner: playlist.owner?.display_name || "Spotify",
      followers: playlist.followers?.total || 0,
      discovered: true, // Mark as discovered
    }

    // Cache the results
    playlistCache[playlistId] = formattedPlaylist

    return NextResponse.json(formattedPlaylist, {
      headers: {
        "Cache-Control": "public, max-age=3600",
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error(`Error fetching discovered playlist ${params.playlistId}:`, error)
    return NextResponse.json(
      {
        error: "Failed to fetch discovered playlist",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
