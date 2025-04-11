import { getAlbumDetails } from "@/lib/spotify"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: { albumId: string } }) {
  try {
    const albumDetails = await getAlbumDetails(params.albumId)

    return NextResponse.json(albumDetails, {
      headers: {
        "Cache-Control": "no-store, must-revalidate",
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Error in Spotify album details API route:", error)
    return NextResponse.json({ error: "Failed to fetch album details" }, { status: 500 })
  }
}
