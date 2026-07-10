import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardClient } from "./DashboardClient"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: portfolio } = await supabase
    .from("portfolios")
    .select(`
      *,
      brandbook(*),
      hero_section(*),
      about_section(*),
      projects(*),
      cases_section(*),
      footer_section(*)
    `)
    .eq("user_id", user.id)
    .single()

  if (!portfolio) redirect("/wizard")

  return <DashboardClient portfolio={portfolio} />
}
