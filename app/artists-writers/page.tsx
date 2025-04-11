import { Header } from "@/components/header"
import { ArtistsGrid } from "@/components/artists-grid"

export default function ArtistsWritersPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <hr className="border-t border-gray-200 w-full" />
        <ArtistsGrid />
      </main>
    </>
  )
}
