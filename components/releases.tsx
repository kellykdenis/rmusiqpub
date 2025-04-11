"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { fetchAllReleases, getLatestReleases } from "./browse-new-releases"
import { Skeleton } from "@/components/ui/skeleton"

export function Releases() {
  const [latestReleases, setLatestReleases] = useState<ReturnType<typeof getLatestReleases>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadReleases() {
      try {
        setLoading(true)
        await fetchAllReleases()
        setLatestReleases(getLatestReleases(6))
      } catch (err) {
        console.error("Error loading releases:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    loadReleases()
  }, [])

  return (
    <div className="py-2">
      <div className="max-w-[1180px] mx-auto px-0">
        <h2 className="text-3xl font-bold mb-2">Latest Releases</h2>
        <div className="grid grid-cols-6 gap-4">
          {loading ? (
            // Show skeletons while loading
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="w-[186px] h-[186px] rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))
          ) : error ? (
            // Show error message if there's an error
            <div className="col-span-6 text-center text-red-500">Failed to load releases. Please try again later.</div>
          ) : (
            // Show releases once loaded
            latestReleases.map((release) => (
              <Link key={release.id} href={`/songs/${release.slug}`} className="group">
                <div className="relative w-[186px] h-[186px] mb-2 overflow-hidden rounded-lg">
                  <Image
                    src={release.image || "/placeholder.svg"}
                    alt={`${release.title} by ${release.artist}`}
                    width={186}
                    height={186}
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <h3 className="font-semibold text-sm group-hover:text-[#F50604] truncate">{release.title}</h3>
                <p className="text-xs text-gray-600 truncate">{release.artist}</p>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
