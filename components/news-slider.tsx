"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { newsArticles } from "@/data/newsArticles"

export function NewsSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const itemsPerSlide = 4
  const totalSlides = Math.ceil(newsArticles.length / itemsPerSlide)

  return (
    <div className="relative h-[275px] py-1">
      <div className="overflow-hidden h-full">
        <div
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {Array.from({ length: totalSlides }).map((_, slideIndex) => (
            <div key={slideIndex} className="flex-none w-full h-full">
              <div className="flex h-full gap-4">
                {newsArticles.slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide).map((item, index) => (
                  <div key={item.id} className={`w-1/4 ${index === 0 ? "pl-0" : "pl-4"} ${index === 3 ? "pr-0" : ""}`}>
                    <h2 className="text-lg font-bold mb-2">{item.category}</h2>
                    <Link href={`/news/${item.slug}`} className="group block">
                      <div className="relative w-full h-[124px] mb-2 overflow-hidden">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.title}
                          width={280}
                          height={124}
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                          <span className="text-sm">{item.title}</span>
                        </div>
                      </div>
                      <p className="text-sm text-zinc-600 line-clamp-3">{item.description}</p>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <button
            key={index}
            className={`w-4 h-2 ${currentSlide === index ? "bg-[#F50604]" : "bg-zinc-300"}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  )
}
