export interface NewsArticle {
  id: number
  slug: string
  category: string
  title: string
  description: string
  content: string
  image: string
  date: string
}

export const newsArticles: NewsArticle[] = [
  {
    id: 1,
    slug: "jamie-kinelski-appointed",
    category: "News",
    title: "Jamie Kinelski",
    description:
      "The seasoned executive joins RMP as Senior Vice President of A&R, where she will sign, develop and guide the evolution of emerging and established songwriters, artists and producers.",
    content: `
      <p>Revered Musiq Publishing Group (RMPG) is thrilled to announce the appointment of Jamie Kinelski as Senior Vice President of A&R. In this pivotal role, Kinelski will be responsible for signing, developing, and guiding the evolution of both emerging and established songwriters, artists, and producers.</p>
      <p>With over 15 years of experience in the music industry, Kinelski brings a wealth of knowledge and a proven track record of identifying and nurturing top-tier talent. Her appointment underscores RMPG's commitment to maintaining its position as a leader in the music publishing landscape.</p>
      <p>"We are excited to welcome Jamie to the RMPG family," said the CEO of Revered Musiq Publishing Group. "Her passion for music, industry expertise, and ability to foster creative talent will be invaluable as we continue to grow our roster and provide unparalleled opportunities for our artists and songwriters."</p>
      <p>Kinelski expressed her enthusiasm about joining RMPG, stating, "I'm honored to be part of such a respected and forward-thinking company. RMPG has a rich history of supporting incredible talent, and I look forward to contributing to its legacy by discovering and developing the next generation of music creators."</p>
      <p>In her new role, Kinelski will work closely with RMPG's existing team to expand the company's creative initiatives and strengthen its position in key markets across East Africa and beyond.</p>
    `,
    image: "https://placehold.co/600x400?text=Jamie+Kinelski",
    date: "01 February 2025",
  },
  {
    id: 2,
    slug: "us-holiday-commercials",
    category: "Sync News",
    title: "US Holiday Commercials",
    description:
      "The RMP sync team licensed the music for a host of holiday commercials this year, for brands including Amazon, Target, Airbnb, Starbucks and Mercedes-Benz.",
    content: `
      <p>The Revered Musiq Publishing Group (RMPG) sync team has once again demonstrated its prowess in the world of commercial music licensing, securing placements for a impressive array of holiday commercials for some of the biggest brands in the United States.</p>
      <p>This holiday season, viewers across the country will be treated to RMPG-licensed music in commercials for industry giants including:</p>
      <ul>
        <li>Amazon</li>
        <li>Target</li>
        <li>Airbnb</li>
        <li>Starbucks</li>
        <li>Mercedes-Benz</li>
      </ul>
      <p>These high-profile placements not only showcase the diverse catalog of music represented by RMPG but also highlight the company's strong relationships with major brands and advertising agencies.</p>
      <p>"Our sync team has outdone themselves this holiday season," said the Head of Sync Licensing at RMPG. "These placements in major holiday campaigns demonstrate the emotional power of our music and its ability to connect with audiences during this special time of year."</p>
      <p>The success of these holiday commercial placements is expected to open up even more opportunities for RMPG's artists and songwriters in the coming year, further solidifying the company's position as a leader in music publishing and sync licensing.</p>
    `,
    image: "https://placehold.co/600x400?text=Holiday+Commercials",
    date: "15 December 2024",
  },
  {
    id: 3,
    slug: "natasha-baldwin-appointed",
    category: "News",
    title: "Natasha Baldwin",
    description:
      "RMP Global Classics and Jazz division appoints Natasha Baldwin to President Global Classics, Jazz & Screen.",
    content: `
      <p>Revered Musiq Publishing Group (RMPG) is proud to announce the appointment of Natasha Baldwin as President of Global Classics, Jazz & Screen. This strategic move reinforces RMPG's commitment to excellence across diverse musical genres and further strengthens its position in the global music publishing landscape.</p>
      <p>Natasha Baldwin brings over two decades of experience in the music industry, with a particular focus on classical music, jazz, and film scoring. Her expertise and vision will be instrumental in driving growth and innovation within these specialized sectors of RMPG's business.</p>
      <p>"We are delighted to welcome Natasha to lead our Global Classics, Jazz & Screen division," said the CEO of RMPG. "Her deep understanding of these genres, combined with her proven leadership skills, will be crucial in expanding our reach and supporting our talented composers and musicians in these fields."</p>
      <p>In her new role, Baldwin will oversee the development and execution of global strategies for RMPG's classical, jazz, and screen music catalogs. She will also focus on fostering new talent and exploring innovative ways to promote these genres in the digital age.</p>
      <p>"I am thrilled to join RMPG and lead this important division," Baldwin stated. "The company's rich heritage in classical music, jazz, and screen composition is unparalleled. I look forward to building on this foundation and creating new opportunities for our artists in the global marketplace."</p>
      <p>This appointment underscores RMPG's dedication to nurturing and promoting a diverse range of musical styles, ensuring that the company remains at the forefront of the ever-evolving music industry.</p>
    `,
    image: "https://placehold.co/600x400?text=Natasha+Baldwin",
    date: "10 January 2025",
  },
  {
    id: 4,
    slug: "grammy-nominations-2025",
    category: "Awards News",
    title: "67th GRAMMY Nominations",
    description:
      "RMP songwriters, artists, producers and composers earned a record 111 nominations spanning 51 categories.",
    content: `
      <p>Revered Musiq Publishing Group (RMPG) is celebrating an unprecedented achievement as its songwriters, artists, producers, and composers have garnered a record-breaking 111 nominations for the upcoming 67th Annual GRAMMY Awards. These nominations span an impressive 51 categories, showcasing the depth and diversity of talent represented by RMPG.</p>
      <p>This remarkable feat underscores RMPG's position as a powerhouse in the music industry, with nominations across various genres including pop, R&B, hip-hop, country, rock, classical, and more. Some of the highlights include:</p>
      <ul>
        <li>15 nominations in the "Big Four" categories (Record of the Year, Album of the Year, Song of the Year, and Best New Artist)</li>
        <li>Multiple nominations in genre-specific categories such as Best Pop Vocal Album, Best Rap Performance, and Best Country Song</li>
        <li>Strong presence in technical categories like Producer of the Year and Best Engineered Album</li>
        <li>Notable nominations in specialized categories including Best Global Music Performance and Best Contemporary Classical Composition</li>
      </ul>
      <p>"We are incredibly proud of our talented roster of songwriters, artists, producers, and composers," said the CEO of RMPG. "These nominations are a testament to their hard work, creativity, and the impact they've made on the music industry over the past year."</p>
      <p>The 67th Annual GRAMMY Awards ceremony is scheduled to take place on February 15, 2025, at the Crypto.com Arena in Los Angeles. RMPG will be hosting a special viewing party for its nominees and will be providing live updates throughout the event.</p>
      <p>This record-breaking number of nominations not only celebrates the current success of RMPG's roster but also sets a new benchmark for the company's future achievements in the music industry.</p>
    `,
    image: "https://placehold.co/600x400?text=GRAMMY+Nominations",
    date: "20 November 2024",
  },
]
