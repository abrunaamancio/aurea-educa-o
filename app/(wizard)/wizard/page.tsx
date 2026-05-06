import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function WizardStartPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  // Check if portfolio already exists
  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("id, status")
    .eq("user_id", user.id)
    .single()

  if (portfolio?.status === "published") {
    redirect("/dashboard")
  }

  // If no portfolio, create one
  if (!portfolio) {
    await supabase.from("portfolios").insert({
      user_id: user.id,
      status: "draft",
      template_id: "minimal",
    })
  }

  redirect("/wizard/brandbook")
}
