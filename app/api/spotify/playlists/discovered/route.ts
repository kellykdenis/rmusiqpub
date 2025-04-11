import { getAccessToken } from "@/lib/spotify"
import { NextResponse } from "next/server"
import { artists } from "@/components/artists-grid"
import { allNewReleases } from "@/components/browse-new-releases"

export const dynamic = "force-dynamic"

// Cache for discovered playlists
const discoveredPlaylistsCache: Record<string, any> = {}

// Helper function to normalize text for comparison
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^\w\s]/g, "") // Remove special characters
    .trim()
}

// Helper function to check if a track matches any of our releases
function matchesOurReleases(trackName: string, artistName: string): boolean {
  // Get all our releases and their artists
  const ourReleases = allNewReleases.map((release) => ({
    title: normalizeText(release.title),
    artist: normalizeText(release.artist),
  }))

  // Normalize the input track and artist names
  const normalizedTrackName = normalizeText(trackName)
  const normalizedArtistName = normalizeText(artistName)

  // Check if this track/artist combination exists in our releases
  return ourReleases.some(
    (release) =>
      (release.title.includes(normalizedTrackName) || normalizedTrackName.includes(release.title)) &&
      (release.artist.includes(normalizedArtistName) || normalizedArtistName.includes(release.artist)),
  )
}

// Helper function to calculate a relevance score for a playlist
function calculateRelevanceScore(playlist: any, tracks: any[]): number {
  if (!tracks || tracks.length === 0) return 0

  // Get our artist names in normalized form
  const ourArtistNames = artists.map((artist) => normalizeText(artist.name))

  // Count matching tracks
  let matchingTracks = 0
  const totalTracks = tracks.length

  for (const track of tracks) {
    if (!track || !track.track) continue

    const trackArtists = track.track.artists?.map((a) => normalizeText(a.name)) || []

    // Check if any of the track's artists match our artists
    const hasMatchingArtist = trackArtists.some((artistName) =>
      ourArtistNames.some((ourArtist) => ourArtist.includes(artistName) || artistName.includes(ourArtist)),
    )

    if (hasMatchingArtist) {
      matchingTracks++
    }
  }

  // Calculate score as percentage of matching tracks
  return (matchingTracks / totalTracks) * 100
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const forceRefresh = searchParams.get("refresh") === "true"
    const minRelevanceScore = Number(searchParams.get("minScore") || "10") // Minimum relevance score (default 10%)

    // Check if we have cached data
    const cacheKey = "discovered-playlists"
    if (!forceRefresh && discoveredPlaylistsCache[cacheKey]) {
      console.log("Using cached discovered playlists data")
      return NextResponse.json(discoveredPlaylistsCache[cacheKey], {
        headers: {
          "Cache-Control": "public, max-age=3600",
          "Content-Type": "application/json",
        },
      })
    }

    console.log("Fetching discovered playlists featuring our artists...")

    const token = await getAccessToken()
    const discoveredPlaylists = []

    // Get all artist names for searching
    const artistNames = artists.map((artist) => artist.name)

    // Search for playlists for each artist
    for (const artistName of artistNames) {
      try {
        console.log(`Searching for playlists featuring ${artistName}...`)

        // Search for playlists containing the artist name
        const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=playlist&limit=50&market=UG`

        const searchResponse = await fetch(searchUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!searchResponse.ok) {
          console.error(`Error searching playlists for artist ${artistName}: ${searchResponse.status}`)
          continue
        }

        const searchData = await searchResponse.json()

        if (searchData?.playlists?.items?.length > 0) {
          console.log(`Found ${searchData.playlists.items.length} potential playlists for ${artistName}`)

          // For each playlist, check if it actually contains tracks by this artist
          for (const playlist of searchData.playlists.items) {
            try {
              // Skip if playlist is null or undefined
              if (!playlist) {
                console.log("Skipping null playlist")
                continue
              }

              // Skip if we already have this playlist
              if (playlist.id && discoveredPlaylists.some((p) => p.id === playlist.id)) {
                continue
              }

              // Make sure playlist.id exists before using it
              if (!playlist.id) {
                console.log("Skipping playlist with no ID")
                continue
              }

              // Get the playlist tracks to verify it contains our artists
              const playlistTracksUrl = `https://api.spotify.com/v1/playlists/${playlist.id}/tracks?limit=50`
              const tracksResponse = await fetch(playlistTracksUrl, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              })

              if (!tracksResponse.ok) {
                console.error(`Error fetching tracks for playlist ${playlist.id}: ${tracksResponse.status}`)
                continue
              }

              const tracksData = await tracksResponse.json()

              // Calculate relevance score
              const relevanceScore = calculateRelevanceScore(playlist, tracksData.items)

              // Skip playlists with low relevance
              if (relevanceScore < minRelevanceScore) {
                console.log(
                  `Skipping playlist "${playlist.name}" with low relevance score: ${relevanceScore.toFixed(2)}%`,
                )
                continue
              }

              // Get full playlist details to get followers count
              const playlistDetailsUrl = `https://api.spotify.com/v1/playlists/${playlist.id}`
              const detailsResponse = await fetch(playlistDetailsUrl, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              })

              if (!detailsResponse.ok) {
                console.error(`Error fetching details for playlist ${playlist.id}: ${detailsResponse.status}`)
                continue
              }

              const playlistDetails = await detailsResponse.json()
              const followersCount = playlistDetails.followers?.total || 0

              // Add the playlist to our discovered playlists
              discoveredPlaylists.push({
                id: playlist.id,
                name: playlist.name || "Unnamed Playlist",
                description: playlist.description || `Featuring ${artistName}`,
                image: playlist.images && playlist.images[0] ? playlist.images[0].url : "/placeholder.svg",
                tracks: playlist.tracks && typeof playlist.tracks.total === "number" ? playlist.tracks.total : 0,
                external_url:
                  playlist.external_urls && playlist.external_urls.spotify
                    ? playlist.external_urls.spotify
                    : `https://open.spotify.com/playlist/${playlist.id}`,
                owner: playlist.owner && playlist.owner.display_name ? playlist.owner.display_name : "Music Platform",
                featuredArtist: artistName,
                followers: followersCount,
                relevanceScore: relevanceScore,
              })

              console.log(`Added playlist "${playlist.name}" with relevance score: ${relevanceScore.toFixed(2)}%`)
            } catch (error) {
              console.error(`Error processing playlist ${playlist?.id || "unknown"}:`, error)
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching playlists for artist ${artistName}:`, error)
        // Continue with next artist even if one fails
      }

      // Add a delay between artists to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    // Remove duplicates
    const uniquePlaylists = Array.from(new Map(discoveredPlaylists.map((playlist) => [playlist.id, playlist])).values())

    // Sort by followers count (highest to lowest)
    const sortedPlaylists = uniquePlaylists.sort((a, b) => (b.followers || 0) - (a.followers || 0))

    // Cache the results
    discoveredPlaylistsCache[cacheKey] = sortedPlaylists

    console.log(`Returning ${sortedPlaylists.length} discovered playlists`)
    return NextResponse.json(sortedPlaylists, {
      headers: {
        "Cache-Control": "public, max-age=3600",
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Error in discovered playlists API route:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch discovered playlists",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
