import { Header } from "@/components/header"
import { SongsContent } from "@/components/songs-content"

export default function SongsPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <hr className="border-t border-gray-200 w-full" />
        <SongsContent />
      </main>
    </>
  )
}
