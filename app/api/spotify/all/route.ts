import { getAllAlbumsWithTracks } from "@/lib/spotify"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Use getAllAlbumsWithTracks to get all albums from all artists
    const albums = await getAllAlbumsWithTracks()

    console.log(`Returning ${albums.length} albums from API`)

    return NextResponse.json(albums, {
      headers: {
        // Cache for 1 hour to improve performance
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Error in Spotify all albums API route:", error)

    // Return a more detailed error response
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : undefined

    return NextResponse.json(
      {
        error: "Failed to fetch albums",
        message: errorMessage,
        stack: process.env.NODE_ENV === "development" ? errorStack : undefined,
      },
      { status: 500 },
    )
  }
}
