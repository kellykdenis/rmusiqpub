import Image from "next/image"
import Link from "next/link"
import { newsArticles } from "@/data/newsArticles"

export function NewsList() {
  return (
    <div className="max-w-[1180px] mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-8">News</h1>
          <div className="space-y-8">
            {newsArticles.map((article) => (
              <article key={article.id} className="border-b pb-8">
                <Link href={`/news/${article.slug}`} className="group">
                  <div className="relative aspect-[16/9] mb-4 overflow-hidden rounded-lg">
                    <Image
                      src={article.image || "/placeholder.svg"}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <h2 className="text-xl font-bold mb-2 group-hover:text-[#F50604]">{article.title}</h2>
                  <p className="text-sm text-zinc-600 mb-2">{article.date}</p>
                  <p className="text-zinc-600">{article.description}</p>
                </Link>
              </article>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <h2 className="text-xl font-bold mb-6">Latest Articles</h2>
          <div className="space-y-4">
            {newsArticles.slice(0, 5).map((article) => (
              <Link key={article.id} href={`/news/${article.slug}`} className="flex gap-4 group">
                <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded">
                  <Image src={article.image || "/placeholder.svg"} alt={article.title} fill className="object-cover" />
                </div>
                <div>
                  <h3 className="font-medium group-hover:text-[#F50604]">{article.title}</h3>
                  <p className="text-sm text-zinc-600">{article.date}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
