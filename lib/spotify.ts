const CLIENT_ID = "ef6b52550fc64ba2a4ad92a221911fa7"
const CLIENT_SECRET = "9ed118dd4b41400eb647a41678a15312"

// Update redirect URI to use the current host
const REDIRECT_URI = typeof window !== 'undefined' 
  ? `${window.location.origin}/api/spotify/callback`
  : "http://localhost:3000/api/spotify/callback"

// Scopes needed for track previews
const SCOPES = [
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-email",
  "user-read-private",
].join(" ")

// Individual artist IDs - include all artists to show all releases
const ARTIST_IDS = [
  "53u06LkxIUGXSn3fCbwfau", // Bebe Cool
  "3I0DLcc9U3sXwCj5RIu1qF", // Jhenell Dina
  "6x4C5hivCmfL4SIluxGV81", // Phila Kaweesa
  "6JgZGZUxAsUWv8o1hcKHRS", // Carol Bu'dhwike
  "2HhbgMesxeJCkAwSSJ8EBy", // Johnie Beats
  "4H6ZO57SwwBU3EySPa9THB", // Richy Kaweesa
]

// Mock playlists to use as fallback if API fails
export const MOCK_PLAYLISTS = [
  {
    id: "mock1",
    name: "Gospel Hits",
    description: "The best gospel music featuring our top artists",
    image: "https://placehold.co/600x600?text=Gospel+Hits",
    tracks: 25,
    external_url: "https://open.spotify.com/",
    owner: "RMPG",
  },
  {
    id: "mock2",
    name: "East African Hits",
    description: "Top hits from East Africa featuring our artists",
    image: "https://placehold.co/600x600?text=East+African+Hits",
    tracks: 30,
    external_url: "https://open.spotify.com/",
    owner: "RMPG",
  },
  {
    id: "mock3",
    name: "Worship Experience",
    description: "A powerful worship experience with our artists",
    image: "https://placehold.co/600x600?text=Worship+Experience",
    tracks: 28,
    external_url: "https://open.spotify.com/",
    owner: "RMPG",
  },
  {
    id: "mock4",
    name: "RMPG Essentials",
    description: "Essential tracks from all RMPG artists",
    image: "https://placehold.co/600x600?text=RMPG+Essentials",
    tracks: 50,
    external_url: "https://open.spotify.com/",
    owner: "RMPG",
  },
]

// Cache token to avoid unnecessary requests
let cachedToken: string | null = null
let tokenExpiry: number | null = null

// Request queue to limit concurrent requests
const requestQueue: Array<() => Promise<any>> = []
let isProcessingQueue = false

// Process the request queue with a delay between requests
async function processQueue() {
  if (isProcessingQueue) return

  isProcessingQueue = true

  while (requestQueue.length > 0) {
    const request = requestQueue.shift()
    if (request) {
      try {
        await request()
      } catch (error) {
        console.error("Error processing queued request:", error)
      }

      // Add a delay between requests to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  isProcessingQueue = false
}

// Add a request to the queue and start processing
function queueRequest<T>(requestFn: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    requestQueue.push(async () => {
      try {
        const result = await requestFn()
        resolve(result)
      } catch (error) {
        reject(error)
      }
    })

    processQueue()
  })
}

export async function getAccessToken() {
  try {
    // Check if we have a valid cached token
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
      return cachedToken
    }

    const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
      cache: "no-store",
    })

    // Check for rate limiting before trying to parse JSON
    if (response.status === 429) {
      const retryAfter = Number.parseInt(response.headers.get("Retry-After") || "1")
      console.log(`Rate limited when getting token. Retrying after ${retryAfter} seconds...`)
      await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000))
      return getAccessToken() // Retry recursively
    }

    // Handle other non-200 responses
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to get access token: ${response.status} ${response.statusText} - ${errorText}`)
    }

    // Only try to parse JSON for successful responses
    const data = await response.json()

    // Cache token with expiry (subtract 60 seconds as safety margin)
    cachedToken = data.access_token
    tokenExpiry = Date.now() + (data.expires_in - 60) * 1000

    return data.access_token
  } catch (error) {
    console.error("Error getting Spotify access token:", error)
    throw error
  }
}

// Generate Spotify authorization URL
export function getSpotifyAuthUrl() {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    show_dialog: "true",
  })
  const url = `https://accounts.spotify.com/authorize?${params.toString()}`
  console.log("Generated Spotify auth URL:", url)
  return url
}

