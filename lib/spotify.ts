const CLIENT_ID = "ef6b52550fc64ba2a4ad92a221911fa7"
const CLIENT_SECRET = "9ed118dd4b41400eb647a41678a15312"

// Artist IDs from the provided list
const ARTIST_IDS = [
  // Core artists - these are our main featured artists
  "53u06LkxIUGXSn3fCbwfau", // Bebe Cool
  "6x4C5hivCmfL4SIluxGV81", // Phila Kaweesa
  "3I0DLcc9U3sXwCj5RIu1qF", // Jhenell Dina
  "6JgZGZUxAsUWv8o1hcKHRS", // Carol Bu'dhwike
  "2HhbgMesxeJCkAwSSJ8EBy", // Johnie Beats
  "4H6ZO57SwwBU3EySPa9THB", // Richy Kaweesa
  "4cZJRyLjg00Lof3gXteZVz", // New artist

  // Additional artists - add new artist IDs here
  "2sJUTjQmuW1hLhLy7dQtPh",
  "2mToO55cekNJDa4tQx5Ipp",
  "4AO9uBcZTJbn4EhaZlL8gX",
  "6OPe0VU4tE6WsIyYZatf1l",
  "2CzPnR1jSDtjM3ZEiRl3pX",
  "4jY6R19KcBOgfVoYcFRGmx",
  "439cAFpgGsd10FGSviU0sF",
  "74irFmh7k7vfTa2QXwI729",
  "6d7TH1WmN4YI15WAygkuMR",
  "6nTXL0DkmSqjvcKjn6hCUz",
  "0ETh62E8XafPUn9uCQeriQ",
  "5lkIhrZsXArI4PMzEPr4BU",
  "4Dvh0aMCIBySKye4a8O2UB",
  "1tLHxC9BSAUZBtKbK6qdgc",
  "5A4WNUoNE2OHg8hbn0wzDi",

  // To add a new artist, simply add their Spotify ID here
  // The system will automatically fetch their data and create a profile
]

// Cache for track data
const trackCache: Record<string, any> = {}
const albumTracksCache: Record<string, any[]> = {}
const artistTopTracksCache: Record<string, any[]> = {}

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

