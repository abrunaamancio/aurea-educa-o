"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FileDropzone } from "@/components/wizard/FileDropzone"
import { createClient } from "@/lib/supabase/client"
import {
  ChevronRight,
  ChevronLeft,
  Wand2,
  Upload,
  Scissors,
  RefreshCw,
  Plus,
  Trash2,
  Check,
} from "lucide-react"

interface Project {
  title: string
  cover: File | null
  coverPreview: string
}

export default function ContentPage() {
  const router = useRouter()
  const supabase = createClient()

  // Hero
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>("")
  const [removingBg, setRemovingBg] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [ctaText, setCtaText] = useState("Ver projetos")

  // Bio
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [generatingBio, setGeneratingBio] = useState(false)
  const [bioVersions, setBioVersions] = useState<string[]>([])
  const [selectedBio, setSelectedBio] = useState<number | null>(null)
  const [bioText, setBioText] = useState("")

  // Projects
  const [projects, setProjects] = useState<Project[]>([
    { title: "", cover: null, coverPreview: "" },
    { title: "", cover: null, coverPreview: "" },
  ])

  // Footer
  const [email, setEmail] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [linkedin, setLinkedin] = useState("")

  const [saving, setSaving] = useState(false)

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function handleRemoveBg() {
    if (!photoFile) return
    setRemovingBg(true)

    const formData = new FormData()
    formData.append("image_file", photoFile)

    const res = await fetch("/api/storage/remove-bg", {
      method: "POST",
      body: formData,
    })

    if (res.status === 501) {
      alert("Funcionalidade de remoção de fundo não está configurada nesta instalação.")
    } else if (res.ok) {
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setPhotoPreview(url)
      setPhotoFile(new File([blob], "photo-no-bg.png", { type: "image/png" }))
    }

    setRemovingBg(false)
  }

  async function handleGenerateBio() {
    setGeneratingBio(true)
    const formData = new FormData()

    if (cvFile) formData.append("cv", cvFile)

    // Fetch brandbook data to pass to bio generator
    const { data: portfolio } = await supabase
      .from("portfolios")
      .select("id")
      .single()

    if (portfolio) {
      const { data: bb } = await supabase
        .from("brandbook")
        .select("slogan, voice_tone, market_sector")
        .eq("portfolio_id", portfolio.id)
        .single()

      if (bb) formData.append("brandbook", JSON.stringify(bb))
    }

    const res = await fetch("/api/ai/generate-bio", {
      method: "POST",
      body: formData,
    })

    if (res.ok) {
      const data = await res.json()
      setBioVersions(data.versions ?? [])
      setSelectedBio(0)
      setBioText(data.versions?.[0] ?? "")
    }

    setGeneratingBio(false)
  }

  function handleSelectBio(index: number) {
    setSelectedBio(index)
    setBioText(bioVersions[index])
  }

  function handleProjectCover(index: number, file: File) {
    const preview = URL.createObjectURL(file)
    setProjects((prev) =>
      prev.map((p, i) => (i === index ? { ...p, cover: file, coverPreview: preview } : p))
    )
  }

  function handleProjectTitle(index: number, title: string) {
    setProjects((prev) =>
      prev.map((p, i) => (i === index ? { ...p, title } : p))
    )
  }

  function addProject() {
    if (projects.length < 6) {
      setProjects([...projects, { title: "", cover: null, coverPreview: "" }])
    }
  }

  function removeProject(index: number) {
    if (projects.length > 1) {
      setProjects(projects.filter((_, i) => i !== index))
    }
  }

  async function handleSave() {
    setSaving(true)

    const { data: portfolio } = await supabase
      .from("portfolios")
      .select("id")
      .single()

    if (!portfolio) {
      setSaving(false)
      return
    }

    const pid = portfolio.id

    // Upload hero photo
    let photoUrl = ""
    if (photoFile) {
      const ext = photoFile.name.split(".").pop()
      const path = `${pid}/hero/photo.${ext}`
      const { data } = await supabase.storage
        .from("portfolio-assets")
        .upload(path, photoFile, { upsert: true })
      if (data?.path) {
        const { data: url } = supabase.storage
          .from("portfolio-assets")
          .getPublicUrl(data.path)
        photoUrl = url.publicUrl
      }
    }

    // Save hero section
    await supabase.from("hero_section").upsert({
      portfolio_id: pid,
      photo_url: photoUrl || undefined,
      name: firstName,
      surname: lastName,
      cta_text: ctaText,
    })

    // Save about section
    await supabase.from("about_section").upsert({
      portfolio_id: pid,
      bio_text: bioText,
      source: cvFile ? "cv" : "brandbook",
    })

    // Save projects
    await supabase.from("projects").delete().eq("portfolio_id", pid)
    for (let i = 0; i < projects.length; i++) {
      const p = projects[i]
      let coverUrl = ""
      if (p.cover) {
        const ext = p.cover.name.split(".").pop()
        const path = `${pid}/projects/${i}.${ext}`
        const { data } = await supabase.storage
          .from("portfolio-assets")
          .upload(path, p.cover, { upsert: true })
        if (data?.path) {
          const { data: url } = supabase.storage
            .from("portfolio-assets")
            .getPublicUrl(data.path)
          coverUrl = url.publicUrl
        }
      }
      if (p.title || coverUrl) {
        await supabase.from("projects").insert({
          portfolio_id: pid,
          title: p.title,
          cover_image_url: coverUrl,
          order: i,
          active: true,
        })
      }
    }

    // Save footer
    await supabase.from("footer_section").upsert({
      portfolio_id: pid,
      email,
      whatsapp,
      linkedin_url: linkedin,
    })

    router.push("/wizard/template")
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Conteúdo</h1>
        <p className="mt-1.5 text-sm text-zinc-500">
          Preencha as informações do seu portfólio. Preview em tempo real
          disponível após salvar.
        </p>
      </div>

      {/* Hero — Foto */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-zinc-800">
          Foto profissional
        </h2>
        <div className="flex items-start gap-6">
          <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full border-2 border-zinc-200 bg-zinc-100">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Foto"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-zinc-400">
                <Upload className="h-8 w-8" />
              </div>
            )}
          </div>
          <div className="space-y-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
              <Upload className="h-4 w-4" />
              Escolher foto
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handlePhotoChange}
              />
            </label>
            {photoPreview && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRemoveBg}
                loading={removingBg}
              >
                <Scissors className="h-3.5 w-3.5" />
                Remover fundo
              </Button>
            )}
            <p className="text-xs text-zinc-400">
              JPG ou PNG • Dimensões recomendadas: 800×800 px
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nome"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Ana"
          />
          <Input
            label="Sobrenome"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Lima"
          />
        </div>

        <Input
          label="Texto do botão CTA"
          value={ctaText}
          onChange={(e) => setCtaText(e.target.value)}
          placeholder="Ver projetos"
        />
      </section>

      {/* Bio */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-zinc-800">Sobre mim</h2>
        <p className="text-sm text-zinc-500">
          Envie seu currículo para gerar a bio automaticamente, ou escreva
          diretamente.
        </p>

        <div className="flex items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
            <Upload className="h-4 w-4" />
            {cvFile ? cvFile.name : "Enviar currículo (PDF)"}
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="sr-only"
              onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <Button onClick={handleGenerateBio} loading={generatingBio}>
            <Wand2 className="h-4 w-4" />
            {bioVersions.length ? "Gerar novamente" : "Gerar com IA"}
          </Button>
        </div>

        {bioVersions.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-zinc-700">
              Escolha uma versão:
            </p>
            {bioVersions.map((v, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectBio(i)}
                className={`w-full rounded-xl border-2 px-4 py-3 text-left text-sm transition-colors ${
                  selectedBio === i
                    ? "border-zinc-900 bg-zinc-50"
                    : "border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-xs ${
                      selectedBio === i
                        ? "bg-zinc-900 text-white"
                        : "bg-zinc-100 text-zinc-400"
                    }`}
                  >
                    {selectedBio === i ? (
                      <Check className="h-2.5 w-2.5" />
                    ) : (
                      i + 1
                    )}
                  </span>
                  <p className="leading-relaxed text-zinc-700">{v}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        <Textarea
          label={bioVersions.length ? "Editar bio selecionada" : "Bio"}
          value={bioText}
          onChange={(e) => setBioText(e.target.value)}
          placeholder="Escreva sua bio profissional..."
          rows={5}
        />
      </section>

      {/* Projects */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-zinc-800">Projetos</h2>
        <p className="text-sm text-zinc-500">
          Adicione imagens e títulos dos seus projetos principais.
        </p>

        <div className="space-y-4">
          {projects.map((project, i) => (
            <div
              key={i}
              className="flex items-start gap-4 rounded-xl border border-zinc-200 bg-white p-4"
            >
              <label className="relative h-24 w-32 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50 hover:border-zinc-300">
                {project.coverPreview ? (
                  <img
                    src={project.coverPreview}
                    alt="Capa"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-zinc-400">
                    <Upload className="h-5 w-5" />
                    <span className="text-xs">Capa</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleProjectCover(i, f)
                  }}
                />
              </label>
              <div className="flex-1 space-y-2">
                <Input
                  placeholder={`Título do projeto ${i + 1}`}
                  value={project.title}
                  onChange={(e) => handleProjectTitle(i, e.target.value)}
                />
                <p className="text-xs text-zinc-400">
                  Escreva em estilo manchete — impacto e clareza
                </p>
              </div>
              {projects.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeProject(i)}
                  className="text-zinc-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {projects.length < 6 && (
          <button
            type="button"
            onClick={addProject}
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700"
          >
            <Plus className="h-4 w-4" />
            Adicionar projeto
          </button>
        )}
      </section>

      {/* Footer */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-zinc-800">Contatos</h2>
        <div className="space-y-3">
          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@email.com"
          />
          <Input
            label="WhatsApp"
            type="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="+55 11 99999-9999"
          />
          <Input
            label="LinkedIn"
            type="url"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            placeholder="https://linkedin.com/in/seunome"
          />
        </div>
      </section>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/wizard/brandbook")}
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </Button>
        <Button onClick={handleSave} loading={saving} size="lg">
          Continuar
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
