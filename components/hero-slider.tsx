"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import type React from "react" // Added import for React

const slides = [
  {
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/s1.jpg-FsZhr9cu0uIt2gJRswqdWvIzzjLGNr.jpeg",
    title: "DISCOVER OUR ARTISTS",
    subtitle: "Explore the diverse talent shaping the future of music.",
    cta: "View Artists & Writers",
  },
  {
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/s2.jpg-BX5TkqSLco5RgFz0mZVhgdfPIokhBE.jpeg",
    title: "EMPOWERING VOICES",
    subtitle: "Supporting emerging songwriters and artists across East Africa.",
    cta: "Learn More",
  },
  {
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/s3.jpg-0gpKNZc8HYsssvprYEn2T5sUnMUyRw.jpeg",
    title: "ICONIC CATALOG",
    subtitle: "The RMP catalog spans genres, geographies and generations.",
    cta: "Search RMP Songs",
  },
]

const HeroButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
  <button
    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors 
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white 
    disabled:pointer-events-none disabled:opacity-50 border-2 border-white bg-transparent 
    text-white px-4 py-2 hover:bg-[#F50604] hover:border-[#F50604] hover:text-white"
    {...props}
  >
    {children}
  </button>
)

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative h-[506px] w-[1180px] mx-auto overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            currentSlide === index
              ? "opacity-100 translate-x-0"
              : index === (currentSlide - 1 + slides.length) % slides.length
                ? "opacity-0 -translate-x-full"
                : "opacity-0 translate-x-full"
          }`}
        >
          <Image
            src={slide.image || "/placeholder.svg"}
            alt={slide.title}
            width={1180}
            height={506}
            className="object-cover"
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-black/40">
            <div className="container mx-auto h-full flex flex-col justify-center px-8">
              <div className="max-w-xl">
                <h1 className="text-5xl font-bold mb-4 text-white">{slide.title}</h1>
                <p className="text-xl mb-8 text-white">{slide.subtitle}</p>
                <HeroButton>{slide.cta}</HeroButton>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-4 h-2 transition-colors duration-300 ${
              currentSlide === index ? "bg-[#F50604]" : "bg-white/50"
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  )
}
