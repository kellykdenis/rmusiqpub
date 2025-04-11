export interface Song {
  id: string
  title: string
  artist: string
  audioUrl: string
  external_urls?: {
    spotify?: string
  }
  album?: {
    name?: string
    images?: Array<{ url: string; height: number; width: number }>
  }
}

// This will be populated dynamically from the Spotify API
export const sampleSongs: Song[] = [
  {
    id: "1",
    title: "Loading...",
    artist: "Please wait",
    audioUrl: "",
  },
]