// Exchange authorization code for access token
export async function getSpotifyUserToken(code: string) {
  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to get user token")
    }

    const data = await response.json()
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
    }
  } catch (error) {
    console.error("Error getting user token:", error)
    throw error
  }
}

// Refresh user access token
export async function refreshSpotifyUserToken(refreshToken: string) {
  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to refresh token")
    }

    const data = await response.json()
    return {
      access_token: data.access_token,
      expires_in: data.expires_in,
    }
  } catch (error) {
    console.error("Error refreshing user token:", error)
    throw error
  }
}

// Update the makeSpotifyRequest function to handle user tokens
async function makeSpotifyRequest(url: string, userToken?: string, retries = 5) {
  let attempts = 0
  let lastError: Error | null = null

  while (attempts < retries) {
    try {
      const token = userToken || await getAccessToken()

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      })

      // Check for rate limiting before trying to parse JSON
      if (response.status === 429) {
        const retryAfter = Number.parseInt(response.headers.get("Retry-After") || "1")
        console.log(`Rate limited. Retrying after ${retryAfter} seconds...`)
        await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000))
        attempts++
        continue
      }

      // Handle other errors
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Spotify API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      // Only try to parse JSON for successful responses
      return await response.json()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      attempts++

      // Add exponential backoff with jitter
      const baseBackoff = Math.pow(2, attempts) * 1000
      const jitter = Math.random() * 1000
      const backoffTime = baseBackoff + jitter

      console.log(`Request failed, attempt ${attempts}/${retries}. Retrying in ${Math.round(backoffTime / 1000)}s...`)
      await new Promise((resolve) => setTimeout(resolve, backoffTime))
    }
  }

  throw lastError || new Error("Maximum retry attempts reached")
}

// Queue-based version of makeSpotifyRequest
async function queuedSpotifyRequest(url: string, userToken?: string, retries = 5) {
  return queueRequest(() => makeSpotifyRequest(url, userToken, retries))
}

export async function getArtistAlbums() {
  try {
    console.log("Fetching artist albums individually to avoid rate limits...")

    // Process artists one by one to avoid rate limiting
    const allAlbums = []

    for (const artistId of ARTIST_IDS) {
      try {
        console.log(`Fetching albums for artist ${artistId}...`)
        const data = await queuedSpotifyRequest(
          `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&market=UG&limit=50`,
        )

        allAlbums.push(...data.items)
      } catch (error) {
        console.error(`Error fetching albums for artist ${artistId}:`, error)
        // Continue with next artist even if one fails
      }
    }

    // Remove duplicates based on album name
    const uniqueAlbums = Array.from(new Map(allAlbums.map((album) => [album.name, album])).values())

    return uniqueAlbums
  } catch (error) {
    console.error("Error fetching Spotify albums:", error)
    throw error
  }
}

export async function getAlbumTracks(albumId: string) {
  try {
    const data = await queuedSpotifyRequest(`https://api.spotify.com/v1/albums/${albumId}/tracks`)
    return data.items
  } catch (error) {
    console.error(`Error fetching album tracks for ${albumId}:`, error)
    // Return empty array instead of throwing to allow partial data
    return []
  }
}

export async function getAlbumDetails(albumId: string) {
  try {
    return await queuedSpotifyRequest(`https://api.spotify.com/v1/albums/${albumId}`)
  } catch (error) {
    console.error(`Error fetching album details for ${albumId}:`, error)
    throw error
  }
}

