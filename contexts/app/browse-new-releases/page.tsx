import { Header } from "@/components/header"
import { BrowseNewReleases } from "@/components/browse-new-releases"

export default function BrowseNewReleasesPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <hr className="border-t border-gray-200 w-full" />
        <BrowseNewReleases />
      </main>
    </>
  )
}

