import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const supabase = await createServiceClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { portfolioId } = await request.json()

  // Fetch portfolio
  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("*")
    .eq("id", portfolioId)
    .eq("user_id", user.id)
    .single()

  if (!portfolio) {
    return NextResponse.json({ error: "Portfolio not found" }, { status: 404 })
  }

  const domain = portfolio.domain
  if (!domain) {
    return NextResponse.json({ error: "Domain not set" }, { status: 400 })
  }

  // Add custom domain to Vercel project
  const vercelToken = process.env.VERCEL_TOKEN
  const vercelProjectId = process.env.VERCEL_PROJECT_ID
  const vercelTeamId = process.env.VERCEL_TEAM_ID

  let vercelDomainId: string | null = null

  if (vercelToken && vercelProjectId) {
    const teamQuery = vercelTeamId ? `?teamId=${vercelTeamId}` : ""
    const res = await fetch(
      `https://api.vercel.com/v10/projects/${vercelProjectId}/domains${teamQuery}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${vercelToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: domain }),
      }
    )

    if (res.ok) {
      const data = await res.json()
      vercelDomainId = data.apexName ?? data.name ?? domain
    }
  }

  // Mark portfolio as published
  await supabase
    .from("portfolios")
    .update({
      status: "published",
      vercel_domain_id: vercelDomainId ?? domain,
    })
    .eq("id", portfolioId)

  return NextResponse.json({
    success: true,
    url: `https://${domain}`,
  })
}
