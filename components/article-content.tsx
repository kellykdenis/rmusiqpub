import Image from "next/image"
import Link from "next/link"
import { newsArticles } from "@/data/newsArticles"

interface ArticleContentProps {
  slug: string
}

export function ArticleContent({ slug }: ArticleContentProps) {
  const article = newsArticles.find((article) => article.slug === slug)
  const relatedArticles = newsArticles.filter((a) => a.slug !== slug).slice(0, 3)

  if (!article) {
    return <div>Article not found</div>
  }

  return (
    <div className="max-w-[1180px] mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Link href="/news" className="inline-flex items-center text-sm text-zinc-600 hover:text-[#F50604] mb-4">
            ← Back to all RMPG News
          </Link>

          <article>
            <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
            <p className="text-zinc-600 mb-6">{article.date}</p>

            <div className="relative aspect-[16/9] mb-6 rounded-lg overflow-hidden">
              <Image src={article.image || "/placeholder.svg"} alt={article.title} fill className="object-cover" />
            </div>

            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
          </article>
        </div>

        <div className="lg:col-span-1">
          <h2 className="text-xl font-bold mb-6">Related Articles</h2>
          <div className="space-y-4">
            {relatedArticles.map((relatedArticle) => (
              <Link key={relatedArticle.id} href={`/news/${relatedArticle.slug}`} className="flex gap-4 group">
                <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded">
                  <Image
                    src={relatedArticle.image || "/placeholder.svg"}
                    alt={relatedArticle.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium group-hover:text-[#F50604]">{relatedArticle.title}</h3>
                  <p className="text-sm text-zinc-600">{relatedArticle.date}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
