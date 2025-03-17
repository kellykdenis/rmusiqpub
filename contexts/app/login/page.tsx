"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const [isEmployee, setIsEmployee] = useState(false)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-[900px]">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/rmplogo-u5LUrWNOFODwcOASrJ87cqlZ0rObSI.png"
            alt="Revered Musiq Publishing Group"
            width={280}
            height={55}
            priority
            className="mb-2"
          />
        </div>

        {/* Login Container */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Side - Regular Login */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Log In</h2>
            <form className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  required
                  className="w-full border-gray-300 focus:border-[#F50604] focus:ring-[#F50604]"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  required
                  className="w-full border-gray-300 focus:border-[#F50604] focus:ring-[#F50604]"
                />
              </div>

              <Link href="#" className="block text-sm text-[#F50604] hover:underline">
                Forgot Your Password/Reset Your Password
              </Link>

              <Button type="submit" className="w-full bg-[#F50604] hover:bg-[#D50604] text-white font-normal">
                Sign In
              </Button>
            </form>
          </div>

          {/* Right Side - Employee Login */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">RMPG Employee Log In</h2>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Select an account to log in</p>
              <Button
                variant="outline"
                className="w-full justify-start gap-4 text-left font-normal border-gray-300 hover:bg-gray-50"
              >
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/rmplogobtm-eSQ9NJg7SepM8xjY93xeBWvx7gq0uJ.png"
                  alt="RMPG"
                  width={24}
                  height={24}
                  className="rounded"
                />
                RMPG Employee
              </Button>
            </div>
          </div>
        </div>

        {/* Privacy Policy */}
        <div className="mt-8 text-center text-sm text-gray-600">
          By submitting, you agree to the{" "}
          <Link href="#" className="text-[#F50604] hover:underline">
            Revered Musiq Group Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  )
}

