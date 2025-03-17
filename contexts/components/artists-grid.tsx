import Image from "next/image"
import Link from "next/link"
import { Select } from "@/components/ui/select"

// Update the artists data to include social links and featured video
export const artists = [
  {
    id: "1",
    name: "Bebe Cool",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/BC1-50lHZcEFX4ydaRVQqj0VeYFPIo1OlU.jpeg", // New Bebe Cool image
    slug: "bebe-cool",
    website: "https://bebecool.co.ug",
    featuredVideoId: "dQw4w9WgXcQ",
    socials: {
      spotify: "https://open.spotify.com/artist/bebecool",
      instagram: "https://instagram.com/bebecoolug",
      youtube: "https://youtube.com/@bebecool",
      facebook: "https://facebook.com/bebecool",
      twitter: "https://twitter.com/bebecoolug",
    },
    releases: [
      {
        title: "Circumference",
        image:
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1.%20Bebe%20Cool%20-%20Circumference.jpg-VZlzTGZ50tDWiEz1fA5FZu3I8A7CTl.jpeg",
        slug: "circumference",
      },
    ],
  },
  {
    id: "2",
    name: "Jhenell Dina",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/s2.jpg-BX5TkqSLco5RgFz0mZVhgdfPIokhBE.jpeg", // s2 image
    slug: "jhenell-dina",
    website: "https://jhenelldina.com",
    featuredVideoId: "dQw4w9WgXcQ",
    socials: {
      spotify: "https://open.spotify.com/artist/jhenelldina",
      instagram: "https://instagram.com/jhenelldina",
      youtube: "https://youtube.com/@jhenelldina",
      facebook: "https://facebook.com/jhenelldina",
      twitter: "https://twitter.com/jhenelldina",
    },
    releases: [
      {
        title: "At Your Feet",
        image: "https://placehold.co/600x600?text=At+Your+Feet",
        slug: "at-your-feet",
      },
      {
        title: "Your Way",
        image: "https://placehold.co/600x600?text=Your+Way",
        slug: "your-way",
      },
      {
        title: "Bless Me",
        image: "https://placehold.co/600x600?text=Bless+Me",
        slug: "bless-me",
      },
      {
        title: "Mighty Warrior",
        image: "https://placehold.co/600x600?text=Mighty+Warrior",
        slug: "mighty-warrior",
      },
      {
        title: "Trust (Alive Again Riddim)",
        image: "https://placehold.co/600x600?text=Trust",
        slug: "trust",
      },
      {
        title: "Ffe'Abaliko",
        image: "https://placehold.co/600x600?text=Ffe+Abaliko",
        slug: "ffe-abaliko",
      },
      {
        title: "Nkwagala",
        image:
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2.%20Jhenell%20Dina%20-%20Nkwagala.jpg-kh8CAjVBSSTuiV5Dl2a0XLZzdfmfBR.jpeg",
        slug: "nkwagala",
      },
    ],
  },
  {
    id: "3",
    name: "Phila Kaweesa",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/s3.jpg-0gpKNZc8HYsssvprYEn2T5sUnMUyRw.jpeg", // s3 image
    slug: "phila-kaweesa",
    website: "https://philakaweesa.com",
    featuredVideoId: "dQw4w9WgXcQ",
    socials: {
      spotify: "https://open.spotify.com/artist/philakaweesa",
      instagram: "https://instagram.com/philakaweesa",
      youtube: "https://youtube.com/@philakaweesa",
      facebook: "https://facebook.com/philakaweesa",
      twitter: "https://twitter.com/philakaweesa",
    },
    releases: [
      {
        title: "Faith Walks",
        image:
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3.%20Phila%20Kaweesa%20-%20Faith%20Walks.jpg-wYHYjUfOUuuCQAhGVT5x7hM2Crg0DV.jpeg",
        slug: "faith-walks",
      },
    ],
  },
  {
    id: "4",
    name: "Carol Bu'dhwike",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4.%20Carol%20Bu'dhwike%20-%20Tukusinza%20Tukutenda.jpg-dL50nJSQDxlqcMtsWYes5Xp5voC8M8.jpeg",
    slug: "carol-budhwike",
    website: "https://carolbudhwike.com",
    featuredVideoId: "dQw4w9WgXcQ",
    socials: {
      spotify: "https://open.spotify.com/artist/carolbudhwike",
      instagram: "https://instagram.com/carolbudhwike",
      youtube: "https://youtube.com/@carolbudhwike",
      facebook: "https://facebook.com/carolbudhwike",
      twitter: "https://twitter.com/carolbudhwike",
    },
    releases: [
      {
        title: "Tukusinza Tukutenda",
        image:
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4.%20Carol%20Bu'dhwike%20-%20Tukusinza%20Tukutenda.jpg-dL50nJSQDxlqcMtsWYes5Xp5voC8M8.jpeg",
        slug: "tukusinza-tukutenda",
      },
    ],
  },
  {
    id: "5",
    name: "Johnie Beats",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5.%20Alive%20Again%20-%20Johnie%20Beats.jpg-pFT2A8jb9GoR6CdRybcUGsUI4C9m9G.jpeg",
    slug: "johnie-beats",
    website: "https://johniebeats.com",
    featuredVideoId: "dQw4w9WgXcQ",
    socials: {
      spotify: "https://open.spotify.com/artist/johniebeats",
      instagram: "https://instagram.com/johniebeats",
      youtube: "https://youtube.com/@johniebeats",
      facebook: "https://facebook.com/johniebeats",
      twitter: "https://twitter.com/johniebeats",
    },
    releases: [
      {
        title: "Alive Again (Remastered)",
        image:
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5.%20Alive%20Again%20-%20Johnie%20Beats.jpg-pFT2A8jb9GoR6CdRybcUGsUI4C9m9G.jpeg",
        slug: "alive-again-remastered",
      },
    ],
  },
  {
    id: "6",
    name: "Richy Kaweesa",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/6.%20Richy%20Kaweesa%20-%20Kings%20&%20Queens.jpg-LsYI8KU9bBOZgXbB9PkMvWIpaZpREr.jpeg",
    slug: "richy-kaweesa",
    website: "https://richykaweesa.com",
    featuredVideoId: "dQw4w9WgXcQ",
    socials: {
      spotify: "https://open.spotify.com/artist/richykaweesa",
      instagram: "https://instagram.com/richykaweesa",
      youtube: "https://youtube.com/@richykaweesa",
      facebook: "https://facebook.com/richykaweesa",
      twitter: "https://twitter.com/richykaweesa",
    },
    releases: [
      {
        title: "Kings & Queens",
        image:
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/6.%20Richy%20Kaweesa%20-%20Kings%20&%20Queens.jpg-LsYI8KU9bBOZgXbB9PkMvWIpaZpREr.jpeg",
        slug: "kings-and-queens",
      },
    ],
  },
]

export function ArtistsGrid() {
  return (
    <div className="max-w-[1180px] mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Artists & Writers</h1>
        <Select>
          <option>Our Artists & Writers</option>
          {artists.map((artist) => (
            <option key={artist.slug}>{artist.name}</option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {artists.map((artist) => (
          <Link key={artist.slug} href={`/artists-writers/${artist.slug}`} className="group block">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg mb-2">
              <Image
                src={artist.image || "/placeholder.svg"}
                alt={artist.name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <h2 className="text-lg font-medium group-hover:text-[#F50604]">{artist.name}</h2>
          </Link>
        ))}
      </div>
    </div>
  )
}

