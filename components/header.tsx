import Link from "next/link"
import Image from "next/image"
import { Twitter, Instagram, Facebook, Youtube, Linkedin } from "lucide-react"
import { SpotifyAuth } from "@/components/spotify-auth"

export function Header() {
  return (
    <header className="mb-0">
      <div className="max-w-[1180px] mx-auto pt-6 pb-1">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/rmplogo-u5LUrWNOFODwcOASrJ87cqlZ0rObSI.png"
              alt="Revered Musiq Publishing Group"
              width={340}
              height={66}
              priority
            />
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center mr-4">
              <SpotifyAuth />
            </div>
            <Link href="https://x.com/rmusiqpub" className="hover:text-[#F50604]">
              <Twitter className="h-4 w-4" />
            </Link>
            <Link href="https://instagram.com/rmusiqpub" className="hover:text-[#F50604]">
              <Instagram className="h-4 w-4" />
            </Link>
            <Link href="https://facebook.com/rmusiqpub" className="hover:text-[#F50604]">
              <Facebook className="h-4 w-4" />
            </Link>
            <Link href="https://youtube.com/@rmusiqpub" className="hover:text-[#F50604]">
              <Youtube className="h-4 w-4" />
            </Link>
            <Link href="https://linkedin.com/rmusiqpub" className="hover:text-[#F50604]">
              <Linkedin className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <nav className="flex justify-end mt-2">
          <ul className="flex items-center">
            <li>
              <Link href="/artists-writers" className="px-3 py-2 hover:bg-[#F50604] hover:text-white transition-colors">
                ARTISTS & WRITERS
              </Link>
            </li>
            <li>
              <Link href="/news" className="px-3 py-2 hover:bg-[#F50604] hover:text-white transition-colors">
                NEWS
              </Link>
            </li>
            <li>
              <Link href="/songs" className="px-3 py-2 hover:bg-[#F50604] hover:text-white transition-colors">
                SONGS
              </Link>
            </li>
            <li>
              <Link href="/about" className="px-3 py-2 hover:bg-[#F50604] hover:text-white transition-colors">
                ABOUT
              </Link>
            </li>
            <li>
              <Link href="/contact" className="px-3 py-2 hover:bg-[#F50604] hover:text-white transition-colors">
                CONTACT
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

