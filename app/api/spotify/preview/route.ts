import { getAccessToken } from "@/lib/spotify"
import { NextResponse } from "next/server"

// Function to get track preview URL by track ID
async function getTrackPreview(trackId: string, token: string) {
  try {
    const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to get track: ${response.status} ${response.statusText}`)
    }

    const trackData = await response.json()
    return {
      name: trackData.name,
      preview_url: trackData.preview_url,
      external_url: trackData.external_urls.spotify,
      artists: trackData.artists.map((artist: any) => artist.name),
      album: trackData.album.name,
      image: trackData.album.images[0]?.url,
    }
  } catch (error) {
    console.error("Error getting track preview:", error)
    throw error
  }
}

// Function to search for a track by name
async function searchTrack(trackName: string, token: string) {
  try {
    const params = new URLSearchParams({
      q: trackName,
      type: "track",
      limit: "1",
    })

    const response = await fetch(`https://api.spotify.com/v1/search?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to search track: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    if (data.tracks.items.length > 0) {
      return data.tracks.items[0].id
    } else {
      console.log(`No track found for '${trackName}'`)
      return null
    }
  } catch (error) {
    console.error("Error searching track:", error)
    throw error
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const trackName = searchParams.get("track")
    const trackId = searchParams.get("id")

    if (!trackId && !trackName) {
      return NextResponse.json({ error: "Either track name or track ID is required" }, { status: 400 })
    }

    // Try to get token, but handle errors gracefully
    let token
    try {
      token = await getAccessToken()
    } catch (error) {
      console.error("Failed to get Spotify token:", error)
      // Return a fallback response with mock data
      return NextResponse.json(
        {
          name: trackName || "Unknown Track",
          preview_url: null,
          external_url: null,
          artists: [],
          album: "Unknown Album",
          image: null,
          error: "Authentication failed",
        },
        { status: 200 },
      ) // Return 200 with error info in the payload
    }

    let id = trackId
    // If no ID but we have a track name, search for the track
    if (!id && trackName) {
      try {
        id = await searchTrack(trackName, token)
        if (!id) {
          return NextResponse.json(
            {
              name: trackName,
              preview_url: null,
              external_url: null,
              artists: [],
              album: "Unknown Album",
              image: null,
              error: "Track not found",
            },
            { status: 200 },
          )
        }
      } catch (error) {
        console.error("Error searching for track:", error)
        return NextResponse.json(
          {
            name: trackName,
            preview_url: null,
            external_url: null,
            artists: [],
            album: "Unknown Album",
            image: null,
            error: "Search failed",
          },
          { status: 200 },
        )
      }
    }

    try {
      const trackData = await getTrackPreview(id as string, token)
      return NextResponse.json(trackData, {
        headers: {
          "Cache-Control": "public, max-age=86400", // Cache for 24 hours
          "Content-Type": "application/json",
        },
      })
    } catch (error) {
      console.error("Error fetching track preview:", error)
      return NextResponse.json(
        {
          name: trackName || "Unknown Track",
          preview_url: null,
          external_url: null,
          artists: [],
          album: "Unknown Album",
          image: null,
          error: "Preview fetch failed",
        },
        { status: 200 },
      )
    }
  } catch (error) {
    console.error("Error in preview API route:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch track preview",
        details: error instanceof Error ? error.message : "Unknown error",
        preview_url: null,
      },
      { status: 200 }, // Return 200 with error info
    )
  }
}

