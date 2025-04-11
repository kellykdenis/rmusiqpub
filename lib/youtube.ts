// Cache to store channel IDs
const channelCache: { [key: string]: string } = {}

// Cache to store video data
const videoCache: { [key: string]: { id: string; title: string; thumbnail: string; categoryId?: string } } = {}

// Update the findArtistChannel function to use our API route
async function findArtistChannel(artistName: string): Promise<string | null> {
  // Check cache first
  if (channelCache[artistName]) {
    return channelCache[artistName]
  }

  try {
    const response = await fetch(`/api/youtube/channel?name=${encodeURIComponent(artistName)}`, {
      cache: "force-cache",
    })

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (data.items && data.items.length > 0) {
      const channelId = data.items[0].snippet.channelId
      // Store in cache
      channelCache[artistName] = channelId
      return channelId
    }

    return null
  } catch (error) {
    console.error("Error finding artist channel:", error)
    return null
  }
}

// Update the getLatestVideo function to use our API route with improved filtering
async function getLatestVideo(
  channelId: string,
): Promise<{ id: string; title: string; thumbnail: string; categoryId?: string } | null> {
  // Check cache first
  if (videoCache[channelId]) {
    return videoCache[channelId]
  }

  try {
    // This now uses the improved API route that filters for music videos
    const response = await fetch(`/api/youtube/videos?channelId=${channelId}`, {
      cache: "force-cache",
    })

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (data.items && data.items.length > 0) {
      const videoData = {
        id: data.items[0].id.videoId,
        title: data.items[0].snippet.title,
        thumbnail: data.items[0].snippet.thumbnails.high.url,
        categoryId: data.items[0].snippet.categoryId,
      }

      // Store in cache
      videoCache[channelId] = videoData
      return videoData
    }

    return null
  } catch (error) {
    console.error("Error fetching latest video:", error)
    return null
  }
}

export async function getLatestVideoByArtist(
  artistName: string,
): Promise<{ id: string; title: string; thumbnail: string; categoryId?: string } | null> {
  const channelId = await findArtistChannel(artistName)
  if (!channelId) {
    return null
  }
  return getLatestVideo(channelId)
}
