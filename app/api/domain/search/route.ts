import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const name = searchParams.get("name")?.trim()

  if (!name) {
    return NextResponse.json({ error: "Name required" }, { status: 400 })
  }

  // Generate domain suggestions in priority order
  const parts = name.toLowerCase().split(/\s+/)
  const [first, ...rest] = parts
  const middle = rest.length > 1 ? rest.slice(0, -1).join("") : ""
  const last = rest[rest.length - 1] ?? ""

  const suggestions = [
    `${first}${last}.com`,
    `${first}${last}.com.br`,
    middle ? `${first}${middle}${last}.com` : null,
    middle ? `${first}${middle}${last}.com.br` : null,
    `${first}${last}.net`,
    `${first}${last}.pro`,
  ].filter(Boolean) as string[]

  // Check availability via Cloudflare API
  const cfToken = process.env.CLOUDFLARE_API_TOKEN
  const cfAccount = process.env.CLOUDFLARE_ACCOUNT_ID

  if (!cfToken || !cfAccount) {
    // Return mock data in development
    return NextResponse.json({
      suggestions: suggestions.slice(0, 4).map((domain) => ({
        domain,
        available: Math.random() > 0.3,
        price_cents: domain.endsWith(".com") ? 850 : 4500,
        currency: "BRL",
      })),
    })
  }

  const results = await Promise.all(
    suggestions.slice(0, 4).map(async (domain) => {
      try {
        const response = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${cfAccount}/registrar/domains/${domain}`,
          {
            headers: {
              Authorization: `Bearer ${cfToken}`,
              "Content-Type": "application/json",
            },
          }
        )
        const data = await response.json()

        if (data.success && data.result) {
          return {
            domain,
            available: data.result.available ?? false,
            price_cents: Math.round((data.result.fees?.registration ?? 8.5) * 100),
            currency: "BRL",
          }
        }

        return { domain, available: false, price_cents: 0, currency: "BRL" }
      } catch {
        return { domain, available: false, price_cents: 0, currency: "BRL" }
      }
    })
  )

  return NextResponse.json({ suggestions: results })
}
