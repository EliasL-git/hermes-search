import React from "react"
import { Search, Loader2, FileText, AlertCircle } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { PageContainer } from "../components/PageContainer"

interface SearchResult {
  title: string
  url: string
  snippet?: string
  scrapedContent?: string
}

interface WorkflowResponse {
  success?: boolean
  results?: SearchResult[]
  error?: string
  message?: string
}

export default function HomePage() {
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [hasSearched, setHasSearched] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const abortControllerRef = React.useRef<AbortController | null>(null)

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    if (isLoading) return

    if (abortControllerRef.current) abortControllerRef.current.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    setIsLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
        signal: controller.signal,
      })

      let data: WorkflowResponse = {}
      try { data = await response.json() } catch { data = {} }

      if (!response.ok || data.success === false) {
        throw new Error(data.error || data.message || `Search failed (${response.status})`)
      }

      setResults(normalizeResults(data.results))
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return
      setResults([])
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  function normalizeResults(raw: unknown): SearchResult[] {
    if (!Array.isArray(raw)) return []
    return raw
      .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
      .map((item) => ({
        title: String(item.title || "Untitled"),
        url: String(item.url || "#"),
        snippet: item.snippet != null ? String(item.snippet) : item.description != null ? String(item.description) : undefined,
        scrapedContent: item.scrapedContent != null ? String(item.scrapedContent) : item.pageContent != null ? String(item.pageContent) : item.content != null ? String(item.content) : undefined,
      }))
  }

  React.useEffect(() => { return () => { abortControllerRef.current?.abort() } }, [])

  return (
    <PageContainer className="h-full">
      <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center pt-16 pb-12">
        <div className="w-full max-w-2xl mx-auto text-center px-4">
          <div className="mb-10">
            <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-white mb-3">Hermes</h1>
            <p className="text-lg text-stone-400">Free web search &amp; scrape</p>
          </div>

          <form onSubmit={handleSearch} className="relative mb-8">
            <div className="relative flex items-center">
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for anything — websites, products, tools..."
                className="w-full h-14 pl-5 pr-28 text-base md:text-lg rounded-full bg-zinc-900 border-zinc-700 text-white placeholder:text-stone-500 focus:border-emerald-500 focus:ring-emerald-500/20 shadow-2xl"
                autoFocus
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                <span className="sr-only">Search</span>
              </Button>
            </div>
          </form>

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-left">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center gap-2 text-stone-400 py-8">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Searching the web...</span>
            </div>
          )}

          {!isLoading && hasSearched && results.length === 0 && !error && (
            <p className="text-stone-500 py-8">No results found. Try a different query.</p>
          )}

          {!isLoading && results.length > 0 && (
            <div className="text-left space-y-5 mt-4">
              {results.map((result, index) => (
                <SearchResultCard key={`${result.url}-${index}`} result={result} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}

function SearchResultCard({ result }: { result: SearchResult }) {
  const [expanded, setExpanded] = React.useState(false)
  const hasScrapedContent = result.scrapedContent && result.scrapedContent.trim().length > 0

  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 transition-colors hover:border-zinc-700">
      <a href={result.url} target="_blank" rel="noopener noreferrer" className="group block">
        <h2 className="text-lg font-medium text-blue-400 group-hover:text-blue-300 group-hover:underline mb-1 truncate">{result.title}</h2>
        <p className="text-sm text-emerald-500 mb-2 truncate">{result.url}</p>
      </a>

      {result.snippet && (
        <p className="text-sm text-stone-300 leading-relaxed line-clamp-3">{result.snippet}</p>
      )}

      {hasScrapedContent && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="inline-flex items-center gap-2 text-sm font-medium text-stone-400 hover:text-white transition-colors"
          >
            <FileText className="h-4 w-4" />
            {expanded ? "Hide page content" : "Page content"}
          </button>
          {expanded && (
            <div className="mt-3 rounded-lg bg-zinc-950 border border-zinc-800 p-4">
              <p className="text-sm text-stone-300 leading-relaxed whitespace-pre-wrap line-clamp-[20]">{result.scrapedContent}</p>
            </div>
          )}
        </div>
      )}
    </article>
  )
}