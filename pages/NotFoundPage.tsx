import React from "react"
import PortalSDK from "@stacker/portal-sdk"
import { Button } from "@workspace/ui/components/button"
import { Home, ArrowLeft, FileQuestion } from "lucide-react"
import { PageContainer } from "../components/PageContainer"

export default function NotFoundPage() {
  const { navigate, goBack } = PortalSDK.useRouter()

  return (
    <PageContainer>
      <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full text-center px-4">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto rounded-full bg-stone-100 flex items-center justify-center mb-6">
            <FileQuestion className="w-12 h-12 text-stone-400" />
          </div>
          <h1 className="text-6xl font-bold text-stone-200 mb-2">404</h1>
        </div>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-stone-900 mb-2">Page not found</h2>
          <p className="text-stone-500">Sorry, we could not find the page you are looking for.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button onClick={() => navigate("home")} className="bg-violet-600 hover:bg-violet-700 gap-2 w-full sm:w-auto">
            <Home className="h-4 w-4" />Go to Home
          </Button>
          <Button variant="outline" onClick={() => goBack()} className="gap-2 w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4" />Go Back
          </Button>
        </div>
      </div>
      </div>
    </PageContainer>
  )
}