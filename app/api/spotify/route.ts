import { getArtistAlbums } from "@/lib/spotify"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1", 10)
    const itemsPerPage = 20

    const albums = await getArtistAlbums()

    // Sort by release date (newest first)
    const sortedAlbums = albums.sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime())

    // Calculate pagination
    const startIndex = (page - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedAlbums = sortedAlbums.slice(startIndex, endIndex)
    const totalPages = Math.ceil(sortedAlbums.length / itemsPerPage)

    return NextResponse.json(
      {
        albums: paginatedAlbums,
        pagination: {
          currentPage: page,
          totalPages,
          hasMore: page < totalPages,
          totalItems: sortedAlbums.length,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, must-revalidate",
          "Content-Type": "application/json",
        },
      },
    )
  } catch (error) {
    console.error("Error in Spotify API route:", error)
    return NextResponse.json(
      { error: "Failed to fetch albums", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
