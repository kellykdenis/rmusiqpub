"use client"

import { useEffect, useRef, useState } from "react"
import { Loader } from "@googlemaps/js-api-loader"

export function ContactMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapError, setMapError] = useState<string | null>(null)

  useEffect(() => {
    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
          version: "weekly",
        })

        const google = await loader.load()
        const { Map, Marker } = await google.maps

        // Coordinates for The Kimkalz Universe, Inc
        const kimkalzLocation = { lat: 0.3157629, lng: 32.6087416 }

        const mapOptions = {
          center: kimkalzLocation,
          zoom: 16,
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.TOP_LEFT,
          },
          fullscreenControl: true,
          fullscreenControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT,
          },
          streetViewControl: true,
        }

        if (mapRef.current) {
          const map = new Map(mapRef.current, mapOptions)

          new Marker({
            position: kimkalzLocation,
            map,
            title: "Revered Musiq Publishing Group at The Kimkalz Universe",
          })
        }
      } catch (error) {
        setMapError("Failed to load map. Please try again later.")
        console.error("Map loading error:", error)
      }
    }

    initMap()
  }, [])

  return (
    <div className="relative">
      <div ref={mapRef} className="w-full h-[500px] rounded-lg overflow-hidden border border-gray-200" />
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <p className="text-red-600">{mapError}</p>
        </div>
      )}
    </div>
  )
}

