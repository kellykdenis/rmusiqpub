import Image from "next/image"
import Link from "next/link"

const news = [
  {
    category: "Awards News",
    title: "67th GRAMMY Nominations",
    description:
      "UMPG songwriters, artists, producers and composers earned a record 111 nominations spanning 51 categories.",
    image: "/placeholder.svg",
  },
  {
    category: "News",
    title: "David Gray",
    description:
      "The creative music publishing executive is promoted to Managing Director U.K. and Head of Global A&R.",
    image: "/placeholder.svg",
  },
  {
    category: "News",
    title: "The Other Songs",
    description: "The Other Songs and UMPG announce new publishing collaboration.",
    image: "/placeholder.svg",
  },
  {
    category: "News",
    title: "Meta & UMG",
    description:
      "Meta and UMG announce expanded global agreement to further evolve opportunities for UMG artists & writers across Meta's global network of platforms.",
    image: "/placeholder.svg",
  },
]

export function NewsGrid() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {news.map((item, index) => (
          <Link key={index} href="#" className="group">
            <div className="relative aspect-video mb-4 overflow-hidden">
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <div className="space-y-2">
              <div className="text-sm text-zinc-600">{item.category}</div>
              <h3 className="font-bold group-hover:text-zinc-600">{item.title}</h3>
              <p className="text-sm text-zinc-600">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

