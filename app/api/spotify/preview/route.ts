import { NextResponse } from "next/server"

// Spotify API credentials from environment variables
const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET

// Function to get access token
async function getAccessToken() {
  try {
    const authString = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${authString}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
      }),
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error("Error getting Spotify access token:", error)
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const trackName = searchParams.get("track")
    const trackId = searchParams.get("id")

    if (!trackId && !trackName) {
      return NextResponse.json({ error: "Either track name or track ID is required" }, { status: 400 })
    }

    const token = await getAccessToken()

    let id = trackId
    // If no ID but we have a track name, search for the track
    if (!id && trackName) {
      id = await searchTrack(trackName, token)
      if (!id) {
        return NextResponse.json({ error: `No track found for '${trackName}'` }, { status: 404 })
      }
    }

    const trackData = await getTrackPreview(id as string, token)

    return NextResponse.json(trackData, {
      headers: {
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Error in preview API route:", error)
    return NextResponse.json(
      { error: "Failed to fetch track preview", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
