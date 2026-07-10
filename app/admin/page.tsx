import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminClient } from "./AdminClient"

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "professora@aureaeducacao.com.br"

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) redirect("/login?error=unauthorized")

  const { data: students } = await supabase
    .from("approved_students")
    .select("*")
    .order("created_at", { ascending: false })

  const { data: portfolios } = await supabase
    .from("portfolios")
    .select("user_id, status, domain")

  return <AdminClient students={students ?? []} portfolios={portfolios ?? []} />
}
