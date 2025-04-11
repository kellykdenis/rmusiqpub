import { Header } from "@/components/header"
import { AboutContent } from "@/components/about-content"

export default function AboutPage() {
  return (
    <>
      <Header />
      <hr className="border-t border-gray-200 w-full" />
      <main className="flex-1">
        <AboutContent />
      </main>
    </>
  )
}
