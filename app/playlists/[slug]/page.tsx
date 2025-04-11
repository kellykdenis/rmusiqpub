import { Header } from "@/components/header"
import { PlaylistDetails } from "@/components/playlist-details"

export default function PlaylistPage({ params }: { params: { slug: string } }) {
  return (
    <>
      <Header />
      <main className="flex-1">
        <hr className="border-t border-gray-200 w-full" />
        <PlaylistDetails slug={params.slug} />
      </main>
    </>
  )
}
