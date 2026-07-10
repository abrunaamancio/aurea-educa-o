import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PublishClient } from "./PublishClient"

export default async function PreviewPage() {
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
      footer_section(*)
    `)
    .eq("user_id", user.id)
    .single()

  if (!portfolio) redirect("/wizard")

  return <PublishClient portfolio={portfolio} />
}
