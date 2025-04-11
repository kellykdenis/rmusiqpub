import Link from "next/link"
import { Twitter, Facebook, Instagram } from "lucide-react"

export function ContactInfo() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-2">Revered Musiq Publishing Group</h2>
        <address className="not-italic text-zinc-600">
          The Kimkalz Universe, Inc.
          <br />
          155572, Lwanga FX Lane
          <br />
          Kampala, Uganda
          <br />
          East Africa
        </address>
      </div>

      <div>
        <p className="text-zinc-600">
          Phone:{" "}
          <a href="tel:+256394531070" className="hover:text-[#F50604]">
            +256 394 531 070
          </a>
        </p>
      </div>

      <div className="space-y-4 border-t border-gray-200 pt-4">
        <div>
          <h3 className="font-medium mb-1">News Media</h3>
          <a href="mailto:media@rmusiqpub.com" className="text-[#F50604] hover:underline">
            media@rmusiqpub.com
          </a>
        </div>

        <div>
          <h3 className="font-medium mb-1">Music Licensing</h3>
          <a href="mailto:licensing@rmusiqpub.com" className="text-[#F50604] hover:underline">
            licensing@rmusiqpub.com
          </a>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h3 className="font-medium mb-3">Join us on:</h3>
        <div className="flex gap-4">
          <Link
            href="https://x.com/rmusiqpub"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#f8f0ea] hover:bg-[#F50604] hover:text-white p-2 rounded-md transition-colors"
          >
            <Twitter className="h-5 w-5" />
            <span className="sr-only">Twitter</span>
          </Link>
          <Link
            href="https://facebook.com/rmusiqpub"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#f8f0ea] hover:bg-[#F50604] hover:text-white p-2 rounded-md transition-colors"
          >
            <Facebook className="h-5 w-5" />
            <span className="sr-only">Facebook</span>
          </Link>
          <Link
            href="https://instagram.com/rmusiqpub"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#f8f0ea] hover:bg-[#F50604] hover:text-white p-2 rounded-md transition-colors"
          >
            <Instagram className="h-5 w-5" />
            <span className="sr-only">Instagram</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
