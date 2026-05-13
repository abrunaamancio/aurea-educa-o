import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/auth/callback",
  "/auth/error",
]

const ADMIN_PATHS = ["/admin"]
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "professora@aureaeducacao.com.br"

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // Allow public paths and portfolio routes (served by domain matching)
  const isPublicPath = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith("/auth/")
  )

  if (isPublicPath) return supabaseResponse

  // Admin paths require the professor email
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    if (!user || user.email !== ADMIN_EMAIL) {
      return NextResponse.redirect(new URL("/login?error=unauthorized", request.url))
    }
    return supabaseResponse
  }

  // Protected wizard/dashboard paths require authenticated + approved student
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Check student approval (only for wizard and dashboard)
  if (pathname.startsWith("/wizard") || pathname.startsWith("/dashboard")) {
    const { data: student } = await supabase
      .from("approved_students")
      .select("status, access_expires_at")
      .eq("email", user.email!)
      .single()

    if (!student) {
      return NextResponse.redirect(
        new URL("/login?error=not_approved", request.url)
      )
    }

    if (student.status === "revoked") {
      return NextResponse.redirect(
        new URL("/login?error=revoked", request.url)
      )
    }

    const now = new Date()
    const expires = new Date(student.access_expires_at)
    if (now > expires || student.status === "expired") {
      return NextResponse.redirect(
        new URL("/login?error=expired", request.url)
      )
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
