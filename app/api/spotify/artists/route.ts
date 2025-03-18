import { getAllArtists } from "@/lib/spotify"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 3600 // Revalidate every hour

export async function GET() {
  try {
    console.log("Starting to fetch artists from Spotify API...")
    const artists = await getAllArtists()

    // Log the number of artists fetched
    console.log(`Successfully fetched ${artists.length} artists from Spotify API`)

    if (!artists || artists.length === 0) {
      console.error("No artists were fetched from Spotify API")
      return NextResponse.json(
        { error: "No artists found", details: "The Spotify API returned no artists" },
        { status: 404 }
      )
    }

    return NextResponse.json(artists, {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=7200", // Cache for 1 hour, stale for 2 hours
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Error in Spotify artists API route:", error)
    return NextResponse.json(
      { 
        error: "Failed to fetch artists", 
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

