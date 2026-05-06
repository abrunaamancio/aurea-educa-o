import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.com" },
    ],
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/:path*",
          has: [
            {
              type: "host",
              value: "(?!app\\.aureaeducacao\\.com\\.br)(?!localhost)(.+)",
            },
          ],
          destination: "/:path*",
        },
      ],
      afterFiles: [],
      fallback: [],
    }
  },
}

export default nextConfig
