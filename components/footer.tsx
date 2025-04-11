"use client"

import Link from "next/link"
import Image from "next/image"
import { Twitter, Instagram, Facebook, Youtube, Linkedin, ArrowUp } from "lucide-react"

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="bg-[#F7F7F7] border-t">
      <div className="max-w-[1180px] mx-auto pt-6 pb-1">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <Link href="https://rmusiqpub.com" target="_blank" rel="noopener noreferrer">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/rmplogobtm-eSQ9NJg7SepM8xjY93xeBWvx7gq0uJ.png"
                alt="Revered Musiq Publishing"
                width={120}
                height={23.5}
                className="mb-6"
              />
            </Link>
            <div className="flex gap-4">
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

          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-[#F50604]">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#F50604]">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#F50604]">
                  Do not sell my personal information
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-[#F50604]">
                  Song List
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#F50604]">
                  RMP Window
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#F50604]">
                  Cookie Choices
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-[#F50604]">
                  Royalty Inquiries
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#F50604]">
                  Revered Musiq Production
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-6 pb-5 border-t text-sm text-zinc-600">
          © 2024 Revered Musiq Publishing All rights reserved
        </div>
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 bg-[#F50604] text-white p-2 rounded-full shadow-lg hover:bg-[#D50604] transition-colors"
          aria-label="Back to top"
        >
          <ArrowUp className="h-6 w-6" />
        </button>
      </div>
    </footer>
  )
}