// New function to get all albums with tracks
export async function getAllAlbumsWithTracks() {
  try {
    // Get albums
    const albums = await getArtistAlbums()
    console.log(`Fetched ${albums.length} albums, now fetching tracks...`)

    // For each album, fetch its tracks
    const albumsWithTracks = []

    // Process in smaller batches to avoid overwhelming the API
    const batchSize = 5
    for (let i = 0; i < albums.length; i += batchSize) {
      const batch = albums.slice(i, i + batchSize)
      console.log(`Processing batch ${i / batchSize + 1} of ${Math.ceil(albums.length / batchSize)}...`)

      const batchPromises = batch.map(async (album) => {
        try {
          const tracks = await getAlbumTracks(album.id)
          return {
            ...album,
            tracks: { items: tracks },
          }
        } catch (error) {
          console.error(`Error fetching tracks for album ${album.id}:`, error)
          return {
            ...album,
            tracks: { items: [] },
          }
        }
      })

      const batchResults = await Promise.all(batchPromises)
      albumsWithTracks.push(...batchResults)

      // Add a delay between batches
      if (i + batchSize < albums.length) {
        console.log("Waiting between batches to avoid rate limits...")
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }

    // Sort by release date (newest first)
    return albumsWithTracks.sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime())
  } catch (error) {
    console.error("Error fetching all albums with tracks:", error)
    throw error
  }
}

// Function to get a limited set of albums with tracks for testing
export async function getLimitedAlbumsWithTracks(limit = 10) {
  try {
    const albums = await getArtistAlbums()
    console.log(`Fetched ${albums.length} albums, limiting to ${limit} for testing...`)

    // Take only the first few albums to avoid rate limits during testing
    const limitedAlbums = albums.slice(0, limit)

    const albumsWithTracks = []

    for (const album of limitedAlbums) {
      try {
        const tracks = await getAlbumTracks(album.id)
        albumsWithTracks.push({
          ...album,
          tracks: { items: tracks },
        })

        // Add a delay between requests
        await new Promise((resolve) => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`Error fetching tracks for album ${album.id}:`, error)
        albumsWithTracks.push({
          ...album,
          tracks: { items: [] },
        })
      }
    }

    return albumsWithTracks.sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime())
  } catch (error) {
    console.error("Error fetching limited albums with tracks:", error)
    throw error
  }
}

// Function to get featured playlists from Spotify
export async function getFeaturedPlaylists() {
  try {
    console.log("Fetching Spotify featured playlists...")

    // First try to get actual featured playlists
    try {
      const featuredData = await queuedSpotifyRequest(
        `https://api.spotify.com/v1/browse/featured-playlists?limit=10`,
      )

      if (
        featuredData &&
        featuredData.playlists &&
        featuredData.playlists.items &&
        featuredData.playlists.items.length > 0
      ) {
        console.log(`Successfully fetched ${featuredData.playlists.items.length} featured playlists from Spotify`)

        // Map the featured playlists to our format
        return featuredData.playlists.items.map((playlist: any) => ({
          id: playlist.id,
          name: playlist.name,
          description: playlist.description || "Featured Spotify playlist",
          image: playlist.images[0]?.url || "/placeholder.svg",
          tracks: playlist.tracks?.total || 0,
          external_url: playlist.external_urls?.spotify || "https://open.spotify.com/playlist/" + playlist.id,
          owner: playlist.owner?.display_name || "Spotify",
        }))
      }
    } catch (error) {
      console.error("Error fetching featured playlists, trying new releases instead:", error)
    }

    // If featured playlists fail, try to get new releases
    try {
      const data = await queuedSpotifyRequest(`https://api.spotify.com/v1/browse/new-releases?limit=10`)

      if (data && data.albums && data.albums.items && data.albums.items.length > 0) {
        console.log(`Successfully fetched ${data.albums.items.length} new releases from Spotify`)

        // Map the new releases to our playlist format
        return data.albums.items.map((album: any) => ({
          id: album.id,
          name: album.name,
          description: `New release by ${album.artists.map((a: any) => a.name).join(", ")}`,
          image: album.images[0]?.url || "/placeholder.svg",
          tracks: album.total_tracks || 0,
          external_url: album.external_urls?.spotify || "https://open.spotify.com/album/" + album.id,
          owner: album.artists[0]?.name || "Spotify",
        }))
      }
    } catch (error) {
      console.error("Error fetching new releases, trying categories instead:", error)
    }

    // If new releases fail, try to get categories
    try {
      const categoriesData = await queuedSpotifyRequest(
        `https://api.spotify.com/v1/browse/categories?limit=10`,
      )

      if (
        categoriesData &&
        categoriesData.categories &&
        categoriesData.categories.items &&
        categoriesData.categories.items.length > 0
      ) {
        console.log(`Successfully fetched ${categoriesData.categories.items.length} categories from Spotify`)

        // Map the categories to our playlist format
        return categoriesData.categories.items.map((category: any) => ({
          id: category.id,
          name: category.name,
          description: `${category.name} music collection`,
          image: category.icons[0]?.url || "/placeholder.svg",
          tracks: 20, // Placeholder value
          external_url: `https://open.spotify.com/genre/${category.id}`,
          owner: "Spotify",
        }))
      }
    } catch (error) {
      console.error("Error fetching categories, falling back to mock data:", error)
    }

    // If all API calls fail, use mock data
    console.log("No data from Spotify API, using mock playlists")
    return MOCK_PLAYLISTS
  } catch (error) {
    console.error("Error in getFeaturedPlaylists:", error)
    // Always return mock playlists as fallback
    return MOCK_PLAYLISTS
  }
}

