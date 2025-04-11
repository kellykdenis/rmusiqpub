"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Message sent!",
      description: "We'll get back to you as soon as possible.",
    })

    setIsSubmitting(false)
    event.currentTarget.reset()
  }

  return (
    <div className="relative">
      <div className="absolute inset-0">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1.%20Bebe%20Cool%20-%20Circumference.jpg-VZlzTGZ50tDWiEz1fA5FZu3I8A7CTl.jpeg"
          alt="Contact background"
          fill
          className="object-cover brightness-50"
          priority
        />
      </div>

      <div className="relative min-h-[calc(100vh-280px)] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-8">
          <h1 className="text-4xl font-bold mb-2">Contact Us</h1>
          <p className="text-zinc-600 mb-8">
            Get in touch with us for any inquiries about our music publishing services.
          </p>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">
                  First name
                </label>
                <Input id="firstName" name="firstName" required className="bg-white" />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">
                  Last name
                </label>
                <Input id="lastName" name="lastName" required className="bg-white" />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input id="email" name="email" type="email" required className="bg-white" />
            </div>

            <div className="space-y-2">
              <label htmlFor="subject" className="text-sm font-medium">
                Subject
              </label>
              <Input id="subject" name="subject" required className="bg-white" />
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                Message
              </label>
              <Textarea id="message" name="message" required className="min-h-[120px] bg-white" />
            </div>

            <Button type="submit" className="w-full bg-[#F50604] hover:bg-[#D50604] text-white" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
