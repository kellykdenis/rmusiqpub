// Utility functions for working with Spotify

/**
 * Fetches a track preview URL from Spotify
 * @param trackName The name of the track to search for
 * @param artistName Optional artist name to improve search accuracy
 * @returns The track data including preview URL
 */
export async function fetchTrackPreview(trackName: string, artistName?: string) {
  try {
    const query = artistName ? `${trackName} artist:${artistName}` : trackName

    const response = await fetch(`/api/spotify/preview?track=${encodeURIComponent(query)}`, {
      cache: "force-cache",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch preview: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching track preview:", error)
    return null
  }
}

/**
 * Fetches a track preview URL from Spotify using a track ID
 * @param trackId The Spotify track ID
 * @returns The track data including preview URL
 */
export async function fetchTrackPreviewById(trackId: string) {
  try {
    const response = await fetch(`/api/spotify/preview?id=${encodeURIComponent(trackId)}`, {
      cache: "force-cache",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch preview: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching track preview by ID:", error)
    return null
  }
}

/**
 * Extracts a Spotify track ID from a Spotify URL
 * @param spotifyUrl The full Spotify URL
 * @returns The track ID
 */
export function extractTrackId(spotifyUrl: string): string | null {
  if (!spotifyUrl) return null

  // Handle both formats: https://open.spotify.com/track/ID and spotify:track:ID
  if (spotifyUrl.includes("open.spotify.com/track/")) {
    return spotifyUrl.split("track/")[1].split("?")[0]
  } else if (spotifyUrl.includes("spotify:track:")) {
    return spotifyUrl.split("spotify:track:")[1]
  }

  return null
}

