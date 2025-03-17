import { getSpotifyUserToken } from "@/lib/spotify"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const error = searchParams.get("error")

    if (error) {
      console.error("Spotify auth error:", error)
      return NextResponse.redirect(new URL("/?error=spotify_auth_failed", request.url))
    }

    if (!code) {
      console.error("No code received from Spotify")
      return NextResponse.redirect(new URL("/?error=no_code", request.url))
    }

    const tokenData = await getSpotifyUserToken(code)

    // Create response with redirect
    const response = NextResponse.redirect(new URL("/", request.url))

    // Set cookies in the response
    response.cookies.set("spotify_access_token", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokenData.expires_in,
    })

    response.cookies.set("spotify_refresh_token", tokenData.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    })

    return response
  } catch (error) {
    console.error("Error in Spotify callback:", error)
    return NextResponse.redirect(new URL("/?error=callback_failed", request.url))
  }
} 