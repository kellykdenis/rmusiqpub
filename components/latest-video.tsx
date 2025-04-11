"use client"

import { useState, useEffect } from "react"
import { getLatestVideoByArtist } from "@/lib/youtube"
import { Skeleton } from "@/components/ui/skeleton"
import { Info } from "lucide-react"

interface LatestVideoProps {
  artistName: string
  fallbackVideoId?: string
}

export function LatestVideo({ artistName, fallbackVideoId = "dQw4w9WgXcQ" }: LatestVideoProps) {
  const [videoId, setVideoId] = useState<string | null>(null)
  const [videoTitle, setVideoTitle] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMusicVideo, setIsMusicVideo] = useState(false)

  useEffect(() => {
    async function fetchLatestVideo() {
      try {
        setLoading(true)
        setError(null)

        const videoData = await getLatestVideoByArtist(artistName)

        if (videoData) {
          setVideoId(videoData.id)
          setVideoTitle(videoData.title)

          // Check if it's a music video (category 10 or has music video in title)
          const isMusicCat = videoData.categoryId === "10"
          const hasMusicInTitle =
            videoData.title.toLowerCase().includes("music video") ||
            videoData.title.toLowerCase().includes("official video")
          setIsMusicVideo(isMusicCat || hasMusicInTitle)
        } else {
          // If no video found, use fallback
          setVideoId(fallbackVideoId)
          setError("Could not find official videos for this artist. Showing a recommended video instead.")
        }
      } catch (err) {
        console.error("Error fetching latest video:", err)
        setVideoId(fallbackVideoId)
        setError("Error loading the latest video. Showing a recommended video instead.")
      } finally {
        setLoading(false)
      }
    }

    if (artistName) {
      fetchLatestVideo()
    }
  }, [artistName, fallbackVideoId])

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-6 w-2/3 mb-4" />
        <Skeleton className="aspect-video w-full rounded-lg" />
      </div>
    )
  }

  return (
    <div>
      {videoTitle && (
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-lg font-medium">{videoTitle}</h3>
          {isMusicVideo && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">Music Video</span>
          )}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 text-amber-600 text-sm mb-2">
          <Info className="h-4 w-4" />
          <p>{error}</p>
        </div>
      )}
      <div className="relative aspect-video rounded-lg overflow-hidden">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}`}
          title={videoTitle || "Artist Video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0"
        />
      </div>
    </div>
  )
}