// Function to handle API requests with rate limiting
async function makeSpotifyRequest(url: string, retries = 5) {
  let attempts = 0
  let lastError: Error | null = null

  while (attempts < retries) {
    try {
      const token = await getAccessToken()

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
async function queuedSpotifyRequest(url: string, retries = 5) {
  return queueRequest(() => makeSpotifyRequest(url, retries))
}

// 1. Get all artists data
export async function getAllArtists() {
  try {
    // Split artist IDs into chunks to avoid URL length limits
    const chunkSize = 20 // Spotify API allows up to 50, but we'll use 20 to be safe
    const artistChunks = []

    for (let i = 0; i < ARTIST_IDS.length; i += chunkSize) {
      artistChunks.push(ARTIST_IDS.slice(i, i + chunkSize))
    }

    const allArtists = []

    for (const chunk of artistChunks) {
      // Clean up the IDs to ensure they're valid
      const cleanIds = chunk
        .filter((id) => {
          // Skip invalid IDs (like those with hyphens or other invalid characters)
          return id && id.match(/^[a-zA-Z0-9]+$/)
        })
        .map((id) => {
          // Extract just the ID part if it contains query parameters
          if (id.includes("?")) {
            return id.split("?")[0]
          }
          return id
        })

      if (cleanIds.length === 0) continue

      const artistIds = cleanIds.join(",")
      console.log(`Fetching artists chunk with IDs: ${artistIds}`)

      const url = `https://api.spotify.com/v1/artists?ids=${artistIds}`

      try {
        const response = await queuedSpotifyRequest(url)
        if (response && response.artists) {
          // Filter out null artists (which can happen if an ID is invalid)
          const validArtists = response.artists.filter((artist) => artist !== null)
          console.log(`Received ${validArtists.length} valid artists from Spotify`)
          allArtists.push(...validArtists)
        }
      } catch (error) {
        console.error(`Error fetching artist chunk: ${error}`)
        // Continue with next chunk even if one fails
      }
    }

    console.log(`Total artists fetched: ${allArtists.length}`)
    return allArtists
  } catch (error) {
    console.error("Error fetching all artists:", error)
    throw error
  }
}

// 2. Get artist top tracks
export async function getArtistTopTracks(artistId: string, market = "UG") {
  try {
    // Check cache first
    if (artistTopTracksCache[artistId]) {
      console.log(`Using cached top tracks for artist ${artistId}`)
      return { tracks: artistTopTracksCache[artistId] }
    }

    console.log(`Fetching top tracks for artist ${artistId}`)
    const url = `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=${market}`
    const data = await queuedSpotifyRequest(url)

    // Store in cache
    if (data && data.tracks) {
      artistTopTracksCache[artistId] = data.tracks
    }

    return data
  } catch (error) {
    console.error(`Error fetching top tracks for artist ${artistId}:`, error)
    return { tracks: [] }
  }
}

export async function getArtistAlbums(artistId?: string) {
  try {
    console.log("Fetching artist albums individually to avoid rate limits...")

    // Process artists one by one to avoid rate limiting
    const allAlbums = []

    // If a specific artist ID is provided, only fetch for that artist
    const artistsToFetch = artistId ? [artistId] : ARTIST_IDS

    for (const id of artistsToFetch) {
      try {
        console.log(`Fetching albums for artist ${id}...`)
        const data = await queuedSpotifyRequest(
          `https://api.spotify.com/v1/artists/${id}/albums?include_groups=album,single&market=UG&limit=50`,
        )

        allAlbums.push(...data.items)
      } catch (error) {
        console.error(`Error fetching albums for artist ${id}:`, error)
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
    // Check cache first
    if (albumTracksCache[albumId]) {
      console.log(`Using cached tracks for album ${albumId}`)
      return albumTracksCache[albumId]
    }

    console.log(`Fetching tracks for album ${albumId}`)
    const data = await queuedSpotifyRequest(`https://api.spotify.com/v1/albums/${albumId}/tracks?limit=50`)

    // Store in cache
    albumTracksCache[albumId] = data.items

    return data.items
  } catch (error) {
    console.error(`Error fetching album tracks for ${albumId}:`, error)
    // Return empty array instead of throwing to allow partial data
    return []
  }
}

export async function getAlbumDetails(albumId: string) {
  try {
    // Check if the result is cached
    if (trackCache[albumId]) {
      console.log(`Returning cached album details for ${albumId}`)
      return trackCache[albumId]
    }

    const data = await queuedSpotifyRequest(`https://api.spotify.com/v1/albums/${albumId}`)

    // Cache the result
    trackCache[albumId] = data

    return data
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
    const batchSize = 10
    for (let i = 0; i < albums.length; i += batchSize) {
      const batch = albums.slice(i, i + batchSize)
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(albums.length / batchSize)}...`)

      const batchPromises = batch.map(async (album) => {
        try {
          // Check if we already have this album in the cache
          const cacheKey = `album-${album.id}`
          if (trackCache[cacheKey]) {
            console.log(`Using cached data for album ${album.id}`)
            return trackCache[cacheKey]
          }

          const tracks = await getAlbumTracks(album.id)
          const albumWithTracks = {
            ...album,
            tracks: { items: tracks },
          }

          // Cache the result
          trackCache[cacheKey] = albumWithTracks

          return albumWithTracks
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
        await new Promise((resolve) => setTimeout(resolve, 1000))
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
        `https://api.spotify.com/v1/browse/featured-playlists?country=UG&limit=20`,
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
      const data = await queuedSpotifyRequest(`https://api.spotify.com/v1/browse/new-releases?limit=10&country=UG`)

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
        `https://api.spotify.com/v1/browse/categories?limit=10&country=UG`,
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

    // Get all artists first to have their names for better searching
    let artistsData = []
    try {
      artistsData = await getAllArtists()
    } catch (error) {
      console.error("Error fetching artists data:", error)
    }

    // Create a map of artist IDs to names for reference
    const artistNameMap = {}
    artistsData.forEach((artist) => {
      if (artist && artist.id && artist.name) {
        artistNameMap[artist.id] = artist.name
      }
    })

    // Try to get playlists for each artist
    for (const artistId of ARTIST_IDS) {
      try {
        // Skip invalid artist IDs to avoid unnecessary API calls
        if (!artistId || artistId.includes("-")) {
          console.log(`Skipping invalid artist ID: ${artistId}`)
          continue
        }

        const artistName = artistNameMap[artistId] || "Unknown Artist"
        console.log(`Fetching playlists for artist: ${artistName} (${artistId})...`)

        // 1. Search for playlists containing the artist name
        const token = await getAccessToken()
        const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=playlist&limit=50&market=UG`

        const searchResponse = await fetch(searchUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        })

        if (!searchResponse.ok) {
          console.error(`Error searching playlists for artist ${artistName}: ${searchResponse.status}`)
          continue
        }

        const searchData = await searchResponse.json()

        if (searchData && searchData.playlists && searchData.playlists.items && searchData.playlists.items.length > 0) {
          console.log(`Found ${searchData.playlists.items.length} potential playlists for ${artistName}`)

          // For each playlist, check if it actually contains tracks by this artist
          for (const playlist of searchData.playlists.items) {
            try {
              // Get the first few tracks of the playlist to check
              const playlistTracksUrl = `https://api.spotify.com/v1/playlists/${playlist.id}/tracks?limit=100&market=UG`
              const tracksResponse = await fetch(playlistTracksUrl, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                cache: "no-store",
              })

              if (!tracksResponse.ok) continue

              const tracksData = await tracksResponse.json()

              // Check if any track in the playlist is by our artist
              const hasArtistTrack = tracksData.items.some((item) => {
                if (!item.track) return false
                return item.track.artists.some(
                  (artist) => artist.id === artistId || artist.name.toLowerCase() === artistName.toLowerCase(),
                )
              })

              if (hasArtistTrack) {
                console.log(`✅ Playlist "${playlist.name}" contains tracks by ${artistName}`)

                // Add to our playlists collection
                playlists.push({
                  id: playlist.id,
                  name: playlist.name,
                  description: `Featuring ${artistName}${playlist.description ? ` - ${playlist.description}` : ""}`,
                  image: playlist.images[0]?.url || "/placeholder.svg",
                  tracks: playlist.tracks?.total || 0,
                  external_url: playlist.external_urls?.spotify || "https://open.spotify.com/playlist/" + playlist.id,
                  owner: playlist.owner?.display_name || "Music Platform",
                  featuredArtist: artistName,
                })
              }
            } catch (error) {
              console.error(`Error checking tracks for playlist ${playlist.id}:`, error)
            }

            // Add a small delay between playlist checks to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 200))
          }
        }

        // 2. Also search for playlists by genre if the artist has genres
        const artistDetails = artistsData.find((a) => a.id === artistId)
        if (artistDetails && artistDetails.genres && artistDetails.genres.length > 0) {
          // Take the first 2 genres for searching
          const genres = artistDetails.genres.slice(0, 2)

          for (const genre of genres) {
            try {
              const genreSearchUrl = `https://api.spotify.com/v1/search?q=genre:${encodeURIComponent(genre)}&type=playlist&limit=20&market=UG`

              const genreResponse = await fetch(genreSearchUrl, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                cache: "no-store",
              })

              if (!genreResponse.ok) continue

              const genreData = await genreResponse.json()

              if (genreData && genreData.playlists && genreData.playlists.items) {
                console.log(
                  `Found ${genreData.playlists.items.length} ${genre} playlists that might feature ${artistName}`,
                )

                // Add these playlists with a note that they're genre-based
                for (const playlist of genreData.playlists.items) {
                  playlists.push({
                    id: `genre-${playlist.id}`,
                    name: playlist.name,
                    description: `${genre} playlist that may feature ${artistName}${playlist.description ? ` - ${playlist.description}` : ""}`,
                    image: playlist.images[0]?.url || "/placeholder.svg",
                    tracks: playlist.tracks?.total || 0,
                    external_url: playlist.external_urls?.spotify || "https://open.spotify.com/playlist/" + playlist.id,
                    owner: playlist.owner?.display_name || "Music Platform",
                    featuredArtist: artistName,
                    genreBased: true,
                  })
                }
              }
            } catch (error) {
              console.error(`Error searching ${genre} playlists for ${artistName}:`, error)
            }
          }
        }

        // 3. Also add the artist's top tracks as a "playlist"
        try {
          const topTracksUrl = `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=UG`
          const topTracksResponse = await fetch(topTracksUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          })

          if (topTracksResponse.ok) {
            const topTracksData = await topTracksResponse.json()

            if (topTracksData && topTracksData.tracks && topTracksData.tracks.length > 0) {
              // Create a "playlist" from top tracks
              const topTracksPlaylist = {
                id: `top-tracks-${artistId}`,
                name: `${artistName}'s Top Tracks`,
                description: `The most popular tracks by ${artistName}`,
                image: topTracksData.tracks[0].album.images[0]?.url || "/placeholder.svg",
                tracks: topTracksData.tracks.length,
                external_url: `https://open.spotify.com/artist/${artistId}`,
                owner: "RMPG",
                featuredArtist: artistName,
              }

              playlists.push(topTracksPlaylist)
            }
          }
        } catch (error) {
          console.error(`Error fetching top tracks for artist ${artistId}:`, error)
        }

        // Add a delay between artists to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`Error fetching playlists for artist ${artistId}:`, error)
        // Continue with next artist even if one fails
      }
    }

    // Remove duplicates and return
    const uniquePlaylists = Array.from(new Map(playlists.map((playlist) => [playlist.id, playlist])).values())

    return uniquePlaylists
  } catch (error) {
    console.error("Error in getArtistPlaylists:", error)
    return MOCK_PLAYLISTS
  }
}

