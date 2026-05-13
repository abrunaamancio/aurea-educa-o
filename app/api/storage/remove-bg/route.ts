import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const apiKey = process.env.REMOVE_BG_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "not_configured" },
      { status: 501 }
    )
  }

  const formData = await request.formData()
  const imageFile = formData.get("image_file") as File

  if (!imageFile) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 })
  }

  const body = new FormData()
  body.append("image_file", imageFile)
  body.append("size", "auto")

  const res = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: { "X-Api-Key": apiKey },
    body,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    return NextResponse.json(
      { error: "remove.bg error", details: err },
      { status: res.status }
    )
  }

  const buffer = await res.arrayBuffer()
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": "inline; filename=photo-no-bg.png",
    },
  })
}
