import { Header } from "@/components/header"
import { HeroSlider } from "@/components/hero-slider"
import { NewsSlider } from "@/components/news-slider"
import { Releases } from "@/components/releases"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <hr className="border-t border-gray-200 w-full" />
        <HeroSlider />
        <div className="max-w-[1180px] mx-auto">
          <Releases />
          <hr className="border-t border-gray-200 w-full my-4" />
          <NewsSlider />
        </div>
      </main>
    </div>
  )
}

