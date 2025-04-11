import { Header } from "@/components/header"
import { NewsList } from "@/components/news-list"

export default function NewsPage() {
  return (
    <>
      <Header />
      <hr className="border-t border-gray-200 w-full" />
      <main className="flex-1">
        <NewsList />
      </main>
    </>
  )
}
