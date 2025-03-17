import { Header } from "@/components/header"
import { ArtistProfile } from "@/components/artist-profile"

export default function ArtistPage({ params }: { params: { slug: string } }) {
  return (
    <>
      <Header />
      <main className="flex-1">
        <hr className="border-t border-gray-200 w-full" />
        <ArtistProfile slug={params.slug} />
      </main>
    </>
  )
}

