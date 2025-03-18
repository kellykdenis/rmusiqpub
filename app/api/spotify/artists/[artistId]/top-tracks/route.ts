import { getArtistTopTracks } from "@/lib/spotify"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: { artistId: string } }) {
  try {
    const { artistId } = params
    const topTracks = await getArtistTopTracks(artistId)

    return NextResponse.json(topTracks, {
      headers: {
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error(`Error fetching top tracks for artist ${params.artistId}:`, error)
    return NextResponse.json(
      { error: "Failed to fetch top tracks", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

