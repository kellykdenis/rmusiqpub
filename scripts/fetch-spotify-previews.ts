// This is a utility script that can be run to fetch preview URLs for multiple tracks
// You can run this script with: npx ts-node scripts/fetch-spotify-previews.ts

import fetch from "node-fetch"
import fs from "fs"
import path from "path"

// Spotify API credentials
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET

// Function to get access token
async function getAccessToken() {
  const authString = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${authString}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.status}`)
  }

  const data = await response.json()
  return data.access_token
}

// Function to search for a track by name
async function searchTrack(trackName, artistName, token) {
  const query = artistName ? `${trackName} artist:${artistName}` : trackName

  const params = new URLSearchParams({
    q: query,
    type: "track",
    limit: "1",
  })

  const response = await fetch(`https://api.spotify.com/v1/search?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to search track: ${response.status}`)
  }

  const data = await response.json()
  if (data.tracks.items.length > 0) {
    return data.tracks.items[0].id
  } else {
    console.log(`No track found for '${trackName}' by '${artistName || "unknown"}'`)
    return null
  }
}

// Function to get track preview URL by track ID
async function getTrackPreview(trackId, token) {
  const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to get track: ${response.status}`)
  }

  const trackData = await response.json()
  return {
    id: trackData.id,
    name: trackData.name,
    preview_url: trackData.preview_url,
    external_url: trackData.external_urls.spotify,
    artists: trackData.artists.map((artist) => artist.name),
    album: trackData.album.name,
    image: trackData.album.images[0]?.url,
  }
}

// Main function to process a list of tracks
async function processTrackList(trackList) {
  try {
    const token = await getAccessToken()
    const results = []

    for (const track of trackList) {
      try {
        console.log(`Processing: ${track.title} by ${track.artist}`)

        // If we have a track ID, use it directly
        let trackId = track.id

        // Otherwise search for the track
        if (!trackId) {
          trackId = await searchTrack(track.title, track.artist, token)
        }

        if (trackId) {
          const trackData = await getTrackPreview(trackId, token)
          results.push({
            ...track,
            spotify_id: trackId,
            preview_url: trackData.preview_url,
            external_url: trackData.external_url,
            album: trackData.album,
            image: trackData.image,
          })

          console.log(`✅ Found preview for: ${track.title} by ${track.artist}`)
          if (!trackData.preview_url) {
            console.log(`⚠️ No preview URL available for this track`)
          }
        } else {
          results.push({
            ...track,
            error: "Track not found",
          })
          console.log(`❌ Could not find: ${track.title} by ${track.artist}`)
        }

        // Add a small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500))
      } catch (error) {
        console.error(`Error processing track ${track.title}:`, error)
        results.push({
          ...track,
          error: error.message,
        })
      }
    }

    // Save results to a JSON file
    const outputPath = path.join(process.cwd(), "track-previews.json")
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2))
    console.log(`Results saved to ${outputPath}`)

    // Print summary
    const withPreviews = results.filter((r) => r.preview_url).length
    console.log(`Found previews for ${withPreviews} out of ${results.length} tracks`)
  } catch (error) {
    console.error("Error processing track list:", error)
  }
}

// Example track list - replace with your own tracks
const trackList = [
  { title: "Circumference", artist: "Bebe Cool" },
  { title: "At Your Feet", artist: "Jhenell Dina" },
  { title: "Your Way", artist: "Jhenell Dina" },
  { title: "Bless Me", artist: "Jhenell Dina" },
  { title: "Mighty Warrior", artist: "Jhenell Dina" },
  { title: "Trust", artist: "Jhenell Dina" },
  { title: "Mighty Warrior", artist: "Jhenell Dina" },
  { title: "Trust", artist: "Jhenell Dina" },
  { title: "Ffe'Abaliko", artist: "Jhenell Dina" },
  { title: "Nkwagala", artist: "Jhenell Dina" },
  { title: "Faith Walks", artist: "Phila Kaweesa" },
  { title: "Tukusinza Tukutenda", artist: "Carol Bu'dhwike" },
  { title: "Alive Again", artist: "Johnie Beats" },
  { title: "Kings & Queens", artist: "Richy Kaweesa" },
]

// Run the script
processTrackList(trackList)

