import type { PortfolioData } from "@/lib/portfolio"

interface AboutProps {
  about: PortfolioData["about_section"]
  brandbook: PortfolioData["brandbook"]
}

export function AboutSection({ about, brandbook }: AboutProps) {
  if (!about?.bio_text) return null

  const accentColor = brandbook?.colors?.[0] ?? "#111827"

  return (
    <section id="sobre" className="px-8 py-24 lg:px-20">
      <div className="mx-auto max-w-3xl">
        <div
          className="mb-6 h-1 w-12 rounded"
          style={{ backgroundColor: accentColor }}
        />
        <h2 className="mb-8 text-sm font-semibold uppercase tracking-widest text-zinc-400">
          Sobre mim
        </h2>
        <p className="text-xl leading-relaxed text-zinc-700 lg:text-2xl">
          {about.bio_text}
        </p>
      </div>
    </section>
  )
}
