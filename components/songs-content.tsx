"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NewReleases } from "@/components/songs/new-releases"
import { FeaturedPlaylists } from "@/components/songs/themed-playlists"
import { SearchResults } from "@/components/songs/search-results"
import { getAllSearchableItems, searchItems, type SearchableItem } from "@/utils/search"
import { fetchAllReleases } from "./browse-new-releases"

export function SongsContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchFilter, setSearchFilter] = useState("all")
  const [searchResults, setSearchResults] = useState<SearchableItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load releases on component mount
  useEffect(() => {
    async function loadReleases() {
      try {
        setIsLoading(true)
        await fetchAllReleases()
      } catch (error) {
        console.error("Error loading releases:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadReleases()
  }, [])

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setIsSearching(false)
      setSearchResults([])
      return
    }

    const allItems = getAllSearchableItems()
    const results = searchItems(searchQuery, searchFilter, allItems)

    setSearchResults(results)
    setIsSearching(true)
  }

  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
    setIsSearching(false)
  }

  return (
    <div className="max-w-[1180px] mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">RMPG Songs</h1>

      {/* Search Section */}
      <div className="flex gap-4 mb-8">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search songs, releases, and playlists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pr-8"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Select value={searchFilter} onValueChange={setSearchFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="new release">New Releases</SelectItem>
            <SelectItem value="themed playlist">Themed Playlists</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={handleSearch}>
          Search
        </Button>
        <Button variant="outline" onClick={clearSearch}>
          Clear
        </Button>
      </div>

      {/* Search Results or Default Content */}
      {isSearching ? (
        <SearchResults results={searchResults} />
      ) : (
        <>
          <NewReleases isLoading={isLoading} />
          <FeaturedPlaylists isLoading={isLoading} />
        </>
      )}
    </div>
  )
}
