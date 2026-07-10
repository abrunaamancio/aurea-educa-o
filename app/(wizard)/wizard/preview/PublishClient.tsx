"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Globe, Rocket, Check, ExternalLink } from "lucide-react"

interface PublishClientProps {
  portfolio: {
    id: string
    domain: string | null
    template_id: string
    brandbook: { slogan: string | null; colors: string[]; fonts: string[] } | null
    hero_section: {
      name: string | null
      surname: string | null
      photo_url: string | null
      cta_text: string | null
    } | null
    about_section: { bio_text: string | null } | null
    projects: { id: string; title: string; cover_image_url: string | null }[]
    footer_section: {
      email: string | null
      whatsapp: string | null
      linkedin_url: string | null
    } | null
  }
}

export function PublishClient({ portfolio }: PublishClientProps) {
  const router = useRouter()
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)
  const [siteUrl, setSiteUrl] = useState("")

  const hero = portfolio.hero_section
  const about = portfolio.about_section
  const footer = portfolio.footer_section
  const bb = portfolio.brandbook
  const projects = portfolio.projects ?? []

  async function handlePublish() {
    setPublishing(true)

    const res = await fetch("/api/deploy/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ portfolioId: portfolio.id }),
    })

    if (res.ok) {
      const data = await res.json()
      setSiteUrl(data.url)
      setPublished(true)
    }

    setPublishing(false)
  }

  if (published) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">
            Portfólio publicado!
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Seu portfólio está no ar. Agora configure o DNS do seu domínio
            para apontar para o Vercel.
          </p>
        </div>
        {siteUrl && (
          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-700"
          >
            <Globe className="h-4 w-4" />
            {portfolio.domain}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
        <Button
          variant="secondary"
          onClick={() => router.push("/dashboard")}
        >
          Ir para o dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Preview e publicar</h1>
        <p className="mt-1.5 text-sm text-zinc-500">
          Revise as informações antes de publicar. Você poderá editar tudo
          depois pelo dashboard.
        </p>
      </div>

      {/* Summary cards */}
      <div className="space-y-4">
        {/* Hero */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-zinc-500">
            Hero
          </h2>
          <div className="flex items-center gap-4">
            {hero?.photo_url ? (
              <img
                src={hero.photo_url}
                alt="Foto"
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-zinc-100" />
            )}
            <div>
              <p className="font-semibold text-zinc-900">
                {hero?.name} {hero?.surname}
              </p>
              {bb?.slogan && (
                <p className="text-sm text-zinc-500">{bb.slogan}</p>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="mb-2 text-sm font-semibold text-zinc-500">Sobre mim</h2>
          <p className="text-sm leading-relaxed text-zinc-700">
            {about?.bio_text ?? (
              <span className="italic text-zinc-400">Bio não preenchida</span>
            )}
          </p>
        </div>

        {/* Projects */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-zinc-500">
            Projetos ({projects.length})
          </h2>
          <div className="flex gap-3">
            {projects.map((p) => (
              <div key={p.id} className="space-y-1">
                <div className="h-16 w-24 overflow-hidden rounded-lg bg-zinc-100">
                  {p.cover_image_url && (
                    <img
                      src={p.cover_image_url}
                      alt={p.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <p className="max-w-[96px] text-xs text-zinc-600 line-clamp-2">
                  {p.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Brandbook */}
        {bb && (
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-zinc-500">
              Brandbook
            </h2>
            <div className="flex items-center gap-2">
              {bb.colors.slice(0, 7).map((color) => (
                <div
                  key={color}
                  className="h-6 w-6 rounded-full border border-zinc-100"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            {bb.fonts.length > 0 && (
              <p className="mt-2 text-xs text-zinc-500">
                Fontes: {bb.fonts.join(", ")}
              </p>
            )}
          </div>
        )}

        {/* Domain */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="mb-1 text-sm font-semibold text-zinc-500">Domínio</h2>
          {portfolio.domain ? (
            <p className="font-mono text-sm text-zinc-900">
              {portfolio.domain}
            </p>
          ) : (
            <p className="text-sm italic text-zinc-400">
              Nenhum domínio configurado
            </p>
          )}
        </div>

        {/* Footer contacts */}
        {footer && (
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <h2 className="mb-2 text-sm font-semibold text-zinc-500">
              Contatos
            </h2>
            <ul className="space-y-1 text-sm text-zinc-600">
              {footer.email && <li>Email: {footer.email}</li>}
              {footer.whatsapp && <li>WhatsApp: {footer.whatsapp}</li>}
              {footer.linkedin_url && (
                <li>LinkedIn: {footer.linkedin_url}</li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Template */}
      <div className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm text-zinc-500">
        Template selecionado:{" "}
        <span className="font-medium capitalize text-zinc-800">
          {portfolio.template_id}
        </span>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={() => router.push("/wizard/domain")}>
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </Button>
        <Button onClick={handlePublish} loading={publishing} size="lg">
          <Rocket className="h-4 w-4" />
          Publicar portfólio
        </Button>
      </div>
    </div>
  )
}
