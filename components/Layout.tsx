import React from "react"
import { Header } from "./Header"
import { Footer } from "./Footer"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-black overflow-x-clip">
      <Header />
      <main className="flex-1 w-full max-w-full overflow-x-clip">
        {children}
      </main>
      <Footer />
    </div>
  )
}