interface SearchRequest {
  query?: string
}

interface SearchResult {
  title: string
  url: string
  snippet: string
  scraped?: string
}

interface SearchResponse {
  success: boolean
  query: string
  totalResults: number
  scrapedCount: number
  results: SearchResult[]
}

interface ErrorResponse {
  error: string
  details?: string
}

const USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"

function decodeUddg(href: string): string | null {
  const match = href.match(/[?&]uddg=([^&]+)/i)
  if (!match) return null
  try {
    return decodeURIComponent(match[1])
  } catch {
    return null
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

async function scrapePage(url: string): Promise<string | undefined> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    })

    if (!response.ok) return undefined

    const contentType = response.headers.get("content-type") || ""
    if (!contentType.includes("text/html")) return undefined

    const html = await response.text()
    const text = stripHtml(html)
    return text.slice(0, 2000)
  } catch {
    return undefined
  }
}

async function fetchDuckDuckGoResults(query: string): Promise<SearchResult[]> {
  const encodedQuery = encodeURIComponent(query.trim())
  const searchUrl = `https://lite.duckduckgo.com/lite/?q=${encodedQuery}`

  const response = await fetch(searchUrl, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      Referer: "https://lite.duckduckgo.com/",
    },
  })

  if (!response.ok) {
    throw new Error(`DuckDuckGo returned ${response.status}`)
  }

  const html = await response.text()
  const results: SearchResult[] = []

  const rowRegex = /<tr[^>]*>.*?<\/tr>/gis
  const rows = html.match(rowRegex) || []

  for (const row of rows) {
    if (row.includes("ad_domain=")) continue

    const linkMatch = row.match(
      /<a[^>]+href=["']([^"']*uddg=[^"']+)["'][^>]*>(.*?)<\/a>/is
    )
    if (!linkMatch) continue

    const rawHref = linkMatch[1]
    const url = decodeUddg(rawHref)
    if (!url) continue

    const title = stripHtml(linkMatch[2])

    const snippetMatch = row.match(
      /<td[^>]+class=['"]result-snippet['"][^>]*>(.*?)<\/td>/is
    )
    const snippet = snippetMatch ? stripHtml(snippetMatch[1]) : ""

    results.push({ title, url, snippet })
  }

  return results
}

export default async function handler(
  req: { method?: string; body: SearchRequest },
  res: {
    status: (code: number) => { json: (body: SearchResponse | ErrorResponse) => void }
  }
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { query } = req.body
  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return res.status(400).json({ error: "Missing or invalid 'query' field" })
  }

  const trimmedQuery = query.trim()

  try {
    const organicResults = await fetchDuckDuckGoResults(trimmedQuery)

    const topResults = organicResults.slice(0, 3)
    const scrapedResults: SearchResult[] = []
    let scrapedCount = 0

    for (const result of topResults) {
      const scraped = await scrapePage(result.url)
      if (scraped) scrapedCount += 1
      scrapedResults.push({ ...result, scraped })
    }

    const remainingResults = organicResults.slice(3)

    const response: SearchResponse = {
      success: true,
      query: trimmedQuery,
      totalResults: organicResults.length,
      scrapedCount,
      results: [...scrapedResults, ...remainingResults],
    }

    return res.status(200).json(response)
  } catch (err) {
    const details = err instanceof Error ? err.message : "Unknown error"
    return res.status(500).json({
      error: "Search failed",
      details,
    })
  }
}