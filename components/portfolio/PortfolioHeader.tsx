import type { PortfolioData } from "@/lib/portfolio"

interface PortfolioHeaderProps {
  hero: PortfolioData["hero_section"]
  brandbook: PortfolioData["brandbook"]
  footer: PortfolioData["footer_section"]
}

export function PortfolioHeader({ hero, brandbook, footer }: PortfolioHeaderProps) {
  const fullName = [hero?.name, hero?.surname].filter(Boolean).join(" ")
  const accentColor = brandbook?.colors?.[0] ?? "#111827"

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
        <a
          href="#hero"
          className="text-base font-semibold text-zinc-900 hover:opacity-80"
        >
          {brandbook?.logo_light_url ? (
            <img
              src={brandbook.logo_light_url}
              alt={fullName}
              className="h-8 w-auto"
            />
          ) : (
            fullName
          )}
        </a>

        <nav className="hidden items-center gap-6 sm:flex">
          <a href="#sobre" className="text-sm text-zinc-600 hover:text-zinc-900">
            Sobre
          </a>
          <a href="#projetos" className="text-sm text-zinc-600 hover:text-zinc-900">
            Projetos
          </a>
          <a href="#contato" className="text-sm text-zinc-600 hover:text-zinc-900">
            Contato
          </a>

          {footer?.linkedin_url && (
            <a
              href={footer.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg px-4 py-1.5 text-sm font-medium text-white"
              style={{ backgroundColor: accentColor }}
            >
              LinkedIn
            </a>
          )}
        </nav>
      </div>
    </header>
  )
}
