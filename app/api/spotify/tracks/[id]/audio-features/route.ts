import { NextResponse } from "next/server"
import { getTrackAudioFeatures } from "@/lib/spotify"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const features = await getTrackAudioFeatures(id)
    return NextResponse.json(features)
  } catch (error) {
    console.error("Error in track audio features route:", error)
    return NextResponse.json({ error: "Failed to fetch track audio features" }, { status: 500 })
  }
} 