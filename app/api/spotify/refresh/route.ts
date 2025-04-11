import { NextResponse } from "next/server"
import { getAllArtists } from "@/lib/spotify"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Force refresh the artists data
    console.log("Forcing refresh of Spotify artists data...")
    const artists = await getAllArtists()

    return NextResponse.json(
      {
        success: true,
        message: `Successfully refreshed data for ${artists.length} artists`,
      },
      {
        headers: {
          "Cache-Control": "no-store, must-revalidate",
          "Content-Type": "application/json",
        },
      },
    )
  } catch (error) {
    console.error("Error refreshing Spotify artists data:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to refresh artists data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
