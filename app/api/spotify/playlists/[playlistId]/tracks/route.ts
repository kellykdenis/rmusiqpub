import { getPlaylistTracks } from "@/lib/spotify"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: { playlistId: string } }) {
  try {
    const { playlistId } = params
    const tracks = await getPlaylistTracks(playlistId)

    // Extract track objects from the items array
    const formattedTracks = tracks.map((item: any) => item.track)

    return NextResponse.json(formattedTracks, {
      headers: {
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error(`Error fetching tracks for playlist ${params.playlistId}:`, error)
    return NextResponse.json(
      { error: "Failed to fetch playlist tracks", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

