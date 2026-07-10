import type { PortfolioData } from "@/lib/portfolio"
import { Mail, Phone, ExternalLink } from "lucide-react"

interface FooterProps {
  footer: PortfolioData["footer_section"]
  hero: PortfolioData["hero_section"]
  brandbook: PortfolioData["brandbook"]
}

export function FooterSection({ footer, hero, brandbook }: FooterProps) {
  const fullName = [hero?.name, hero?.surname].filter(Boolean).join(" ")
  const accentColor = brandbook?.colors?.[0] ?? "#111827"

  return (
    <footer id="contato" className="border-t border-zinc-200 px-8 py-16 lg:px-20">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-zinc-900">{fullName}</p>
            {brandbook?.slogan && (
              <p className="mt-1 text-sm text-zinc-500">{brandbook.slogan}</p>
            )}
          </div>

          {footer && (
            <div className="flex flex-col gap-3">
              {footer.email && (
                <a
                  href={`mailto:${footer.email}`}
                  className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
                >
                  <Mail className="h-4 w-4" style={{ color: accentColor }} />
                  {footer.email}
                </a>
              )}
              {footer.whatsapp && (
                <a
                  href={`https://wa.me/${footer.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
                >
                  <Phone className="h-4 w-4" style={{ color: accentColor }} />
                  {footer.whatsapp}
                </a>
              )}
              {footer.linkedin_url && (
                <a
                  href={footer.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
                >
                  <ExternalLink className="h-4 w-4" style={{ color: accentColor }} />
                  LinkedIn
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}
