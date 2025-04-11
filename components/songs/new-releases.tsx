"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getLatestReleases } from "../browse-new-releases"

interface NewReleasesProps {
  isLoading?: boolean
}

export function NewReleases({ isLoading = false }: NewReleasesProps) {
  const [releases, setReleases] = useState<ReturnType<typeof getLatestReleases>>([])

  useEffect(() => {
    // Get the latest 5 releases
    const latestReleases = getLatestReleases(5)
    setReleases(latestReleases)
  }, [])

  return (
    <div className="mb-12">
      <div className="grid grid-cols-5 gap-6">
        {isLoading ? (
          // Show skeletons while loading
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))
        ) : releases.length === 0 ? (
          <div className="col-span-5 text-center text-gray-500 py-8">No releases available</div>
        ) : (
          releases.map((release) => (
            <Link key={release.id} href={`/songs/${release.slug}`} className="group">
              <div className="space-y-2">
                <div className="relative">
                  <div className="relative aspect-square overflow-hidden rounded-lg">
                    <Image
                      src={release.image || "/placeholder.svg"}
                      alt={`${release.title} by ${release.artist}`}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium truncate group-hover:text-[#F50604]">{release.title}</h3>
                  <p className="text-sm text-zinc-600 truncate">{release.artist}</p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="flex gap-4 mt-6">
        <Button variant="outline" asChild>
          <Link href="/browse-new-releases">Browse New Releases</Link>
        </Button>
      </div>
    </div>
  )
}
