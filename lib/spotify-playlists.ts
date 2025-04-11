// This file contains the specific Spotify playlists to be featured

// Function to extract playlist ID from Spotify URL
export function extractPlaylistIdFromUrl(url: string): string | null {
  try {
    // Extract the playlist ID from URLs like https://open.spotify.com/playlist/78a87vGu05li7dEzhD0d1z?si=CyG_CWfoQACYwXQPFwqKSA
    const regex = /playlist\/([a-zA-Z0-9]+)/
    const match = url.match(regex)
    return match ? match[1] : null
  } catch (error) {
    console.error("Error extracting playlist ID:", error)
    return null
  }
}

// List of featured Spotify playlist URLs
export const FEATURED_PLAYLIST_URLS = [
  "https://open.spotify.com/playlist/78a87vGu05li7dEzhD0d1z?si=CyG_CWfoQACYwXQPFwqKSA", // Ugandan Praise & Worship
  "https://open.spotify.com/playlist/6boaBvCb0EumKkdO37wiW6?si=qclht61xR6-EcjTfB2_0ng",
  "https://open.spotify.com/playlist/476YC3dOzLy9uQGWMdi24o?si=Bh9PgpGRRoqgMI0IViT1xQ",
  "https://open.spotify.com/playlist/1Vo8NbPSGW8ta9iBgDfEen?si=B2dPIaq1Rh6-YB9raA-PNw",
  "https://open.spotify.com/playlist/0wuV31RNfpEvYbLAkf5kpn?si=_t52HprLTluJ5tSBRKrh_w",
  "https://open.spotify.com/playlist/2plFxqp25RsvvTxYfVR8aI?si=xg339K0XQkWcE9YDSyBWOQ",
  "https://open.spotify.com/playlist/0tvQ8FyYLaGPc57F4u4KIR?si=olUs99clTZmHjAieiLRvPA",
  "https://open.spotify.com/playlist/2T1M2SInKIvxau28FtMbSM?si=f4pL078MQSqQxGubqec86Q",
]

// Extract playlist IDs from URLs
export const FEATURED_PLAYLIST_IDS = FEATURED_PLAYLIST_URLS.map(extractPlaylistIdFromUrl).filter(
  (id): id is string => id !== null,
)

// Create a mapping of playlist names for better display
export const PLAYLIST_NAME_MAPPING: Record<string, string> = {
  "78a87vGu05li7dEzhD0d1z": "Ugandan Praise & Worship",
  "6boaBvCb0EumKkdO37wiW6": "Featured Playlist 2",
  "476YC3dOzLy9uQGWMdi24o": "Featured Playlist 3",
  "1Vo8NbPSGW8ta9iBgDfEen": "Featured Playlist 4",
  "0wuV31RNfpEvYbLAkf5kpn": "Featured Playlist 5",
  "2plFxqp25RsvvTxYfVR8aI": "Featured Playlist 6",
  "0tvQ8FyYLaGPc57F4u4KIR": "Featured Playlist 7",
  "2T1M2SInKIvxau28FtMbSM": "Featured Playlist 8",
}
