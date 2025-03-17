"use client"

import { useEffect, useState, useRef } from "react"
import { useToast } from "@/hooks/use-toast"

interface SpotifyPlayerProps {
  onReady?: (player: Spotify.Player) => void
  onPlayerStateChanged?: (state: Spotify.PlaybackState | null) => void
}

declare global {
  interface Window {
    Spotify: any
    onSpotifyWebPlaybackSDKReady: () => void
    spotifyReady: boolean
  }
}

export function SpotifyPlayer({ onReady, onPlayerStateChanged }: SpotifyPlayerProps) {
  const [player, setPlayer] = useState<Spotify.Player | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [deviceId, setDeviceId] = useState<string | null>(null)
  const { toast } = useToast()
  const scriptLoaded = useRef(false)
  const initializationAttempted = useRef(false)
  const sdkLoadTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Function to check if the browser is compatible with Spotify Web Playback SDK
  const checkBrowserCompatibility = () => {
    // Check for Web Playback SDK requirements
    const isHttps = window.location.protocol === "https:" || window.location.hostname === "localhost"

    if (!isHttps) {
      console.error("Spotify Web Playback SDK requires HTTPS")
      return false
    }

    return true
  }

  // Function to get a valid token
  const getValidToken = () => {
    // First try to get from localStorage
    const token = localStorage.getItem("spotify_access_token")

    // If not in localStorage, check if we have a token in the environment
    if (!token) {
      console.log("No token in localStorage, Spotify features will be limited")
      // We'll return null here, which will prevent player initialization
      return null
    }

    // Validate token format (basic check)
    if (token.length < 20) {
      console.error("Invalid Spotify token format")
      return null
    }

    return token
  }

  // Initialize the player when the SDK is ready
  const initializePlayer = () => {
    if (initializationAttempted.current) return
    initializationAttempted.current = true

    console.log("Initializing Spotify player...")

    // Get and validate token
    const token = getValidToken()

    if (!token) {
      console.log("No valid Spotify token available, skipping player initialization")

      // Notify the parent component that we're not initializing Spotify
      if (onReady) {
        // We're passing null to indicate that Spotify is not available
        onReady(null as any)
      }

      // Show a toast only if this is not the initial page load
      if (document.referrer) {
        toast({
          title: "Spotify Authentication Required",
          description: "Please log in to Spotify to enable full playback features.",
          variant: "default",
        })
      }
      return
    }

    try {
      console.log("Creating Spotify player instance...")
      const spotifyPlayer = new window.Spotify.Player({
        name: "Revered Musiq Publishing Web Player",
        getOAuthToken: (cb: (token: string) => void) => {
          console.log("OAuth token requested by player")
          cb(token)
        },
        volume: 0.5,
      })

      // Error handling with detailed logging
      spotifyPlayer.addListener("initialization_error", ({ message }: { message: string }) => {
        console.error("Spotify initialization error:", message)
        toast({
          title: "Spotify Player Error",
          description: "Failed to initialize Spotify player. Using fallback player.",
          variant: "destructive",
        })
      })

      spotifyPlayer.addListener("authentication_error", ({ message }: { message: string }) => {
        console.error("Spotify authentication error:", message)
        toast({
          title: "Spotify Authentication Error",
          description: "Authentication failed. Please log in again.",
          variant: "destructive",
        })
        // Clear the token on auth error
        localStorage.removeItem("spotify_access_token")
      })

      spotifyPlayer.addListener("account_error", ({ message }: { message: string }) => {
        console.error("Spotify account error:", message)
        toast({
          title: "Spotify Account Error",
          description: "Spotify Premium is required for playback.",
          variant: "destructive",
        })
      })

      spotifyPlayer.addListener("playback_error", ({ message }: { message: string }) => {
        console.error("Spotify playback error:", message)
        toast({
          title: "Playback Error",
          description: "Error during playback. Using fallback player.",
          variant: "destructive",
        })
      })

      // Playback status updates
      spotifyPlayer.addListener("player_state_changed", (state: Spotify.PlaybackState) => {
        console.log("Spotify player state changed:", state ? "New state" : "No state")
        if (onPlayerStateChanged) {
          onPlayerStateChanged(state)
        }
      })

      // Ready
      spotifyPlayer.addListener("ready", ({ device_id }: { device_id: string }) => {
        console.log("Spotify Player Ready with Device ID:", device_id)
        setDeviceId(device_id)
        setIsReady(true)

        if (onReady) {
          onReady(spotifyPlayer)
        }

        toast({
          title: "Spotify Player Connected",
          description: "Ready to play music.",
        })
      })

      // Not Ready
      spotifyPlayer.addListener("not_ready", ({ device_id }: { device_id: string }) => {
        console.log("Device ID has gone offline", device_id)
        setIsReady(false)
        toast({
          title: "Spotify Player Disconnected",
          description: "The player has been disconnected.",
          variant: "destructive",
        })
      })

      // Connect to the player with error handling
      console.log("Connecting to Spotify player...")
      spotifyPlayer
        .connect()
        .then((success: boolean) => {
          if (success) {
            console.log("Spotify player connected successfully")
            setPlayer(spotifyPlayer)
          } else {
            console.error("Failed to connect to Spotify player")
            toast({
              title: "Connection Failed",
              description: "Failed to connect to Spotify player. Using fallback player.",
              variant: "destructive",
            })
          }
        })
        .catch((error: any) => {
          console.error("Error connecting to Spotify player:", error)
          toast({
            title: "Connection Error",
            description: "Error connecting to Spotify. Using fallback player.",
            variant: "destructive",
          })
        })
    } catch (error) {
      console.error("Error creating Spotify player:", error)
      toast({
        title: "Spotify Player Error",
        description: "Failed to create Spotify player. Using fallback player.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (scriptLoaded.current) return

    // Check if we have a token before trying to load the SDK
    const token = getValidToken()
    if (!token) {
      console.log("No valid Spotify token, skipping SDK loading")

      // Notify the parent component that we're not initializing Spotify
      if (onReady) {
        // We're passing null to indicate that Spotify is not available
        onReady(null as any)
      }

      return
    }

    // Check browser compatibility
    if (!checkBrowserCompatibility()) {
      toast({
        title: "Browser Not Compatible",
        description: "Your browser doesn't support Spotify Web Playback. Using fallback player.",
        variant: "destructive",
      })
      return
    }

    // Set up a timeout to detect if the SDK fails to load
    sdkLoadTimeoutRef.current = setTimeout(() => {
      if (!window.Spotify) {
        console.error("Spotify SDK failed to load within timeout period")
        toast({
          title: "Spotify Player Error",
          description: "Failed to load Spotify player. Using fallback player.",
          variant: "destructive",
        })
      }
    }, 10000) // 10 seconds timeout

    // Define the callback for when the SDK is ready
    window.onSpotifyWebPlaybackSDKReady = () => {
      if (sdkLoadTimeoutRef.current) {
        clearTimeout(sdkLoadTimeoutRef.current)
      }
      console.log("Spotify Web Playback SDK is ready")
      window.spotifyReady = true

      // Delay initialization slightly to ensure SDK is fully loaded
      setTimeout(initializePlayer, 500)
    }

    // Load the Spotify Web Playback SDK
    try {
      console.log("Loading Spotify SDK script...")
      const script = document.createElement("script")
      script.src = "https://sdk.scdn.co/spotify-player.js"
      script.async = true

      script.onerror = () => {
        console.error("Failed to load Spotify SDK script")
        if (sdkLoadTimeoutRef.current) {
          clearTimeout(sdkLoadTimeoutRef.current)
        }
        toast({
          title: "Spotify Player Error",
          description: "Failed to load Spotify player. Using fallback player.",
          variant: "destructive",
        })
      }

      document.body.appendChild(script)
      scriptLoaded.current = true
    } catch (error) {
      console.error("Error loading Spotify SDK:", error)
      toast({
        title: "Spotify Player Error",
        description: "Failed to load Spotify player. Using fallback player.",
        variant: "destructive",
      })
    }

    return () => {
      if (sdkLoadTimeoutRef.current) {
        clearTimeout(sdkLoadTimeoutRef.current)
      }
      if (player) {
        player.disconnect()
      }
    }
  }, [])

  // This component doesn't render anything visible
  return null
}

// Helper functions for controlling playback
export const spotifyPlaybackControls = {
  async play(trackUri: string, deviceId: string) {
    const token = localStorage.getItem("spotify_access_token")

    if (!token || !deviceId) {
      console.error("Missing token or device ID for playback")
      return false
    }

    try {
      console.log(`Playing track ${trackUri} on device ${deviceId}`)
      const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: [trackUri],
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Error playing track: ${response.status} - ${errorText}`)
        return false
      }

      return true
    } catch (error) {
      console.error("Error playing track:", error)
      return false
    }
  },

  async pause() {
    const token = localStorage.getItem("spotify_access_token")

    if (!token) {
      console.error("Missing token for pause")
      return false
    }

    try {
      console.log("Pausing playback")
      const response = await fetch("https://api.spotify.com/v1/me/player/pause", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Error pausing playback: ${response.status} - ${errorText}`)
        return false
      }

      return true
    } catch (error) {
      console.error("Error pausing track:", error)
      return false
    }
  },
}

