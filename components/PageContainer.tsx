import React from "react"

interface PageContainerProps {
  children: React.ReactNode
  fullBleed?: boolean
  className?: string
}

export function PageContainer({ children, fullBleed = false, className = "" }: PageContainerProps) {
  if (fullBleed) {
    return (
      <div className={`pt-16 w-full max-w-full min-w-0 overflow-x-clip ${className}`}>
        {children}
      </div>
    )
  }
  return (
    <div className={`pt-20 pb-8 w-full max-w-7xl mx-auto px-4 md:px-6 min-w-0 overflow-x-clip ${className}`}>
      {children}
    </div>
  )
}