// Function to fetch playlists that feature our artists
export async function getArtistPlaylists() {
  try {
    console.log("Fetching playlists featuring our artists...")

    // Start with our mock playlists as a fallback
    const playlists = [...MOCK_PLAYLISTS]

    // Try to get playlists for each artist
    for (const artistId of ARTIST_IDS) {
      try {
        // Try to get artist-related playlists
        const data = await queuedSpotifyRequest(
          `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=appears_on&market=UG&limit=10`,
        )

        if (data && data.items && data.items.length > 0) {
          // Map the appears_on albums to our playlist format
          const artistPlaylists = data.items.map((album: any) => ({
            id: album.id,
            name: album.name,
            description: `Featuring ${album.artists.map((a: any) => a.name).join(", ")}`,
            image: album.images[0]?.url || "/placeholder.svg",
            tracks: album.total_tracks || 0,
            external_url: album.external_urls?.spotify || "https://open.spotify.com/album/" + album.id,
            owner: album.artists[0]?.name || "Spotify",
          }))

          playlists.push(...artistPlaylists)
        }

        // Also try to get artist's top tracks as a "playlist"
        try {
          const topTracksData = await queuedSpotifyRequest(
            `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=UG`,
          )

          if (topTracksData && topTracksData.tracks && topTracksData.tracks.length > 0) {
            // Get artist name from first track
            const artistName = topTracksData.tracks[0].artists[0]?.name || "Artist"

            // Create a "playlist" from top tracks
            const topTracksPlaylist = {
              id: `top-tracks-${artistId}`,
              name: `${artistName}'s Top Tracks`,
              description: `The most popular tracks by ${artistName}`,
              image: topTracksData.tracks[0].album.images[0]?.url || "/placeholder.svg",
              tracks: topTracksData.tracks.length,
              external_url: `https://open.spotify.com/artist/${artistId}`,
              owner: "Spotify",
            }

            playlists.push(topTracksPlaylist)
          }
        } catch (error) {
          console.error(`Error fetching top tracks for artist ${artistId}:`, error)
        }
      } catch (error) {
        console.error(`Error fetching playlists for artist ${artistId}:`, error)
      }
    }

    // Also try to get featured playlists from Spotify
    try {
      const featuredData = await queuedSpotifyRequest(
        `https://api.spotify.com/v1/browse/featured-playlists?limit=10`,
      )

      if (featuredData && featuredData.playlists && featuredData.playlists.items) {
        const featuredPlaylists = featuredData.playlists.items.map((playlist: any) => ({
          id: playlist.id,
          name: playlist.name,
          description: playlist.description || "Featured Spotify playlist",
          image: playlist.images[0]?.url || "/placeholder.svg",
          tracks: playlist.tracks?.total || 0,
          external_url: playlist.external_urls?.spotify || "https://open.spotify.com/playlist/" + playlist.id,
          owner: playlist.owner?.display_name || "Spotify",
        }))

        playlists.push(...featuredPlaylists)
      }
    } catch (error) {
      console.error("Error fetching featured playlists:", error)
    }

    // Remove duplicates and return
    const uniquePlaylists = Array.from(new Map(playlists.map((playlist) => [playlist.id, playlist])).values())

    return uniquePlaylists
  } catch (error) {
    console.error("Error in getArtistPlaylists:", error)
    return MOCK_PLAYLISTS
  }
}