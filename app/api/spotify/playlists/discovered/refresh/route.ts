import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    console.log("Forcing refresh of discovered playlists...")

    // Use relative URL which works in both local development and production
    const response = await fetch(`/api/spotify/playlists/discovered?refresh=true`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to refresh discovered playlists: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json(
      {
        success: true,
        message: `Successfully refreshed ${data.length} discovered playlists`,
        count: data.length,
      },
      {
        headers: {
          "Cache-Control": "no-store, must-revalidate",
          "Content-Type": "application/json",
        },
      },
    )
  } catch (error) {
    console.error("Error refreshing discovered playlists:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to refresh discovered playlists",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
