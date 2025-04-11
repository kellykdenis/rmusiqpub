import { getArtistPlaylists } from "@/lib/spotify"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    console.log("Forcing refresh of Spotify playlists data...")
    const playlists = await getArtistPlaylists()

    return NextResponse.json(
      {
        success: true,
        message: `Successfully refreshed data for ${playlists.length} playlists`,
        count: playlists.length,
      },
      {
        headers: {
          "Cache-Control": "no-store, must-revalidate",
          "Content-Type": "application/json",
        },
      },
    )
  } catch (error) {
    console.error("Error refreshing Spotify playlists data:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to refresh playlists data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
