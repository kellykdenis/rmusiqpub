import Image from "next/image"
import Link from "next/link"
import type { SearchableItem } from "@/utils/search"

interface SearchResultsProps {
  results: SearchableItem[]
}

export function SearchResults({ results }: SearchResultsProps) {
  if (results.length === 0) {
    return <div className="text-center py-8 text-gray-500">No items found matching your search.</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Search Results</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {results.map((result) => (
          <Link
            key={result.id}
            href={`/${result.type === "Themed Playlist" ? "playlists" : "songs"}/${result.slug}`}
            className="group"
          >
            <div className="space-y-2">
              <div className="relative">
                <div className="relative aspect-square overflow-hidden rounded-lg">
                  <Image
                    src={result.image || "/placeholder.svg"}
                    alt={result.title || result.name || ""}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              </div>
              <div>
                <div className="text-xs text-zinc-600 mb-1">{result.type}</div>
                <h3 className="font-medium truncate group-hover:text-[#F50604]">{result.title || result.name}</h3>
                {result.artist && <p className="text-sm text-zinc-600 truncate">{result.artist}</p>}
                {result.description && <p className="text-sm text-zinc-600 line-clamp-2">{result.description}</p>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
