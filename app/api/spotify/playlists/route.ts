import { MOCK_PLAYLISTS, getArtistPlaylists } from "@/lib/spotify"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    // Get the artist query parameter if it exists
    const { searchParams } = new URL(request.url)
    const artist = searchParams.get("artist")
    const forceRefresh = searchParams.get("refresh") === "true"

    console.log(`Fetching playlists${artist ? ` for artist: ${artist}` : ""}${forceRefresh ? " (forced refresh)" : ""}`)

    // Check if we have cached data in session storage
    if (!forceRefresh && typeof sessionStorage !== "undefined") {
      try {
        const cachedData = sessionStorage.getItem("spotifyPlaylists")
        if (cachedData) {
          const parsedData = JSON.parse(cachedData)
          console.log(`Using ${parsedData.length} cached playlists from session storage`)

          // Filter by artist if needed
          if (artist) {
            const filteredPlaylists = parsedData.filter(
              (playlist) =>
                playlist.description?.toLowerCase().includes(artist.toLowerCase()) ||
                playlist.name?.toLowerCase().includes(artist.toLowerCase()) ||
                playlist.featuredArtist?.toLowerCase().includes(artist.toLowerCase()),
            )
            return NextResponse.json(filteredPlaylists, {
              headers: {
                "Cache-Control": "no-store, must-revalidate",
                "Content-Type": "application/json",
              },
            })
          }

          return NextResponse.json(parsedData, {
            headers: {
              "Cache-Control": "no-store, must-revalidate",
              "Content-Type": "application/json",
            },
          })
        }
      } catch (error) {
        console.error("Error reading from session storage:", error)
      }
    }

    let playlists = []
    try {
      playlists = await getArtistPlaylists()

      // Cache the results in session storage
      if (typeof sessionStorage !== "undefined") {
        try {
          sessionStorage.setItem("spotifyPlaylists", JSON.stringify(playlists))
          console.log(`Cached ${playlists.length} playlists in session storage`)
        } catch (error) {
          console.error("Error caching playlists in session storage:", error)
        }
      }
    } catch (error) {
      console.error("Error fetching playlists, using mock data:", error)
      playlists = MOCK_PLAYLISTS
    }

    // Filter playlists by artist if provided
    const filteredPlaylists = artist
      ? playlists.filter((playlist) => {
          // Check if artist name appears in description, name, or owner
          const artistLower = artist.toLowerCase()
          return (
            (playlist.description && playlist.description.toLowerCase().includes(artistLower)) ||
            (playlist.name && playlist.name.toLowerCase().includes(artistLower)) ||
            (playlist.owner &&
              typeof playlist.owner === "string" &&
              playlist.owner.toLowerCase().includes(artistLower)) ||
            (playlist.featuredArtist && playlist.featuredArtist.toLowerCase().includes(artistLower))
          )
        })
      : playlists

    // Ensure we always return an array
    if (!filteredPlaylists || !Array.isArray(filteredPlaylists) || filteredPlaylists.length === 0) {
      console.warn("No playlists found for this artist, using mock playlists")
      // If artist is provided, filter mock playlists to only include those that mention the artist
      const mockPlaylists = artist
        ? MOCK_PLAYLISTS.filter(
            (p) =>
              p.description.toLowerCase().includes(artist.toLowerCase()) ||
              p.name.toLowerCase().includes(artist.toLowerCase()),
          )
        : MOCK_PLAYLISTS

      return NextResponse.json(mockPlaylists.length > 0 ? mockPlaylists : MOCK_PLAYLISTS, {
        headers: {
          "Cache-Control": "no-store, must-revalidate",
          "Content-Type": "application/json",
        },
      })
    }

    return NextResponse.json(filteredPlaylists, {
      headers: {
        "Cache-Control": "no-store, must-revalidate",
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Error in Spotify playlists API route:", error)

    // Always return mock playlists if there's an error
    return NextResponse.json(MOCK_PLAYLISTS, {
      headers: {
        "Cache-Control": "no-store, must-revalidate",
        "Content-Type": "application/json",
      },
    })
  }
}
