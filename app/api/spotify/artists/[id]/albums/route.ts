import { NextResponse } from "next/server"
import { getArtistAlbums } from "@/lib/spotify"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const albums = await getArtistAlbums(id)
    return NextResponse.json(albums)
  } catch (error) {
    console.error("Error in artist albums route:", error)
    return NextResponse.json({ error: "Failed to fetch artist albums" }, { status: 500 })
  }
} 