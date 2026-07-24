import React from "react"
import { Link } from "@stacker/portal-sdk"

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <div className="flex items-center h-16">
          <Link
            to="home"
            className="text-xl font-semibold tracking-tight text-white hover:text-white/90 transition-colors"
          >
            Hermes
          </Link>
        </div>
      </div>
    </header>
  )
}