import { getFeaturedPlaylists } from "@/lib/spotify"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const playlists = await getFeaturedPlaylists()

    return NextResponse.json(playlists, {
      headers: {
        "Cache-Control": "no-store, must-revalidate",
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Error in Spotify featured playlists API route:", error)
    return NextResponse.json({ error: "Failed to fetch featured playlists" }, { status: 500 })
  }
}
