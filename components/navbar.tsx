"use client"

import { useState } from "react"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-emerald-100 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold text-gray-900 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-emerald-500 mr-2"
              >
                <path d="M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"></path>
                <path d="M16 2v20"></path>
                <path d="M10 6h2"></path>
                <path d="M10 10h2"></path>
                <path d="M10 14h2"></path>
                <path d="M10 18h2"></path>
              </svg>
              AirQuality <span className="text-emerald-500">Monitor</span>
            </span>
          </div>
        </div>
      </div>
    </nav>
  )
}
