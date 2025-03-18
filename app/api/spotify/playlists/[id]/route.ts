import { NextResponse } from "next/server"
import { getPlaylistDetails, getPlaylistTracks } from "@/lib/spotify"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const [details, tracks] = await Promise.all([
      getPlaylistDetails(id),
      getPlaylistTracks(id)
    ])
    return NextResponse.json({ details, tracks })
  } catch (error) {
    console.error("Error in playlist route:", error)
    return NextResponse.json({ error: "Failed to fetch playlist data" }, { status: 500 })
  }
} 