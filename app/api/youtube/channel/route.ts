import { NextResponse } from "next/server"

const API_KEY = process.env.YOUTUBE_API_KEY || "AIzaSyBU5SXEcWTQ3pomB4RmV66Ddn0cL8gMAqg"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const artistName = searchParams.get("name")

    if (!artistName) {
      return NextResponse.json({ error: "Artist name is required" }, { status: 400 })
    }

    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
      artistName,
    )}&type=channel&key=${API_KEY}`

    const response = await fetch(searchUrl)

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
      },
    })
  } catch (error) {
    console.error("Error in YouTube channel API route:", error)
    return NextResponse.json({ error: "Failed to fetch YouTube channel data" }, { status: 500 })
  }
}
