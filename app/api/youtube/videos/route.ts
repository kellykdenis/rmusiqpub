import { NextResponse } from "next/server"

const API_KEY = process.env.YOUTUBE_API_KEY || "AIzaSyBU5SXEcWTQ3pomB4RmV66Ddn0cL8gMAqg"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const channelId = searchParams.get("channelId")

    if (!channelId) {
      return NextResponse.json({ error: "Channel ID is required" }, { status: 400 })
    }

    // Step 1: Get latest videos (excluding Shorts)
    const videoUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=5&order=date&type=video&videoDuration=medium&key=${API_KEY}`

    const response = await fetch(videoUrl)

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      return NextResponse.json(
        { items: [] },
        {
          headers: { "Cache-Control": "public, max-age=3600" },
        },
      )
    }

    // Extract video IDs for the second request
    const videoIds = data.items.map((item: any) => item.id.videoId).join(",")

    // Step 2: Get video details to filter by category
    const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoIds}&key=${API_KEY}`
    const detailsResponse = await fetch(videoDetailsUrl)

    if (!detailsResponse.ok) {
      // If the second request fails, return the original search results
      return NextResponse.json(data, {
        headers: { "Cache-Control": "public, max-age=3600" },
      })
    }

    const detailsData = await detailsResponse.json()

    // Filter for music videos (category ID 10) or videos with "music video" in the title
    const musicVideos = detailsData.items.filter((video: any) => {
      const isMusicCategory = video.snippet.categoryId === "10"
      const hasMusicVideoInTitle =
        video.snippet.title.toLowerCase().includes("music video") ||
        video.snippet.title.toLowerCase().includes("official video")
      return isMusicCategory || hasMusicVideoInTitle
    })

    // If we found music videos, return those, otherwise return the original results
    const finalResult =
      musicVideos.length > 0
        ? {
            items: musicVideos.map((video: any) => ({
              id: { videoId: video.id },
              snippet: video.snippet,
            })),
          }
        : data

    return NextResponse.json(finalResult, {
      headers: {
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error("Error in YouTube videos API route:", error)
    return NextResponse.json({ error: "Failed to fetch YouTube videos data" }, { status: 500 })
  }
}
