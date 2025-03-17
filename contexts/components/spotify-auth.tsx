"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function SpotifyAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Check if we have a token in localStorage
    const token = localStorage.getItem("spotify_access_token")

    if (token) {
      // Validate the token
      validateToken(token).then((valid) => {
        setIsAuthenticated(valid)
        if (!valid) {
          // Clear invalid token
          localStorage.removeItem("spotify_access_token")
          toast({
            title: "Spotify Session Expired",
            description: "Please log in again to use Spotify features.",
            variant: "destructive",
          })
        }
        setIsLoading(false)
      })
    } else {
      setIsLoading(false)
    }

    // Check if we're returning from Spotify auth
    const hash = window.location.hash
    if (hash) {
      const params = new URLSearchParams(hash.substring(1))
      const token = params.get("access_token")
      const expiresIn = params.get("expires_in")

      if (token) {
        // Store token with expiration
        localStorage.setItem("spotify_access_token", token)

        if (expiresIn) {
          // Calculate and store expiration time
          const expirationTime = Date.now() + Number.parseInt(expiresIn) * 1000
          localStorage.setItem("spotify_token_expiration", expirationTime.toString())
        }

        setIsAuthenticated(true)
        toast({
          title: "Spotify Connected",
          description: "You can now play music directly from Spotify.",
        })

        // Remove the hash from the URL
        window.history.replaceState({}, document.title, window.location.pathname)
        setIsLoading(false)

        // Reload the page to reinitialize the Spotify player with the new token
        window.location.reload()
      }
    }
  }, [])

  const validateToken = async (token: string): Promise<boolean> => {
    try {
      console.log("Validating Spotify token...")
      const response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        console.log("Spotify token is valid")
        return true
      } else {
        console.error("Spotify token validation failed:", response.status)
        return false
      }
    } catch (error) {
      console.error("Error validating Spotify token:", error)
      return false
    }
  }

  const handleLogin = () => {
    // Spotify authorization parameters
    // Use environment variable if available, otherwise use a default
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID

    if (!clientId) {
      toast({
        title: "Configuration Error",
        description: "Spotify client ID is not configured. Please check your environment variables.",
        variant: "destructive",
      })
      console.error("Missing NEXT_PUBLIC_SPOTIFY_CLIENT_ID environment variable")
      return
    }

    const redirectUri = window.location.origin
    const scopes = [
      "streaming",
      "user-read-email",
      "user-read-private",
      "user-modify-playback-state",
      "user-read-playback-state",
    ]

    // Construct the authorization URL
    const authUrl = new URL("https://accounts.spotify.com/authorize")
    authUrl.searchParams.append("client_id", clientId)
    authUrl.searchParams.append("redirect_uri", redirectUri)
    authUrl.searchParams.append("scope", scopes.join(" "))
    authUrl.searchParams.append("response_type", "token")
    authUrl.searchParams.append("show_dialog", "true") // Force login dialog

    // Redirect to Spotify authorization page
    console.log("Redirecting to Spotify auth:", authUrl.toString())
    window.location.href = authUrl.toString()
  }

  const handleLogout = () => {
    localStorage.removeItem("spotify_access_token")
    localStorage.removeItem("spotify_token_expiration")
    setIsAuthenticated(false)
    toast({
      title: "Spotify Disconnected",
      description: "You've been logged out of Spotify.",
    })

    // Reload the page to reinitialize without Spotify
    window.location.reload()
  }

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled>
        Loading...
      </Button>
    )
  }

  return (
    <div>
      {isAuthenticated ? (
        <Button onClick={handleLogout} variant="outline" size="sm">
          Disconnect Spotify
        </Button>
      ) : (
        <Button onClick={handleLogin} className="bg-[#1DB954] hover:bg-[#1AA34A] text-white" size="sm">
          Connect Spotify
        </Button>
      )}
    </div>
  )
}

