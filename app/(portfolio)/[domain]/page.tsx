import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { buildCssVariables, type PortfolioData } from "@/lib/portfolio"
import { PortfolioHeader } from "@/components/portfolio/PortfolioHeader"
import { HeroSection } from "@/components/portfolio/HeroSection"
import { AboutSection } from "@/components/portfolio/AboutSection"
import { ProjectsSection } from "@/components/portfolio/ProjectsSection"
import { FooterSection } from "@/components/portfolio/FooterSection"
import { Analytics } from "@vercel/analytics/react"
import type { Metadata } from "next"

interface Props {
  params: { domain: string }
}

async function getPortfolio(domain: string): Promise<PortfolioData | null> {
  const supabase = await createClient()

  const { data } = await supabase
    .from("portfolios")
    .select(`
      id,
      template_id,
      domain,
      status,
      brandbook(colors, fonts, logo_light_url, logo_dark_url, slogan, voice_tone, market_sector),
      hero_section(photo_url, background_url, name, surname, cta_text),
      about_section(bio_text),
      projects(id, title, cover_image_url, order, active),
      cases_section(active, embed_type, file_url, embed_url),
      footer_section(email, whatsapp, linkedin_url)
    `)
    .eq("domain", domain)
    .eq("status", "published")
    .single()

  return data as PortfolioData | null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const portfolio = await getPortfolio(params.domain)
  if (!portfolio) return {}

  const hero = portfolio.hero_section
  const bb = portfolio.brandbook
  const fullName = [hero?.name, hero?.surname].filter(Boolean).join(" ")
  const sector = bb?.market_sector ? ` | ${bb.market_sector}` : ""

  return {
    title: `${fullName}${sector}`,
    description: bb?.slogan ?? undefined,
    openGraph: {
      title: fullName,
      description: bb?.slogan ?? undefined,
      images: hero?.photo_url ? [{ url: hero.photo_url }] : [],
    },
  }
}

export default async function PortfolioPage({ params }: Props) {
  const portfolio = await getPortfolio(params.domain)
  if (!portfolio) notFound()

  const cssVars = buildCssVariables(portfolio.brandbook)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `:root { ${cssVars} }` }} />

      <div className="min-h-screen bg-white font-sans antialiased">
        <PortfolioHeader
          hero={portfolio.hero_section}
          brandbook={portfolio.brandbook}
          footer={portfolio.footer_section}
        />

        <main>
          <HeroSection
            hero={portfolio.hero_section}
            brandbook={portfolio.brandbook}
            template={portfolio.template_id}
          />

          <AboutSection
            about={portfolio.about_section}
            brandbook={portfolio.brandbook}
          />

          <ProjectsSection
            projects={portfolio.projects}
            brandbook={portfolio.brandbook}
          />

          {portfolio.cases_section?.active && portfolio.cases_section.embed_url && (
            <section id="cases" className="px-8 py-24 lg:px-20">
              <div className="mx-auto max-w-5xl">
                <h2 className="mb-8 text-sm font-semibold uppercase tracking-widest text-zinc-400">
                  Cases
                </h2>
                <div className="aspect-video overflow-hidden rounded-2xl border border-zinc-200">
                  <iframe
                    src={portfolio.cases_section.embed_url}
                    className="h-full w-full"
                    allowFullScreen
                  />
                </div>
              </div>
            </section>
          )}
        </main>

        <FooterSection
          footer={portfolio.footer_section}
          hero={portfolio.hero_section}
          brandbook={portfolio.brandbook}
        />
      </div>

      <Analytics />
    </>
  )
}
