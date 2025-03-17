import { Header } from "@/components/header"
import { SongDetails } from "@/components/song-details"

export default function SongPage({ params }: { params: { slug: string } }) {
  return (
    <>
      <Header />
      <main className="flex-1">
        <hr className="border-t border-gray-200 w-full" />
        <SongDetails slug={params.slug} />
      </main>
    </>
  )
}

