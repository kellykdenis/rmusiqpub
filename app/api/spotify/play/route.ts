import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const uri = searchParams.get("uri")

    if (!uri) {
      console.error("Missing track URI in request")
      return NextResponse.json({ error: "Missing track URI" }, { status: 400 })
    }

    // Use the access token from the environment variable
    const token = process.env.SPOTIFY_ACCESS_TOKEN

    if (!token) {
      console.error("No Spotify token available in environment")
      return NextResponse.json(
        {
          error: "Spotify token not available",
          message: "Please connect your Spotify account or use the fallback player.",
        },
        { status: 401 },
      )
    }

    console.log(`Attempting to play track: ${uri}`)

    // First, check if there are any active devices
    console.log("Fetching active Spotify devices...")
    const devicesResponse = await fetch("https://api.spotify.com/v1/me/player/devices", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!devicesResponse.ok) {
      const errorText = await devicesResponse.text()
      console.error(`Failed to get Spotify devices: ${devicesResponse.status} - ${errorText}`)
      return NextResponse.json(
        {
          error: "Failed to get Spotify devices",
          status: devicesResponse.status,
          message: "No active Spotify devices found. Please open Spotify on any device first.",
        },
        { status: devicesResponse.status },
      )
    }

    const devicesData = await devicesResponse.json()

    if (!devicesData.devices || devicesData.devices.length === 0) {
      console.error("No active Spotify devices found")
      return NextResponse.json(
        {
          error: "No active Spotify devices found",
          message: "Please open Spotify on any device first.",
        },
        { status: 404 },
      )
    }

    // Use the first active device
    const deviceId = devicesData.devices[0].id
    console.log(`Using device: ${deviceId}`)

    // Play the track on the device
    console.log(`Playing track ${uri} on device ${deviceId}`)
    const playResponse = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uris: [uri],
      }),
    })

    if (!playResponse.ok) {
      const errorText = await playResponse.text()
      console.error(`Failed to play track: ${playResponse.status} - ${errorText}`)
      return NextResponse.json(
        {
          error: "Failed to play track",
          status: playResponse.status,
          details: errorText,
          message: "Could not play track on Spotify. Using fallback player.",
        },
        { status: playResponse.status },
      )
    }

    console.log("Track playing successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in Spotify play API route:", error)
    return NextResponse.json(
      {
        error: "Failed to play track",
        details: error instanceof Error ? error.message : "Unknown error",
        message: "An error occurred while playing the track. Using fallback player.",
      },
      { status: 500 },
    )
  }
}
