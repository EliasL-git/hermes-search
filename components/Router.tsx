import React from "react"
import PortalSDK from "@stacker/portal-sdk"
import HomePage from "../pages/HomePage"
import NotFoundPage from "../pages/NotFoundPage"

export function Router() {
  const { currentPage } = PortalSDK.useRouter()

  switch (currentPage) {
    case "home":
    case undefined:
    case null:
    case "":
      return <HomePage />
    default:
      return <NotFoundPage />
  }
}