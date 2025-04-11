import { Header } from "@/components/header"
import { BrowseThemedPlaylists } from "@/components/browse-themed-playlists"

export default function BrowseFeaturedPlaylistsPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <hr className="border-t border-gray-200 w-full" />
        <BrowseThemedPlaylists />
      </main>
    </>
  )
}
