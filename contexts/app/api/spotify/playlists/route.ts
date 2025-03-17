import { MOCK_PLAYLISTS, getArtistPlaylists } from "@/lib/spotify"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    // Get the artist query parameter if it exists
    const { searchParams } = new URL(request.url)
    const artist = searchParams.get("artist")

    const playlists = await getArtistPlaylists()

    // Filter playlists by artist if provided
    const filteredPlaylists = artist
      ? playlists.filter(
          (playlist) =>
            playlist.description.toLowerCase().includes(artist.toLowerCase()) ||
            playlist.name.toLowerCase().includes(artist.toLowerCase()),
        )
      : playlists

    // Ensure we always return an array
    if (!filteredPlaylists || !Array.isArray(filteredPlaylists) || filteredPlaylists.length === 0) {
      console.warn("No playlists found for this artist, using mock playlists")
      return NextResponse.json(MOCK_PLAYLISTS, {
        headers: {
          "Cache-Control": "no-store, must-revalidate",
          "Content-Type": "application/json",
        },
      })
    }

    return NextResponse.json(filteredPlaylists, {
      headers: {
        "Cache-Control": "no-store, must-revalidate",
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Error in Spotify playlists API route:", error)

    // Always return mock playlists if there's an error
    return NextResponse.json(MOCK_PLAYLISTS, {
      headers: {
        "Cache-Control": "no-store, must-revalidate",
        "Content-Type": "application/json",
      },
    })
  }
}

