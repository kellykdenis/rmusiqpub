import { Header } from "@/components/header"
import { ContactInfo } from "@/components/contact-info"
import { ContactMap } from "@/components/contact-map"

export default function ContactPage() {
  return (
    <>
      <Header />
      <hr className="border-t border-gray-200 w-full" />
      <main className="flex-1 py-8">
        <div className="max-w-[1180px] mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Contact Us</h1>
          <div className="grid md:grid-cols-2 gap-8">
            <ContactInfo />
            <ContactMap />
          </div>
        </div>
      </main>
    </>
  )
}

