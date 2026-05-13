"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Globe,
  ExternalLink,
  Save,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Wand2,
  Upload,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardClientProps {
  portfolio: {
    id: string
    status: string
    domain: string | null
    template_id: string
    hero_section: {
      name: string | null
      surname: string | null
      photo_url: string | null
      cta_text: string | null
    } | null
    about_section: { bio_text: string | null } | null
    projects: {
      id: string
      title: string
      cover_image_url: string | null
      order: number
      active: boolean
    }[]
    cases_section: {
      id: string
      active: boolean
      embed_url: string | null
    } | null
    footer_section: {
      email: string | null
      whatsapp: string | null
      linkedin_url: string | null
    } | null
    brandbook: {
      slogan: string | null
      colors: string[]
    } | null
  }
}

type ActiveSection = "hero" | "bio" | "projects" | "cases" | "contacts"

export function DashboardClient({ portfolio }: DashboardClientProps) {
  const supabase = createClient()
  const [activeSection, setActiveSection] = useState<ActiveSection>("hero")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Hero state
  const [heroName, setHeroName] = useState(portfolio.hero_section?.name ?? "")
  const [heroSurname, setHeroSurname] = useState(portfolio.hero_section?.surname ?? "")
  const [ctaText, setCtaText] = useState(portfolio.hero_section?.cta_text ?? "")
  const [newPhoto, setNewPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState(portfolio.hero_section?.photo_url ?? "")

  // Bio state
  const [bioText, setBioText] = useState(portfolio.about_section?.bio_text ?? "")
  const [generatingBio, setGeneratingBio] = useState(false)
  const [bioVersions, setBioVersions] = useState<string[]>([])

  // Projects state
  const [projects, setProjects] = useState(portfolio.projects)

  // Cases state
  const [casesActive, setCasesActive] = useState(portfolio.cases_section?.active ?? false)
  const [caseEmbedUrl, setCaseEmbedUrl] = useState(portfolio.cases_section?.embed_url ?? "")

  // Footer state
  const [email, setEmail] = useState(portfolio.footer_section?.email ?? "")
  const [whatsapp, setWhatsapp] = useState(portfolio.footer_section?.whatsapp ?? "")
  const [linkedin, setLinkedin] = useState(portfolio.footer_section?.linkedin_url ?? "")

  const pid = portfolio.id

  async function saveHero() {
    setSaving(true)
    let photoUrl = portfolio.hero_section?.photo_url ?? ""

    if (newPhoto) {
      const ext = newPhoto.name.split(".").pop()
      const path = `${pid}/hero/photo.${ext}`
      const { data } = await supabase.storage
        .from("portfolio-assets")
        .upload(path, newPhoto, { upsert: true })
      if (data?.path) {
        const { data: url } = supabase.storage
          .from("portfolio-assets")
          .getPublicUrl(data.path)
        photoUrl = url.publicUrl
      }
    }

    await supabase.from("hero_section").upsert({
      portfolio_id: pid,
      name: heroName,
      surname: heroSurname,
      cta_text: ctaText,
      photo_url: photoUrl,
    })

    setSaving(false)
    flashSaved()
  }

  async function saveBio() {
    setSaving(true)
    await supabase.from("about_section").upsert({
      portfolio_id: pid,
      bio_text: bioText,
      source: "manual",
    })
    setSaving(false)
    flashSaved()
  }

  async function generateBio() {
    setGeneratingBio(true)
    const formData = new FormData()

    const { data: bb } = await supabase
      .from("brandbook")
      .select("slogan, voice_tone, market_sector")
      .eq("portfolio_id", pid)
      .single()

    if (bb) formData.append("brandbook", JSON.stringify(bb))

    const res = await fetch("/api/ai/generate-bio", {
      method: "POST",
      body: formData,
    })

    if (res.ok) {
      const data = await res.json()
      setBioVersions(data.versions ?? [])
    }

    setGeneratingBio(false)
  }

  async function saveProjects() {
    setSaving(true)
    await supabase.from("projects").delete().eq("portfolio_id", pid)

    for (let i = 0; i < projects.length; i++) {
      const p = projects[i]
      await supabase.from("projects").insert({
        portfolio_id: pid,
        title: p.title,
        cover_image_url: p.cover_image_url,
        order: i,
        active: p.active,
      })
    }

    setSaving(false)
    flashSaved()
  }

  async function saveCases() {
    setSaving(true)
    await supabase.from("cases_section").upsert({
      portfolio_id: pid,
      active: casesActive,
      embed_type: "link",
      embed_url: caseEmbedUrl,
    })
    setSaving(false)
    flashSaved()
  }

  async function saveFooter() {
    setSaving(true)
    await supabase.from("footer_section").upsert({
      portfolio_id: pid,
      email,
      whatsapp,
      linkedin_url: linkedin,
    })
    setSaving(false)
    flashSaved()
  }

  function flashSaved() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const sections: { id: ActiveSection; label: string }[] = [
    { id: "hero", label: "Hero" },
    { id: "bio", label: "Sobre mim" },
    { id: "projects", label: "Projetos" },
    { id: "cases", label: "Cases" },
    { id: "contacts", label: "Contatos" },
  ]

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-zinc-900">Dashboard</h1>
            {portfolio.domain && (
              <a
                href={`https://${portfolio.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700"
              >
                <Globe className="h-3 w-3" />
                {portfolio.domain}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          {saved && (
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              Salvo!
            </span>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8 lg:grid lg:grid-cols-[200px_1fr] lg:gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:block">
          <nav className="space-y-1">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={cn(
                  "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  activeSection === s.id
                    ? "bg-zinc-900 text-white font-medium"
                    : "text-zinc-600 hover:bg-zinc-100"
                )}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="space-y-6">
          {/* Mobile tabs */}
          <div className="flex gap-2 overflow-x-auto lg:hidden">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-1.5 text-sm transition-colors",
                  activeSection === s.id
                    ? "bg-zinc-900 text-white"
                    : "bg-white border border-zinc-200 text-zinc-600"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Hero */}
          {activeSection === "hero" && (
            <div className="space-y-5 rounded-xl border border-zinc-200 bg-white p-6">
              <h2 className="font-semibold text-zinc-900">Hero</h2>

              <div className="flex items-start gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-zinc-200 bg-zinc-100">
                  {photoPreview && (
                    <img src={photoPreview} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50">
                  <Upload className="h-4 w-4" />
                  Trocar foto
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) {
                        setNewPhoto(f)
                        setPhotoPreview(URL.createObjectURL(f))
                      }
                    }}
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Nome"
                  value={heroName}
                  onChange={(e) => setHeroName(e.target.value)}
                />
                <Input
                  label="Sobrenome"
                  value={heroSurname}
                  onChange={(e) => setHeroSurname(e.target.value)}
                />
              </div>

              <Input
                label="Texto do botão CTA"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
              />

              <Button onClick={saveHero} loading={saving}>
                <Save className="h-4 w-4" />
                Salvar hero
              </Button>
            </div>
          )}

          {/* Bio */}
          {activeSection === "bio" && (
            <div className="space-y-5 rounded-xl border border-zinc-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-zinc-900">Sobre mim</h2>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={generateBio}
                  loading={generatingBio}
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  Re-gerar com IA
                </Button>
              </div>

              {bioVersions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-zinc-500">Clique para usar:</p>
                  {bioVersions.map((v, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setBioText(v)}
                      className="w-full rounded-lg border border-zinc-200 p-3 text-left text-sm text-zinc-700 hover:border-zinc-400"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              )}

              <Textarea
                label="Bio"
                value={bioText}
                onChange={(e) => setBioText(e.target.value)}
                rows={6}
              />

              <Button onClick={saveBio} loading={saving}>
                <Save className="h-4 w-4" />
                Salvar bio
              </Button>
            </div>
          )}

          {/* Projects */}
          {activeSection === "projects" && (
            <div className="space-y-5 rounded-xl border border-zinc-200 bg-white p-6">
              <h2 className="font-semibold text-zinc-900">Projetos</h2>

              <div className="space-y-3">
                {projects.map((p, i) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 rounded-lg border border-zinc-200 p-3"
                  >
                    <div className="h-12 w-16 shrink-0 overflow-hidden rounded bg-zinc-100">
                      {p.cover_image_url && (
                        <img src={p.cover_image_url} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <Input
                      value={p.title}
                      onChange={(e) =>
                        setProjects((prev) =>
                          prev.map((pp, j) =>
                            j === i ? { ...pp, title: e.target.value } : pp
                          )
                        )
                      }
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setProjects((prev) =>
                          prev.map((pp, j) =>
                            j === i ? { ...pp, active: !pp.active } : pp
                          )
                        )
                      }
                      className="text-zinc-400 hover:text-zinc-700"
                    >
                      {p.active ? (
                        <ToggleRight className="h-5 w-5 text-green-600" />
                      ) : (
                        <ToggleLeft className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setProjects((prev) => prev.filter((_, j) => j !== i))
                      }
                      className="text-zinc-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <Button onClick={saveProjects} loading={saving}>
                <Save className="h-4 w-4" />
                Salvar projetos
              </Button>
            </div>
          )}

          {/* Cases */}
          {activeSection === "cases" && (
            <div className="space-y-5 rounded-xl border border-zinc-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-zinc-900">Cases</h2>
                <button
                  type="button"
                  onClick={() => setCasesActive(!casesActive)}
                  className="flex items-center gap-2 text-sm text-zinc-600"
                >
                  {casesActive ? (
                    <ToggleRight className="h-5 w-5 text-green-600" />
                  ) : (
                    <ToggleLeft className="h-5 w-5 text-zinc-400" />
                  )}
                  {casesActive ? "Visível no portfólio" : "Oculto"}
                </button>
              </div>

              <Input
                label="Link da apresentação"
                value={caseEmbedUrl}
                onChange={(e) => setCaseEmbedUrl(e.target.value)}
                placeholder="https://www.canva.com/design/... ou Google Slides"
                hint="Cole o link de embed do Canva, Google Slides ou Behance"
              />

              <Button onClick={saveCases} loading={saving}>
                <Save className="h-4 w-4" />
                Salvar cases
              </Button>
            </div>
          )}

          {/* Contacts */}
          {activeSection === "contacts" && (
            <div className="space-y-5 rounded-xl border border-zinc-200 bg-white p-6">
              <h2 className="font-semibold text-zinc-900">Contatos</h2>

              <Input
                label="E-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label="WhatsApp"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
              />
              <Input
                label="LinkedIn URL"
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
              />

              <Button onClick={saveFooter} loading={saving}>
                <Save className="h-4 w-4" />
                Salvar contatos
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
