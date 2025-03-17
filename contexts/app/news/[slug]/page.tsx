import { Header } from "@/components/header"
import { ArticleContent } from "@/components/article-content"

export default function ArticlePage({ params }: { params: { slug: string } }) {
  return (
    <>
      <Header />
      <hr className="border-t border-gray-200 w-full" />
      <main className="flex-1">
        <ArticleContent slug={params.slug} />
      </main>
    </>
  )
}

