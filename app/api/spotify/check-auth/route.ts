import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { refreshSpotifyUserToken } from "@/lib/spotify"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("spotify_access_token")
    const refreshToken = cookieStore.get("spotify_refresh_token")

    if (!accessToken || !refreshToken) {
      return NextResponse.json({ authenticated: false })
    }

    // Verify the token is still valid by making a request to Spotify
    const response = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
      },
    })

    // If token is expired, try to refresh it
    if (response.status === 401 && refreshToken) {
      try {
        const newTokenData = await refreshSpotifyUserToken(refreshToken.value)
        
        // Create response with new token
        const authResponse = NextResponse.json({ authenticated: true })
        
        // Set new access token cookie
        authResponse.cookies.set("spotify_access_token", newTokenData.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: newTokenData.expires_in,
        })

        return authResponse
      } catch (refreshError) {
        console.error("Error refreshing token:", refreshError)
        return NextResponse.json({ authenticated: false })
      }
    }

    return NextResponse.json({ authenticated: response.ok })
  } catch (error) {
    console.error("Error checking Spotify auth:", error)
    return NextResponse.json({ authenticated: false })
  }
} 