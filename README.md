# Hermes Search

Free web search & scrape engine. No API keys, no auth, no cost.

## How it works

1. User enters a search query
2. Searches DuckDuckGo Lite (free, no API key)
3. Parses organic results, skips ads
4. Scrapes top 3 result pages for full content
5. Returns structured JSON results

## Live demo

https://hermes.stacker.ai

## Tech Stack

- Next.js API route (server-side search + scraping)
- React frontend with Tailwind CSS
- DuckDuckGo Lite search (no API key needed)
- Server-side page scraping

## Running locally

```bash
npm install
npm run dev
```

## API

POST /api/search

```json
{ "query": "best laptop 2026" }
```

Returns:

```json
{
  "success": true,
  "query": "best laptop 2026",
  "totalResults": 10,
  "scrapedCount": 3,
  "results": [
    {
      "title": "The Best Laptops for 2026",
      "url": "https://...",
      "snippet": "...",
      "scraped": "Full page content..."
    }
  ]
}
```

## Features

- **100% free** — no API keys, no paid services
- **No auth** — public portal, anyone can use it
- **Dark mode** — clean, modern UI
- **Page scraping** — get full page content, not just snippets
- **Ad filtering** — skips sponsored results