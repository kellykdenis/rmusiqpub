import { getAlbumTracks } from "@/lib/spotify"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: { albumId: string } }) {
  try {
    const tracks = await getAlbumTracks(params.albumId)

    return NextResponse.json(tracks, {
      headers: {
        "Cache-Control": "no-store, must-revalidate",
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Error in Spotify tracks API route:", error)
    return NextResponse.json(
      { error: "Failed to fetch tracks", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

