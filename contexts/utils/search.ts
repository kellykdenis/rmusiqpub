import { allNewReleases } from "@/components/browse-new-releases"
import { allThemedPlaylists } from "@/components/browse-themed-playlists"

export interface SearchableItem {
  id: string
  title?: string
  name?: string
  artist?: string
  type: string
  image: string
  slug: string
  description?: string
  details?: string
}

// Combine all items into a searchable format
export const getAllSearchableItems = (): SearchableItem[] => {
  const newReleases = allNewReleases.map((release) => ({
    id: release.id,
    title: release.title,
    artist: release.artist,
    type: "New Release",
    image: release.image,
    slug: release.slug,
    details: release.type,
  }))

  const themedPlaylists = allThemedPlaylists.map((playlist) => ({
    id: playlist.id,
    title: playlist.name,
    type: "Featured Playlist",
    image: playlist.image,
    slug: playlist.slug,
    description: playlist.description,
  }))

  return [...newReleases, ...themedPlaylists]
}

export const searchItems = (query: string, filter: string, items: SearchableItem[]): SearchableItem[] => {
  const searchQuery = query.toLowerCase().trim()

  if (!searchQuery) return []

  return items.filter((item) => {
    const matchesFilter = filter === "all" || item.type.toLowerCase().includes(filter.toLowerCase())

    const searchableFields = [item.title, item.name, item.artist, item.description, item.details]
      .filter(Boolean)
      .map((field) => field?.toLowerCase())

    const matchesQuery = searchableFields.some((field) => field?.includes(searchQuery))

    return matchesFilter && matchesQuery
  })
}

