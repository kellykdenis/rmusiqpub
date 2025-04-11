import Image from "next/image"

const artistImages = [
  { src: "/placeholder.svg", alt: "Artist 1", width: 300, height: 200 },
  { src: "/placeholder.svg", alt: "Artist 2", width: 300, height: 200 },
  { src: "/placeholder.svg", alt: "Artist 3", width: 300, height: 200 },
  { src: "/placeholder.svg", alt: "Artist 4", width: 300, height: 200 },
  { src: "/placeholder.svg", alt: "Artist 5", width: 300, height: 200 },
  { src: "/placeholder.svg", alt: "Artist 6", width: 300, height: 200 },
]

export function AboutContent() {
  return (
    <div className="max-w-[1180px] mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">About Revered Musiq Publishing Group</h1>

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        {artistImages.map((image, index) => (
          <div key={index} className="relative aspect-[3/2] overflow-hidden rounded-lg">
            <Image src={image.src || "/placeholder.svg"} alt={image.alt} fill className="object-cover" />
          </div>
        ))}
      </div>

      <div className="prose max-w-none">
        <p className="text-lg mb-6">
          Revered Musiq Publishing Group (RMPG), the global publishing division of Revered Musiq Group, represents a
          world-class catalogue of songs inclusive of every genre. Headquartered in Kampala, RMPG has offices across
          East Africa. The company represents some of the world's most important songwriters and catalogs.
        </p>

        <p className="mb-6">
          Our roster includes emerging talents and established artists across multiple genres, from gospel and
          contemporary Christian music to R&B, hip-hop, and traditional African music. We pride ourselves on discovering
          and nurturing new talent while preserving and promoting our rich musical heritage.
        </p>

        <p className="mb-6">
          RMPG is also a global leader in Christian/Gospel and Production Music. The company is the publisher of choice
          for film and TV studios, providing creative, sync licensing and administration services for companies across
          East Africa and beyond.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Our Services</h2>
        <ul className="list-disc pl-6 mb-6">
          <li>Music Publishing and Administration</li>
          <li>Sync Licensing</li>
          <li>Artist Development</li>
          <li>Copyright Management</li>
          <li>Digital Distribution</li>
          <li>Performance Rights</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">Our Mission</h2>
        <p className="mb-6">
          To discover, nurture, and promote exceptional musical talent while preserving and celebrating Africa's rich
          musical heritage. We strive to create opportunities for our artists and songwriters on both local and global
          stages.
        </p>
      </div>
    </div>
  )
}
