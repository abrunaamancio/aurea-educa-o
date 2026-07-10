import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Aurea Educação — Portfólio Profissional",
  description: "Crie seu portfólio profissional com domínio próprio em minutos.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  )
}
