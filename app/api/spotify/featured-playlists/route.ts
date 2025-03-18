import { NextResponse } from "next/server"
import { getFeaturedPlaylists } from "@/lib/spotify"

export async function GET() {
  try {
    const playlists = await getFeaturedPlaylists()
    return NextResponse.json(playlists)
  } catch (error) {
    console.error("Error in featured playlists route:", error)
    return NextResponse.json({ error: "Failed to fetch featured playlists" }, { status: 500 })
  }
} 