// Get playlist details including tracks
export async function getPlaylistDetails(playlistId: string) {
  try {
    // Check if the result is cached
    if (trackCache[playlistId]) {
      console.log(`Returning cached playlist details for ${playlistId}`)
      return trackCache[playlistId]
    }

    const data = await queuedSpotifyRequest(`https://api.spotify.com/v1/playlists/${playlistId}`)

    // Cache the result
    trackCache[playlistId] = data

    return data
  } catch (error) {
    console.error(`Error fetching playlist details for ${playlistId}:`, error)
    throw error
  }
}

// Get playlist tracks
export async function getPlaylistTracks(playlistId: string) {
  try {
    // Check if the result is cached
    if (albumTracksCache[playlistId]) {
      console.log(`Returning cached playlist tracks for ${playlistId}`)
      return albumTracksCache[playlistId]
    }

    const data = await queuedSpotifyRequest(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`)

    // Cache the result
    albumTracksCache[playlistId] = data.items

    return data.items
  } catch (error) {
    console.error(`Error fetching playlist tracks for ${playlistId}:`, error)
    return []
  }
}

// Get track audio features
export async function getTrackAudioFeatures(trackId: string) {
  try {
    // Check if the result is cached
    if (trackCache[trackId]) {
      console.log(`Returning cached audio features for track ${trackId}`)
      return trackCache[trackId]
    }

    const data = await queuedSpotifyRequest(`https://api.spotify.com/v1/audio-features/${trackId}`)

    // Cache the result
    trackCache[trackId] = data

    return data
  } catch (error) {
    console.error(`Error fetching audio features for track ${trackId}:`, error)
    return null
  }
}
