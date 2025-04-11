import { getAllArtists } from "@/lib/spotify"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const artists = await getAllArtists()

    // Log the number of artists fetched
    console.log(`Fetched ${artists.length} artists from Spotify API`)

    return NextResponse.json(artists, {
      headers: {
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Error in Spotify artists API route:", error)
    return NextResponse.json(
      { error: "Failed to fetch artists", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
